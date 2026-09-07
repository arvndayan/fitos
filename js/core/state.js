const KEY='fitos-v3';
const defaults={
  profile:{name:'Aravind',age:30,sex:'male',height:69,weight:170,goal:'maintain',activity:1.55,days:5},
  targets:{calories:2300,protein:170,carbs:250,fat:70},
  food:[],weights:[],steps:0,program:'PPL + Upper / Lower',workoutLogs:{},usage:{}
};
export function loadState(){
  try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}
  catch{return structuredClone(defaults)}
}
export function saveState(state){localStorage.setItem(KEY,JSON.stringify(state))}
export function todayKey(){return new Date().toISOString().slice(0,10)}
export function todaysFood(state){const k=todayKey();return state.food.filter(x=>x.loggedAt.slice(0,10)===k)}
export function sumNutrition(entries){
  return entries.reduce((a,e)=>{
    for(const [k,v] of Object.entries(e.nutrition||{}))a[k]=(a[k]||0)+(Number(v)||0);
    return a;
  },{});
}