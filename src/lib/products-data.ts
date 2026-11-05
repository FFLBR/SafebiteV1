import type { Allergy } from './allergen-detection'

// Демонстрационный каталог. Цены, магазины, состав и калорийность условные;
// аллергены выписаны по составу. Не заменяет проверку реальной упаковки.
// Калорийность — ориентировочная (на 100 г для твёрдых продуктов, на 100 мл для напитков и молока).

export type CatalogProductType = 'milk' | 'yogurt' | 'cheese' | 'bread' | 'chocolate' | 'drink' | 'grocery'
export type CatalogStoreId = 'vkusvill' | 'pyaterochka' | 'perekrestok' | 'magnit' | 'auchan'

export type CatalogProduct = {
  id: string
  name: string
  typeTag: CatalogProductType
  storeId: CatalogStoreId
  price: number
  image: string
  description: string
  ingredients: string[]
  // Аллергены, которые есть в составе товара (из списка).
  allergens: Allergy[]
  // Возможные следы (демо-оценка производства).
  mayContain: Allergy[]
  kcalPer100: number
  example?: boolean
}

export const catalogProducts: CatalogProduct[] = [
  // Молоко: молочный белок и лактоза
  { id: 'milk-vkusvill', name: 'Молоко 3.2% ВкусВилл', typeTag: 'milk', storeId: 'vkusvill', price: 110, image: '/uploads/products/milk.png', description: 'Пастеризованное молоко, 1 л', ingredients: ['молоко цельное', 'молоко обезжиренное'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 58 },
  { id: 'milk-pyaterochka', name: 'Молоко 3.2% Пятёрочка', typeTag: 'milk', storeId: 'pyaterochka', price: 89, image: '/uploads/products/wm-milk-argaman.jpg', description: 'Молоко питьевое пастеризованное, 1 л', ingredients: ['молоко нормализованное'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 58 },
  { id: 'milk-perekrestok', name: 'Молоко 3.2% Перекрёсток', typeTag: 'milk', storeId: 'perekrestok', price: 95, image: '/uploads/products/wm-trappist.jpg', description: 'Молоко отборное, 930 мл', ingredients: ['молоко цельное'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 58 },
  { id: 'milk-magnit', name: 'Молоко 3.2% Магнит', typeTag: 'milk', storeId: 'magnit', price: 85, image: '/uploads/products/wm-milk-hood.jpg', description: 'Молоко пастеризованное, 900 мл', ingredients: ['молоко нормализованное'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 58 },
  { id: 'milk-auchan', name: 'Молоко 3.2% Ашан', typeTag: 'milk', storeId: 'auchan', price: 92, image: '/uploads/products/wm-betsukai.jpg', description: 'Молоко питьевое, 1 л', ingredients: ['молоко нормализованное'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 58 },
  // Йогурты
  { id: 'yogurt-vkusvill', name: 'Йогурт натуральный ВкусВилл', typeTag: 'yogurt', storeId: 'vkusvill', price: 125, image: '/uploads/products/photo-yogurt-natural.jpg', description: 'Йогурт без добавок, 180 г', ingredients: ['молоко цельное', 'закваска йогуртовая'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 60 },
  { id: 'yogurt-pyaterochka', name: 'Йогурт клубничный Пятёрочка', typeTag: 'yogurt', storeId: 'pyaterochka', price: 79, image: '/uploads/products/yogurt.png', description: 'Йогурт с клубникой, 150 г', ingredients: ['молоко нормализованное', 'клубника', 'сахар', 'закваска'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 90 },
  { id: 'yogurt-magnit', name: 'Йогурт натуральный Магнит', typeTag: 'yogurt', storeId: 'magnit', price: 85, image: '/uploads/products/yogurt-natural.png', description: 'Йогурт классический, 170 г', ingredients: ['молоко', 'закваска'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 60 },
  // Безлактозный продукт всё равно содержит молочный белок
  { id: 'yogurt-lactose-free', name: 'Йогурт без лактозы ВкусВилл', typeTag: 'yogurt', storeId: 'vkusvill', price: 149, image: '/uploads/products/yogurt-lactose-free.png', description: 'Натуральный йогурт без лактозы, 150 г', ingredients: ['молоко без лактозы', 'закваска'], allergens: [], mayContain: [], kcalPer100: 60 },
  // Сыр
  { id: 'cheese-vkusvill', name: 'Сыр Российский ВкусВилл', typeTag: 'cheese', storeId: 'vkusvill', price: 299, image: '/uploads/products/cheese.png', description: 'Полутвёрдый сыр, 200 г', ingredients: ['молоко пастеризованное', 'закваска', 'соль', 'ферментный препарат'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 360 },
  { id: 'cheese-auchan', name: 'Сыр Российский Ашан', typeTag: 'cheese', storeId: 'auchan', price: 249, image: '/uploads/products/wm-cheese-block.jpg', description: 'Сыр полутвёрдый, 200 г', ingredients: ['молоко цельное', 'закваска', 'соль', 'кальций хлористый'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 360 },
  // Хлеб
  { id: 'bread-pyaterochka', name: 'Хлеб пшеничный Пятёрочка', typeTag: 'bread', storeId: 'pyaterochka', price: 69, image: '/uploads/products/photo-bread.jpg', description: 'Хлеб нарезанный, 350 г', ingredients: ['мука пшеничная', 'вода', 'дрожжи', 'соль'], allergens: ['Злаки / глютен'], mayContain: ['Кунжут', 'Лактоза', 'Соя'], kcalPer100: 240 },
  { id: 'bread-vkusvill', name: 'Хлеб без глютена ВкусВилл', typeTag: 'bread', storeId: 'vkusvill', price: 189, image: '/uploads/products/gluten-free-bread.png', description: 'Хлеб из рисовой и кукурузной муки, 250 г', ingredients: ['мука рисовая', 'мука кукурузная', 'вода', 'дрожжи', 'псиллиум'], allergens: [], mayContain: ['Кунжут', 'Яйца'], kcalPer100: 230 },
  { id: 'bread-auchan', name: 'Хлеб пшеничный Ашан', typeTag: 'bread', storeId: 'auchan', price: 59, image: '/uploads/products/bread.png', description: 'Батон нарезной, 300 г', ingredients: ['мука пшеничная', 'вода', 'сахар', 'дрожжи', 'соль'], allergens: ['Злаки / глютен'], mayContain: ['Соя'], kcalPer100: 250 },
  // Шоколад
  { id: 'chocolate-perekrestok', name: 'Шоколад молочный Перекрёсток', typeTag: 'chocolate', storeId: 'perekrestok', price: 139, image: '/uploads/products/milk-chocolate.png', description: 'Молочный шоколад, 90 г', ingredients: ['сахар', 'какао-масло', 'сухое цельное молоко', 'какао тёртое', 'соевый лецитин'], allergens: ['Лактоза', 'Соя'], mayContain: ['Орехи', 'Арахис'], kcalPer100: 535 },
  { id: 'chocolate-auchan', name: 'Шоколад тёмный 72% Ашан', typeTag: 'chocolate', storeId: 'auchan', price: 129, image: '/uploads/products/chocolate.png', description: 'Тёмный шоколад, 90 г', ingredients: ['какао тёртое', 'сахар', 'какао-масло', 'соевый лецитин'], allergens: ['Соя'], mayContain: ['Лактоза', 'Орехи', 'Арахис'], kcalPer100: 590 },
  // Напитки
  { id: 'drink-oat-vkusvill', name: 'Напиток овсяный ВкусВилл', typeTag: 'drink', storeId: 'vkusvill', price: 149, image: '/uploads/products/photo-oat-drink.jpg', description: 'Овсяный напиток без сахара, 1 л', ingredients: ['вода', 'овёс 10%', 'масло подсолнечное', 'соль морская'], allergens: ['Злаки / глютен'], mayContain: ['Соя'], kcalPer100: 46 },
  { id: 'drink-soy-magnit', name: 'Напиток соевый Магнит', typeTag: 'drink', storeId: 'magnit', price: 109, image: '/uploads/products/soy-drink.png', description: 'Напиток на основе сои, 1 л', ingredients: ['вода', 'соевые бобы', 'соль морская'], allergens: ['Соя'], mayContain: ['Орехи'], kcalPer100: 36 },
  { id: 'drink-juice-pyaterochka', name: 'Сок яблочный Пятёрочка', typeTag: 'drink', storeId: 'pyaterochka', price: 99, image: '/uploads/products/apple-juice.png', description: 'Сок яблочный осветлённый, 1 л', ingredients: ['сок яблочный восстановленный'], allergens: [], mayContain: [], kcalPer100: 46 },
  { id: 'drink-kefir-magnit', name: 'Кефир 2.5% Магнит', typeTag: 'drink', storeId: 'magnit', price: 75, image: '/uploads/products/kefir.png', description: 'Кефир, 900 мл', ingredients: ['молоко нормализованное', 'закваска кефирная'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 53 },
  // Примеры категорий (без цены в интерфейсе)
  { id: 'almond-milk', name: 'Миндальное молоко', typeTag: 'drink', storeId: 'vkusvill', price: 219, image: '/uploads/products/almond-milk.png', description: 'Растительный напиток, 1 л', ingredients: ['вода', 'миндаль'], allergens: ['Орехи'], mayContain: ['Соя', 'Злаки / глютен'], kcalPer100: 24 },
  { id: 'butter', name: 'Сливочное масло', typeTag: 'grocery', storeId: 'pyaterochka', price: 179, image: '/uploads/products/photo-butter.jpg', description: 'Масло сливочное, 180 г', ingredients: ['сливки'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 748 },
  { id: 'chocolate', name: 'Шоколад с молоком', typeTag: 'chocolate', storeId: 'magnit', price: 119, image: '/uploads/products/illustration-milk-chocolate.jpg', description: 'Молочный шоколад, 90 г', ingredients: ['какао', 'сахар', 'молоко', 'соевый лецитин'], allergens: ['Лактоза', 'Соя'], mayContain: ['Орехи', 'Арахис'], kcalPer100: 535 },
  { id: 'cookies', name: 'Печенье', typeTag: 'grocery', storeId: 'auchan', price: 99, image: '/uploads/products/cookies.png', description: 'Печенье пшеничное, 200 г', ingredients: ['пшеничная мука', 'яйца', 'молоко', 'сахар'], allergens: ['Злаки / глютен', 'Яйца', 'Лактоза'], mayContain: ['Орехи', 'Соя'], kcalPer100: 450 },
  { id: 'cornflakes', name: 'Кукурузные хлопья', typeTag: 'grocery', storeId: 'perekrestok', price: 169, image: '/uploads/products/cornflakes.png', description: 'Хлопья кукурузные, 250 г', ingredients: ['кукуруза'], allergens: [], mayContain: ['Лактоза', 'Соя'], kcalPer100: 375 },
  { id: 'cottage-cheese', name: 'Творог', typeTag: 'cheese', storeId: 'vkusvill', price: 139, image: '/uploads/products/cottage-cheese.png', description: 'Творог, 180 г', ingredients: ['молоко', 'закваска'], allergens: ['Лактоза'], mayContain: [], kcalPer100: 121 },
  { id: 'granola-nuts', name: 'Гранола с орехами и арахисом', typeTag: 'grocery', storeId: 'perekrestok', price: 279, image: '/uploads/products/granola-nuts.png', description: 'Гранола с орехами, 300 г', ingredients: ['овсяные хлопья', 'орехи', 'арахис'], allergens: ['Злаки / глютен', 'Орехи', 'Арахис'], mayContain: ['Соя'], kcalPer100: 460 },
  { id: 'granola', name: 'Гранола', typeTag: 'grocery', storeId: 'magnit', price: 199, image: '/uploads/products/granola.png', description: 'Гранола овсяная, 300 г', ingredients: ['овсяные хлопья'], allergens: ['Злаки / глютен'], mayContain: ['Орехи', 'Соя'], kcalPer100: 420 },
  { id: 'lactose-free-milk', name: 'Молоко без лактозы', typeTag: 'milk', storeId: 'vkusvill', price: 159, image: '/uploads/products/lactose-free-milk.png', description: 'Молоко без лактозы, 1 л', ingredients: ['молоко без лактозы'], allergens: [], mayContain: ['Соя'], kcalPer100: 58 },
  { id: 'oatmeal', name: 'Овсянка', typeTag: 'grocery', storeId: 'pyaterochka', price: 89, image: '/uploads/products/oatmeal.png', description: 'Хлопья овсяные, 400 г', ingredients: ['овсяные хлопья'], allergens: ['Злаки / глютен'], mayContain: ['Лактоза', 'Орехи'], kcalPer100: 370 },
  { id: 'pasta', name: 'Макароны', typeTag: 'grocery', storeId: 'auchan', price: 109, image: '/uploads/products/pasta.png', description: 'Макаронные изделия, 450 г', ingredients: ['пшеничная мука', 'вода'], allergens: ['Злаки / глютен'], mayContain: [], kcalPer100: 355 },
  { id: 'rice', name: 'Рис', typeTag: 'grocery', storeId: 'magnit', price: 129, image: '/uploads/products/rice.png', description: 'Рис шлифованный, 800 г', ingredients: ['рис'], allergens: [], mayContain: [], kcalPer100: 350 },
]
