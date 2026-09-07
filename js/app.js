import {FOOD_SEED} from '../data/food-seed.js';
import {parseFoodText,detectAmbiguity} from './nutrition/food-parser.js';
import {rankLocalFoods,searchOpenFoodFacts} from './nutrition/food-search.js';
import {buildFoodLogEntry} from './nutrition/nutrition-engine.js';
import {loadState,saveState,todaysFood,sumNutrition} from './core/state.js';
import {PROGRAMS} from './training/plans.js';
import {calculateTargets,recommendProgram} from './core/profile.js';

let state=loadState();
let pendingParsed=null;
let pendingFood=null;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function setView(id){
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  $('#pageTitle').textContent=id[0].toUpperCase()+id.slice(1);
}
$$('.nav-btn').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('#quickAdd').onclick=()=>{setView('nutrition');$('#foodText').focus()};

function defaultUnit(food,parsed){
  if(parsed.unit)return parsed.unit;
  if(food.id==='egg-whole-large')return 'egg';
  if(food.id==='banana')return 'banana';
  if(food.id==='chapati')return 'roti';
  return 'g';
}
function normalizeQuery(parsed,choice){
  let q=parsed.query;
  if(choice)q=`${q} ${choice.toLowerCase()}`;
  if(parsed.preparation)q=`${q} ${parsed.preparation}`;
  return q.replace(/\s+/g,' ').trim();
}
function showAmbiguity(a){
  const box=$('#ambiguityBox');
  box.classList.remove('hidden');
  box.innerHTML=`<strong>${a.question}</strong><div>${a.options.map(o=>`<button class="chip" data-choice="${o}">${o}</button>`).join('')}</div>`;
  box.querySelectorAll('[data-choice]').forEach(btn=>btn.onclick=()=>{
    const choice=btn.dataset.choice;
    if(a.type==='chicken_cut'){
      pendingParsed.query=`${pendingParsed.query} ${choice.toLowerCase()}`;
      const next=detectAmbiguity(pendingParsed);
      if(next){showAmbiguity(next);return}
    }else if(a.type==='chicken_prep'){
      pendingParsed.preparation=choice.toLowerCase();
    }
    box.classList.add('hidden');
    resolveParsedFood(pendingParsed);
  });
}
async function resolveParsedFood(parsed){
  $('#foodMatches').innerHTML='';
  const local=rankLocalFoods(normalizeQuery(parsed),FOOD_SEED,state.usage);
  if(local.length){renderMatches(local.slice(0,5),parsed);return}
  $('#nutritionStatus').textContent='No local match. Searching Open Food Facts for packaged foods…';
  try{
    const external=await searchOpenFoodFacts(parsed.query,8);
    if(external.length)renderMatches(external,parsed);
    else $('#nutritionStatus').textContent='No reliable match yet. Try a more specific food name.';
  }catch{
    $('#nutritionStatus').textContent='External food search is unavailable right now. Try a local food such as eggs, banana, rice, roti, Greek yogurt or chicken breast.';
  }
}
function renderMatches(foods,parsed){
  $('#nutritionStatus').textContent='Choose the closest match. FitOS calculates nutrients automatically.';
  $('#foodMatches').innerHTML=foods.map((f,i)=>`<div class="result"><div><strong>${f.name}</strong><div class="muted">${f.brand||''} ${f.source||''}</div></div><button class="btn" data-use="${i}">Use</button></div>`).join('');
  $('#foodMatches').querySelectorAll('[data-use]').forEach(btn=>btn.onclick=()=>{
    const food=foods[Number(btn.dataset.use)];
    pendingFood=food;
    const unit=defaultUnit(food,parsed);
    try{
      const entry=buildFoodLogEntry({food,quantity:parsed.quantity,unit,meal:$('#mealSelect').value||parsed.meal||'Unassigned',confidence:food.confidence||0.8});
      state.food.push(entry);
      state.usage[food.id]=(state.usage[food.id]||0)+1;
      saveState(state);
      $('#nutritionStatus').textContent=`Logged ${entry.quantity} ${entry.unit} ${entry.name} (${entry.grams} g).`;
      $('#foodMatches').innerHTML='';
      $('#foodText').value='';
      renderAll();
    }catch(e){$('#nutritionStatus').textContent=e.message}
  });
}
$('#understandFood').onclick=()=>{
  const parsed=parseFoodText($('#foodText').value);
  if(!parsed.raw)return;
  pendingParsed=parsed;
  const ambiguity=detectAmbiguity(parsed);
  if(ambiguity){showAmbiguity(ambiguity);return}
  resolveParsedFood(parsed);
};
$('#foodText').addEventListener('keydown',e=>{if(e.key==='Enter')$('#understandFood').click()});

