# 4C-Console — 接触网智能检测复核平台
> **v2 极简合体版** ｜ 给 AI 编码代理（Cursor / Cline / Claude Code / Codex）的项目蓝本
> **作者：董学山** ｜ **目标：5/6 14:00 面试 Demo（深圳市中维华视科技）**
> **可用工时：6 个上午 × ~3h ≈ 18h**（毕设占下午晚上）
> **覆盖**：本文档替代 v1 PromptForge plan，作为唯一真相源

---

## 0. 给 AI 代理的元指令（每次开会话先复读）

你是这个项目的协作开发者。我会按 milestone 把任务交给你完成。请严格遵守：

1. **技术栈完全锁死**，不要建议"改用更现代的方案"。本项目目的是匹配特定 JD 考点（Redux + Redux-Saga + Express + GraphQL）。
2. **Scope 优先级**：能跑 > 能演示 > 关键字命中 > 代码漂亮。任何"为了完美再加一层抽象"先反问"会拖到 5/6 之前演示不了吗"。
3. **每完成一个 milestone 提交一个 git commit**，commit message 用英文祈使句（feat/fix/refactor/docs）。
4. **环境/版本冲突先报告再行动**，不要自作主张降级或换库。
5. **不接真实数据库**——所有持久化用 JSON 文件，演示用，面试讲"生产换 Postgres + Drizzle 即可"。
6. **不接真实 AI 算法**——算法服务用 mock，但代码要保留"算法 service 抽象层"，面试可讲"易于替换为真实 4C 算法服务"。

---

## 1. 项目定位（一句话）

**4C-Console**：模拟铁路接触网 4C 智能检测系统的复核工作台。检测车上传图片 → AI 算法实时推送疑似缺陷 → 人工复核员确认/标记误检 → 状态流转 + 看板统计。

**面向面试官的核心信息**：
- 业务理解：我研究了贵公司 4C 接触网检测的全流程
- 技术对齐：JD 四件套（Redux + Saga + Express + GraphQL）全部用上且**有真实业务理由**
- AI 工程化思维：算法服务作为可替换 service 抽象，预留 LLM 接口（DeepSeek）做"AI 复核建议"
- 工程素养：git commit 节奏、TypeScript、loading/empty/error 三态、可演示闭环

---

## 2. JD 对齐性证明（写进 README，面试官第一眼看）

| JD 要求 | 在项目里的真实位置 |
|---|---|
| React 实际项目经验 | `client/` 整个前端 |
| Redux Toolkit | 缺陷列表、当前选中、筛选、复核草稿、流式状态、看板指标都走 store |
| **Redux-Saga**（重点考点） | `streamDefectsSaga` 监听 SSE 推送、`reviewSaga` 乐观更新+回滚、`take/race/cancel` 真实使用 |
| Node.js + Express | `server/index.ts` 提供 GraphQL endpoint + `/api/stream` SSE + `/api/llm/suggest` LLM 代理 |
| GraphQL Schema + Resolver | 4 个 type、3 个 query、4 个 mutation、嵌套查询 `defect.reviewLogs` |
| 接口开发与系统维护 | 前后端联调、错误处理、loading/empty/error 三态 |
| Git 协作 | 按 milestone 切分支、PR-style commit |
| 善用 Codex/Claude Code | README 专门一节 "AI-assisted development log" |

---

## 3. Scope 红线（极简版）

### ✅ MUST（保住基础分）

1. **缺陷列表页**：从 GraphQL 拉数据 → Redux 渲染 → 支持按风险等级筛选
2. **缺陷详情/复核页**：图片 + AI 标注框 overlay + 复核操作（确认/误检/待复查）
3. **实时推送**：检测车 SSE 流，每 5–8 秒推一条新缺陷进列表（**Saga 主战场**）
4. **看板**：4 个核心数字（总检出/待复核/已确认/误检率）+ 1 个饼图（风险等级分布）

### ⚠️ NICE-TO-HAVE（有时间才做）

- **LLM AI 复核建议**：详情页"AI 复核建议"按钮 → DeepSeek 流式输出建议（这张牌让你简历的 AI 经验复活）
- 复核日志时间线（一个嵌套查询展示足够）

