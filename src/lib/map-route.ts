export type PedestrianRoute = { points: [number, number][]; distanceKm: number; minutes: number }

export function decodeRouteShape(shape: string): [number, number][] {
  const points: [number, number][] = []
  let index = 0
  let lat = 0
  let lon = 0
  function nextDelta() {
    let value = 0
    let shift = 0
    let part: number
    do {
      if (index >= shape.length || shift > 30) throw new Error('Invalid route geometry')
      part = shape.charCodeAt(index++) - 63
      if (part < 0 || part > 63) throw new Error('Invalid route geometry')
      value |= (part & 31) << shift
      shift += 5
    } while (part >= 32)
    return (value & 1) ? ~(value >> 1) : value >> 1
  }
  while (index < shape.length) {
    lat += nextDelta()
    lon += nextDelta()
    points.push([lat / 1e6, lon / 1e6])
  }
  return points
}

export function readPedestrianRoute(data: unknown): PedestrianRoute {
  const trip = (data as { trip?: { summary?: { length?: number; time?: number }; legs?: { shape?: string }[] } })?.trip
  const length = trip?.summary?.length
  const time = trip?.summary?.time
  if (typeof length !== 'number' || !Number.isFinite(length) || length < 0 || typeof time !== 'number' || !Number.isFinite(time) || time < 0 || !trip?.legs?.length) throw new Error('Invalid route response')
  const points = trip.legs.flatMap((leg) => {
    if (typeof leg.shape !== 'string') throw new Error('Invalid route geometry')
    return decodeRouteShape(leg.shape)
  })
  if (points.length < 2) throw new Error('Invalid route geometry')
  return { points, distanceKm: length, minutes: Math.max(1, Math.ceil(time / 60)) }
}
