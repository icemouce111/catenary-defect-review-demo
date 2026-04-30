export type RiskLevel = '一级' | '二级' | '三级';

export type ReviewStatus = '待复核' | '已确认' | '误检' | '待复查' | '已派单';

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ReviewLog {
  id: string;
  defectId: string;
  reviewer: string;
  action: ReviewStatus | 'AI_SUGGEST';
  comment?: string;
  timestamp: string;
}

export interface Defect {
  id: string;
  line: string;
  section: string;
  poleNumber: string;
  component: string;
  defectType: string;
  confidence: number;
  riskLevel: RiskLevel;
  status: ReviewStatus;
  detectedAt: string;
  imageUrl: string;
  bbox: BBox;
  reviewLogs: ReviewLog[];
}

export interface DashboardStats {
  totalDetected: number;
  pendingReview: number;
  confirmed: number;
  falsePositive: number;
  falsePositiveRate: number;
  riskDistribution: Array<{ level: RiskLevel; count: number }>;
}

export interface DefectFilters {
  riskLevel?: RiskLevel;
  status?: ReviewStatus;
}
