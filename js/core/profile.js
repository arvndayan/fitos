export function calculateTargets(profile){
  const kg=Number(profile.weight)*0.45359237;
  const cm=Number(profile.height)*2.54;
  const age=Number(profile.age);
  const sexAdj=profile.sex==='female'?-161:5;
  const bmr=10*kg+6.25*cm-5*age+sexAdj;
  const tdee=bmr*Number(profile.activity||1.55);
  const goalFactor=profile.goal==='fat_loss'?0.82:profile.goal==='muscle_gain'?1.08:1;
  const calories=Math.round(tdee*goalFactor/10)*10;
  const protein=Math.round(Number(profile.weight)*(profile.goal==='fat_loss'?0.9:0.8));
  const fat=Math.max(50,Math.round(Number(profile.weight)*0.3));
  const carbs=Math.max(0,Math.round((calories-protein*4-fat*9)/4));
  return {bmr:Math.round(bmr),tdee:Math.round(tdee),calories,protein,fat,carbs};
}
export function recommendProgram(profile){
  const d=Number(profile.days);
  if(profile.goal==='strength'&&d>=4)return 'Upper / Lower';
  if(d<=3)return 'Full Body';
  if(d===4)return 'Upper / Lower';
  if(d===5)return 'PPL + Upper / Lower';
  return 'Push / Pull / Legs';
}