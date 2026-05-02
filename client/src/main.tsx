import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import 'antd/dist/reset.css';
import './styles/index.css';
import { apolloClient } from './api/apolloClient';
import App from './App';
import { store } from './store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <ConfigProvider locale={zhCN}>
          <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <App />
          </BrowserRouter>
        </ConfigProvider>
      </ApolloProvider>
    </Provider>
  </React.StrictMode>,
);
