import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ReviewStatus } from '@4c-console/shared';

const decisionLabels: Record<ReviewStatus, string> = {
  待复核: '待复核',
  已确认: '已确认',
  误检: '误检',
  待复查: '待复查',
  已派单: '已派单',
};

const isPastReview = (status: ReviewStatus) => status !== '待复核';

export default function StatusFlow({ status }: { status: ReviewStatus }) {
  return (
    <div className="status-flow">
      <div className="flow-node active">
        <FileSearchOutlined />
        <span>候选记录</span>
        <small>算法输出</small>
      </div>
      <div className="flow-arrow" />
      <div className={`flow-node ${status === '待复核' ? 'active' : 'done'}`}>
        <ClockCircleOutlined />
        <span>待复核</span>
        <small>人工抽检</small>
      </div>
      <div className="flow-arrow" />
      <div className={`flow-node decision-node ${isPastReview(status) ? 'active' : ''}`}>
        {status === '误检' ? <StopOutlined /> : <CheckCircleOutlined />}
        <span>{decisionLabels[status]}</span>
        <small>{status === '误检' ? '排除' : status === '待复查' ? '二次确认' : '真缺陷'}</small>
      </div>
      <div className="flow-arrow" />
      <div className={`flow-node ${status === '已确认' || status === '已派单' ? 'active' : ''}`}>
        <DatabaseOutlined />
        <span>缺陷台账</span>
        <small>入库</small>
      </div>
      <div className="flow-arrow" />
      <div className={`flow-node warning ${status === '已派单' ? 'active' : ''}`}>
        <AlertOutlined />
        <span>预警/派单</span>
        <small>处置</small>
      </div>
    </div>
  );
}
