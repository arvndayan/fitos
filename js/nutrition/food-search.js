import { FITOS_API_BASE } from '../config.js';

export function rankLocalFoods(query, foods, usage = {}) {
  const q = String(query || '').toLowerCase().trim();

  if (!q) return [];

  return foods
    .map(food => {
      const candidates = [
        food.name,
        ...(food.aliases || [])
      ].map(x => String(x || '').toLowerCase());

      let score = 0;

      if (candidates.some(x => x === q)) {
        score += 100;
      }

      if (candidates.some(x => x.startsWith(q))) {
        score += 50;
      }

      if (candidates.some(x => x.includes(q))) {
        score += 25;
      }

      // Only apply usage/frequency boost when the food
      // actually matches the user's search query.
      if (score > 0) {
        score += Math.min(
          20,
          Number(usage[food.id] || 0)
        );
      }

      return {
        food,
        score
      };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.food);
}

export async function searchFitOSBackend(query, pageSize = 20) {
  if (!FITOS_API_BASE) {
    return [];
  }

  const url = new URL(
    '/api/v1/foods/search',
    FITOS_API_BASE
  );

  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(pageSize));

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `FitOS food API failed (${response.status})`
    );
  }

  const data = await response.json();

  return Array.isArray(data) ? data : [];
}

export async function lookupBarcode(code) {
  if (!FITOS_API_BASE) {
    throw new Error(
      'FitOS API backend is not configured'
    );
  }

  const url = new URL(
    `/api/v1/foods/barcode/${encodeURIComponent(code)}`,
    FITOS_API_BASE
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Barcode lookup failed (${response.status})`
    );
  }

  return response.json();
}

export async function searchOpenFoodFacts(
  query,
  pageSize = 12
) {
  // Browser fallback only.
  // Production should prefer the FitOS backend.

  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(pageSize),
    fields:
      'code,product_name,brands,nutriments,serving_size,quantity,image_front_small_url'
  });

  const response = await fetch(
    `https://world.openfoodfacts.org/cgi/search.pl?${params}`
  );

  if (!response.ok) {
    throw new Error(
      `Open Food Facts search failed (${response.status})`
    );
  }

  const data = await response.json();

  return (data.products || []).map(product => ({
    id: `off:${product.code}`,
    source: 'Open Food Facts',
    sourceId: product.code,

    name:
      product.product_name ||
      product.brands ||
      'Unnamed product',

    brand: product.brands || '',
    barcode: product.code || '',
    servingSize: product.serving_size || '',
    image: product.image_front_small_url || '',
    portions: [],

    per100g: {
      calories: numberValue(
        product.nutriments?.['energy-kcal_100g']
      ),

      protein: numberValue(
        product.nutriments?.proteins_100g
      ),

      carbs: numberValue(
        product.nutriments?.carbohydrates_100g
      ),

      fat: numberValue(
        product.nutriments?.fat_100g
      ),

      fiber: numberValue(
        product.nutriments?.fiber_100g
      ),

      sugar: numberValue(
        product.nutriments?.sugars_100g
      ),

      saturatedFat: numberValue(
        product.nutriments?.['saturated-fat_100g']
      ),

      sodium: toMilligrams(
        product.nutriments?.sodium_100g
      ),

      potassium: toMilligrams(
        product.nutriments?.potassium_100g
      ),

      cholesterol: toMilligrams(
        product.nutriments?.cholesterol_100g
      ),

      calcium: toMilligrams(
        product.nutriments?.calcium_100g
      ),

      iron: toMilligrams(
        product.nutriments?.iron_100g
      )
    }
  }));
}

function numberValue(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function toMilligrams(value) {
  const number = numberValue(value);

  return number == null
    ? null
    : number * 1000;
}
