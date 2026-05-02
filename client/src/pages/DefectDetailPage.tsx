import {
  AlertOutlined,
  ArrowLeftOutlined,
  CheckSquareOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Descriptions, Empty, Space, Spin, Statistic, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { BBox, Defect } from '@4c-console/shared';
import BBoxOverlay from '../components/BBoxOverlay';
import CandidateDefectTable from '../components/CandidateDefectTable';
import DefectLedgerPanel from '../components/DefectLedgerPanel';
import { RiskTag, StatusTag } from '../components/DefectTags';
import ReviewDecisionPanel from '../components/ReviewDecisionPanel';
import StatusFlow from '../components/StatusFlow';
import StreamControl from '../components/StreamControl';
import { clearHighlightedId, defectsSlice } from '../store/defects/slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const demoSteps = [
  { index: 1, label: '图片采集', icon: <FileImageOutlined /> },
  { index: 2, label: 'AI智能分析', icon: <RobotOutlined /> },
  { index: 3, label: '疑似缺陷输出', icon: <CloudUploadOutlined /> },
  { index: 4, label: '候选缺陷记录', icon: <FileSearchOutlined /> },
  { index: 5, label: '推送复核工作台', icon: <SendOutlined /> },
  { index: 6, label: '人工查看图片与标注框', icon: <CheckSquareOutlined /> },
  { index: 7, label: '复核判定', icon: <SafetyCertificateOutlined /> },
  { index: 8, label: '缺陷台账', icon: <DatabaseOutlined /> },
  { index: 9, label: '风险预警/派单', icon: <AlertOutlined /> },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const secondaryBoxesFor = (bbox: BBox) => [
  {
    bbox: {
      x: clamp(bbox.x - 0.34, 0.08, 0.82),
      y: clamp(bbox.y + 0.04, 0.12, 0.76),
      w: 0.09,
      h: 0.13,
    },
    confidence: 0.78,
  },
  {
    bbox: {
      x: clamp(bbox.x - 0.18, 0.08, 0.82),
      y: clamp(bbox.y + 0.18, 0.12, 0.76),
      w: 0.08,
      h: 0.12,
    },
    confidence: 0.86,
  },
  {
    bbox: {
      x: clamp(bbox.x + 0.31, 0.08, 0.82),
      y: clamp(bbox.y - 0.08, 0.12, 0.76),
      w: 0.08,
      h: 0.13,
    },
    confidence: 0.81,
  },
];

function WorkflowStepper() {
  return (
    <div className="workflow-stepper">
      {demoSteps.map((step) => (
        <div
          key={step.index}
          className={`workflow-step ${step.index >= 4 && step.index <= 9 ? 'in-demo' : ''} ${
            step.index === 6 || step.index === 7 ? 'focus-step' : ''
          }`}
        >
          <div className="step-number">{step.index}</div>
          <div className="step-icon">{step.icon}</div>
          <span>{step.label}</span>
        </div>
      ))}
      <div className="workflow-step muted">
        <div className="step-number">10</div>
        <span>统计分析/维修闭环</span>
      </div>
    </div>
  );
}

function KpiStrip({ defects }: { defects: Defect[] }) {
  const today = defects.filter((defect) => dayjs(defect.detectedAt).isSame(dayjs(), 'day')).length;
  const pending = defects.filter((defect) => defect.status === '待复核').length;
  const confirmed = defects.filter((defect) => defect.status === '已确认').length;
  const highRisk = defects.filter((defect) => defect.riskLevel === '一级').length;

  return (
    <div className="kpi-grid">
      <div className="kpi-card blue">
        <FileSearchOutlined />
        <Statistic title="待复核" value={pending} />
      </div>
      <div className="kpi-card green">
        <CloudUploadOutlined />
        <Statistic title="今日新增" value={today} />
      </div>
      <div className="kpi-card purple">
        <SafetyCertificateOutlined />
        <Statistic title="真缺陷" value={confirmed} />
      </div>
      <div className="kpi-card red">
        <AlertOutlined />
        <Statistic title="高风险" value={highRisk} />
      </div>
    </div>
  );
}

export default function DefectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const defectsState = useAppSelector((state) => state.defects);
  const { highlightedId, list, status } = defectsState;
  const defect = useMemo(() => list.find((item) => item.id === id), [id, list]);
  const secondaryBoxes = useMemo(
    () => (defect ? secondaryBoxesFor(defect.bbox) : []),
    [defect],
  );

  useEffect(() => {
    if (id) {
      dispatch(defectsSlice.actions.setSelectedId(id));
    }
    return () => {
      dispatch(defectsSlice.actions.setSelectedId(null));
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!list.length && status === 'idle') {
      dispatch(defectsSlice.actions.fetchRequested());
    }
  }, [dispatch, list.length, status]);

  useEffect(() => {
    if (!highlightedId) {
      return;
    }
    const timer = window.setTimeout(() => dispatch(clearHighlightedId(highlightedId)), 1400);
    return () => window.clearTimeout(timer);
  }, [dispatch, highlightedId]);

  if (!id) {
    return <Empty description="缺少缺陷编号" />;
  }

  if (!defect && status === 'loading') {
    return (
      <div className="center-state">
        <Spin size="large" />
      </div>
    );
  }

  if (!defect) {
    return (
      <div className="center-state">
        <Empty description="没有找到这条缺陷">
          <Button type="primary" onClick={() => navigate('/defects')}>
            返回候选记录
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="workbench-page">
      <div className="workbench-toolbar">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/defects')}>
          候选记录
        </Button>
        <div className="workbench-title">
          <Typography.Title level={2}>复核工作台</Typography.Title>
          <Space wrap>
            <Typography.Text type="secondary">{defect.id}</Typography.Text>
            <RiskTag value={defect.riskLevel} />
            <StatusTag value={defect.status} />
          </Space>
        </div>
        <StreamControl />
      </div>

      <WorkflowStepper />
      <KpiStrip defects={list} />

      <div className="workbench-main-grid">
        <section className="workbench-panel image-panel">
          <div className="panel-title-row">
            <Typography.Title level={3}>复核工作台</Typography.Title>
            <span className="demo-badge">演示重点</span>
          </div>
          <BBoxOverlay
            imageUrl={defect.imageUrl}
            bbox={defect.bbox}
            confidence={defect.confidence}
            title={`${defect.component}${defect.defectType}`}
            recordId={defect.id}
            secondaryBoxes={secondaryBoxes}
          />
        </section>

        <aside className="workbench-panel info-panel">
          <div className="panel-title-row">
            <Typography.Title level={3}>缺陷信息</Typography.Title>
            <span className="demo-badge">演示重点</span>
          </div>
          <Descriptions size="small" column={1} className="defect-descriptions">
            <Descriptions.Item label="记录编号">{defect.id}</Descriptions.Item>
            <Descriptions.Item label="部件">{defect.component}</Descriptions.Item>
            <Descriptions.Item label="缺陷类型">{defect.defectType}</Descriptions.Item>
            <Descriptions.Item label="AI置信度">{defect.confidence.toFixed(1)}%</Descriptions.Item>
            <Descriptions.Item label="风险等级">
              <RiskTag value={defect.riskLevel} />
            </Descriptions.Item>
            <Descriptions.Item label="线路区段">
              {defect.line} {defect.section}
            </Descriptions.Item>
            <Descriptions.Item label="杆号">{defect.poleNumber}</Descriptions.Item>
            <Descriptions.Item label="采集时间">
              {dayjs(defect.detectedAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
          </Descriptions>
          <ReviewDecisionPanel defect={defect} />
        </aside>
      </div>

      <div className="workbench-bottom-grid">
        <section className="workbench-panel candidate-panel">
          <Typography.Title level={4}>候选缺陷记录</Typography.Title>
          <CandidateDefectTable
            compact
            defects={list.slice(0, 5)}
            highlightedId={highlightedId}
            selectedId={defect.id}
            loading={status === 'loading'}
            onSelect={(nextId) => navigate(`/defects/${nextId}`)}
          />
        </section>
        <section className="workbench-panel flow-panel">
          <Typography.Title level={4}>状态流转</Typography.Title>
          <StatusFlow status={defect.status} />
        </section>
        <section className="workbench-panel ledger-panel">
          <div className="panel-title-row">
            <Typography.Title level={4}>缺陷台账 / 预警派单</Typography.Title>
            <Button type="link">查看更多</Button>
          </div>
          <DefectLedgerPanel defects={list} selectedId={defect.id} />
        </section>
      </div>
    </div>
  );
}
