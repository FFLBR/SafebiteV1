import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownUp,
  ArrowRight,
  Camera,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  Heart,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Minus,
  Plus,
  QrCode,
  ScanLine,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  ShoppingBag,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { allergyOptions, analyzeIngredients, type Allergy } from '@/lib/allergen-detection'
import { getProductSafetyStatus } from '@/lib/product-safety'
import { catalogProducts } from '@/lib/products-data'
import { matchesProductSearch } from '@/lib/product-search'
import { recognizeIngredients } from '@/lib/ocr'

type StoreId = 'vkusvill' | 'pyaterochka' | 'perekrestok' | 'magnit' | 'auchan'
type Coordinates = { lat: number; lon: number }
type NearbyStore = {
  id: string
  name: string
  storeId: StoreId
  lat: number
  lon: number
  address: string
  distanceMeters: number
  walkingMinutes: number
}

type SafetyStatus = 'safe' | 'caution' | 'danger'
type ProductType = 'milk' | 'yogurt' | 'cheese' | 'bread' | 'chocolate' | 'drink' | 'grocery'
type Product = {
  id: string
  name: string
  typeTag: ProductType
  storeId: StoreId
  store: string
  price: number
  image: string
  description: string
  ingredients: string[]
  allergens: Allergy[]
  mayContain: Allergy[]
  kcalPer100: number
  example?: boolean
}

const StoreMap = lazy(() => import('@/components/store-map').then((module) => ({ default: module.StoreMap })))
const DEMO_CENTER: Coordinates = { lat: 55.7539, lon: 37.6208 }
const DEMO_STORES: NearbyStore[] = [
  { id: 'demo-vkusvill-1', name: 'ВкусВилл', storeId: 'vkusvill', lat: 55.7594, lon: 37.6259, address: 'ул. Центральная, 14', distanceMeters: 780, walkingMinutes: 10 },
  { id: 'demo-pyaterochka-1', name: 'Пятёрочка', storeId: 'pyaterochka', lat: 55.749, lon: 37.629, address: 'пер. Садовый, 8', distanceMeters: 820, walkingMinutes: 11 },
  { id: 'demo-perekrestok-1', name: 'Перекрёсток', storeId: 'perekrestok', lat: 55.758, lon: 37.608, address: 'ул. Парковая, 21', distanceMeters: 1030, walkingMinutes: 13 },
  { id: 'demo-magnit-1', name: 'Магнит', storeId: 'magnit', lat: 55.747, lon: 37.611, address: 'ул. Речная, 5', distanceMeters: 1120, walkingMinutes: 14 },
  { id: 'demo-vkusvill-2', name: 'ВкусВилл', storeId: 'vkusvill', lat: 55.766, lon: 37.618, address: 'пр-т Центральный, 31', distanceMeters: 1390, walkingMinutes: 18 },
  { id: 'demo-pyaterochka-2', name: 'Пятёрочка', storeId: 'pyaterochka', lat: 55.754, lon: 37.64, address: 'ул. Новая, 12', distanceMeters: 1240, walkingMinutes: 16 },
  { id: 'demo-perekrestok-2', name: 'Перекрёсток', storeId: 'perekrestok', lat: 55.744, lon: 37.63, address: 'пл. Зелёная, 3', distanceMeters: 1590, walkingMinutes: 20 },
  { id: 'demo-magnit-2', name: 'Магнит', storeId: 'magnit', lat: 55.762, lon: 37.638, address: 'ул. Восточная, 17', distanceMeters: 1530, walkingMinutes: 19 },
  { id: 'demo-auchan-1', name: 'Ашан', storeId: 'auchan', lat: 55.748, lon: 37.599, address: 'ш. Западное, 2', distanceMeters: 1760, walkingMinutes: 22 },
]

const storeMeta: Record<StoreId, { name: string; initials: string; color: string; surface: string; url: string }> = {
  vkusvill: { name: 'ВкусВилл', initials: 'ВВ', color: '#348252', surface: '#eaf3ec', url: 'https://vkusvill.ru/' },
  pyaterochka: { name: 'Пятёрочка', initials: '5', color: '#cf3c48', surface: '#f8ebec', url: 'https://5ka.ru/' },
  perekrestok: { name: 'Перекрёсток', initials: 'П', color: '#337b4c', surface: '#eaf2eb', url: 'https://www.perekrestok.ru/' },
  magnit: { name: 'Магнит', initials: 'М', color: '#d14548', surface: '#f8ebec', url: 'https://magnit.ru/' },
  auchan: { name: 'Ашан', initials: 'А', color: '#df493d', surface: '#fbefe8', url: 'https://www.auchan.ru/' },
}

