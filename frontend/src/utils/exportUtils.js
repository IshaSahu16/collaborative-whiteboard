import { jsPDF } from 'jspdf';

const getCanvasElement = () => document.querySelector('canvas');

export const exportCanvasAsPng = (filenamePrefix = 'whiteboard') => {
	const canvas = getCanvasElement();
	if (!canvas) throw new Error('Canvas not found');

	const link = document.createElement('a');
	link.href = canvas.toDataURL('image/png');
	link.download = `${filenamePrefix}-${Date.now()}.png`;
	link.click();
};

export const exportCanvasAsPdf = (filenamePrefix = 'whiteboard') => {
	const canvas = getCanvasElement();
	if (!canvas) throw new Error('Canvas not found');

	const dataUrl = canvas.toDataURL('image/png');
	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;

	const orientation = canvasWidth >= canvasHeight ? 'landscape' : 'portrait';
	const pdf = new jsPDF({ orientation, unit: 'pt', format: 'a4' });

	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();

	const scale = Math.min(pageWidth / canvasWidth, pageHeight / canvasHeight);
	const renderWidth = canvasWidth * scale;
	const renderHeight = canvasHeight * scale;
	const offsetX = (pageWidth - renderWidth) / 2;
	const offsetY = (pageHeight - renderHeight) / 2;

	pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, renderWidth, renderHeight);
	pdf.save(`${filenamePrefix}-${Date.now()}.pdf`);
};