### ❌ 显式排除（面试官问到再解释为什么不做）

- 用户系统 / 鉴权（演示单用户，讲"production 接 better-auth"）
- 真实数据库（用 JSON 文件，讲"生产换 Postgres + Drizzle，已抽象 repository 层"）
- 真实图像识别（用 mock 推送，讲"算法服务作为可替换 service，已留接口"）
- 部署到生产（本地跑 + 录屏备份）
- 派单 / 工单 / 维修闭环
- 移动端 / 国际化 / 暗色模式 / PWA / 单测覆盖率

---

## 4. 技术栈（已锁定，不要改）

### 前端
```
react@18.x
react-dom@18.x
react-router-dom@6.x
@reduxjs/toolkit@2.x
react-redux@9.x
redux-saga@1.x
@apollo/client@3.x
graphql@16.x
vite@5.x
typescript@5.x
antd@5.x              # 直接用 AntD 组件库省时间
echarts@5.x + echarts-for-react   # 看板饼图
dayjs                 # 时间处理
```

### 后端
```
node@20.x
express@4.x
@apollo/server@4.x + @as-integrations/express5
graphql@16.x
cors
dotenv
nanoid                # ID 生成
```

### 持久化（极简）
```
直接读写 server/data/defects.json 等 JSON 文件
启动时 load 到内存，写操作落盘
不用 Drizzle、不用 SQLite、不用 ORM
```

### LLM 集成
```
fetch DeepSeek API（https://api.deepseek.com/v1/chat/completions）
SSE 流式转发给前端
```

### 开发工具
```
tsx                   # 直接跑 ts，省 build
nodemon               # 热重载
prettier
pnpm                  # monorepo 友好
```

---

## 5. 数据模型（TypeScript types）

```typescript
// shared/types.ts（前后端共用）
export type RiskLevel = '一级' | '二级' | '三级';
export type ReviewStatus = '待复核' | '已确认' | '误检' | '待复查' | '已派单';

export interface Defect {
  id: string;
  line: string;              // 沪昆线 / 青藏线 / 昆明南联络线 ...
  section: string;           // K124+320
  poleNumber: string;        // 23#杆
  component: string;         // 弹性定位器支座 / 吊弦 / 绝缘子 ...
  defectType: string;        // 裂损 / 松弛 / 缺失 ...
  confidence: number;        // 0~100
  riskLevel: RiskLevel;
  status: ReviewStatus;
  detectedAt: string;        // ISO 8601 UTC
  imageUrl: string;          // /images/sample-1.jpg 或 placeholder
  bbox: { x: number; y: number; w: number; h: number };  // 标注框，比例 0~1
  reviewLogs: ReviewLog[];   // 复核日志，嵌套查询用
}

export interface ReviewLog {
  id: string;
  defectId: string;
  reviewer: string;          // mock: '复核员 张三' / 'AI 助手'
  action: ReviewStatus | 'AI_SUGGEST';
  comment?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalDetected: number;
  pendingReview: number;
  confirmed: number;
  falsePositive: number;
  falsePositiveRate: number; // 0~1
  riskDistribution: { level: RiskLevel; count: number }[];
}
```

**JSON 文件初始数据**（`server/data/defects.json`）：参照本项目 v1 资料里的 4 条示例 + 再凑 6 条到 10 条，覆盖不同部件、风险、状态。

---

## 6. GraphQL Schema

```graphql
enum RiskLevel { LEVEL_1 LEVEL_2 LEVEL_3 }
enum ReviewStatus { PENDING CONFIRMED FALSE_POSITIVE RECHECK DISPATCHED }

type Defect {
  id: ID!
  line: String!
  section: String!
  poleNumber: String!
  component: String!
  defectType: String!
  confidence: Float!
  riskLevel: RiskLevel!
  status: ReviewStatus!
  detectedAt: String!
  imageUrl: String!
  bbox: BBox!
  reviewLogs: [ReviewLog!]!     # 嵌套查询 → GraphQL 优势点
}

type BBox { x: Float!, y: Float!, w: Float!, h: Float! }

type ReviewLog {
  id: ID!
  reviewer: String!
  action: String!
  comment: String
  timestamp: String!
}

type DashboardStats {
  totalDetected: Int!
  pendingReview: Int!
  confirmed: Int!
  falsePositive: Int!
  falsePositiveRate: Float!
  riskDistribution: [RiskCount!]!
}
type RiskCount { level: RiskLevel!, count: Int! }

type Query {
  defects(riskLevel: RiskLevel, status: ReviewStatus): [Defect!]!
  defect(id: ID!): Defect
  dashboardStats: DashboardStats!
}

type Mutation {
  reviewDefect(id: ID!, action: ReviewStatus!, comment: String): Defect!
  dispatchDefect(id: ID!): Defect!
}
```

