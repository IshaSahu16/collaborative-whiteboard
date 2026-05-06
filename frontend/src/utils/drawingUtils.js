import getStroke from 'perfect-freehand';

export function getPerfectFreehandStroke(points, width) {
	if (!points || points.length === 0) return [];

	return getStroke(
		points.map((point) => [point.x, point.y]),
		{
			size: Math.max(1, width * 2),
			thinning: 0.65,
			smoothing: 0.5,
			streamline: 0.5,
			simulatePressure: true,
		}
	);
}

export function drawPerfectFreehandStroke(ctx, stroke) {
	const outlinePoints = getPerfectFreehandStroke(stroke.points, stroke.width);

	if (outlinePoints.length === 0) return;

	ctx.save();
	ctx.globalCompositeOperation =
		stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
	ctx.fillStyle = stroke.color;
	ctx.beginPath();
	ctx.moveTo(outlinePoints[0][0], outlinePoints[0][1]);

	outlinePoints.slice(1).forEach(([x, y]) => {
		ctx.lineTo(x, y);
	});

	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

