import { Tag } from 'antd';
import type { ReviewStatus, RiskLevel } from '@4c-console/shared';

const riskColor: Record<RiskLevel, string> = {
  一级: 'red',
  二级: 'orange',
  三级: 'green',
};

const statusColor: Record<ReviewStatus, string> = {
  待复核: 'blue',
  已确认: 'green',
  误检: 'default',
  待复查: 'gold',
  已派单: 'purple',
};

export function RiskTag({ value }: { value: RiskLevel }) {
  return <Tag color={riskColor[value]}>{value}</Tag>;
}

export function StatusTag({ value }: { value: ReviewStatus }) {
  return <Tag color={statusColor[value]}>{value}</Tag>;
}