**为什么不全走 GraphQL**：
- 实时推送走 Express SSE `/api/stream`（演示亮点 + 避开 GraphQL Subscriptions 复杂度）
- LLM 流式走 Express SSE `/api/llm/suggest`（同上）
- **面试可讲**："读写走 GraphQL（schema 严格、嵌套查询省请求）；流式数据走 SSE（HTTP/1.1 兼容、单向推送够用、无须 WebSocket 状态机）"——这一句话把架构决策讲清楚

---

## 7. Redux Store 形状

```typescript
{
  defects: {
    list: Defect[],              // 列表数据，SSE 推送会 prepend 新缺陷
    selectedId: string | null,
    filter: { riskLevel?: RiskLevel, status?: ReviewStatus },
    status: 'idle' | 'loading' | 'error',
    error: string | null,
  },
  stream: {
    isActive: boolean,           // 检测车是否在推送
    receivedCount: number,       // 本次会话收到多少新缺陷
  },
  review: {
    drafts: Record<string, { action: ReviewStatus, comment: string }>,  // 复核草稿
    submitting: Record<string, boolean>,
  },
  llm: {
    activeDefectId: string | null,
    buffer: string,              // 流式累积
    isStreaming: boolean,
  },
  dashboard: {
    stats: DashboardStats | null,
    lastFetched: string | null,
  },
}
```

### 必须实现的 4 个 Saga（CTO 会盯着看）

```
1. fetchDefectsSaga      — takeLatest，列表筛选
2. streamDefectsSaga     — ⭐ 主战场：fork SSE listener，take(STREAM_STOP) 时 cancel
3. reviewDefectSaga      — takeEvery，乐观更新 → 失败回滚（讲 try/catch + put rollback action）
4. streamLLMSuggestSaga  — race(call(stream), take(LLM_CANCEL))，演示 race 用法
```

`streamDefectsSaga` 关键代码骨架（**Day 4 直接喂给 AI 代理**）：

```typescript
function* streamDefectsSaga() {
  while (true) {
    yield take('stream/start');
    const channel = yield call(createSSEChannel, '/api/stream');
    const task = yield fork(handleStreamMessages, channel);
    yield take('stream/stop');
    yield cancel(task);
    channel.close();
  }
}

function* handleStreamMessages(channel) {
  try {
    while (true) {
      const msg = yield take(channel);
      yield put(defectsSlice.actions.prepend(msg));
      yield put(streamSlice.actions.increment());
    }
  } finally {
    if (yield cancelled()) {
      // 清理
    }
  }
}
```

---

## 8. 文件结构

