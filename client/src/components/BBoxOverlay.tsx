import {
  DownloadOutlined,
  ExpandOutlined,
  MinusOutlined,
  PlusOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { useCallback, useEffect, useRef } from 'react';
import type { BBox } from '@4c-console/shared';

interface SecondaryBox {
  bbox: BBox;
  confidence: number;
  label?: string;
}

interface BBoxOverlayProps {
  imageUrl: string;
  bbox: BBox;
  confidence: number;
  title: string;
  recordId?: string;
  secondaryBoxes?: SecondaryBox[];
}

const drawBox = (
  context: CanvasRenderingContext2D,
  bbox: BBox,
  confidence: number,
  width: number,
  height: number,
  color: string,
  labelPrefix: string,
) => {
  const x = bbox.x * width;
  const y = bbox.y * height;
  const boxWidth = bbox.w * width;
  const boxHeight = bbox.h * height;
  const label = `${labelPrefix} ${confidence.toFixed(2)}`;

  context.lineWidth = color === '#f5222d' ? 3 : 2;
  context.strokeStyle = color;
  context.fillStyle = color === '#f5222d' ? 'rgba(245, 34, 45, 0.12)' : 'rgba(22, 119, 255, 0.1)';
  context.fillRect(x, y, boxWidth, boxHeight);
  context.strokeRect(x, y, boxWidth, boxHeight);

  context.font = '600 13px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  const labelWidth = context.measureText(label).width + 16;
  const labelX = Math.max(8, Math.min(x, width - labelWidth - 8));
  const labelY = Math.max(8, y - 28);
  context.fillStyle = color;
  context.fillRect(labelX, labelY, labelWidth, 23);
  context.fillStyle = '#fff';
  context.fillText(label, labelX + 8, labelY + 16);
};

export default function BBoxOverlay({
  imageUrl,
  bbox,
  confidence,
  title,
  recordId,
  secondaryBoxes = [],
}: BBoxOverlayProps) {
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

    secondaryBoxes.forEach((item) => {
      drawBox(context, item.bbox, item.confidence, width, height, '#1677ff', item.label ?? '疑似缺陷');
    });
    drawBox(context, bbox, confidence / 100, width, height, '#f5222d', '疑似缺陷');
  }, [bbox, confidence, secondaryBoxes]);

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
      {recordId && <div className="image-record-badge">图像ID: {recordId}</div>}
      <div className="image-zoom-inset">
        <div className="zoom-title">局部放大</div>
        <img src={imageUrl} alt="" />
      </div>
      <div className="image-toolbar" aria-hidden="true">
        <span>
          <MinusOutlined />
        </span>
        <span>
          <PlusOutlined />
        </span>
        <strong>120%</strong>
        <span>
          <ExpandOutlined />
        </span>
        <span>
          <RedoOutlined />
        </span>
        <span>
          <DownloadOutlined />
        </span>
      </div>
    </div>
  );
}