const allergyDescriptions: Record<Allergy, string> = {
  Лактоза: "Непереносимость молочного сахара",
  Яйца: 'Яйца и продукты их переработки',
  Рыба: 'Рыба и продукты её переработки',
  Ракообразные: 'Креветки, крабы и другие ракообразные',
  Орехи: 'Миндаль и другие орехи, кроме арахиса',
  Арахис: 'Арахис и продукты его переработки',
  Соя: 'Соевые бобы и соевые ингредиенты',
  'Злаки / глютен': 'Пшеница, рожь, ячмень и овёс',
  Сельдерей: 'Сельдерей и продукты его переработки',
  Горчица: 'Горчица и продукты её переработки',
  Кунжут: 'Семена кунжута и продукты их переработки',
  Сульфиты: 'Сульфиты и диоксид серы',
  Люпин: 'Люпин и продукты его переработки',
  Моллюски: 'Мидии, устрицы, кальмары и другие моллюски',
}
const typeFilters: { label: string; value: ProductType | 'all' }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Молоко', value: 'milk' },
  { label: 'Йогурт', value: 'yogurt' },
  { label: 'Сыр', value: 'cheese' },
  { label: 'Хлеб', value: 'bread' },
  { label: 'Шоколад', value: 'chocolate' },
  { label: 'Напитки', value: 'drink' },
  { label: 'Бакалея', value: 'grocery' },
]

const products: Product[] = catalogProducts.map((product) => ({
  ...product,
  store: storeMeta[product.storeId].name,
}))

const typeLabels: Record<ProductType, string> = {
  milk: 'Молоко', yogurt: 'Йогурт', cheese: 'Сыр', bread: 'Хлеб', chocolate: 'Шоколад', drink: 'Напитки', grocery: 'Бакалея',
}
const safetyRank: Record<SafetyStatus, number> = { safe: 0, caution: 1, danger: 2 }
const safetyLabels: Record<SafetyStatus, string> = { safe: 'Нет совпадений', caution: 'Возможны следы', danger: 'Есть аллерген' }
const rubles = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const getSafety = getProductSafetyStatus

function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

function formatPrice(price: number) {
  return `${rubles.format(price)} ₽`
}

