# 4C-Console 面试 Demo 人工 QA 手册

4C-Console 是一个铁路接触网 4C 智能检测复核平台 demo。它的核心演示链路是：候选缺陷记录进入复核工作台，复核员查看图片与 AI 标注框，执行复核判定，状态同步进入缺陷台账，并呈现预警/派单入口。

这份 README 的目标不是包装项目，而是让你可以按步骤人工排查 bug。每个检查点都写了预期现象、异常表现和优先排查文件。

## Demo 范围

### 已覆盖

- 候选缺陷列表：GraphQL 拉取数据，Redux 保存列表，支持风险等级筛选。
- 复核工作台：展示图片、主 bbox、辅助候选框、局部放大、缺陷详情。
- 人工复核：确认真缺陷、判定误检、标记待复查。
- 状态流转：复核状态进入状态流、缺陷台账和派单目标展示。
- 实时检测流：Express SSE 每 6 秒 mock 推送一条新缺陷，Redux-Saga 接收并插入列表。
- 基础稳定性：未实现路由显示 placeholder，避免 demo 空白页。

### 不在本 demo 范围

- 真实 4C 图像采集。
- 真实 AI 图像识别算法。
- 真实数据库、ORM、登录鉴权。
- 完整统计报表、维修闭环、真实派单系统。
- 生产部署和权限系统。

## 技术栈

项目技术栈已锁定，用来命中面试 JD 的重点：

- 前端：React 18、Vite、TypeScript、Ant Design 5。
- 状态：Redux Toolkit、React Redux、Redux-Saga。
- 数据：Apollo Client、GraphQL。
- 后端：Express 4、Apollo Server 4、GraphQL、SSE。
- 持久化：JSON 文件，位于 `server/src/data/`。
- 共享类型：`shared/src/types.ts`。

## 目录说明

```text
.
├── client/                         # React 前端
│   ├── src/App.tsx                 # 路由、侧边栏、placeholder 页面
│   ├── src/pages/DefectListPage.tsx
│   ├── src/pages/DefectDetailPage.tsx
│   ├── src/components/             # bbox、表格、复核按钮、状态流、SSE 控制
│   ├── src/store/                  # Redux slices 和 sagas
│   └── src/api/                    # Apollo queries、GraphQL enum 映射、SSE channel
├── server/                         # Express + GraphQL 后端
│   ├── src/index.ts                # 服务入口，端口默认 4000
│   ├── src/graphql/                # typeDefs + resolvers
│   ├── src/routes/stream.ts        # /api/stream SSE
│   ├── src/routes/llmProxy.ts      # /api/llm/suggest mock/DeepSeek fallback
│   ├── src/repo/defectRepo.ts      # JSON repo，复核和派单写盘
│   └── src/data/                   # defects.json + reviewLogs.json
├── shared/src/types.ts             # 前后端共享业务类型
└── demo-reference/PLAN.md          # 项目唯一真相源，不要随意改
```

## 重要文件定位

| 想查的问题 | 先看文件 |
| --- | --- |
| 菜单、路由、placeholder | `client/src/App.tsx` |
| 候选列表、风险筛选、刷新按钮 | `client/src/pages/DefectListPage.tsx` |
| 复核工作台主流程 | `client/src/pages/DefectDetailPage.tsx` |
| 图片和 bbox overlay | `client/src/components/BBoxOverlay.tsx` |
| 候选缺陷表格行点击 | `client/src/components/CandidateDefectTable.tsx` |
| 复核按钮提交 | `client/src/components/ReviewDecisionPanel.tsx` |
| 状态流展示 | `client/src/components/StatusFlow.tsx` |
| 台账/派单目标展示 | `client/src/components/DefectLedgerPanel.tsx` |
| SSE 启停按钮 | `client/src/components/StreamControl.tsx` |
| SSE Saga 接收和断线处理 | `client/src/store/stream/sagas.ts` |
| 复核 Saga 乐观更新和回滚 | `client/src/store/review/sagas.ts` |
| GraphQL 查询和 mutation | `client/src/api/queries.ts` |
| GraphQL schema | `server/src/graphql/typeDefs.ts` |
| 后端 resolver | `server/src/graphql/resolvers.ts` |
| JSON 持久化和复核写盘 | `server/src/repo/defectRepo.ts` |
| SSE mock 推送 | `server/src/routes/stream.ts` |

## 环境准备

### 依赖版本

