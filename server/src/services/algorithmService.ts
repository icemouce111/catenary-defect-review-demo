import { nanoid } from 'nanoid';
import type { BBox, Defect, RiskLevel } from '@4c-console/shared';

const lines = ['沪昆线', '京广线', '青藏线', '京沪高铁', '广深线'];
const components = ['定位器线夹', '吊弦线夹', '绝缘子', '承力索线夹', '腕臂支撑'];
const defectTypes = ['松脱/偏移', '裂纹/损伤', '污闪/破损', '磨耗超限', '缺失/变形'];
const risks: RiskLevel[] = ['一级', '二级', '三级'];

const randomItem = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const randomBBox = (): BBox => ({
  x: Number((0.12 + Math.random() * 0.56).toFixed(2)),
  y: Number((0.18 + Math.random() * 0.42).toFixed(2)),
  w: Number((0.08 + Math.random() * 0.12).toFixed(2)),
  h: Number((0.1 + Math.random() * 0.2).toFixed(2)),
});

export const generateMockDefect = (): Defect => {
  const riskLevel = randomItem(risks);
  return {
    id: `DEF-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${nanoid(5)}`,
    line: randomItem(lines),
    section: `K${Math.floor(20 + Math.random() * 900)}+${Math.floor(Math.random() * 999)
      .toString()
      .padStart(3, '0')}`,
    poleNumber: `${Math.floor(1 + Math.random() * 70)}#杆`,
    component: randomItem(components),
    defectType: randomItem(defectTypes),
    confidence: Number((72 + Math.random() * 24).toFixed(1)),
    riskLevel,
    status: '待复核',
    detectedAt: new Date().toISOString(),
    imageUrl: Math.random() > 0.5 ? '/images/sample-1.svg' : '/images/sample-2.svg',
    bbox: randomBBox(),
    reviewLogs: [],
  };
};
