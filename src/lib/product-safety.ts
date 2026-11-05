import type { Allergy, SafetyStatus } from './allergen-detection'

export type ProductAllergens = { allergens: Allergy[]; mayContain: Allergy[] }

// Учебные профили категорий: не являются сведениями о конкретном производителе.
export const productProfiles = {
  'almond-milk': { allergens: ['Орехи'], mayContain: ['Соя', 'Злаки / глютен'] },
  'apple-juice': { allergens: [], mayContain: [] },
  bread: { allergens: ['Злаки / глютен'], mayContain: ['Кунжут', 'Лактоза', 'Соя'] },
  butter: { allergens: ['Лактоза'], mayContain: [] },
  cheese: { allergens: ['Лактоза'], mayContain: [] },
  chocolate: { allergens: ['Лактоза', 'Соя'], mayContain: ['Орехи', 'Арахис'] },
  cookies: { allergens: ['Злаки / глютен', 'Яйца', 'Лактоза'], mayContain: ['Орехи', 'Соя'] },
  cornflakes: { allergens: [], mayContain: ['Лактоза', 'Соя'] },
  'cottage-cheese': { allergens: ['Лактоза'], mayContain: [] },
  'gluten-free-bread': { allergens: [], mayContain: ['Кунжут', 'Яйца'] },
  'granola-nuts': { allergens: ['Злаки / глютен', 'Орехи', 'Арахис'], mayContain: ['Соя'] },
  granola: { allergens: ['Злаки / глютен'], mayContain: ['Орехи', 'Соя'] },
  kefir: { allergens: ['Лактоза'], mayContain: [] },
  'lactose-free-milk': { allergens: [], mayContain: ['Соя'] },
  'milk-chocolate': { allergens: ['Лактоза', 'Соя'], mayContain: ['Орехи'] },
  milk: { allergens: ['Лактоза'], mayContain: [] },
  oatmeal: { allergens: ['Злаки / глютен'], mayContain: ['Лактоза', 'Орехи'] },
  pasta: { allergens: ['Злаки / глютен'], mayContain: [] },
  rice: { allergens: [], mayContain: [] },
  'soy-drink': { allergens: ['Соя'], mayContain: ['Орехи'] },
  'yogurt-lactose-free': { allergens: [], mayContain: [] },
  'yogurt-natural': { allergens: ['Лактоза'], mayContain: [] },
  yogurt: { allergens: ['Лактоза'], mayContain: ['Злаки / глютен', 'Орехи'] },
} satisfies Record<string, ProductAllergens>

export type ProductProfileId = keyof typeof productProfiles

export function getProductSafetyStatus(product: ProductAllergens, allergies: Allergy[]): SafetyStatus {
  if (product.allergens.some((allergen) => allergies.includes(allergen))) return 'danger'
  if (product.mayContain.some((allergen) => allergies.includes(allergen))) return 'caution'
  return 'safe'
}
