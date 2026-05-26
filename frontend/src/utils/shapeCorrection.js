const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const getBounds = (points) => {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	points.forEach((p) => {
		minX = Math.min(minX, p.x);
		minY = Math.min(minY, p.y);
		maxX = Math.max(maxX, p.x);
		maxY = Math.max(maxY, p.y);
	});

	return { minX, minY, maxX, maxY };
};

const isClosed = (points, diag) => {
	if (points.length < 6) return false;
	return distance(points[0], points[points.length - 1]) < diag * 0.35;
};

const isLineLike = (points, diag) => {
	const start = points[0];
	const end = points[points.length - 1];
	const lineLen = Math.max(distance(start, end), 1);
	const threshold = Math.max(3, diag * 0.03);

	let maxDist = 0;
	points.forEach((p) => {
		const numerator = Math.abs(
			(end.y - start.y) * p.x -
			(end.x - start.x) * p.y +
			end.x * start.y -
			end.y * start.x
		);
		const dist = numerator / lineLen;
		maxDist = Math.max(maxDist, dist);
	});

	return maxDist < threshold;
};

const isCircleLike = (points, bounds) => {
	const { minX, minY, maxX, maxY } = bounds;
	const w = maxX - minX;
	const h = maxY - minY;
	const ratio = Math.min(w, h) / Math.max(w, h || 1);
	if (ratio < 0.8) return false;

	const cx = (minX + maxX) / 2;
	const cy = (minY + maxY) / 2;
	const radii = points.map((p) => Math.hypot(p.x - cx, p.y - cy));
	const avg = radii.reduce((sum, r) => sum + r, 0) / radii.length;
	const variance = radii.reduce((sum, r) => sum + Math.abs(r - avg), 0) / radii.length;

	return variance < Math.max(6, avg * 0.18);
};

const isRectLike = (points, bounds) => {
	const { minX, minY, maxX, maxY } = bounds;
	const w = maxX - minX;
	const h = maxY - minY;
	const threshold = Math.max(6, Math.max(w, h) * 0.12);

	return points.every((p) => {
		const distLeft = Math.abs(p.x - minX);
		const distRight = Math.abs(p.x - maxX);
		const distTop = Math.abs(p.y - minY);
		const distBottom = Math.abs(p.y - maxY);
		return Math.min(distLeft, distRight, distTop, distBottom) <= threshold;
	});
};

const getCornerPoints = (points, diag) => {
	const closeThreshold = Math.max(6, diag * 0.03);
	const angleThreshold = 135;
	const minCornerGap = Math.max(10, diag * 0.1);

	const first = points[0];
	const last = points[points.length - 1];
	const closedPoints = distance(first, last) < closeThreshold
		? points.slice(0, -1)
		: points;

	const step = Math.max(1, Math.floor(closedPoints.length / 40));
	const sampled = closedPoints.filter((_, i) => i % step === 0);
	if (sampled.length < 4) return [];

	const corners = [];
	const len = sampled.length;
	for (let i = 0; i < len; i += 1) {
		const prev = sampled[(i - 1 + len) % len];
		const curr = sampled[i];
		const next = sampled[(i + 1) % len];

		const v1x = prev.x - curr.x;
		const v1y = prev.y - curr.y;
		const v2x = next.x - curr.x;
		const v2y = next.y - curr.y;
		const dot = v1x * v2x + v1y * v2y;
		const mag1 = Math.hypot(v1x, v1y) || 1;
		const mag2 = Math.hypot(v2x, v2y) || 1;
		const cos = dot / (mag1 * mag2);
		const angle = Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);

		if (angle < angleThreshold) {
			const lastCorner = corners[corners.length - 1];
			if (!lastCorner || distance(lastCorner, curr) >= minCornerGap) {
				corners.push(curr);
			}
		}
	}

	if (corners.length > 1 && distance(corners[0], corners[corners.length - 1]) < minCornerGap) {
		corners.pop();
	}

	return corners;
};

export const detectShapeFromStroke = (points) => {
	if (!points || points.length < 8) return null;

	const bounds = getBounds(points);
	const w = bounds.maxX - bounds.minX;
	const h = bounds.maxY - bounds.minY;
	const diag = Math.hypot(w, h);
	if (diag < 20) return null;

	const closed = isClosed(points, diag);

	if (isLineLike(points, diag)) {
		return {
			type: 'line',
			startX: points[0].x,
			startY: points[0].y,
			endX: points[points.length - 1].x,
			endY: points[points.length - 1].y,
		};
	}

	if (closed && isRectLike(points, bounds)) {
		return {
			type: 'rectangle',
			startX: bounds.minX,
			startY: bounds.minY,
			endX: bounds.maxX,
			endY: bounds.maxY,
		};
	}

	if (closed && isCircleLike(points, bounds)) {
		return {
			type: 'circle',
			startX: bounds.minX,
			startY: bounds.minY,
			endX: bounds.maxX,
			endY: bounds.maxY,
		};
	}

	if (closed) {
		const corners = getCornerPoints(points, diag);
		if (corners.length === 3) {
			return {
				type: 'triangle',
				startX: bounds.minX,
				startY: bounds.minY,
				endX: bounds.maxX,
				endY: bounds.maxY,
			};
		}
	}

	return null;
};
