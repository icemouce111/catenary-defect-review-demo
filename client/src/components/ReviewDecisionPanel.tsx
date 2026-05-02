import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Alert, Button, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import type { Defect, ReviewStatus } from '@4c-console/shared';
import { reviewSlice } from '../store/review/slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { StatusTag } from './DefectTags';

const reviewActions: Array<{
  status: ReviewStatus;
  label: string;
  icon: React.ReactNode;
  className: string;
}> = [
  {
    status: '已确认',
    label: '确认真缺陷',
    icon: <CheckCircleOutlined />,
    className: 'decision-confirm',
  },
  {
    status: '误检',
    label: '判定误检',
    icon: <CloseCircleOutlined />,
    className: 'decision-false',
  },
  {
    status: '待复查',
    label: '标记待复查',
    icon: <ClockCircleOutlined />,
    className: 'decision-recheck',
  },
];

export default function ReviewDecisionPanel({ defect }: { defect: Defect }) {
  const dispatch = useAppDispatch();
  const submitting = useAppSelector((state) => Boolean(state.review.submitting[defect.id]));
  const error = useAppSelector((state) => state.review.errors[defect.id]);
  const [comment, setComment] = useState('');

  const submit = (status: ReviewStatus) => {
    dispatch(
      reviewSlice.actions.submitReviewRequested({
        id: defect.id,
        action: status,
        comment: comment.trim() || undefined,
      }),
    );
    setComment('');
  };

  return (
    <div className="decision-panel">
      <div className="panel-title-row">
        <Typography.Title level={4}>复核判定</Typography.Title>
        <StatusTag value={defect.status} />
      </div>
      {error && <Alert type="error" showIcon message={error} />}
      <Space className="decision-actions" wrap>
        {reviewActions.map((item) => (
          <Button
            key={item.status}
            size="large"
            type={item.status === '已确认' ? 'primary' : 'default'}
            icon={item.icon}
            className={item.className}
            loading={submitting}
            onClick={() => submit(item.status)}
          >
            {item.label}
          </Button>
        ))}
      </Space>
      <Typography.Text className="field-label">复核备注</Typography.Text>
      <Input.TextArea
        value={comment}
        rows={3}
        maxLength={200}
        showCount
        placeholder="请输入复核备注（选填）"
        onChange={(event) => setComment(event.target.value)}
      />
    </div>
  );
}
