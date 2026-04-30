import { useCallback, useEffect, useRef } from 'react';
import type { BBox } from '@4c-console/shared';

interface BBoxOverlayProps {
  imageUrl: string;
  bbox: BBox;
  confidence: number;
  title: string;
}

export default function BBoxOverlay({ imageUrl, bbox, confidence, title }: BBoxOverlayProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const draw = useCallback(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) {
      return;
    }

    const width = image.clientWidth;
    const height = image.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const x = bbox.x * width;
    const y = bbox.y * height;
    const boxWidth = bbox.w * width;
    const boxHeight = bbox.h * height;

    context.lineWidth = 3;
    context.strokeStyle = '#f5222d';
    context.fillStyle = 'rgba(245, 34, 45, 0.12)';
    context.fillRect(x, y, boxWidth, boxHeight);
    context.strokeRect(x, y, boxWidth, boxHeight);

    const label = `AI ${confidence.toFixed(1)}%`;
    context.font = '600 14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    const labelWidth = context.measureText(label).width + 18;
    const labelX = Math.max(8, Math.min(x, width - labelWidth - 8));
    const labelY = Math.max(8, y - 30);
    context.fillStyle = '#f5222d';
    context.fillRect(labelX, labelY, labelWidth, 24);
    context.fillStyle = '#fff';
    context.fillText(label, labelX + 9, labelY + 17);
  }, [bbox.h, bbox.w, bbox.x, bbox.y, confidence]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) {
      return;
    }
    const observer = new ResizeObserver(draw);
    observer.observe(image);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div className="inspection-frame">
      <img ref={imageRef} className="inspection-image" src={imageUrl} alt={title} onLoad={draw} />
      <canvas ref={canvasRef} className="inspection-canvas" aria-hidden="true" />
    </div>
  );
}