建议使用 Node 20+ 和 pnpm。仓库声明的包管理器是：

```bash
pnpm@10.33.0
```

### 安装依赖

```bash
pnpm install
```

### 环境变量

根目录已有 `.env.example`：

```bash
DEEPSEEK_API_KEY=
PORT=4000
```

本 demo 不需要真实 LLM key。没有 `DEEPSEEK_API_KEY` 时，`/api/llm/suggest` 会返回 mock 建议。

## 启动项目

### 一键启动前后端

```bash
pnpm dev
```

正常情况下你会看到：

- 后端：`http://localhost:4000/graphql`
- 前端：`http://localhost:5173/`

如果 `5173` 被占用，Vite 可能会自动切到 `5174` 或更高端口。浏览器请使用终端输出的实际 URL。

### 分开启动

如果想分别排查前后端：

```bash
pnpm --filter @4c-console/server dev
```

```bash
pnpm --filter @4c-console/client dev
```

注意：前端 Vite proxy 写在 `client/vite.config.ts`，默认把 `/graphql` 和 `/api` 转发到 `http://localhost:4000`。后端最好保持 `PORT=4000`。

## 快速健康检查

启动后先跑这几条命令，确认服务和数据正常：

```bash
curl http://localhost:4000/health
```

预期：

```json
{"ok":true,"service":"4c-console-server"}
```

查询缺陷数量：

```bash
curl http://localhost:4000/graphql \
  -H 'content-type: application/json' \
  --data '{"query":"{ defects { id status riskLevel } }"}'
```

干净种子数据预期：

- `defects.json` 有 17 条。
- `reviewLogs.json` 有 4 条。
- 第一条缺陷 id 通常是 `DEF-20260501-kVo8b`。

也可以本地直接查 JSON：

```bash
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('server/src/data/defects.json','utf8')); const l=JSON.parse(fs.readFileSync('server/src/data/reviewLogs.json','utf8')); console.log({defects:d.length, logs:l.length, first:d[0]?.id});"
```

## 人工 QA 总流程

建议每次排查按这个顺序走：

1. 确认服务启动和数据种子。
2. 打开候选缺陷列表。
3. 检查导航和未实现页面。
4. 检查复核工作台渲染。
5. 检查候选行点击和 URL 同步。
6. 检查三个复核按钮。
7. 检查 SSE 启停。
8. 检查浏览器 Console 和 Network。
9. 恢复 JSON 种子数据。
10. 跑 typecheck、test、build。

## 手工排查 Checklist

### 1. 候选缺陷列表

打开：

```text
http://localhost:5173/defects
```

预期：

- 页面标题是 `候选缺陷记录`。
- 工具栏显示 `风险等级`、`刷新`。
- 右侧显示 `共 17 条记录`。
- 表格列包含缺陷编号、部件、AI 置信度、风险、状态、线路区间。

如果不符合：

- 页面白屏：先看浏览器 Console，再看 `client/src/App.tsx` 路由。
- 列表加载失败：看 Network 中 `/graphql` 是否 200，再看 `client/src/store/defects/sagas.ts`。
- 数量不是 17：SSE 或复核 QA 可能写过 JSON，按“恢复数据种子”章节处理。

### 2. 风险等级筛选

操作：

1. 在列表页打开 `风险等级` 下拉。
2. 选择 `一级风险`。
3. 再清空筛选。

预期：

- 选择后列表数量减少，只显示一级风险。
- 清空后回到 17 条。
- Network 里 `/graphql` 请求变量包含 `riskLevel`。

如果不符合：

- 先查 `client/src/pages/DefectListPage.tsx` 的 `Select`。
- 再查 `client/src/store/defects/sagas.ts` 是否把 Redux filter 转成 GraphQL 变量。
- enum 映射问题看 `client/src/api/graphqlEnums.ts`。

### 3. 导航和未实现页面

操作：

1. 点击 `候选缺陷记录`。
2. 点击 `复核工作台`。
3. 手动访问 `http://localhost:5173/ledger`。
4. 手动访问一个不存在的地址，例如 `http://localhost:5173/unknown-demo-route`。

预期：

- `/defects` 正常显示列表。
- `/workbench` 正常显示复核工作台，不提示缺少缺陷编号。
- `/ledger` 和未知地址显示 `Demo 暂未实现`。
- 侧边栏 `首页看板`、`缺陷台账`、`预警派单`、`系统设置` 是 disabled 视觉态。

