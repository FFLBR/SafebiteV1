'use client'

import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { Footprints } from 'lucide-react'
import { readPedestrianRoute, type PedestrianRoute } from '@/lib/map-route'

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

const brandColors: Record<StoreId, { color: string; initials: string }> = {
  vkusvill: { color: '#348252', initials: 'ВВ' },
  pyaterochka: { color: '#cf3c48', initials: '5' },
  perekrestok: { color: '#337b4c', initials: 'П' },
  magnit: { color: '#d14548', initials: 'М' },
  auchan: { color: '#df493d', initials: 'А' },
}

const brandUrls: Record<StoreId, string> = {
  vkusvill: 'https://vkusvill.ru/',
  pyaterochka: 'https://5ka.ru/',
  perekrestok: 'https://www.perekrestok.ru/',
  magnit: 'https://magnit.ru/',
  auchan: 'https://www.auchan.ru/',
}

function makeStoreIcon(storeId: StoreId) {
  const brand = brandColors[storeId]
  return L.divIcon({
    className: 'safebite-map-icon',
    html: `<span class="safebite-map-pin" style="--pin-color:${brand.color}"><span>${brand.initials}</span></span>`,
    iconSize: [34, 40],
    iconAnchor: [17, 37],
    popupAnchor: [0, -34],
  })
}

const userIcon = L.divIcon({
  className: 'safebite-map-icon',
  html: '<span class="safebite-user-pin"><span></span></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

function FitRoute({ route }: { route: PedestrianRoute | null }) {
  const map = useMap()
  useEffect(() => {
    if (route) map.fitBounds(L.latLngBounds(route.points), { padding: [45, 45], maxZoom: 16 })
  }, [map, route])
  return null
}

export function StoreMap({ center, stores }: { center: Coordinates; stores: NearbyStore[] }) {
  const [routeStoreId, setRouteStoreId] = useState<string | null>(null)
  const [route, setRoute] = useState<PedestrianRoute | null>(null)
  const [routeStatus, setRouteStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [attempt, setAttempt] = useState(0)
  const [tileError, setTileError] = useState(false)
  const routeStore = stores.find((store) => store.id === routeStoreId)

  useEffect(() => {
    if (!routeStore) {
      setRoute(null)
      setRouteStatus('idle')
      return
    }
    const controller = new AbortController()
    setRoute(null)
    setRouteStatus('loading')
    const params = new URLSearchParams({ json: JSON.stringify({
      locations: [{ lat: center.lat, lon: center.lon }, { lat: routeStore.lat, lon: routeStore.lon }],
      costing: 'pedestrian',
      directions_options: { units: 'kilometers' },
    }) })
    fetch(`https://valhalla1.openstreetmap.de/route?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Route unavailable')
        return response.json()
      })
      .then((data: unknown) => {
        setRoute(readPedestrianRoute(data))
        setRouteStatus('ready')
      })
      .catch(() => {
        if (!controller.signal.aborted) setRouteStatus('error')
      })
    return () => controller.abort()
  }, [center.lat, center.lon, routeStore?.id, routeStore?.lat, routeStore?.lon, attempt])

  return (
    <>
    <div className="relative h-[260px] w-full">
      <MapContainer attributionControl={false} center={[center.lat, center.lon]} zoom={14} scrollWheelZoom className="safebite-leaflet-map" zoomControl>
        <TileLayer
          attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Tiles <a href="https://www.openstreetmap.fr/">OpenStreetMap France</a> / <a href="https://www.hotosm.org/">HOT</a>'}
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          subdomains="abc"
          maxZoom={19}
          eventHandlers={{ tileerror: () => setTileError(true) }}
        />
        <FitRoute route={route} />
        {route && <Polyline positions={route.points} pathOptions={{ color: '#3977da', weight: 5, opacity: 0.9 }} />}
        <Marker position={[center.lat, center.lon]} icon={userIcon}><Popup>Начальная точка · демо, не ваше местоположение</Popup></Marker>
        {stores.map((store) => {
          const brand = brandColors[store.storeId]
          const selected = routeStoreId === store.id
          return <Marker icon={makeStoreIcon(store.storeId)} key={store.id} position={[store.lat, store.lon]} eventHandlers={{ click: () => setRouteStoreId(store.id) }}>
            <Popup className="safebite-store-popup">
              <div className="min-w-[205px] px-0.5 py-0.5">
                <p className="text-xs font-semibold text-[#303832]">{store.name}</p>
                <p className="mt-1 text-[10px] leading-4 text-[#6f786f]">{store.address}</p>
                {selected && <div aria-live="polite" className="mt-1.5 text-[10px] leading-4 text-[#59655b]">
                  {routeStatus === 'loading' && 'Строим пешеходный маршрут…'}
                  {routeStatus === 'ready' && route && <p className="flex items-center gap-1.5 font-medium"><Footprints aria-hidden="true" size={12} />{route.distanceKm < 1 ? `${Math.round(route.distanceKm * 1000)} м` : `${route.distanceKm.toFixed(1)} км`} · примерно {route.minutes} мин пешком</p>}
                  {routeStatus === 'error' && <p>Не удалось построить маршрут. Попробуйте ещё раз.</p>}
                </div>}
                {selected && <button className="mt-2 flex min-h-9 w-full items-center justify-center rounded-md px-2.5 py-2 text-[10px] font-semibold text-white" onClick={() => routeStatus === 'error' ? setAttempt((value) => value + 1) : setRouteStoreId(null)} style={{ backgroundColor: brand.color }} type="button">{routeStatus === 'error' ? 'Повторить' : 'Скрыть маршрут'}</button>}
                <a className="mt-2 block text-center text-[9px] text-[#747d75] underline underline-offset-2" href={brandUrls[store.storeId]} rel="noreferrer" target="_blank">Сайт магазина</a>
              </div>
            </Popup>
          </Marker>
        })}
      </MapContainer>
      {tileError && <span role="status" className="pointer-events-none absolute right-2 top-2 z-[400] max-w-[200px] rounded bg-white/95 px-2 py-1.5 text-[10px] text-[#6f473f] shadow-sm">Не удалось загрузить часть карты. Проверьте соединение.</span>}
    </div>
    <p className="px-2 py-1 text-[10px] text-[#6f786f]">Карта: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> · <a href="https://www.openstreetmap.fr/" target="_blank" rel="noreferrer">OpenStreetMap France</a> / <a href="https://www.hotosm.org/" target="_blank" rel="noreferrer">HOT</a></p>
    </>
  )
}
