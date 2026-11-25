// Geometry for the contribution graph, in cells: x runs along the weeks, y along the weekdays, z up.
// 2D looks straight down, 3D turns the camera by TURN and tilts it down to TILT.

const TURN = Math.PI / 7
const TILT = (35 * Math.PI) / 180
// how much the fit eases between the points that stick out furthest while the camera moves
const FIT_SOFTNESS = 0.5
const MONTH_ROOM = 1.25

export const GAP = 0.16
export const WEEKDAY_ROOM = 2

// the 3D view as a single rotation (a quaternion) away from looking straight down
const [TIP, SPIN] = [(Math.PI / 2 - TILT) / 2, -TURN / 2]
const ROTATION = [
	Math.cos(TIP) * Math.cos(SPIN),
	Math.sin(TIP) * Math.cos(SPIN),
	-Math.sin(TIP) * Math.sin(SPIN),
	Math.cos(TIP) * Math.sin(SPIN)
]
const ROTATION_ANGLE = Math.acos(ROTATION[0])

// part way through that rotation, about its one axis, so the tilt and turn move as one;
// returns the screen's across and down directions in the graph's x, y and z
export function cameraAt(t) {
	const share = Math.sin(t * ROTATION_ANGLE) / Math.sin(ROTATION_ANGLE)
	const [w, x, y, z] = [Math.cos(t * ROTATION_ANGLE), ...ROTATION.slice(1).map((v) => v * share)]
	return [
		[1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
		[2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)]
	]
}

export function project([across, down], x, y, z = 0) {
	return [across[0] * x + across[1] * y + across[2] * z, down[0] * x + down[1] * y + down[2] * z]
}

// eases from one smallest value to the next instead of snapping; exact when softness is 0
function softMin(values, softness) {
	const min = Math.min(...values)
	if (!softness) return min
	const sum = values.reduce((total, value) => total + Math.exp((min - value) / softness), 0)
	return min - softness * Math.log(sum)
}

function polygon(camera, ...corners) {
	return corners.map((corner) => project(camera, ...corner).map((v) => v.toFixed(3))).join(' ')
}

// the faces the 3D camera sees; a flat day is only its floor tile
export function faces(camera, x, y, h) {
	const [x0, x1, y0, y1] = [x + GAP / 2, x + 1 - GAP / 2, y + GAP / 2, y + 1 - GAP / 2]
	return {
		top: polygon(camera, [x0, y0, h], [x1, y0, h], [x1, y1, h], [x0, y1, h]),
		left: h > 0 && polygon(camera, [x0, y0, 0], [x0, y1, 0], [x0, y1, h], [x0, y0, h]),
		front: h > 0 && polygon(camera, [x0, y1, 0], [x1, y1, 0], [x1, y1, h], [x0, y1, h])
	}
}

// the floor and its labels, with room for fully risen blocks so they rise into it instead of
// pushing the floor down. Which point sticks out furthest changes as the camera moves, so the
// edges ease between them mid-turn rather than jolt; at either end the fit is exact.
export function boxAt(t, weekCount, days) {
	const camera = cameraAt(t)
	const floor = [
		[-WEEKDAY_ROOM, 0],
		[-WEEKDAY_ROOM, 7],
		[0, -MONTH_ROOM * (1 - t)],
		[weekCount, -MONTH_ROOM * (1 - t)],
		[0, 7 + MONTH_ROOM * t],
		[weekCount, 7 + MONTH_ROOM * t]
	].map(([x, y]) => project(camera, x, y))
	const tops = days.map(({ x, y, height }) => project(camera, x + 1, y, height)[1])
	const softness = FIT_SOFTNESS * Math.sin(Math.PI * t)
	const xs = floor.map(([px]) => px)
	const ys = floor.map(([, py]) => py)
	const left = softMin(xs, softness)
	const top = softMin([...ys, ...tops], softness)
	const right = -softMin(
		xs.map((v) => -v),
		softness
	)
	const bottom = -softMin(
		ys.map((v) => -v),
		softness
	)
	return { left, top, width: right - left, height: bottom - top }
}