如果不符合：

- 查 `client/src/App.tsx` 的 `Routes` 和 `activeMenuKey`。
- `/workbench` 空状态查 `client/src/pages/DefectDetailPage.tsx` 的 `activeId` 逻辑。

### 4. 复核工作台基础渲染

打开：

```text
http://localhost:5173/workbench
```

预期：

- 顶部标题 `复核工作台`。
- 有流程节点：图片采集、AI智能分析、疑似缺陷输出、候选缺陷记录、推送复核工作台、人工查看图片与标注框、复核判定、缺陷台账、风险预警/派单。
- KPI 卡片显示待复核、今日新增、真缺陷、高风险。
- 主图加载，不是破图。
- 红色主 bbox 可见。
- 多个蓝色辅助候选框可见。
- 右下或图内有 `局部放大`。
- 右侧缺陷信息包含：记录编号、部件、缺陷类型、AI置信度、风险等级、线路区段、杆号、采集时间、采集设备。

如果不符合：

- 图片破图：看缺陷数据的 `imageUrl`，再看 Vite 静态资源或 Network 图片请求。
- bbox 不显示：查 `client/src/components/BBoxOverlay.tsx`，重点看 `image.clientWidth`、`canvas.width`、`onLoad` 和 `ResizeObserver`。
- 信息缺字段：查 `client/src/pages/DefectDetailPage.tsx` 的 `Descriptions`。

### 5. 候选行点击和 URL 同步

操作：

1. 在 `/workbench` 页面底部找到 `候选缺陷记录` 小表格。
2. 点击第二行。

预期：

- 浏览器 URL 变成 `/defects/<缺陷ID>`。
- 被点击的行有选中态。
- 顶部标题旁边的缺陷 id 与选中行一致。
- 主图、缺陷信息、状态流和台账都随选中行更新。

如果不符合：

- 查 `client/src/components/CandidateDefectTable.tsx` 的 `onRow`。
- 查 `client/src/pages/DefectDetailPage.tsx` 传给 `CandidateDefectTable` 的 `onSelect`。
- 查 `useParams`、`activeId`、`selectedId` 是否一致。

### 6. 复核按钮

在工作台选中一条 `待复核` 缺陷后，依次检查三个按钮。

#### 确认真缺陷

操作：点击 `确认真缺陷`。

预期：

- Network 出现 `/graphql` POST，operation 是 `ReviewDefect`。
- 按钮提交期间会有 loading。
- 当前缺陷状态变成 `已确认`。
- 状态流走到 `缺陷台账`。
- 台账中该行 `派单对象` 显示 `待派单`。

#### 判定误检

操作：点击 `判定误检`。

预期：

- 当前缺陷状态变成 `误检`。
- 状态流判定节点显示误检语义。
- 台账中该行 `派单对象` 为 `-`。

#### 标记待复查

操作：点击 `标记待复查`。

预期：

- 当前缺陷状态变成 `待复查`。
- 台账中该行 `派单对象` 显示 `二次复核队列`。

如果不符合：

- 前端乐观更新和回滚：`client/src/store/review/sagas.ts`。
- 复核按钮：`client/src/components/ReviewDecisionPanel.tsx`。
- 后端 mutation：`server/src/graphql/resolvers.ts`。
- 写盘逻辑：`server/src/repo/defectRepo.ts`。
- GraphQL enum 映射：`client/src/api/graphqlEnums.ts`。

注意：复核操作会写入 `server/src/data/defects.json` 和 `server/src/data/reviewLogs.json`，排查完要恢复种子。

### 7. 状态流、台账和派单

检查位置：

- 工作台底部 `状态流转`。
- 工作台底部 `缺陷台账 / 预警派单`。

预期：

- `待复核`：停留在人工抽检阶段。
- `已确认`：进入缺陷台账，派单目标显示 `待派单`。
- `误检`：显示排除语义，不进入派单。
- `待复查`：派单目标显示 `二次复核队列`。
- `已派单`：预警/派单节点激活。

如果不符合：

- 状态流查 `client/src/components/StatusFlow.tsx`。
- 台账规则查 `client/src/components/DefectLedgerPanel.tsx` 的 `dispatchTargetFor`。
- 状态枚举查 `shared/src/types.ts`。

### 8. SSE 实时检测流

在 `/defects` 或 `/workbench` 页面都可以检查。

操作：