function foodTotals(){return sumNutrition(todaysFood(state))}
function renderFood(){
  const entries=todaysFood(state), t=foodTotals();
  $('#nutCalories').textContent=Math.round(t.calories||0);
  $('#nutProtein').textContent=(t.protein||0).toFixed(1);
  $('#nutCarbs').textContent=(t.carbs||0).toFixed(1);
  $('#nutFat').textContent=(t.fat||0).toFixed(1);
  const html=entries.length?entries.map(e=>`<div class="row"><div><strong>${e.name}</strong><div class="muted">${e.quantity} ${e.unit} · ${e.grams} g · ${e.meal} · ${Math.round(e.nutrition.calories||0)} kcal · ${(e.nutrition.protein||0).toFixed(1)} g protein</div></div><button class="delete" data-del="${e.id}">Delete</button></div>`).join(''):'<p class="muted">Nothing logged yet.</p>';
  $('#foodLog').innerHTML=html; $('#todayFoodList').innerHTML=html;
  $$('[data-del]').forEach(b=>b.onclick=()=>{state.food=state.food.filter(x=>x.id!==b.dataset.del);saveState(state);renderAll()});
}
$('#clearFood').onclick=()=>{const k=new Date().toISOString().slice(0,10);state.food=state.food.filter(x=>x.loggedAt.slice(0,10)!==k);saveState(state);renderAll()};

function renderDashboard(){
  const t=foodTotals();
  $('#todayCalories').textContent=Math.round(t.calories||0);
  $('#todayProtein').textContent=Math.round(t.protein||0);
  $('#todayCalTarget').textContent=state.targets.calories;
  $('#todayProteinTarget').textContent=state.targets.protein;
  $('#todayCalBar').style.width=`${Math.min(100,(t.calories||0)/state.targets.calories*100)}%`;
  $('#todayProBar').style.width=`${Math.min(100,(t.protein||0)/state.targets.protein*100)}%`;
  $('#todaySteps').textContent=state.steps||0;
  $('#todayWeight').textContent=state.weights.at(-1)?.value||state.profile.weight||'—';
}
function renderProfile(){
  const p=state.profile;
  $('#profileName').value=p.name;$('#profileAge').value=p.age;$('#profileSex').value=p.sex;$('#profileHeight').value=p.height;$('#profileWeight').value=p.weight;$('#profileGoal').value=p.goal;$('#profileActivity').value=p.activity;$('#profileDays').value=p.days;
  $('#sideName').textContent=p.name;
  $('#sideGoal').textContent=p.goal.replace('_',' ');
}
$('#saveProfile').onclick=()=>{
  const p={name:$('#profileName').value||'User',age:+$('#profileAge').value,sex:$('#profileSex').value,height:+$('#profileHeight').value,weight:+$('#profileWeight').value,goal:$('#profileGoal').value,activity:+$('#profileActivity').value,days:+$('#profileDays').value};
  const calc=calculateTargets(p); state.profile=p; state.targets={calories:calc.calories,protein:calc.protein,carbs:calc.carbs,fat:calc.fat}; state.program=recommendProgram(p); saveState(state);
  $('#profileResults').innerHTML=`<div class="result"><div><strong>Starting targets</strong><div class="muted">BMR ${calc.bmr} · TDEE ${calc.tdee} · ${calc.calories} kcal · ${calc.protein}g protein · ${calc.carbs}g carbs · ${calc.fat}g fat</div></div></div><div class="result"><div><strong>Recommended split</strong><div class="muted">${state.program}</div></div></div>`;
  renderAll();
};

