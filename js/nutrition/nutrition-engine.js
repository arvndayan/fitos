export const NUTRIENT_KEYS=['calories','protein','carbs','fat','fiber','sugar','saturatedFat','sodium','potassium','cholesterol','calcium','iron'];

export function scaleNutrition(per100g,grams){
  const factor=Number(grams||0)/100;
  const out={};
  for(const key of NUTRIENT_KEYS){
    const value=Number(per100g?.[key]);
    out[key]=Number.isFinite(value)?+(value*factor).toFixed(2):null;
  }
  return out;
}

export function resolvePortionToGrams(food,quantity,unit='g'){
  const q=Number(quantity);
  if(!Number.isFinite(q)||q<=0)return null;
  const u=String(unit||'g').trim().toLowerCase();
  if(['g','gram','grams'].includes(u))return q;
  if(u==='kg')return q*1000;
  if(['oz','ounce','ounces'].includes(u))return q*28.3495;
  if(['lb','lbs','pound','pounds'].includes(u))return q*453.592;
  const p=(food?.portions||[]).find(x=>x.unit.toLowerCase()===u||(x.aliases||[]).map(a=>a.toLowerCase()).includes(u));
  return p?q*p.grams:null;
}

export function buildFoodLogEntry({food,quantity,unit,meal='Unassigned',confidence=1}){
  const grams=resolvePortionToGrams(food,quantity,unit);
  if(!grams)throw new Error('Unable to convert quantity to grams');
  return {
    id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,
    foodId:food.id,name:food.name,meal,quantity:Number(quantity),unit,
    grams:+grams.toFixed(1),nutrition:scaleNutrition(food.per100g,grams),
    source:food.source,sourceId:food.sourceId||null,confidence,
    loggedAt:new Date().toISOString()
  };
}