1. 点击 `启动检测流`。
2. 观察按钮旁边 Tag 从 `已暂停` 变成 `推送中`。
3. 等待约 6 秒。
4. 观察 `本次新增 1 条`。
5. 回到列表页，确认记录数从 17 变成 18，新记录插入表格顶部。
6. 点击 `停止检测流`。
7. 再等待 7 秒，确认数量不再增加。

预期：

- Network 中 `/api/stream` 是 EventStream。
- 每条新缺陷会 prepend 到列表顶部。
- 停止后 EventStream 关闭，不再新增。
- 如果后端断开，页面应显示 `检测流连接已断开，请检查后端 /api/stream`，并回到非 active 状态。

如果不符合：

- 前端 EventSource：`client/src/api/sseChannel.ts`。
- Saga 启停和断线处理：`client/src/store/stream/sagas.ts`。
- Stream UI 状态：`client/src/store/stream/slice.ts` 和 `client/src/components/StreamControl.tsx`。
- 后端 SSE：`server/src/routes/stream.ts`。
- mock 缺陷生成：`server/src/services/algorithmService.ts`。

注意：SSE 每新增一条都会写入 `server/src/data/defects.json`，排查完要恢复种子。

### 9. Console 和 Network

打开浏览器 DevTools。

Console 允许出现：

- Vite dev server 连接日志。
- React DevTools 提示。
- Apollo DevTools 提示。

Console 不应出现：

- React Router future warning。
- AntD `bordered` deprecated warning。
- runtime error。
- favicon 404。

Network 不应出现：

- `/graphql` 4xx/5xx。
- `/api/stream` 非预期失败。
- 图片资源 404。
- `/favicon.ico` 404。

如果不符合：

- Router warning 查 `client/src/main.tsx`。
- AntD warning 查对应组件 prop。
- favicon 查 `client/index.html` 和 `client/public/favicon.svg`。
- GraphQL 错误查前后端 enum 映射和 resolver。

### 10. 断线场景

这个检查用于确认错误态是否可解释。

操作：

1. 启动前后端。
2. 在页面点击 `启动检测流`。
3. 停掉后端进程。

预期：

- 页面不应一直显示 `推送中`。
- 应显示警告：`检测流连接已断开，请检查后端 /api/stream`。
- 按钮回到可重新启动状态。

如果不符合：

- 查 `client/src/api/sseChannel.ts` 的 `source.onerror`。
- 查 `client/src/store/stream/sagas.ts` 的 `race({ stopped, ended })`。
- 查 `client/src/store/stream/slice.ts` 的 `failed` reducer 是否设置 `isActive=false`。

## API 手动排查

### 查询列表

```bash
curl http://localhost:4000/graphql \
  -H 'content-type: application/json' \
  --data '{"query":"{ defects { id component defectType status riskLevel confidence } }"}'
```

### 按风险筛选

```bash
curl http://localhost:4000/graphql \
  -H 'content-type: application/json' \
  --data '{"query":"query($riskLevel: RiskLevel){ defects(riskLevel: $riskLevel){ id riskLevel } }","variables":{"riskLevel":"LEVEL_1"}}'
```

### 提交复核

把 `DEF-20260501-kVo8b` 换成当前存在的 id：

```bash
curl http://localhost:4000/graphql \
  -H 'content-type: application/json' \
  --data '{"query":"mutation($id: ID!, $action: ReviewStatus!){ reviewDefect(id: $id, action: $action){ id status reviewLogs { id action comment timestamp } } }","variables":{"id":"DEF-20260501-kVo8b","action":"CONFIRMED"}}'
```

GraphQL 状态 enum 对照：

| 前端中文状态 | GraphQL enum |
| --- | --- |
| 待复核 | `PENDING` |
| 已确认 | `CONFIRMED` |
| 误检 | `FALSE_POSITIVE` |
| 待复查 | `RECHECK` |
| 已派单 | `DISPATCHED` |

GraphQL 风险 enum 对照：

| 前端中文风险 | GraphQL enum |
| --- | --- |
| 一级 | `LEVEL_1` |
| 二级 | `LEVEL_2` |
| 三级 | `LEVEL_3` |

## 恢复数据种子

复核按钮和 SSE 都会写 JSON。做完人工 QA 后，建议恢复到 Git HEAD 的干净数据：

```bash
git show HEAD:server/src/data/defects.json > server/src/data/defects.json
git show HEAD:server/src/data/reviewLogs.json > server/src/data/reviewLogs.json
```