```
4c-console/
├── README.md                            # 含 JD 对齐表、AI 协作说明、demo 脚本
├── package.json                         # workspaces
├── pnpm-workspace.yaml
├── shared/
│   └── types.ts                         # 前后端共用类型
├── client/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                      # 路由 + Apollo Provider + Redux Provider
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   ├── rootSaga.ts
│   │   │   ├── defects/{slice,sagas}.ts
│   │   │   ├── stream/{slice,sagas}.ts  # ⭐ 重头戏
│   │   │   ├── review/{slice,sagas}.ts
│   │   │   ├── llm/{slice,sagas}.ts
│   │   │   └── dashboard/{slice,sagas}.ts
│   │   ├── api/
│   │   │   ├── apolloClient.ts
│   │   │   ├── queries.ts               # gql 模板字面量
│   │   │   └── sseChannel.ts            # SSE → Saga channel 封装
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx        # 看板
│   │   │   ├── DefectListPage.tsx       # 列表
│   │   │   └── DefectDetailPage.tsx     # 详情/复核
│   │   ├── components/
│   │   │   ├── DefectCard.tsx
│   │   │   ├── BBoxOverlay.tsx          # canvas 画标注框
│   │   │   ├── StreamControl.tsx        # 启动/暂停推送按钮
│   │   │   ├── LLMSuggestion.tsx        # AI 复核建议组件
│   │   │   └── RiskPie.tsx              # ECharts 饼图
│   │   ├── styles/index.css
│   │   └── utils/
│   ├── public/
│   │   └── images/                      # AI 生成的 1-2 张主图放这
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── server/
│   ├── src/
│   │   ├── index.ts                     # express + apollo + sse
│   │   ├── data/                        # JSON 持久化
│   │   │   ├── defects.json             # 种子 10 条
│   │   │   └── reviewLogs.json
│   │   ├── repo/
│   │   │   └── defectRepo.ts            # JSON 读写抽象（面试可讲：换 Postgres 只换这层）
│   │   ├── graphql/
│   │   │   ├── typeDefs.ts
│   │   │   └── resolvers.ts
│   │   ├── routes/
│   │   │   ├── stream.ts                # SSE 推送 mock 缺陷
│   │   │   └── llmProxy.ts              # DeepSeek 流式代理
│   │   └── services/
│   │       └── algorithmService.ts      # mock 算法服务（面试可讲：可替换为真实 4C 算法）
│   ├── tsconfig.json
│   └── package.json
├── .env.example                         # DEEPSEEK_API_KEY=
└── docs/
    ├── ARCHITECTURE.md                  # 一页架构图（mermaid）
    ├── DEMO_SCRIPT.md                   # 5 分钟演示稿
    └── PROJECT_PLAN.md                  # 本文档
```

---

## 9. 6 天里程碑（每天上午 ~3h）

> ⚠️ **铁律**：每天结束 push 一个可运行版本。当天卡壳就砍功能，绝不带 bug 进下一天。下午晚上是毕设时间，不要破例。

### Day 1 · 4/30 周四 · 主题：地基（3h）
- [ ] `pnpm init` workspace，建 `client / server / shared` 三个包
- [ ] 后端：Express + Apollo Server 跑通，硬编码返回一条 defect
- [ ] 前端：Vite + React + TS + AntD 跑通空白页
- [ ] Apollo Client 接通后端，页面显示一条 defect 标题
- [ ] **Commit ≥ 3 个**
- [ ] **EOD**：`localhost:5173` 显示一条数据；Apollo Sandbox 能查 GraphQL

### Day 2 · 5/1 周五 · 主题：列表 + Redux（3h）
- [ ] 写 `shared/types.ts`、`server/data/defects.json` 种子 10 条
- [ ] `defectRepo.ts` JSON 读写
- [ ] GraphQL `defects` query 完整 resolver
- [ ] Redux store + sagaMiddleware 接入
- [ ] `defects/slice.ts` + `fetchDefectsSaga`
- [ ] `DefectListPage` 用 AntD Table 渲染
- [ ] 风险等级筛选下拉框
- [ ] **EOD**：列表页能展示 10 条数据 + 筛选生效

### Day 3 · 5/2 周六 · 主题：详情 + 复核（3h）⭐ Mutation 主战场
- [ ] 后端 `reviewDefect` mutation：写日志 + 改状态
- [ ] `DefectDetailPage`：图片 + canvas 标注框 overlay + 右侧信息面板
- [ ] `BBoxOverlay.tsx`：canvas 画 bbox（按 imageUrl 加载后画）
- [ ] `reviewDefectSaga`：乐观更新 + 失败回滚
- [ ] AntD Modal/Drawer 复核操作
- [ ] **EOD**：点缺陷 → 看到图片+红框 → 点"确认"→ 状态变化 → 列表刷新

### Day 4 · 5/3 周日 · 主题：实时推送 SSE（3h）⭐⭐ 演示高潮
- [ ] 后端 `/api/stream` SSE 接口：定时器每 6 秒推一条 mock 缺陷
- [ ] `sseChannel.ts`：SSE → eventChannel 封装
- [ ] `streamDefectsSaga`：fork/take/cancel 完整闭环
- [ ] `StreamControl` 组件：启动/暂停按钮
- [ ] 列表页新缺陷高亮闪烁 1 秒（CSS animation 即可）
- [ ] **EOD**：点"启动检测车" → 列表里每 6 秒跳出一条新缺陷 + 高亮

