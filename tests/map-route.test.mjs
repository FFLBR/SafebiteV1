import { strict as assert } from 'node:assert'
import { decodeRouteShape, readPedestrianRoute } from '../src/lib/map-route.ts'

// Valhalla uses six decimal places for encoded route geometry.
assert.deepEqual(decodeRouteShape('_izlhA~rlgdF_{geC~ywl@_kwzCn`{nI'), [[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]])
assert.throws(() => decodeRouteShape('~'))
const result = readPedestrianRoute({ trip: { summary: { length: 1.2, time: 900 }, legs: [{ shape: '_izlhA~rlgdF_{geC~ywl@_kwzCn`{nI' }] } })
assert.equal(result.distanceKm, 1.2)
assert.equal(result.minutes, 15)
assert.throws(() => readPedestrianRoute({ trip: { summary: { length: 1, time: 1 }, legs: [] } }))
console.log('Map route checks passed')