恢复后重新检查：

```bash
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('server/src/data/defects.json','utf8')); const l=JSON.parse(fs.readFileSync('server/src/data/reviewLogs.json','utf8')); console.log({defects:d.length, logs:l.length});"
```

预期：

```text
{ defects: 17, logs: 4 }
```

如果服务正在运行，恢复文件后建议刷新页面，必要时重启后端，确保内存和文件状态一致。

## 自动验证命令

每次改代码后至少跑：

```bash
pnpm -r typecheck
```

```bash
pnpm -r test
```

建议面试前再跑：

```bash
pnpm build
```

当前测试覆盖重点：

- `client/src/api/graphqlEnums.test.ts`：GraphQL enum 与中文业务枚举互转。
- `client/src/store/defects/slice.test.ts`：缺陷列表 reducer。
- `client/src/store/review/sagas.test.ts`：复核 saga 乐观更新。
- `client/src/store/stream/sagas.test.ts`：SSE saga 启停和 channel 结束。
- `client/src/store/stream/slice.test.ts`：SSE failed 状态。
- `server/src/repo/defectRepo.test.ts`：后端 repo 状态更新和统计。

## 常见 bug 定位表

| 现象 | 优先排查 |
| --- | --- |
| 页面白屏 | 浏览器 Console、`client/src/App.tsx`、`client/src/main.tsx` |
| `/workbench` 显示空状态 | `DefectDetailPage.tsx` 的 `activeId` 和列表加载 |
| 列表数量异常变多 | SSE 写入 JSON，恢复 `server/src/data/defects.json` |
| 复核后状态没变 | `ReviewDecisionPanel.tsx`、`review/sagas.ts`、Network `/graphql` |
| 复核后后端报错 | `server/src/graphql/resolvers.ts`、`server/src/repo/defectRepo.ts` |
| enum 显示不对 | `client/src/api/graphqlEnums.ts`、`server/src/graphql/resolvers.ts` |
| bbox 不显示 | `BBoxOverlay.tsx`、图片是否加载、canvas 尺寸是否为 0 |
| SSE 启动后没有新数据 | Network `/api/stream`、`stream/sagas.ts`、`server/src/routes/stream.ts` |
| SSE 停止后仍新增 | `stream/sagas.ts` 是否 cancel task 并 close channel |
| 后端健康检查失败 | 端口 4000 是否被占用，`server/src/index.ts` |
| Vite 页面请求 4000 失败 | `client/vite.config.ts` proxy 和后端端口是否一致 |
| favicon 404 | `client/index.html`、`client/public/favicon.svg` |

## 面试演示建议顺序

1. 打开 `/defects`，说明候选缺陷记录来自 GraphQL。
2. 用风险等级筛选，说明 Redux filter + saga fetch。
3. 进入 `/workbench`，说明这个页面是 demo 主战场。
4. 指图说明：图片、bbox、AI 置信度、风险等级、线路区段、采集设备。
5. 点击候选行，说明复核员可切换记录。
6. 点击 `确认真缺陷`，说明 GraphQL mutation + 乐观更新 + JSON 持久化。
7. 看状态流和台账，说明真缺陷进入台账和待派单状态。
8. 启动检测流，等待新缺陷进入列表，说明 Redux-Saga 管 SSE。
9. 停止检测流，说明 saga cancel 和 channel cleanup。
10. 最后解释真实算法、真实 DB、鉴权和维修闭环属于生产扩展点。

## 面试前最终检查清单

- `pnpm -r typecheck` 通过。
- `pnpm -r test` 通过。
- `pnpm build` 通过。
- `server/src/data/defects.json` 是 17 条。
- `server/src/data/reviewLogs.json` 是 4 条。
- `/defects` 显示 17 条。
- `/workbench` 直接打开不空白。
- 主图、bbox、局部放大可见。
- 三个复核按钮都能触发 GraphQL mutation。
- SSE 启动后新增，停止后不再新增。
- Console 没有红色错误。
- Network 没有同源 404/500。

## 约束提醒

- 不要改 `demo-reference/PLAN.md` 的业务边界，除非你是在更新计划文档。
- 不要改 `demo-reference/ReviewWorkbenchMockup.reference.tsx`。
- 不要为了 demo 引入新技术栈。
- 不要把真实数据库、鉴权、完整派单系统塞进本 demo。
- 修 bug 优先保持最小改动：先定位根因，再改对应文件。
