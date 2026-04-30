import { AlertOutlined, DatabaseOutlined } from '@ant-design/icons';
import { Layout, Menu, Typography } from 'antd';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import DefectDetailPage from './pages/DefectDetailPage';
import DefectListPage from './pages/DefectListPage';

const { Content, Sider } = Layout;

const menuItems = [
  {
    key: '/defects',
    icon: <DatabaseOutlined />,
    label: '缺陷列表',
  },
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout className="app-shell">
      <Sider width={224} theme="light" className="app-sider">
        <div className="brand">
          <AlertOutlined className="brand-icon" />
          <div>
            <Typography.Text strong>4C-Console</Typography.Text>
            <Typography.Text type="secondary" className="brand-subtitle">
              智能检测复核
            </Typography.Text>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname.startsWith('/defects') ? '/defects' : location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/defects" replace />} />
            <Route path="/defects" element={<DefectListPage />} />
            <Route path="/defects/:id" element={<DefectDetailPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