### Day 5 · 5/4 周一 · 主题：看板 + LLM 加分项（3h）
- [ ] 后端 `dashboardStats` resolver
- [ ] `DashboardPage`：4 个统计卡 + ECharts 饼图
- [ ] **如果还有时间**（NICE-TO-HAVE）：
  - 后端 `/api/llm/suggest` SSE 代理 DeepSeek
  - `streamLLMSuggestSaga`（用 race 演示）
  - 详情页"AI 复核建议"按钮 + 流式渲染
- [ ] **EOD**：三个页面（看板/列表/详情）+ 实时推送 + 复核闭环 + LLM（如完成）全跑通

### Day 6 · 5/5 周二 · 主题：打磨 + 文档 + 彩排（3h）
- [ ] 修 5 个最影响第一印象的小问题（loading 态 / 空状态 / 错误提示）
- [ ] README.md 完整版（见 §11 模板）
- [ ] ARCHITECTURE.md 一页 mermaid 图
- [ ] DEMO_SCRIPT.md 5 分钟演示稿（见 §12）
- [ ] **录一段 90 秒演示视频**（OBS 或 QuickTime）放 U 盘备份
- [ ] 对镜子讲 3 遍，限时 5 分钟
- [ ] **下午切毕设**

---

## 10. AI 协作策略（写进 README，面试官加分项）

每次开发会话开头：

1. 让 AI 代理读 `docs/PROJECT_PLAN.md`
2. 告诉它今天做哪个 Day 的哪一项
3. 让它先输出"今天会做的具体步骤 + 可能问你的 3 个澄清问题"
4. 你回答后再让它开干

**不要做的事**：
- 同时打开两个 AI 代理改同一个文件
- 一次让它做超过 200 行代码的任务
- 接受它"建议改用更现代方案"——栈是锁死的

**面试可讲的金句**：
- "我让 AI 写代码，但架构决策和 PR review 都是我做的。"
- "我给 AI 的 prompt 限制 scope，避免过度设计。"
- "git commit 切片，每个 commit 不超过一个语义变更，方便 AI 后续 patch。"
- "Redux-Saga 的关键 channel 和 race 我手写的——我希望 AI 是放大器而不是黑盒。"

---

## 11. README.md 模板（项目根目录）

````markdown
# 4C-Console — 接触网智能检测复核平台

> 模拟铁路接触网 4C 智能检测系统的复核工作台。
> 检测车上传图片 → AI 算法实时推送疑似缺陷 → 人工复核员确认/标记误检 → 状态流转 + 看板统计。

## Demo 截图
（3 张：看板 / 列表（推送中）/ 详情复核）

## 业务背景
本项目模拟铁路接触网（Catenary）4C 检测业务流程。4C 指接触网悬挂状态检测监测，
通过检测车采集高清图像 → AI 算法识别疑似缺陷 → 人工复核员确认 → 缺陷台账。
本 Demo 聚焦"AI 检出之后"的前端复核工作流。

## 技术栈与 JD 对齐说明
| JD 要求 | 本项目实现 |
|---|---|
| React + TS | 整个 client/ |
| Redux Toolkit | 4 个 slice：defects / stream / review / llm / dashboard |
| **Redux-Saga** | streamDefectsSaga（fork/take/cancel）、reviewSaga（乐观更新+回滚）、llmSaga（race） |
| Express + Node.js | server/index.ts，提供 GraphQL + SSE + LLM proxy |
| GraphQL | 4 type、3 query、2 mutation，嵌套查询 defect.reviewLogs |

## 关键设计决策
1. **读写走 GraphQL，流式走 SSE**——schema 严格 + 单向推送够用，避开 Subscriptions 复杂度
2. **乐观更新 + Saga 回滚**——所有 mutation 先动 UI，失败 dispatch rollback
3. **算法服务作为可替换 service**——`algorithmService.ts` 抽象，生产可换为真实 4C 算法
4. **JSON 持久化是演示选择**——`defectRepo.ts` 抽象，生产换 Postgres 只换 repo 层
5. **LLM 集成走 service proxy**——前端不直连 DeepSeek，敏感 key 后端持有

