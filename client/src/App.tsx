import {
  AlertOutlined,
  BellOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  HomeOutlined,
  MenuOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Avatar, Empty, Input, Layout, Menu, Space, Typography } from 'antd';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import DefectDetailPage from './pages/DefectDetailPage';
import DefectListPage from './pages/DefectListPage';

const { Content, Header, Sider } = Layout;

const menuItems = [
  {
    key: '/dashboard',
    icon: <HomeOutlined />,
    label: '首页看板',
    disabled: true,
  },
  {
    key: '/defects',
    icon: <DatabaseOutlined />,
    label: '候选缺陷记录',
  },
  {
    key: '/workbench',
    icon: <FileSearchOutlined />,
    label: '复核工作台',
  },
  {
    key: '/ledger',
    icon: <DatabaseOutlined />,
    label: '缺陷台账',
    disabled: true,
  },
  {
    key: '/dispatch',
    icon: <BellOutlined />,
    label: '预警派单',
    disabled: true,
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '系统设置',
    disabled: true,
  },
];

function DemoPlaceholderPage() {
  return (
    <div className="center-state">
      <Empty description="Demo 暂未实现" />
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeMenuKey = menuItems.some((item) => item.key === location.pathname)
    ? location.pathname
    : location.pathname.startsWith('/defects/')
      ? '/workbench'
      : '/defects';

  return (
    <Layout className="app-shell">
      <Sider width={224} theme="light" className="app-sider">
        <div className="brand">
          <AlertOutlined className="brand-icon" />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeMenuKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Space size="middle">
            <MenuOutlined className="header-menu-icon" />
            <Typography.Title level={1}>接触网缺陷智能复核系统 Demo</Typography.Title>
          </Space>
          <Space size="large">
            <Input
              className="header-search"
              prefix={<SearchOutlined />}
              placeholder="搜索记录编号、部件、线路区段..."
            />
            <BellOutlined className="header-bell" />
            <Space>
              <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=zhang" />
              <Typography.Text>张工</Typography.Text>
            </Space>
          </Space>
        </Header>
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/defects" replace />} />
            <Route path="/dashboard" element={<DemoPlaceholderPage />} />
            <Route path="/defects" element={<DefectListPage />} />
            <Route path="/defects/:id" element={<DefectDetailPage />} />
            <Route path="/workbench" element={<DefectDetailPage />} />
            <Route path="/ledger" element={<DemoPlaceholderPage />} />
            <Route path="/dispatch" element={<DemoPlaceholderPage />} />
            <Route path="/settings" element={<DemoPlaceholderPage />} />
            <Route path="*" element={<DemoPlaceholderPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
