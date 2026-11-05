import { strict as assert } from 'node:assert'
import { matchesProductSearch } from '../src/lib/product-search.ts'

const milk = { name: 'Молоко 3.2% Пятёрочка', typeTag: 'milk', typeLabel: 'Молоко', store: 'Пятёрочка' }
const lactoseFree = { name: 'Молоко без лактозы', typeTag: 'milk', typeLabel: 'Молоко', store: 'ВкусВилл' }
const bread = { name: 'Хлеб пшеничный Пятёрочка', typeTag: 'bread', typeLabel: 'Хлеб', store: 'Пятёрочка' }

for (const query of ['м', 'молок', 'МОЛОКО', ' milk ', 'пятер', 'молок пятер', 'ПЯТЁРОЧКА мол', '3.2 мол']) {
  assert.equal(matchesProductSearch(milk, query), true, query)
}
assert.equal(matchesProductSearch(lactoseFree, 'без лакт'), true)
assert.equal(matchesProductSearch(bread, 'молок'), false)
assert.equal(matchesProductSearch(milk, 'молоко хлеб'), false)
assert.equal(matchesProductSearch(milk, '  '), true)
assert.equal(matchesProductSearch(milk, '!!!'), false)
console.log('Product search checks passed')
