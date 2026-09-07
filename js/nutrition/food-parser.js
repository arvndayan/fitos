const MEALS=['breakfast','lunch','dinner','snack'];
const PREP_WORDS=['raw','cooked','grilled','baked','boiled','roasted','fried','air fried'];

export function parseFoodText(input){
  const raw=String(input||'').trim();
  const text=raw.toLowerCase();
  const qty=text.match(/(\d+(?:\.\d+)?)\s*(kg|g|grams?|oz|ounces?|lb|lbs|pounds?|ml|cups?|tbsp|tablespoons?|tsp|teaspoons?|scoops?|slices?|pieces?|eggs?|chapatis?|rotis?|bananas?)?\b/);
  const quantity=qty?Number(qty[1]):1;
  const unit=qty?.[2]||null;
  const meal=MEALS.find(m=>text.includes(m))||null;
  const preparation=PREP_WORDS.find(p=>text.includes(p))||null;
  let query=text;
  if(qty){
    const weightUnits=['kg','g','gram','grams','oz','ounce','ounces','lb','lbs','pound','pounds','ml'];
    query=query.replace(qty[0],weightUnits.includes(unit)?' ':` ${unit||''} `);
  }
  for(const word of [...MEALS,...PREP_WORDS]) query=query.replaceAll(word,' ');
  query=query.replace(/\s+/g,' ').trim();
  return {raw,query,quantity,unit,meal,preparation};
}

export function detectAmbiguity(parsed){
  if(parsed.query.includes('chicken')){
    const cuts=['breast','thigh','drumstick','wing','ground','whole'];
    const cut=cuts.find(x=>parsed.query.includes(x));
    if(!cut){
      return {type:'chicken_cut',question:'Which chicken cut?',options:['Breast','Thigh','Drumstick','Wing','Ground chicken','Whole chicken']};
    }
    if(['breast','thigh'].includes(cut) && !parsed.preparation){
      return {type:'chicken_prep',question:'Is it raw or cooked?',options:['Raw','Cooked']};
    }
  }
  return null;
}