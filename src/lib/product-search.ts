type SearchableProduct = {
  name: string
  typeTag: string
  typeLabel: string
  store: string
}

function searchWords(value: string): string[] {
  return value.toLocaleLowerCase('ru').replaceAll('ё', 'е').match(/[\p{L}\p{N}]+/gu) ?? []
}

export function matchesProductSearch(product: SearchableProduct, query: string): boolean {
  if (!query.trim()) return true
  const queryWords = searchWords(query)
  if (!queryWords.length) return false
  const productWords = searchWords(`${product.name} ${product.typeTag} ${product.typeLabel} ${product.store}`)
  return queryWords.every((word) => productWords.some((productWord) => productWord.startsWith(word)))
}
