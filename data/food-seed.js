export const FOOD_SEED = [
  {
    id:'egg-whole-large',
    name:'Large Whole Egg',
    aliases:['egg','eggs','whole egg','large egg'],
    category:'protein',
    source:'USDA-style development seed',
    sourceId:'dev-egg',
    confidence:0.95,
    per100g:{calories:143,protein:12.6,carbs:0.72,fat:9.51,fiber:0,sugar:0.37,saturatedFat:3.13,sodium:142,potassium:138,cholesterol:372,calcium:56,iron:1.75},
    portions:[{unit:'egg',aliases:['eggs','large egg','large eggs'],grams:50}]
  },
  {
    id:'banana',
    name:'Banana',
    aliases:['banana','bananas'],
    category:'fruit',
    source:'USDA-style development seed',
    sourceId:'dev-banana',
    confidence:0.95,
    per100g:{calories:89,protein:1.09,carbs:22.84,fat:0.33,fiber:2.6,sugar:12.23,saturatedFat:0.11,sodium:1,potassium:358,cholesterol:0,calcium:5,iron:0.26},
    portions:[{unit:'banana',aliases:['bananas','medium banana'],grams:118}]
  },
  {
    id:'chapati',
    name:'Chapati / Roti',
    aliases:['chapati','chapatis','roti','rotis','phulka'],
    category:'grain',
    source:'FitOS Indian development seed',
    sourceId:'dev-roti',
    confidence:0.75,
    per100g:{calories:297,protein:9.6,carbs:46.4,fat:8.4,fiber:7.4,sugar:2.7,saturatedFat:1.2,sodium:408,potassium:250,cholesterol:0,calcium:30,iron:3},
    portions:[{unit:'roti',aliases:['rotis','chapati','chapatis'],grams:40}]
  },
  {
    id:'chicken-breast-cooked',
    name:'Chicken Breast, Cooked, Skinless',
    aliases:['chicken breast','cooked chicken breast','skinless chicken breast'],
    category:'meat',
    source:'USDA-style development seed',
    sourceId:'dev-chicken-breast-cooked',
    confidence:0.95,
    per100g:{calories:165,protein:31,carbs:0,fat:3.6,fiber:0,sugar:0,saturatedFat:1,sodium:74,potassium:256,cholesterol:85,calcium:15,iron:1.04},
    portions:[]
  },
  {
    id:'chicken-breast-raw',
    name:'Chicken Breast, Raw, Skinless',
    aliases:['raw chicken breast','chicken breast raw'],
    category:'meat',
    source:'USDA-style development seed',
    sourceId:'dev-chicken-breast-raw',
    confidence:0.95,
    per100g:{calories:120,protein:22.5,carbs:0,fat:2.6,fiber:0,sugar:0,saturatedFat:0.56,sodium:45,potassium:334,cholesterol:73,calcium:5,iron:0.37},
    portions:[]
  },
  {
    id:'chicken-thigh-cooked',
    name:'Chicken Thigh, Cooked, Skinless',
    aliases:['chicken thigh','cooked chicken thigh'],
    category:'meat',
    source:'USDA-style development seed',
    sourceId:'dev-chicken-thigh-cooked',
    confidence:0.92,
    per100g:{calories:209,protein:26,carbs:0,fat:10.9,fiber:0,sugar:0,saturatedFat:3,sodium:90,potassium:220,cholesterol:105,calcium:11,iron:1.3},
    portions:[]
  },
  {
    id:'white-rice-cooked',
    name:'White Rice, Cooked',
    aliases:['rice','white rice','cooked rice','basmati rice'],
    category:'grain',
    source:'USDA-style development seed',
    sourceId:'dev-rice',
    confidence:0.85,
    per100g:{calories:130,protein:2.7,carbs:28.2,fat:0.3,fiber:0.4,sugar:0.1,saturatedFat:0.08,sodium:1,potassium:35,cholesterol:0,calcium:10,iron:0.2},
    portions:[{unit:'cup',aliases:['cups'],grams:158}]
  },
  {
    id:'greek-yogurt-nonfat',
    name:'Greek Yogurt, Plain, Nonfat',
    aliases:['greek yogurt','nonfat greek yogurt','plain greek yogurt'],
    category:'dairy',
    source:'USDA-style development seed',
    sourceId:'dev-greek-yogurt',
    confidence:0.9,
    per100g:{calories:59,protein:10.3,carbs:3.6,fat:0.4,fiber:0,sugar:3.2,saturatedFat:0.1,sodium:36,potassium:141,cholesterol:5,calcium:110,iron:0.1},
    portions:[{unit:'cup',aliases:['cups'],grams:245}]
  }
];