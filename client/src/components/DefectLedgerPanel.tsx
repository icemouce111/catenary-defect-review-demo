import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Defect } from '@4c-console/shared';
import { RiskTag, StatusTag } from './DefectTags';

interface LedgerRow {
  id: string;
  riskLevel: Defect['riskLevel'];
  status: Defect['status'];
  dispatchTarget: string;
  createdAt: string;
}

const dispatchTargetFor = (status: Defect['status']) => {
  if (status === '已派单') {
    return '工务段A班组';
  }
  if (status === '已确认') {
    return '待派单';
  }
  if (status === '待复查') {
    return '二次复核队列';
  }
  return '-';
};

export default function DefectLedgerPanel({
  defects,
  selectedId,
}: {
  defects: Defect[];
  selectedId?: string | null;
}) {
  const ledgerRows = defects
    .filter((defect) => defect.status !== '待复核' || defect.id === selectedId)
    .slice(0, 5)
    .map<LedgerRow>((defect) => ({
      id: defect.id,
      riskLevel: defect.riskLevel,
      status: defect.status,
      dispatchTarget: dispatchTargetFor(defect.status),
      createdAt: defect.detectedAt,
    }));

  const columns: ColumnsType<LedgerRow> = [
    {
      title: '缺陷编号',
      dataIndex: 'id',
      render: (value: string) => <Typography.Text type="danger">{value}</Typography.Text>,
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      width: 92,
      render: (value: Defect['riskLevel']) => <RiskTag value={value} />,
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      width: 102,
      render: (value: Defect['status']) => <StatusTag value={value} />,
    },
    {
      title: '派单对象',
      dataIndex: 'dispatchTarget',
      width: 128,
      render: (value: string) => (value === '待派单' ? <Tag color="orange">{value}</Tag> : value),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 98,
      render: (value: string) => dayjs(value).format('MM-DD HH:mm'),
    },
  ];

  return (
    <Table<LedgerRow>
      rowKey="id"
      size="small"
      columns={columns}
      dataSource={ledgerRows}
      pagination={false}
      scroll={{ x: 620 }}
    />
  );
}