## 本地开发
```bash
pnpm install
cp .env.example .env  # 填 DEEPSEEK_API_KEY（可选，不填则 LLM 功能禁用）
pnpm dev              # 前后端并行
# 前端 http://localhost:5173
# GraphQL http://localhost:4000/graphql
```

## AI 协作开发说明
本项目使用 Cursor + Claude Code 辅助开发：
- 完整 PROJECT_PLAN.md 在 docs/，作为 AI 代理唯一真相源
- 关键 Saga（streamDefectsSaga）手写，AI 仅辅助
- 每个 commit 不超过一个语义变更
- 6 天里程碑严格执行

## 坦诚说明（未完成项）
- [ ] 用户系统（生产用 better-auth）
- [ ] 真实数据库（演示用 JSON，生产换 Postgres + Drizzle）
- [ ] 真实算法接入（已留 service 接口）
- [ ] 部署（演示本地跑 + 录屏）
- [ ] 单测覆盖率（仅手测）
````

---

## 12. 5 分钟演示脚本（DEMO_SCRIPT.md）

### 开场（30s）
> "陶姐、X 总好。我是董学山。我看到 JD 要求 React + Redux + Redux-Saga + Express + GraphQL 全栈，
> 五一这几天我做了一个对标贵公司核心业务的小工具——**4C-Console，接触网智能检测复核平台**。
> 用 mock 数据模拟检测车上传 → AI 推送 → 人工复核的完整闭环。我演示三分钟可以吗？"

### 演示路径（3 min）

**1. 看板页（30s）**
> "首页是复核员的工作看板，左上角四个核心指标：总检出、待复核、已确认、误检率。
> 右边是风险等级分布。这些数据走 GraphQL `dashboardStats` 查询，一次拿全。"

**2. 列表页 + 启动检测（60s）**
> "切到缺陷列表。这里有 10 条种子数据，可以按风险等级筛选。
> **重点演示——我点一下'启动检测车'。**"
> （新缺陷每 6 秒跳出来 + 高亮闪烁）
> "这是一条 SSE 长连接，后端模拟检测车实时上传，前端用 Redux-Saga 的 channel 接住。
> 我点一下'暂停'——`yield take(STOP)` 触发，`cancel(task)` 销毁监听。
> 这就是为什么我用 Saga 而不是 useEffect——多组件共享流、可中断、可重连。"

**3. 详情复核页（60s）**
> "点开第一条——'弹性定位器支座裂损'，这是贵公司专利里提到的小目标缺陷。
> 左边是检测图片，红框是 AI 标注的位置，置信度 94.2%。右边是详情面板。
> **我点一下'AI 复核建议'**——"
> （DeepSeek 流式输出建议文本）
> "这是接 DeepSeek 的流式代理，给复核员辅助决策。注意流式期间可中断。
> 点'确认缺陷' → 状态变化 → 看板的'已确认'+1。这里用了乐观更新——
> UI 先变化，请求失败再 rollback。"

### 收尾（30s）
> "代码大约 X 行 TypeScript，前后端 monorepo，6 天 22 个 commit。
> 项目用 Cursor + Claude Code 辅助开发，但关键的 Saga channel、race、cancel 是我手写的。
> 我没做用户系统、真实数据库、真实算法——这些在 README 里坦诚说明了，
> 也讲了生产化怎么做。我对贵公司的 4C 算法工程化非常感兴趣，希望能加入团队。"

### 高频追问预案（30s 留给 Q&A）

