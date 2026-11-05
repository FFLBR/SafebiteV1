import { strict as assert } from 'node:assert'
import { allergyOptions } from '../src/lib/allergen-detection.ts'
import { catalogProducts } from '../src/lib/products-data.ts'

const ids = new Set()
for (const product of catalogProducts) {
  assert.ok(!ids.has(product.id), `duplicate id ${product.id}`)
  ids.add(product.id)
  assert.ok(Array.isArray(product.allergens), `${product.id}: allergens missing`)
  assert.ok(Array.isArray(product.mayContain), `${product.id}: mayContain missing`)
  for (const allergen of [...product.allergens, ...product.mayContain]) {
    assert.ok(allergyOptions.includes(allergen), `${product.id}: unknown allergen ${allergen}`)
  }
  assert.ok(Number.isFinite(product.kcalPer100) && product.kcalPer100 >= 0, `${product.id}: kcal missing`)
}
const lactoseFree = catalogProducts.find((p) => p.id === 'yogurt-lactose-free')
assert.ok(!lactoseFree.allergens.includes('Лактоза'), 'lactose-free yogurt should not list lactose')
assert.ok(lactoseFree.ingredients.some((ingredient) => ingredient.includes('молоко')), 'lactose-free yogurt still contains milk')
console.log(`Products data checks passed: ${catalogProducts.length} items`)