function Header({ count, onCart, onAllergies, query, onQueryChange, onSearch }: { count: number; onCart: () => void; onAllergies: () => void; query: string; onQueryChange: (value: string) => void; onSearch: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#0d2a5c] bg-[#051B41] backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-y-2 px-4 pb-3 pt-3 sm:h-16 sm:flex-nowrap sm:gap-x-6 sm:px-8 sm:py-0">
        <a aria-label="SafeBite — каталог" className="flex items-center gap-2.5" href="#catalog">
          <img alt="SafeBite" className="h-7 w-auto" src={import.meta.env.BASE_URL + 'uploads/safebite-logo.png'} />
          <span className="hidden border-l border-[#1d3a6b] pl-2.5 text-xs text-[#a9bcd8] sm:inline">Безопасность превыше всего</span>
        </a>
        <div className="relative order-3 w-full sm:order-none sm:mx-auto sm:max-w-[440px]">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858d86]" size={16} />
          <Input aria-label="Поиск по названию или типу продукта" className="h-10 rounded-lg border-[#e2e5e1] bg-white pl-10 pr-10 text-xs shadow-none placeholder:text-[#a0a6a0] focus-visible:border-[#929b93] focus-visible:ring-[#dce1dc]" onChange={(event) => onQueryChange(event.target.value)} onClick={onSearch} onFocus={onSearch} placeholder="Поиск продуктов" value={query} />
          {query && <button aria-label="Очистить поиск" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#828a83]" onClick={() => onQueryChange('')} type="button"><X aria-hidden="true" size={14} /></button>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button aria-label="Настроить аллергии" className="size-10 rounded-xl border-[#e5e8e4] bg-white text-[#333c35] shadow-none hover:bg-[#f5f6f4]" onClick={onAllergies} size="icon" variant="outline"><SlidersHorizontal aria-hidden="true" /></Button>
          <Button aria-label={`Открыть корзину, товаров: ${count}`} className="relative size-10 rounded-xl border-[#e5e8e4] bg-white text-[#333c35] shadow-none hover:bg-[#f5f6f4]" onClick={onCart} size="icon" variant="outline">
          <ShoppingBag aria-hidden="true" />
          {count > 0 && <span style={{ backgroundColor: "#10b981" }} aria-hidden="true" className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-5 text-white bg-emerald-500">{count}</span>}
          </Button>
        </div>
      </div>
    </header>
  )
}

function AllergyFilters({ selected, onToggle }: { selected: Allergy[]; onToggle: (allergy: Allergy) => void }) {
  return (
    <section aria-labelledby="allergies-title" className="border-b border-[#e7e9e6] bg-white">
      
    </section>
  )
}

function AllergyDialog({ open, onOpenChange, pendingAllergies, onToggle, onSave }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pendingAllergies: Allergy[]
  onToggle: (allergy: Allergy, checked: boolean) => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-2xl border-[#e5e8e4] bg-white p-5 shadow-[0_24px_80px_rgba(26,45,30,0.16)] sm:max-w-[440px] sm:p-7">
        <DialogHeader className="gap-2 pr-8">
          
          <DialogTitle className="text-xl font-semibold tracking-[-0.04em] text-[#1d2a20]">Укажите ваши аллергии</DialogTitle>
          <DialogDescription className="sr-only">Мы отметим товары по демонстрационным данным. Лактоза не заменяет проверку аллергии на молочный белок, в том числе в безлактозных продуктах.</DialogDescription>
        </DialogHeader>
        <fieldset className="mt-5 flex flex-col gap-2">
          <legend className="sr-only">Выберите аллергии</legend>
          {allergyOptions.map((allergy) => {
            const checked = pendingAllergies.includes(allergy)
            const id = `allergy-${allergy.toLowerCase().replaceAll(' ', '-')}`
            return (
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition ${checked ? 'border-[#bad7c3] bg-[#f4faf5]' : 'border-[#ecefeb] bg-white hover:bg-[#fafbfa]'}`} htmlFor={id} key={allergy}>
                <Checkbox checked={checked} id={id} onCheckedChange={(value) => onToggle(allergy, value === true)} />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-[#2e3a31]">{allergy}</span>
                  <span className="mt-0.5 block text-[10px] text-[#889189]">{allergyDescriptions[allergy]}</span>
                </span>
              </label>
            )
          })}
        </fieldset>
        <Button className="mt-4 h-10 w-full rounded-lg bg-[#0AB24E] text-xs font-semibold text-[#051B41] hover:bg-[#099842]" onClick={onSave}>Сохранить и продолжить<ArrowRight aria-hidden="true" data-icon="inline-end" /></Button>
      </DialogContent>
    </Dialog>
  )
}

function LocationPanel() {
  return (
    <section aria-labelledby="map-heading" className="w-full">
      <div className="w-full overflow-hidden rounded-xl border border-[#e5e8e4] bg-white">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-[-0.025em] text-[#2b332d]" id="map-heading">Магазины рядом</h1>
            
          </div>
          
        </div>
        <Suspense fallback={<div aria-label="Загружаем карту" className="h-[260px] animate-pulse rounded-xl bg-[#f0f2ef]" />}>
          <StoreMap center={DEMO_CENTER} stores={DEMO_STORES} />
        </Suspense>
      </div>
      
    </section>
  )
}

function SafetyLabel({ status }: { status: SafetyStatus }) {
  const Icon = status === 'safe' ? CircleCheck : status === 'caution' ? CircleAlert : CircleAlert
  const styles = status === 'safe'
    ? 'border-[#dce9df] bg-[#f2f7f3] text-[#39734b]'
    : status === 'caution'
      ? 'border-[#eee2c9] bg-[#faf6ec] text-[#967032]'
      : 'border-[#eedddd] bg-[#faf1f1] text-[#aa4b4b]'
  return <span className={`inline-flex w-fit max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-semibold ${styles}`}><Icon aria-hidden="true" className="shrink-0" size={12} />{safetyLabels[status]}</span>
}

function ProductCard({ product, status, allergies, onDetails, onAdd, quantity, onQuantityChange, favorite, onFavorite }: {
  product: Product
  status: SafetyStatus
  allergies: Allergy[]
  onDetails: (product: Product) => void
  onAdd: (product: Product) => void
  quantity: number
  onQuantityChange: (product: Product, delta: number) => void
  favorite: boolean
  onFavorite: (productId: string) => void
}) {
  const store = storeMeta[product.storeId]
  return (
    <article className={`product-card overflow-hidden rounded-xl border bg-white hover:border-[#b5d9c0] ${status === 'danger' ? 'border-[#e9d6d6]' : 'border-[#e5e8e4]'}`}>
      <div className="relative aspect-[1.18/1] overflow-hidden" style={{ backgroundColor: store.surface }}>
        <button aria-label={`Подробнее: ${product.name}`} className="size-full p-2" onClick={() => onDetails(product)} type="button">
          <img alt={`${product.name} — демонстрационное фото продукта`} className="size-full rounded-lg object-contain" loading="lazy" src={asset(product.image)} />
        </button>
        {product.example ? <span className="absolute left-2 top-2 rounded bg-[#566158] px-1.5 py-1 text-[8px] font-semibold text-white">Пример</span> : <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded px-1.5 py-1 shadow-sm" style={{ backgroundColor: store.color }}>
          <span aria-hidden="true" className="flex size-3.5 items-center justify-center rounded-sm bg-white/20 text-[8px] font-bold text-white">{store.initials}</span>
          <span className="text-[8px] font-semibold text-white">{store.name}</span>
        </span>}
        <button aria-label={favorite ? 'Убрать из избранного' : 'В избранное'} aria-pressed={favorite} className={`absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-lg border border-[#e7e9e6] bg-white/95 ${favorite ? 'text-[#b84e4e]' : 'text-[#737b74]'}`} onClick={() => onFavorite(product.id)} type="button"><Heart aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} size={15} /></button>
      </div>
      <div className="p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[9px] uppercase tracking-[0.08em] text-[#929992]">{typeLabels[product.typeTag]}</span><SafetyLabel status={status} /></div>
        <button className="safebite-display mt-2 min-h-10 text-left text-[12px] font-bold leading-[1.5] text-[#2d352f] transition-colors hover:text-[#087d39]" onClick={() => onDetails(product)} type="button">{product.name}</button>
        {status !== 'safe' && <p className={`mt-1 line-clamp-1 text-[10px] ${status === 'danger' ? 'text-[#a84a4a]' : 'text-[#90713b]'}`}>{status === 'danger' ? `Есть: ${product.allergens.filter((item) => allergies.includes(item)).join(', ')}` : `Следы: ${product.mayContain.filter((item) => allergies.includes(item)).join(', ')}`}</p>}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#eff0ee] pt-3">
          <span className="text-sm font-semibold tracking-[-0.02em] text-[#28312b]">{product.example ? 'Нет цены' : formatPrice(product.price)}</span>
          {!product.example && (quantity > 0 ? (
            <div aria-label={`Количество ${product.name}: ${quantity}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#e2e5e1] bg-white px-1">
              <button aria-label={`Уменьшить количество: ${product.name}`} className="flex size-6 items-center justify-center rounded-md text-[#58645b] hover:bg-[#f2f4f1]" onClick={() => onQuantityChange(product, -1)} type="button"><Minus aria-hidden="true" size={13} /></button>
              <span aria-live="polite" className="min-w-4 text-center text-[11px] font-semibold text-[#303832]">{quantity}</span>
              <button aria-label={`Увеличить количество: ${product.name}`} className="flex size-6 items-center justify-center rounded-md text-[#58645b] hover:bg-[#f2f4f1]" onClick={() => onQuantityChange(product, 1)} type="button"><Plus aria-hidden="true" size={13} /></button>
            </div>
          ) : (
            <Button aria-label={`Добавить ${product.name} в корзину`} className="h-8 rounded-lg bg-[#0AB24E] px-2.5 text-[10px] text-[#051B41] hover:bg-[#099842]" onClick={() => onAdd(product)}><Plus aria-hidden="true" data-icon="inline-start" />Добавить</Button>
          ))}
        </div>
      </div>
    </article>
  )
}

function ProductDetails({ product, allergies, onClose, onAdd }: { product: Product | null; allergies: Allergy[]; onClose: () => void; onAdd: (product: Product) => void }) {
  const status = product ? getSafety(product, allergies) : 'safe'
  const matches = product ? product.allergens.filter((allergen) => allergies.includes(allergen)) : []
  const traces = product ? product.mayContain.filter((allergen) => allergies.includes(allergen)) : []
  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto rounded-xl border-[#e5e8e4] bg-white p-5 sm:max-w-[500px]">
        {product && <>
          <div className="flex gap-4">
            <img alt={`${product.name} — фото продукта`} className="size-24 shrink-0 rounded-lg bg-[#f4f5f2] object-cover sm:size-28" src={asset(product.image)} />
            <div className="min-w-0 pt-1">
              <span className="text-[10px] text-[#858d86]">{product.example ? 'Демонстрационный пример' : storeMeta[product.storeId].name} · {typeLabels[product.typeTag]}</span>
              <DialogHeader className="mt-1 gap-1 text-left">
                <DialogTitle className="text-base font-semibold leading-6 text-[#2d352f]">{product.name}</DialogTitle>
                <DialogDescription className="text-[11px] text-[#858d86]">{product.description}</DialogDescription>
              </DialogHeader>
              <div className="mt-2 flex flex-wrap items-center gap-2"><SafetyLabel status={status} /><span className="text-sm font-semibold text-[#303832]">{product.example ? 'Нет цены' : formatPrice(product.price)}</span></div>
            </div>
          </div>
          <div className="mt-5">
            <h3 className="text-xs font-semibold text-[#353d36]">Состав</h3>
            <p className="mt-2 text-[11px] leading-6 text-[#687169]">{product.ingredients.join(', ')}.</p>
            <p className="mt-2 text-[11px] leading-5 text-[#687169]"><strong>Содержит:</strong> {product.allergens.length ? product.allergens.join(', ') : 'не указано в демоданных'}.</p>
            <p className="mt-1 text-[11px] leading-5 text-[#687169]"><strong>Возможны следы:</strong> {product.mayContain.length ? product.mayContain.join(', ') : 'не указано в демоданных'}.</p>
            <p className="mt-1 text-[11px] leading-5 text-[#687169]"><strong>Калорийность:</strong> около {product.kcalPer100} ккал на 100 г/мл.</p>
          </div>
          <div className={`mt-4 rounded-lg border px-3.5 py-3 ${status === 'danger' ? 'border-[#eedddd] bg-[#faf1f1]' : status === 'caution' ? 'border-[#eee2c9] bg-[#faf6ec]' : 'border-[#dce9df] bg-[#f2f7f3]'}`}>
            <p className="flex items-center gap-2 text-[11px] font-semibold text-[#424a43]"><ShieldCheck aria-hidden="true" size={14} />Сверка с данными каталога</p>
            <p className="mt-1.5 text-[10px] leading-5 text-[#697169]">{matches.length ? `В демонстрационных данных указан аллерген: ${matches.join(', ')}.` : traces.length ? `Возможны следы аллергена: ${traces.join(', ')}.` : 'Состав проверен и сверен с вашим списком аллергий: совпадений не найдено.'}</p>
          </div>
          {!product.example && <Button className="mt-5 h-10 rounded-lg bg-[#0AB24E] text-xs text-[#051B41] hover:bg-[#099842]" onClick={() => onAdd(product)}>Добавить · {formatPrice(product.price)}<Plus aria-hidden="true" data-icon="inline-end" /></Button>}
        </>}
      </DialogContent>
    </Dialog>
  )
}

function CartDrawer({ open, onOpenChange, cart, onChangeQuantity }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: Record<string, number>
  onChangeQuantity: (product: Product, delta: number) => void
}) {
  const cartProducts = products.filter((product) => cart[product.id] > 0)
  const groups = (Object.keys(storeMeta) as StoreId[]).map((storeId) => ({
    storeId,
    items: cartProducts.filter((product) => product.storeId === storeId),
  })).filter((group) => group.items.length > 0)
  const totalCount = cartProducts.reduce((sum, product) => sum + cart[product.id], 0)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 border-[#e5e8e4] bg-white p-0 sm:max-w-[440px]">
        <SheetHeader className="border-b border-[#e9ebe8] px-5 py-5 pr-14">
          <SheetTitle className="text-base font-semibold text-[#2e362f]">Корзина</SheetTitle>
          <SheetDescription className="text-[11px] text-[#858d86]">{totalCount ? `${totalCount} ${totalCount === 1 ? 'товар' : 'товара'} · выберите магазин для заказа` : 'Пока ничего не добавлено'}</SheetDescription>
        </SheetHeader>
        {groups.length ? (
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {groups.map(({ storeId, items }) => {
              const store = storeMeta[storeId]
              const subtotal = items.reduce((sum, product) => sum + product.price * cart[product.id], 0)
              const units = items.reduce((sum, product) => sum + cart[product.id], 0)
              return (
                <section aria-label={`Корзина магазина ${store.name}`} className="mb-4 rounded-xl border border-[#e5e8e4]" key={storeId}>
                  
                  <ul className="divide-y divide-[#eff0ee] px-3.5">
                    {items.map((product) => <li className="flex items-center gap-3 py-3" key={product.id}>
                      <img alt="" className="size-12 rounded-md bg-[#f4f5f2] object-cover" src={asset(product.image)} />
                      <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium text-[#384039]">{product.name}</p><p className="mt-1 text-[10px] text-[#858d86]">{formatPrice(product.price)}</p></div>
                      <div aria-label={`Количество: ${cart[product.id]}`} className="inline-flex items-center gap-2 rounded-md border border-[#e6e8e5] px-1.5 py-1">
                        <button aria-label={`Уменьшить ${product.name}`} className="p-0.5 text-[#657067]" onClick={() => onChangeQuantity(product, -1)} type="button"><Minus aria-hidden="true" size={12} /></button>
                        <span className="min-w-3 text-center text-[10px] font-semibold">{cart[product.id]}</span>
                        <button aria-label={`Увеличить ${product.name}`} className="p-0.5 text-[#657067]" onClick={() => onChangeQuantity(product, 1)} type="button"><Plus aria-hidden="true" size={12} /></button>
                      </div>
                      <span className="w-12 text-right text-[10px] font-semibold text-[#444c45]">{formatPrice(product.price * cart[product.id])}</span>
                    </li>)}
                  </ul>
                  <header className="flex items-center justify-between border-b border-[#eceeeb] px-3.5 py-3">
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#333b35]"><span aria-hidden="true" className="flex size-6 items-center justify-center rounded text-[9px] font-bold text-white" style={{ backgroundColor: store.color }}>{store.initials}</span>{store.name}</span>
                    <span className="text-[10px] text-[#838a84]">{units} {units === 1 ? 'товар' : 'товара'}</span>
                  </header><div className="flex items-center justify-between border-t border-[#eceeeb] px-3.5 py-3"><span className="text-[10px] text-[#858d86]">Сумма в магазине</span><span className="text-xs font-semibold text-[#303832]">{formatPrice(subtotal)}</span></div>
                  <div className="px-3.5 pb-3.5">
                    <a className={`flex min-h-10 items-center justify-between rounded-lg px-3 text-[10px] font-semibold transition hover:brightness-90 ${storeId === 'auchan' ? 'text-[#111111]' : 'text-white'}`} style={{ backgroundColor: store.color }} href={store.url} rel="noreferrer" target="_blank">Перейти на сайт {store.name}<ArrowRight aria-hidden="true" size={14} /></a>
                  </div>
                </section>
              )
            })}
            <p className="px-1 text-[9px] leading-4 text-[#969c96]">Корзины магазинов независимы. Наличие и стоимость могут отличаться.</p>
          </div>
        ) : <div className="flex flex-1 flex-col items-center justify-center px-6 text-center"><span className="flex size-12 items-center justify-center rounded-xl bg-[#f2f4f1] text-[#707971]"><ShoppingBag aria-hidden="true" size={20} /></span><p className="mt-3 text-xs font-semibold text-[#353d36]">Корзина пуста</p><p className="mt-1 max-w-[220px] text-[10px] leading-5 text-[#858d86]">Добавленные товары появятся здесь, сгруппированные по магазинам.</p></div>}
      </SheetContent>
    </Sheet>
  )
}

// Текст состава распознаётся офлайн в браузере (Tesseract OCR, rus+eng).

const verdictStyles: Record<SafetyStatus, { label: string; box: string }> = {
  safe: { label: '🟢 СОВПАДЕНИЙ НЕ НАЙДЕНО', box: 'border-[#dce9df] bg-[#f2f7f3] text-[#39734b]' },
  caution: { label: '🟡 ВНИМАНИЕ', box: 'border-[#eee2c9] bg-[#faf6ec] text-[#967032]' },
  danger: { label: '🔴 ОПАСНО', box: 'border-[#eedddd] bg-[#faf1f1] text-[#aa4b4b]' },
}

function IngredientScanner({ allergies, onCheckProducts, onOpenAllergies, onClose }: {
  allergies: Allergy[]
  onCheckProducts: () => void
  onOpenAllergies: () => void
  onClose: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [dragging, setDragging] = useState(false)
  const [ingredientsOpen, setIngredientsOpen] = useState(true)
  const [error, setError] = useState('')

  // Освобождаем object URL предыдущего фото при смене и размонтировании.
  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
  }, [imageUrl])

  const handleFile = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Нужен файл изображения: фото или скриншот состава.')
      return
    }
    setError('')
    setImageUrl(URL.createObjectURL(file))
    setText('')
    setProgress(0)
    setPhase('scanning')
    try {
      const recognized = await recognizeIngredients(file, setProgress)
      setText(recognized)
      setPhase('done')
      if (!recognized) setError('Текст на фото не распознан. Попробуйте снимок ближе и ровнее.')
    } catch {
      setError('Не удалось распознать текст. Попробуйте другое фото.')
      setPhase('done')
    }
  }

  const analysis = useMemo(
    () => (phase === 'done' ? analyzeIngredients(text, allergies) : null),
    [allergies, phase, text],
  )
  const dangerAllergens = analysis?.containsAllergens.filter((item) => allergies.includes(item)) ?? []
  const traceAllergens = analysis?.traceAllergens.filter((item) => allergies.includes(item)) ?? []

  const verdict = analysis && (allergies.length === 0 ? null : verdictStyles[analysis.status])

  return (
    <section aria-labelledby="scanner-heading" className="rounded-xl border border-[#e5e8e4] bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f2f4f1] text-[#566158]"><ScanLine aria-hidden="true" size={17} /></span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-[-0.025em] text-[#2b332d]" id="scanner-heading">Сканер состава</h2>
          <p className="mt-1 text-[11px] leading-5 text-[#858d86]">Сфотографируйте этикетку: приложение найдёт маркеры аллергенов в тексте состава и сверит их с вашим профилем.</p>
        </div>
        <button aria-label="Свернуть сканер состава" className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-lg text-[#687169] hover:bg-[#f2f4f1]" onClick={onClose} type="button"><X aria-hidden="true" size={18} /></button>
      </div>

      <input accept="image/*" aria-label="Снять фото состава" capture="environment" className="sr-only" onChange={(event) => { handleFile(event.target.files?.[0]); event.target.value = '' }} ref={inputRef} tabIndex={-1} type="file" />
      <input accept="image/*" aria-label="Выбрать фото состава из галереи" className="sr-only" onChange={(event) => { handleFile(event.target.files?.[0]); event.target.value = '' }} ref={galleryInputRef} tabIndex={-1} type="file" />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div
          className={`relative overflow-hidden rounded-xl border border-dashed transition ${dragging ? 'border-[#344a3b] bg-[#f1f6f2]' : 'border-[#d3d9d3] bg-[#fafbfa]'}`}
          onDragLeave={() => setDragging(false)}
          onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
          onDrop={(event) => { event.preventDefault(); setDragging(false); handleFile(event.dataTransfer.files[0]) }}
        >
          {phase === 'idle' && (
            <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-3 px-6 py-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-white text-[#4d5a50] shadow-[0_6px_20px_rgba(26,45,30,0.08)]"><Camera aria-hidden="true" size={22} /></span>
              <span className="text-xs font-semibold text-[#2e3a31]">Сфотографировать или загрузить состав</span>
              <span className="max-w-[260px] text-[10px] leading-5 text-[#858d86]">Перетащите фото сюда, выберите из галереи или снимите камерой</span>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                <Button className="h-9 rounded-lg bg-[#0AB24E] px-3.5 text-[11px] text-[#051B41] hover:bg-[#099842]" onClick={() => inputRef.current?.click()} type="button"><Camera aria-hidden="true" data-icon="inline-start" />Камера</Button>
                <Button className="h-9 rounded-lg border-[#e2e5e1] bg-white px-3.5 text-[11px] text-[#333c35] shadow-none hover:bg-[#f5f6f4]" onClick={() => galleryInputRef.current?.click()} type="button" variant="outline"><ImagePlus aria-hidden="true" data-icon="inline-start" />Из галереи</Button>
              </div>
            </div>
          )}

          {phase !== 'idle' && imageUrl && (
            <div className="relative flex min-h-[220px] items-center justify-center bg-[#f4f5f2] p-3">
              <img alt="Загруженное фото состава" className="max-h-[260px] w-auto rounded-lg object-contain" src={imageUrl} />
              {phase === 'scanning' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 px-6 backdrop-blur-[2px]" role="status" aria-live="polite">
                  <LoaderCircle aria-hidden="true" className="animate-spin text-[#344a3b]" size={24} />
                  <p className="text-xs font-semibold text-[#2e3a31]">Распознаем текст состава (Tesseract OCR)...</p>
                  <div className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[#e5e8e4]">
                    <div className="h-full rounded-full bg-[#344a3b] transition-[width] duration-100" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[10px] text-[#858d86]">{progress}%</p>
                </div>
              )}
              {phase === 'done' && (
                <Button className="absolute bottom-3 right-3 h-8 rounded-lg border-[#e2e5e1] bg-white text-[10px] text-[#333c35] shadow-none hover:bg-[#f5f6f4]" onClick={() => galleryInputRef.current?.click()} variant="outline"><ImagePlus aria-hidden="true" data-icon="inline-start" />Другое фото</Button>
              )}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          {error && <p className="rounded-lg bg-[#faf1f1] px-3 py-2 text-[10px] text-[#aa4b4b]" role="alert">{error}</p>}

          {phase === 'idle' && (
            <div className="flex flex-1 flex-col justify-center rounded-xl bg-[#f8faf8] p-4 text-[10px] leading-5 text-[#758078]">
              <p className="font-semibold text-[#414a43]">Как это работает</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>Снимите блок «Состав» на упаковке.</li>
                <li>Текст распознаётся и проверяется по маркерам аллергенов.</li>
                <li>Сверьте результаты с данными демонстрационного каталога.</li>
              </ol>
            </div>
          )}

          {phase === 'scanning' && (
            <div className="flex flex-1 flex-col justify-center gap-2 rounded-xl bg-[#f8faf8] p-4 text-[10px] text-[#758078]">
              <p>Ищем маркеры: лактоза, орехи, соя и другие ингредиенты из общего списка аллергенов.</p>
            </div>
          )}

          {phase === 'done' && analysis && (
            <>
              {verdict ? (
                <div className={`rounded-xl border px-4 py-3.5 ${verdict.box}`} role="status">
                  <p className="text-sm font-semibold tracking-[-0.02em]">{verdict.label}</p>
                  <p className="mt-1 text-[11px] leading-5">
                    {analysis.status === 'danger' && `Содержит аллерген из вашего профиля: ${dangerAllergens.join(', ')}.`}
                    {analysis.status === 'caution' && `Возможны следы аллергенов: ${traceAllergens.join(', ')}.`}
                    {analysis.status === 'safe' && 'Маркеров ваших аллергенов в тексте не найдено. Всё равно сверяйте этикетку.'}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-[#e5e8e4] bg-[#f8faf8] px-4 py-3.5 text-[11px] leading-5 text-[#58635a]" role="status">
                  Профиль пуст. <button className="font-semibold text-[#344a3b] underline underline-offset-4" onClick={onOpenAllergies} type="button">Отметьте аллергии</button>, чтобы сверить состав.
                </div>
              )}

              <div className="rounded-xl border border-[#e5e8e4]">
                <button aria-expanded={ingredientsOpen} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setIngredientsOpen((value) => !value)} type="button">
                  <span className="text-[11px] font-semibold text-[#333c35]">Распознанные аллергены</span>
                  <ChevronDown aria-hidden="true" className={`text-[#7d857e] transition-transform ${ingredientsOpen ? 'rotate-180' : ''}`} size={15} />
                </button>
                {ingredientsOpen && (
                  <div className="border-t border-[#eceeeb] px-4 py-3">
                    <div className="flex flex-wrap gap-1.5" aria-label="Найденные аллергены">
                      {analysis.containsAllergens.map((allergen) => <span className="rounded-full bg-[#f5d9d9] px-2.5 py-1 text-[10px] font-semibold text-[#9b3b3b]" key={`d-${allergen}`}>Содержит: {allergen}</span>)}
                      {analysis.traceAllergens.map((allergen) => <span className="rounded-full bg-[#f6e9c8] px-2.5 py-1 text-[10px] font-semibold text-[#7d5a1f]" key={`t-${allergen}`}>Следы: {allergen}</span>)}
                      {analysis.matches.length === 0 && <span className="text-[10px] text-[#858d86]">Маркеры аллергенов не найдены</span>}
                    </div>
                  </div>
                )}
              </div>

              <Button className="h-10 rounded-lg bg-[#0AB24E] text-xs font-semibold text-[#051B41] hover:bg-[#099842]" onClick={onCheckProducts}>Посмотреть товары в каталоге<ArrowRight aria-hidden="true" data-icon="inline-end" /></Button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default function SafeBiteApp() {
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [pendingAllergies, setPendingAllergies] = useState<Allergy[]>([])
  const [allergyDialogOpen, setAllergyDialogOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all')
  const [cartOpen, setCartOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = matchesProductSearch({ ...product, typeLabel: typeLabels[product.typeTag] }, query)
      const matchesType = selectedType === 'all' || product.typeTag === selectedType
      return matchesQuery && matchesType
    }).sort((first, second) => safetyRank[getSafety(first, allergies)] - safetyRank[getSafety(second, allergies)])
  }, [allergies, query, selectedType])

  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const toggleAllergy = (allergy: Allergy) => setAllergies((current) => current.includes(allergy) ? current.filter((item) => item !== allergy) : [...current, allergy])
  const togglePendingAllergy = (allergy: Allergy, checked: boolean) => setPendingAllergies((current) => checked ? [...new Set([...current, allergy])] : current.filter((item) => item !== allergy))
  const openAllergySettings = () => {
    setPendingAllergies(allergies)
    setAllergyDialogOpen(true)
  }
  const saveAllergies = () => {
    setAllergies(pendingAllergies)
    setAllergyDialogOpen(false)
  }
  const addToCart = (product: Product) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }))
    setSelectedProduct(null)
  }
  const changeQuantity = (product: Product, delta: number) => setCart((current) => {
    const quantity = (current[product.id] ?? 0) + delta
    if (quantity <= 0) {
      const next = { ...current }
      delete next[product.id]
      return next
    }
    return { ...current, [product.id]: quantity }
  })
  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  useEffect(() => {
    if (scannerOpen) scrollTo('scanner')
  }, [scannerOpen])
  const checkCatalog = () => {
    setSelectedType('all')
    setQuery('')
    scrollTo('catalog')
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-[#28312b]">
      <Header count={cartCount} onAllergies={openAllergySettings} onCart={() => setCartOpen(true)} onSearch={() => scrollTo('catalog')} onQueryChange={setQuery} query={query} />
      <button aria-controls="scanner" aria-expanded={scannerOpen} aria-label={scannerOpen ? 'Свернуть сканер состава' : 'Открыть сканер состава'} className={`fixed left-0 top-32 z-20 flex h-12 w-11 items-center justify-center rounded-r-xl text-white shadow-lg transition-[width,background-color,box-shadow] duration-300 ease-out hover:w-[50px] hover:bg-[#0d2a5c] hover:shadow-xl active:w-[46px] active:duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0AB24E] motion-reduce:transition-none sm:top-24 ${scannerOpen ? 'bg-[#0d2a5c]' : 'bg-[#051B41]'}`} onClick={() => setScannerOpen((open) => !open)} type="button"><QrCode aria-hidden="true" size={21} strokeWidth={3} /></button>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 pb-16 pt-5 sm:gap-6 sm:px-8 sm:pt-7">
        <LocationPanel />
        <AllergyFilters onToggle={toggleAllergy} selected={allergies} />
        <div aria-hidden={!scannerOpen} className={`grid scroll-mt-36 transition-[grid-template-rows,margin] duration-500 ease-in-out motion-reduce:transition-none sm:scroll-mt-20 ${scannerOpen ? 'grid-rows-[1fr]' : '-mt-5 grid-rows-[0fr] sm:-mt-6'}`} id="scanner" inert={!scannerOpen}>
          <div className="min-h-0 overflow-hidden">
            <div className={`transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${scannerOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}>
              <IngredientScanner allergies={allergies} onCheckProducts={checkCatalog} onClose={() => setScannerOpen(false)} onOpenAllergies={openAllergySettings} />
            </div>
          </div>
        </div>
        <section aria-labelledby="catalog-heading" className="scroll-mt-36 sm:scroll-mt-20" id="catalog">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.035em] text-[#2d352f]" id="catalog-heading">Продукты и цены</h2>
              
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#858d86]"><ArrowDownUp aria-hidden="true" size={13} /><span>Сначала без совпадений</span></div>
          </div>
          <div aria-label="Тип продукта" className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {typeFilters.map(({ label, value }) => <button aria-pressed={selectedType === value} className={`min-h-8 shrink-0 rounded-lg border px-3 text-[10px] font-medium transition ${selectedType === value ? 'border-[#0AB24E] bg-[#0AB24E] text-[#051B41]' : 'border-[#e2e5e1] bg-white text-[#626b63] hover:bg-[#f1f3f0]'}`} key={value} onClick={() => setSelectedType(value)} type="button">{label}</button>)}
          </div>
          <div className="mb-3 mt-4 flex items-center justify-between border-b border-[#e5e8e4] pb-2.5">
            <p aria-live="polite" className="text-[10px] text-[#858d86]">{visibleProducts.length} товаров</p>
            {allergies.length > 0 && <span className="flex items-center gap-1.5 text-[9px] text-[#6f796f]"><ShieldCheck aria-hidden="true" size={12} />Учитвываем ваши аллергии</span>}
          </div>
          {visibleProducts.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {visibleProducts.map((product) => <ProductCard allergies={allergies} favorite={favorites.includes(product.id)} key={product.id} onAdd={addToCart} onDetails={setSelectedProduct} onFavorite={toggleFavorite} onQuantityChange={changeQuantity} product={product} quantity={cart[product.id] ?? 0} status={getSafety(product, allergies)} />)}
          </div> : <div className="rounded-xl border border-dashed border-[#dce0db] bg-white px-4 py-12 text-center"><p className="text-xs font-semibold text-[#454d46]">Ничего не найдено</p><p className="mt-1 text-[10px] text-[#858d86]">Проверьте название продукта или выберите другой тип.</p></div>}
        </section>
        <footer className="flex flex-col gap-1 border-t border-[#e5e8e4] pt-4 text-[9px] leading-4 text-[#949b94] sm:flex-row sm:justify-between"><span className="flex flex-wrap items-center gap-1.5"><img alt="SafeBite" className="h-4 w-auto" src={import.meta.env.BASE_URL + 'uploads/safebite-logo.png'} />· Каталог продуктов рядом · Фото иллюстративные · <a className="underline" href={asset('photo-credits.html')} rel="noreferrer" target="_blank">Источники фотографий</a></span><span>Каталог демонстрационный; состав и наличие не подтверждены производителями. Всегда проверяйте этикетку.</span></footer>
      </div>
      <AllergyDialog onOpenChange={setAllergyDialogOpen} onSave={saveAllergies} onToggle={togglePendingAllergy} open={allergyDialogOpen} pendingAllergies={pendingAllergies} />
      <ProductDetails allergies={allergies} onAdd={addToCart} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
      <CartDrawer cart={cart} onChangeQuantity={changeQuantity} onOpenChange={setCartOpen} open={cartOpen} />
    </main>
  )
}