| 可能的问题 | 你的答 |
|---|---|
| 为什么用 SSE 不用 WebSocket | 单向推送够用、HTTP/1.1 兼容、自动重连、无须状态机 |
| 为什么用 GraphQL 不用 REST | 嵌套查询省请求（defect.reviewLogs 一次拿）、schema 即文档 |
| 你 Saga 用在哪了 | streamDefectsSaga（fork/take/cancel）、llmSaga（race）、reviewSaga（乐观更新+回滚） |
| 为什么不用 Redux Thunk | Saga 可中断、可测试（测 generator yield 顺序）、复杂副作用更清晰 |
| 你 React 多久 | 项目级是这一周，但 Vue3+Pinia 我有项目经验，数据流思想相通 |
| 为什么不接真实数据库 | 演示选择。repo 抽象层在，换 Postgres + Drizzle 改一处 |
| 为什么不接真实 AI 算法 | algorithmService 是 mock，留了接口。我对 AI 工程化很感兴趣 |
| 你这周用了多少 AI 工具 | Cursor 写组件、Claude Code 改 Saga，关键 channel/race 手写 |

---

## 13. 风险清单 & 兜底

| 风险 | 概率 | 兜底 |
|---|---|---|
| Day 4 SSE 联调不通 | 中 | 改成 setInterval 客户端轮询 + 假装是推送，演示效果一样 |
| DeepSeek API 没 key/没额度 | 中 | LLM 功能整体砍，详情页改用静态"AI 复核建议"文本卡 |
| Day 3 canvas 标注框难调 | 中 | 改用 `<div>` 绝对定位 + border-color，简单粗暴 |
| 毕设占用超出预估 | **高** | 砍 Day 5 LLM、砍 Day 4 高亮动画、保住 MUST 4 项 |
| 现场网络不稳 | 低 | 90 秒演示视频 U 盘备份 |
| CTO 当场让你写代码 | 中 | 准备 3 道：debounce / Saga 中断模式 / GraphQL N+1 |
| AntD 版本冲突 | 低 | 锁定 antd@5.x，不用最新 |

---

## 14. 立刻开始（今晚 4/29）

> 今晚不写代码，只搭骨架 + 跑通"Hello"。早睡。

**3 步走完今晚就收工**：

1. ```bash
   mkdir 4c-console && cd 4c-console && git init
   mkdir client server shared docs
   # 把本文档放到 docs/PROJECT_PLAN.md
   ```

2. 在 VSCode 打开项目，启动 AI 编码插件（Cline / Claude Code / Cursor 任选一），第一句话：
   > "Read `docs/PROJECT_PLAN.md` first. Today is Day 1. Before writing any code, list the 3 questions you need me to clarify, and the exact commands you'll run."

3. 让 AI 把澄清问题问完再动手。**绝对不要让它一上来就 npm init**。

**绝对不要在今晚做的事**：
- 写组件代码
- 配 ESLint / Prettier 的高级规则
- 纠结 monorepo 工具（pnpm workspace 够用，不要上 turbo / nx）
- 设计图 / Figma（你不是设计师，AntD 自带就够了）

**今晚 12 点前必须做完的事**：
- 项目目录结构建好
- `pnpm dev` 能启动一个空白 React 页面 + 一个 Express hello world
- git push 到 GitHub（**仓库设为 public**，commit history 本身就是面试加分项）

---

## 附录 A：图像素材准备（4/30 早上）

按你的决定：1–2 张 AI 生成主图 + canvas 示意增量。

**主图 prompt**（用 GPT-image / Midjourney / 即梦）：
```
Realistic photograph of railway catenary suspension hardware,
close-up shot of insulator and bracket, blue sky background,
high detail metal components, industrial inspection style,
4K, sharp focus
```

生成 2 张放 `client/public/images/sample-1.jpg`、`sample-2.jpg`。

**面试明确说**："这两张图是 AI 生成的演示用，真实生产从检测车摄像头来。"

其他 8 条数据指向同两张图 + 不同 bbox 即可。

---

## 附录 B：DeepSeek API 接入（Day 5 用）

`.env`：
```
DEEPSEEK_API_KEY=sk-xxx
```

`server/src/routes/llmProxy.ts` 关键调用：
```typescript
const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: '你是铁路接触网缺陷复核助手，给出 100 字以内的复核建议。' },
      { role: 'user', content: `部件：${component}，缺陷：${defectType}，置信度：${confidence}%，给出复核建议。` },
    ],
    stream: true,
  }),
});
// 转发 SSE 流给前端
```

DeepSeek 充值最低 10 元，演示用 1 元都花不完。

---

**完。开干。**
