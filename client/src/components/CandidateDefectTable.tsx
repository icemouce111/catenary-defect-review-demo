import { Progress, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Defect, RiskLevel } from '@4c-console/shared';
import { RiskTag, StatusTag } from './DefectTags';

interface CandidateDefectTableProps {
  defects: Defect[];
  highlightedId?: string | null;
  loading?: boolean;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  compact?: boolean;
}

export default function CandidateDefectTable({
  defects,
  highlightedId,
  loading,
  onSelect,
  selectedId,
  compact = false,
}: CandidateDefectTableProps) {
  const columns: ColumnsType<Defect> = [
    {
      title: compact ? '缩略图' : '缺陷编号',
      dataIndex: 'id',
      width: compact ? 78 : 172,
      fixed: compact ? undefined : 'left',
      render: (value: string, defect) =>
        compact ? (
          <img className="candidate-thumb" src={defect.imageUrl} alt="" />
        ) : (
          <Typography.Text strong>{value}</Typography.Text>
        ),
    },
    {
      title: '部件',
      key: 'component',
      render: (_, defect) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong={defect.id === selectedId}>{defect.component}</Typography.Text>
          <Typography.Text type="secondary">{defect.defectType}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'AI置信度',
      dataIndex: 'confidence',
      width: compact ? 108 : 150,
      render: (value: number) =>
        compact ? `${value.toFixed(1)}%` : (
          <Progress percent={Number(value.toFixed(1))} size="small" strokeColor="#1677ff" />
        ),
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 92,
      render: (value: RiskLevel) => <RiskTag value={value} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: Defect['status']) => <StatusTag value={value} />,
    },
    {
      title: compact ? '采集时间' : '线路区间',
      key: 'place',
      width: compact ? 96 : 168,
      render: (_, defect) =>
        compact ? (
          dayjs(defect.detectedAt).format('HH:mm:ss')
        ) : (
          <Space direction="vertical" size={0}>
            <Typography.Text>{defect.line}</Typography.Text>
            <Typography.Text type="secondary">
              {defect.section} · {defect.poleNumber}
            </Typography.Text>
          </Space>
        ),
    },
  ];

  return (
    <Table<Defect>
      rowKey="id"
      size={compact ? 'small' : 'middle'}
      columns={columns}
      dataSource={defects}
      loading={loading}
      pagination={compact ? false : { pageSize: 8, showSizeChanger: false }}
      rowClassName={(record) => {
        const classes = [];
        if (record.id === highlightedId) {
          classes.push('defect-row-new');
        }
        if (record.id === selectedId) {
          classes.push('defect-row-selected');
        }
        return classes.join(' ');
      }}
      onRow={(record) => ({
        onClick: () => onSelect?.(record.id),
      })}
      scroll={{ x: compact ? 620 : 1120 }}
    />
  );
}
