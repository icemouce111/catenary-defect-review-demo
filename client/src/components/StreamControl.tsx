import { PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import { streamSlice } from '../store/stream/slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export default function StreamControl() {
  const dispatch = useAppDispatch();
  const stream = useAppSelector((state) => state.stream);

  return (
    <Space size="middle" wrap>
      <Button
        type={stream.isActive ? 'default' : 'primary'}
        icon={stream.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={() =>
          dispatch(stream.isActive ? streamSlice.actions.stop() : streamSlice.actions.start())
        }
      >
        {stream.isActive ? '停止检测流' : '启动检测流'}
      </Button>
      <Tag color={stream.isActive ? 'processing' : 'default'}>
        {stream.isConnecting ? '连接中' : stream.isActive ? '推送中' : '已暂停'}
      </Tag>
      <Typography.Text type="secondary">本次新增 {stream.receivedCount} 条</Typography.Text>
    </Space>
  );
}
