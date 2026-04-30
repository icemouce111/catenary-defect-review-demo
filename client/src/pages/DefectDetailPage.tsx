import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Progress,
  Radio,
  Row,
  Col,
  Space,
  Spin,
  Timeline,
  Typography,
  Input,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ReviewStatus } from '@4c-console/shared';
import BBoxOverlay from '../components/BBoxOverlay';
import { RiskTag, StatusTag } from '../components/DefectTags';
import { defectsFetchRequested, setSelectedId } from '../store/defects/slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { reviewSubmitted } from '../store/review/slice';

const reviewOptions: Array<{ label: string; value: ReviewStatus }> = [
  { label: '确认缺陷', value: '已确认' },
  { label: '判定误检', value: '误检' },
  { label: '标记待复查', value: '待复查' },
];

const actionIcon: Record<ReviewStatus, React.ReactNode> = {
  待复核: <ClockCircleOutlined />,
  已确认: <CheckCircleOutlined />,
  误检: <CloseCircleOutlined />,
  待复查: <ClockCircleOutlined />,
  已派单: <CheckCircleOutlined />,
};

export default function DefectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const defects = useAppSelector((state) => state.defects);
  const review = useAppSelector((state) => state.review);
  const defect = useMemo(() => defects.list.find((item) => item.id === id), [defects.list, id]);
  const [action, setAction] = useState<ReviewStatus>('已确认');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(setSelectedId(id));
    }
    return () => {
      dispatch(setSelectedId(null));
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!defect && defects.status === 'idle') {
      dispatch(defectsFetchRequested());
    }
  }, [defect, defects.status, dispatch]);

  if (!id) {
    return <Empty description="缺少缺陷编号" />;
  }

  if (!defect && defects.status === 'loading') {
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
            返回列表
          </Button>
        </Empty>
      </div>
    );
  }

  const submitting = Boolean(review.submitting[defect.id]);
  const reviewError = review.errors[defect.id];

  return (
    <div className="page-stack">
      <div className="detail-heading">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/defects')}>
          返回
        </Button>
        <div className="detail-title">
          <Typography.Title level={2}>{defect.component} · {defect.defectType}</Typography.Title>
          <Space wrap>
            <Typography.Text type="secondary">{defect.id}</Typography.Text>
            <RiskTag value={defect.riskLevel} />
            <StatusTag value={defect.status} />
          </Space>
        </div>
      </div>

      {reviewError && <Alert type="error" showIcon message={reviewError} />}

      <Row gutter={[18, 18]}>
        <Col xs={24} xl={15}>
          <Card title="人工查看图片与 AI 标注" bordered={false} className="detail-card">
            <BBoxOverlay
              imageUrl={defect.imageUrl}
              bbox={defect.bbox}
              confidence={defect.confidence}
              title={`${defect.component}${defect.defectType}`}
            />
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Space direction="vertical" size={18} className="detail-side">
            <Card title="缺陷信息" bordered={false} className="detail-card">
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="线路区间">
                  {defect.line} {defect.section}
                </Descriptions.Item>
                <Descriptions.Item label="杆号">{defect.poleNumber}</Descriptions.Item>
                <Descriptions.Item label="部件">{defect.component}</Descriptions.Item>
                <Descriptions.Item label="缺陷类型">{defect.defectType}</Descriptions.Item>
                <Descriptions.Item label="检出时间">
                  {dayjs(defect.detectedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="AI 置信度">
                  <Progress percent={Number(defect.confidence.toFixed(1))} size="small" />
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="复核判定" bordered={false} className="detail-card">
              <Space direction="vertical" size="middle" className="full-width">
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  options={reviewOptions}
                  value={action}
                  onChange={(event) => setAction(event.target.value as ReviewStatus)}
                />
                <Input.TextArea
                  value={comment}
                  maxLength={200}
                  showCount
                  rows={3}
                  placeholder="复核备注（选填）"
                  onChange={(event) => setComment(event.target.value)}
                />
                <Button
                  type="primary"
                  icon={actionIcon[action]}
                  loading={submitting}
                  onClick={() => {
                    dispatch(
                      reviewSubmitted({
                        id: defect.id,
                        action,
                        comment: comment.trim() || undefined,
                      }),
                    );
                    setComment('');
                  }}
                >
                  提交复核
                </Button>
              </Space>
            </Card>

            <Card title="复核日志" bordered={false} className="detail-card">
              {defect.reviewLogs.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无复核日志" />
              ) : (
                <Timeline
                  items={defect.reviewLogs.map((log) => ({
                    children: (
                      <Space direction="vertical" size={2}>
                        <Typography.Text strong>{log.action}</Typography.Text>
                        <Typography.Text type="secondary">
                          {log.reviewer} · {dayjs(log.timestamp).format('MM-DD HH:mm')}
                        </Typography.Text>
                        {log.comment && <Typography.Text>{log.comment}</Typography.Text>}
                      </Space>
                    ),
                  }))}
                />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
