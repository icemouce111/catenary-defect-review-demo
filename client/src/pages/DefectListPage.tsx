import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Select, Space, Typography } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RiskLevel } from '@4c-console/shared';
import CandidateDefectTable from '../components/CandidateDefectTable';
import StreamControl from '../components/StreamControl';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearHighlightedId, defectsSlice } from '../store/defects/slice';

const riskOptions: Array<{ label: string; value: RiskLevel }> = [
  { label: '一级风险', value: '一级' },
  { label: '二级风险', value: '二级' },
  { label: '三级风险', value: '三级' },
];

export default function DefectListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, filter, highlightedId, list, status } = useAppSelector((state) => state.defects);
  const streamError = useAppSelector((state) => state.stream.error);

  useEffect(() => {
    dispatch(defectsSlice.actions.fetchRequested());
  }, [dispatch]);

  useEffect(() => {
    if (!highlightedId) {
      return;
    }
    const timer = window.setTimeout(() => dispatch(clearHighlightedId(highlightedId)), 1400);
    return () => window.clearTimeout(timer);
  }, [dispatch, highlightedId]);

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>候选缺陷记录</Typography.Title>
          <Typography.Text type="secondary">GraphQL 列表查询 + Redux 筛选 + Saga 实时流</Typography.Text>
        </div>
        <StreamControl />
      </div>

      {(error || streamError) && (
        <Alert
          type="warning"
          showIcon
          message={error ?? streamError}
          className="page-alert"
        />
      )}

      <Card className="table-card" variant="borderless">
        <div className="table-toolbar">
          <Space wrap>
            <Select<RiskLevel>
              allowClear
              placeholder="风险等级"
              value={filter.riskLevel}
              options={riskOptions}
              className="risk-select"
              onChange={(value) => dispatch(defectsSlice.actions.setFilter({ riskLevel: value }))}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => dispatch(defectsSlice.actions.fetchRequested())}
            >
              刷新
            </Button>
          </Space>
          <Typography.Text type="secondary">共 {list.length} 条记录</Typography.Text>
        </div>

        <CandidateDefectTable
          defects={list}
          highlightedId={highlightedId}
          loading={status === 'loading'}
          onSelect={(id) => navigate(`/defects/${id}`)}
        />
      </Card>
    </div>
  );
}
