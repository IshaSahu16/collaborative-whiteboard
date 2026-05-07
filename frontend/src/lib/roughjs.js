import rough from 'roughjs/bundled/rough.esm.js';

export const getRoughCanvas = (canvas) => {
	if (!canvas) return null;
	return rough.canvas(canvas);
};
