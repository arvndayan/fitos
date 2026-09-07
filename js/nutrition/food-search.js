import {FITOS_API_BASE} from '../config.js';

export function rankLocalFoods(query,foods,usage={}){
  const q=String(query||'').toLowerCase().trim();
  if(!q)return [];
  return foods.map(food=>{
    const candidates=[food.name,...(food.aliases||[])].map(x=>x.toLowerCase());
    let score=0;
    if(candidates.some(x=>x===q))score+=100;
    if(candidates.some(x=>x.startsWith(q)))score+=50;
    if(candidates.some(x=>x.includes(q)))score+=25;
    if(score > 0){
  score += Math.min(20, Number(usage[food.id] || 0));
}
    return {food,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.food);
}

export async function searchFitOSBackend(query,pageSize=20){
  if(!FITOS_API_BASE)return [];
  const u=new URL('/api/v1/foods/search',FITOS_API_BASE);
  u.searchParams.set('q',query);
  u.searchParams.set('limit',String(pageSize));
  const r=await fetch(u);
  if(!r.ok)throw new Error(`FitOS food API failed (${r.status})`);
  return r.json();
}

export async function lookupBarcode(code){
  if(!FITOS_API_BASE)throw new Error('FitOS API backend is not configured');
  const u=new URL(`/api/v1/foods/barcode/${encodeURIComponent(code)}`,FITOS_API_BASE);
  const r=await fetch(u);
  if(!r.ok)throw new Error(`Barcode lookup failed (${r.status})`);
  return r.json();
}

export async function searchOpenFoodFacts(query,pageSize=12){
  // Browser fallback only. Production should prefer the FitOS backend.
  const params=new URLSearchParams({
    search_terms:query,search_simple:'1',action:'process',json:'1',
    page_size:String(pageSize),
    fields:'code,product_name,brands,nutriments,serving_size,quantity,image_front_small_url'
  });
  const response=await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`);
  if(!response.ok)throw new Error(`Open Food Facts search failed (${response.status})`);
  const data=await response.json();
  return (data.products||[]).map(p=>({
    id:`off:${p.code}`,source:'Open Food Facts',sourceId:p.code,
    name:p.product_name||p.brands||'Unnamed product',brand:p.brands||'',barcode:p.code||'',
    servingSize:p.serving_size||'',image:p.image_front_small_url||'',portions:[],
    per100g:{
      calories:n(p.nutriments?.['energy-kcal_100g']),protein:n(p.nutriments?.proteins_100g),
      carbs:n(p.nutriments?.carbohydrates_100g),fat:n(p.nutriments?.fat_100g),
      fiber:n(p.nutriments?.fiber_100g),sugar:n(p.nutriments?.sugars_100g),
      saturatedFat:n(p.nutriments?.['saturated-fat_100g']),
      sodium:mg(p.nutriments?.sodium_100g),potassium:mg(p.nutriments?.potassium_100g),
      cholesterol:mg(p.nutriments?.cholesterol_100g),calcium:mg(p.nutriments?.calcium_100g),
      iron:mg(p.nutriments?.iron_100g)
    }
  }));
}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function mg(v){const x=n(v);return x==null?null:x*1000}