function renderPlans(){
  $('#planGrid').innerHTML=Object.keys(PROGRAMS).map(name=>`<div class="plan ${state.program===name?'selected':''}"><h3>${name}</h3><p class="muted">${PROGRAMS[name].length} sessions</p><button class="btn" data-plan="${name}">${state.program===name?'Selected':'Choose'}</button></div>`).join('');
  $$('[data-plan]').forEach(b=>b.onclick=()=>{state.program=b.dataset.plan;saveState(state);renderAll()});
}
function renderTraining(){
  const names=Object.keys(PROGRAMS);
  $('#programSelect').innerHTML=names.map(n=>`<option ${n===state.program?'selected':''}>${n}</option>`).join('');
  const sessions=PROGRAMS[state.program]||PROGRAMS[names[0]];
  $('#sessionSelect').innerHTML=sessions.map((s,i)=>`<option value="${i}">${s.name}</option>`).join('');
  const draw=()=>{
    const s=sessions[+$('#sessionSelect').value||0]; $('#todayWorkoutName').textContent=s.name;
    $('#exerciseCards').innerHTML=s.exercises.map(([name,muscle,sets,reps])=>`<div class="exercise-card"><div class="exercise-head"><div><h3>${name}</h3><div class="muted">${muscle} · ${sets} sets · ${reps} reps</div></div></div>${Array.from({length:sets},(_,i)=>`<div class="set-row"><strong>${i+1}</strong><input type="number" placeholder="lb"><input type="number" placeholder="reps"><input type="number" step=".5" placeholder="RPE"><button class="setrowbtn">Log</button></div>`).join('')}<div class="progression">Progression: reach the top of the rep range around RPE ≤ 8 before increasing load.</div></div>`).join('');
  };
  $('#sessionSelect').onchange=draw; draw();
  $('#programSelect').onchange=()=>{state.program=$('#programSelect').value;saveState(state);renderAll()};
}

$('#logWeight').onclick=()=>{const v=Number($('#weightInput').value);if(v>0){state.weights.push({value:v,date:new Date().toISOString()});state.profile.weight=v;saveState(state);$('#weightInput').value='';renderAll()}};
function renderWeights(){
  $('#weightList').innerHTML=state.weights.slice(-8).reverse().map(w=>`<div class="row"><span>${new Date(w.date).toLocaleDateString()}</span><strong>${w.value} lb</strong></div>`).join('')||'<p class="muted">No weigh-ins yet.</p>';
  const xs=state.weights.slice(-7).map(x=>Number(x.value));$('#avgWeight').textContent=xs.length?`${(xs.reduce((a,b)=>a+b,0)/xs.length).toFixed(1)} lb`:'—';
}

$('#coachSend').onclick=()=>{const q=$('#coachInput').value.trim();if(!q)return;addBubble(q,'user');const t=foodTotals();let a='I can use your logged FitOS data to help.';
  const l=q.toLowerCase();
  if(l.includes('protein'))a=`You have about ${Math.max(0,state.targets.protein-(t.protein||0)).toFixed(0)} g protein left today.`;
  else if(l.includes('eat'))a=`You have about ${Math.max(0,state.targets.calories-(t.calories||0)).toFixed(0)} kcal and ${Math.max(0,state.targets.protein-(t.protein||0)).toFixed(0)} g protein remaining. Build the next meal around a lean protein source, vegetables and a carb portion that fits the remaining calories.`;
  else if(l.includes('workout'))a=`Your selected program is ${state.program}. Open Training to see today's sessions.`;
  addBubble(a,'ai');$('#coachInput').value='';
};
function addBubble(text,type){const d=document.createElement('div');d.className=`bubble ${type}`;d.textContent=text;$('#coachMessages').appendChild(d);$('#coachMessages').scrollTop=$('#coachMessages').scrollHeight}

function renderAll(){renderFood();renderDashboard();renderProfile();renderPlans();renderTraining();renderWeights()}
renderAll();