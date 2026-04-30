import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Progress, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Defect, RiskLevel } from '@4c-console/shared';
import { RiskTag, StatusTag } from '../components/DefectTags';
import StreamControl from '../components/StreamControl';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearHighlightedId,
  defectsFetchRequested,
  setRiskFilter,
} from '../store/defects/slice';

const riskOptions: Array<{ label: string; value: RiskLevel }> = [
  { label: '一级风险', value: '一级' },
  { label: '二级风险', value: '二级' },
  { label: '三级风险', value: '三级' },
];

const columns: ColumnsType<Defect> = [
  {
    title: '缺陷编号',
    dataIndex: 'id',
    width: 170,
    fixed: 'left',
    render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
  },
  {
    title: '线路区间',
    key: 'line',
    render: (_, defect) => (
      <Space direction="vertical" size={0}>
        <Typography.Text>{defect.line}</Typography.Text>
        <Typography.Text type="secondary">{defect.section}</Typography.Text>
      </Space>
    ),
  },
  {
    title: '杆号',
    dataIndex: 'poleNumber',
    width: 96,
  },
  {
    title: '部件',
    dataIndex: 'component',
  },
  {
    title: '缺陷类型',
    dataIndex: 'defectType',
  },
  {
    title: 'AI置信度',
    dataIndex: 'confidence',
    width: 150,
    render: (value: number) => (
      <Progress percent={Number(value.toFixed(1))} size="small" strokeColor="#1677ff" />
    ),
  },
  {
    title: '风险',
    dataIndex: 'riskLevel',
    width: 96,
    render: (value: RiskLevel) => <RiskTag value={value} />,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    render: (value: Defect['status']) => <StatusTag value={value} />,
  },
  {
    title: '检出时间',
    dataIndex: 'detectedAt',
    width: 156,
    render: (value: string) => dayjs(value).format('MM-DD HH:mm:ss'),
  },
];

export default function DefectListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, filter, highlightedId, list, status } = useAppSelector((state) => state.defects);
  const streamError = useAppSelector((state) => state.stream.error);

  useEffect(() => {
    dispatch(defectsFetchRequested());
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

      <Card className="table-card" bordered={false}>
        <div className="table-toolbar">
          <Space wrap>
            <Select<RiskLevel>
              allowClear
              placeholder="风险等级"
              value={filter.riskLevel}
              options={riskOptions}
              className="risk-select"
              onChange={(value) => dispatch(setRiskFilter(value))}
            />
            <Button icon={<ReloadOutlined />} onClick={() => dispatch(defectsFetchRequested())}>
              刷新
            </Button>
          </Space>
          <Typography.Text type="secondary">共 {list.length} 条记录</Typography.Text>
        </div>

        <Table<Defect>
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={status === 'loading'}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          rowClassName={(record) => (record.id === highlightedId ? 'defect-row-new' : '')}
          onRow={(record) => ({
            onClick: () => navigate(`/defects/${record.id}`),
          })}
          scroll={{ x: 1120 }}
        />
      </Card>
    </div>
  );
}
