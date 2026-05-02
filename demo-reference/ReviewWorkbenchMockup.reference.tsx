// @ts-nocheck
import React, { useMemo, useState } from 'react';

type IconName =
  | 'alert'
  | 'chart'
  | 'bell'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'database'
  | 'download'
  | 'file'
  | 'hand'
  | 'home'
  | 'image'
  | 'maximize'
  | 'menu'
  | 'rotate'
  | 'search'
  | 'settings'
  | 'shield'
  | 'siren'
  | 'x'
  | 'zoomIn'
  | 'zoomOut';

const MOCK_DEFECT = {
  id: 'REC-2026-0418-023',
  imageId: 'IMG-20260418-1023-00045',
  component: '定位器线夹',
  type: '松脱/偏移',
  confidence: 92.6,
  risk: '高',
  line: 'XX线 K124+300',
  time: '2026-04-18 10:23',
  device: '巡检车-03',
  // Demo 阶段建议替换为 client/public/images/sample-catenary-1.jpg
  image:
    'https://images.unsplash.com/photo-1605337142718-d7b6928e4ea4?q=80&w=1200&auto=format&fit=crop',
  bboxes: [
    { x: 57, y: 31, w: 15, h: 29, label: '疑似缺陷 0.93', tone: 'danger' },
    { x: 78, y: 18, w: 8, h: 12, label: '疑似缺陷 0.81', tone: 'primary' },
    { x: 22, y: 45, w: 9, h: 14, label: '疑似缺陷 0.78', tone: 'primary' },
    { x: 38, y: 62, w: 9, h: 14, label: '疑似缺陷 0.86', tone: 'primary' },
  ],
};

const MOCK_LIST = [
  { id: 1, component: '定位器线夹', type: '松脱/偏移', confidence: '92.6%', status: '待复核', time: '10:23:15' },
  { id: 2, component: '承力索线夹', type: '断裂/损伤', confidence: '88.1%', status: '已确认', time: '10:22:41' },
  { id: 3, component: '绝缘子', type: '污闪/破损', confidence: '86.4%', status: '待复查', time: '10:22:08' },
  { id: 4, component: '吊弦线夹', type: '松脱/偏移', confidence: '81.2%', status: '误检', time: '10:21:35' },
  { id: 5, component: '定位器', type: '缺失/变形', confidence: '79.6%', status: '待复核', time: '10:21:02' },
];

const LEDGER_LIST = [
  { id: 'DEF-2026-0418-017', risk: '高', status: '待派单', assignee: '—', createdAt: '04-18 09:58' },
  { id: 'DEF-2026-0418-012', risk: '高', status: '派单中', assignee: '工务段A班组', createdAt: '04-18 09:32' },
  { id: 'DEF-2026-0417-089', risk: '中', status: '处理中', assignee: '工务段B班组', createdAt: '04-17 16:45' },
  { id: 'DEF-2026-0417-063', risk: '中', status: '已完成', assignee: '工务段A班组', createdAt: '04-17 11:21' },
  { id: 'DEF-2026-0416-044', risk: '低', status: '已完成', assignee: '—', createdAt: '04-16 15:08' },
];

const STEPS = [
  { num: 1, text: '图片采集', scope: 'algorithm' },
  { num: 2, text: 'AI智能分析', scope: 'algorithm' },
  { num: 3, text: '疑似缺陷输出', scope: 'algorithm' },
  { num: 4, text: '候选缺陷记录', scope: 'demo' },
  { num: 5, text: '推送复核工作台', scope: 'demo' },
  { num: 6, text: '人工查看图片\n与标注框', scope: 'demo', focus: true },
  { num: 7, text: '复核判定', scope: 'demo', focus: true },
  { num: 8, text: '缺陷台账', scope: 'demo' },
  { num: 9, text: '风险预警/派单', scope: 'demo' },
  { num: 10, text: '统计分析/维修闭环', scope: 'out' },
];

function runSmokeTests() {
  console.assert(STEPS.length === 10, '流程条必须包含 10 个步骤');
  console.assert(STEPS.slice(0, 3).every((step) => step.scope === 'algorithm'), '1-3 步必须属于算法侧');
  console.assert(STEPS.slice(3, 9).every((step) => step.scope === 'demo'), '4-9 步必须属于 Demo 范围');
  console.assert(STEPS[9].scope === 'out', '第 10 步必须标记为本次不展示');
  console.assert(MOCK_DEFECT.bboxes.length === 4, '主图必须保留 4 个 bbox 标注框');
  console.assert(MOCK_LIST.length >= 5, '候选缺陷表至少需要 5 条演示数据');
  console.assert(LEDGER_LIST.some((item) => item.risk === '高'), '台账必须包含高风险记录');
}

runSmokeTests();

export default function App() {
  const [selectedAction, setSelectedAction] = useState<'confirmed' | 'falsePositive' | 'recheck'>('confirmed');
  const defect = MOCK_DEFECT;

  const actionText = useMemo(() => {
    if (selectedAction === 'confirmed') return '确认真缺陷';
    if (selectedAction === 'falsePositive') return '判定误检';
    return '标记待复查';
  }, [selectedAction]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-sm text-slate-700">
      <aside className="z-20 flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="flex h-16 items-center gap-3 bg-blue-800 px-5 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">4C</div>
          <div>
            <div className="text-base font-bold leading-5">4C-Console</div>
            <div className="text-[10px] text-blue-100">Defect Review Demo</div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <NavItem icon={<Icon name="home" size={18} />} label="首页看板" />
          <NavItem icon={<Icon name="image" size={18} />} label="候选缺陷记录" />
          <NavItem icon={<Icon name="check" size={18} />} label="复核工作台" active />
          <NavItem icon={<Icon name="file" size={18} />} label="缺陷台账" />
          <NavItem icon={<Icon name="alert" size={18} />} label="预警派单" />
          <NavItem icon={<Icon name="settings" size={18} />} label="系统设置" />
        </nav>

        <button className="mx-4 mb-4 rounded-lg border border-slate-200 py-2 text-xs text-slate-500 hover:bg-slate-50">
          ← 收起侧边栏
        </button>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Icon name="menu" size={20} className="text-slate-500" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">接触网缺陷智能复核系统 Demo</h1>
              <p className="text-xs text-slate-400">复核工作台 / AI 检出后人工确认闭环</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative hidden md:block">
              <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索记录编号、部件、线路区段..."
                className="w-72 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <Icon name="bell" size={20} className="cursor-pointer text-slate-500 hover:text-blue-600" />
            <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                张
              </div>
              <span className="font-medium text-slate-700">张工</span>
              <Icon name="chevron" size={16} className="text-slate-400" />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-[1500px] space-y-4">
            <WorkflowCard />

            <div className="grid grid-cols-4 gap-4">
              <StatCard title="待复核" value="128" icon={<Icon name="file" size={24} />} tone="blue" />
              <StatCard title="今日新增" value="42" icon={<Icon name="chart" size={24} />} tone="green" />
              <StatCard title="真缺陷" value="31" icon={<Icon name="shield" size={24} />} tone="purple" />
              <StatCard title="高风险" value="7" icon={<Icon name="siren" size={24} />} tone="red" />
            </div>

            <div className="grid h-[470px] grid-cols-12 gap-4">
              <div className="col-span-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <PanelHeader
                  title="复核工作台"
                  badge="演示重点"
                  rightText={`图像ID：${defect.imageId}`}
                />

                <div className="relative h-[408px] overflow-hidden bg-slate-100">
                  <img
                    src={defect.image}
                    alt="接触网巡检图片"
                    className="h-full w-full object-cover saturate-75 contrast-125"
                  />

                  <div className="absolute left-3 top-3 rounded bg-slate-950/70 px-2 py-1 text-xs font-medium text-white">
                    图像ID：{defect.imageId}
                  </div>

                  {defect.bboxes.map((box, index) => (
                    <BBox key={index} {...box} />
                  ))}

                  <div className="absolute bottom-16 right-5 h-40 w-56 overflow-hidden rounded-xl border-4 border-white bg-slate-900 shadow-2xl">
                    <div className="absolute left-0 top-0 z-10 flex items-center gap-1 rounded-br bg-slate-950/75 px-2 py-1 text-[10px] font-medium text-white">
                      <Icon name="zoomIn" size={12} /> 局部放大
                    </div>
                    <img
                      src={defect.image}
                      alt="局部放大"
                      className="h-full w-full scale-[3.35] object-cover saturate-75 contrast-125"
                      style={{ objectPosition: '58% 36%' }}
                    />
                  </div>

                  <ImageToolbar />
                </div>
              </div>

              <div className="col-span-4 flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex-1 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <h2 className="font-bold text-slate-900">缺陷信息</h2>
                    <Badge>演示重点</Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <InfoRow label="记录编号" value={defect.id} />
                    <InfoRow label="部件" value={defect.component} />
                    <InfoRow label="缺陷类型" value={defect.type} />
                    <InfoRow label="AI置信度" value={`${defect.confidence}%`} />
                    <InfoRow label="风险等级" value={<RiskBadge risk={defect.risk} />} />
                    <InfoRow label="线路区段" value={defect.line} />
                    <InfoRow label="采集时间" value={defect.time} />
                    <InfoRow label="采集设备" value={defect.device} />
                  </div>
                </div>

                <div className="m-4 mt-0 rounded-xl border border-dashed border-blue-300 bg-blue-50/30 p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">复核判定</h3>
                    <Badge>演示重点</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <DecisionButton
                      active={selectedAction === 'confirmed'}
                      icon={<Icon name="check" size={17} />}
                      label="确认真缺陷"
                      onClick={() => setSelectedAction('confirmed')}
                    />
                    <DecisionButton
                      active={selectedAction === 'falsePositive'}
                      variant="neutral"
                      icon={<Icon name="x" size={17} />}
                      label="判定误检"
                      onClick={() => setSelectedAction('falsePositive')}
                    />
                    <DecisionButton
                      active={selectedAction === 'recheck'}
                      variant="warning"
                      icon={<Icon name="clock" size={17} />}
                      label="标记待复查"
                      onClick={() => setSelectedAction('recheck')}
                    />
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 text-xs text-slate-500">复核备注</div>
                    <textarea
                      className="h-16 w-full resize-none rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder={`当前选择：${actionText}。请输入复核备注（选填）...`}
                    />
                    <div className="mt-1 text-right text-[10px] text-slate-400">0/200</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 pb-4">
              <CandidateTable />
              <StatusFlow />
              <LedgerTable />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  const paths: Record<IconName, React.ReactNode> = {
    alert: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-7" /><path d="M19 7h-4" /><path d="M19 7v4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
    check: <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-5" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h6" /></>,
    hand: <><path d="M18 11.5V9a2 2 0 0 0-4 0v2" /><path d="M14 10V7a2 2 0 0 0-4 0v4" /><path d="M10 10.5V8a2 2 0 0 0-4 0v7" /><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2a7 7 0 0 1-6.9-5.8L4 12" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10" /><path d="M9 21v-6h6v6" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
    maximize: <><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></>,
    menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
    rotate: <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
    settings: <><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 20 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.7 1Z" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-5" /></>,
    siren: <><path d="M7 18v-6a5 5 0 0 1 10 0v6" /><path d="M5 18h14" /><path d="M4 22h16" /><path d="M12 2v3" /><path d="m4.2 5.2 2.1 2.1" /><path d="m19.8 5.2-2.1 2.1" /></>,
    x: <><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></>,
    zoomIn: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M11 8v6" /><path d="M8 11h6" /></>,
    zoomOut: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function WorkflowCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
        <span>← 复核工作台 / 复核工作台</span>
        <span>Demo 聚焦：AI 检出后的候选记录、人工复核、台账与派单状态</span>
      </div>

      <div className="relative px-2 pb-8">
        <div className="grid grid-cols-10 items-start gap-2">
          {STEPS.map((step) => (
            <Step key={step.num} {...step} />
          ))}
        </div>

        <div className="absolute bottom-2 left-[1.5%] w-[28%] border-t border-slate-300 text-center">
          <span className="relative -top-2 bg-white px-2 text-xs text-slate-400">算法侧</span>
        </div>
        <div className="absolute bottom-2 left-[31%] w-[58%] border-t-2 border-blue-500 text-center">
          <span className="relative -top-2 bg-white px-2 text-xs font-semibold text-blue-600">Demo 范围</span>
        </div>
        <div className="absolute bottom-2 right-[1.5%] w-[8.5%] border-t border-slate-300 text-center">
          <span className="relative -top-2 bg-white px-2 text-xs text-slate-400">本次不展示</span>
        </div>
      </div>
    </div>
  );
}

function Step({ num, text, scope, focus }: { num: number; text: string; scope: string; focus?: boolean }) {
  const base = 'relative flex min-h-[74px] flex-col items-center rounded-lg border px-1.5 py-2 text-center transition';
  const cls =
    scope === 'algorithm'
      ? 'border-slate-200 bg-slate-50 text-slate-400'
      : scope === 'out'
        ? 'border-slate-200 bg-slate-50 text-slate-400'
        : focus
          ? 'border-blue-600 bg-white text-blue-700 shadow-[0_0_0_2px_rgba(37,99,235,0.1)]'
          : 'border-blue-200 bg-blue-50/30 text-blue-600';

  return (
    <div className={base + ' ' + cls}>
      {focus && <div className="absolute -bottom-6 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">★ 演示重点</div>}
      <div className="mb-1 text-lg font-bold">{num}</div>
      <div className="whitespace-pre-line text-[11px] font-semibold leading-4">{text}</div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={`flex cursor-pointer items-center border-l-4 px-5 py-3 transition ${
        active
          ? 'border-blue-600 bg-blue-50 font-semibold text-blue-700'
          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className={`mr-3 ${active ? 'text-blue-600' : 'text-slate-400'}`}>{icon}</div>
      <span>{label}</span>
    </div>
  );
}

function StatCard({ title, value, icon, tone }: { title: string; value: string; icon: React.ReactNode; tone: 'blue' | 'green' | 'purple' | 'red' }) {
  const toneMap = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`rounded-xl p-3 ${toneMap[tone]}`}>{icon}</div>
      <div>
        <div className="text-xs font-medium text-slate-500">{title}</div>
        <div className={`mt-1 text-3xl font-bold ${toneMap[tone].split(' ')[0]}`}>{value}</div>
      </div>
    </div>
  );
}

function PanelHeader({ title, badge, rightText }: { title: string; badge?: string; rightText?: string }) {
  return (
    <div className="flex h-[62px] items-center justify-between border-b border-slate-100 bg-white px-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {badge && <Badge>{badge}</Badge>}
      </div>
      {rightText && <div className="text-xs font-medium text-slate-500">{rightText}</div>}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">{children}</span>;
}

function BBox({ x, y, w, h, label, tone }: { x: number; y: number; w: number; h: number; label: string; tone: string }) {
  const isDanger = tone === 'danger';
  return (
    <div
      className={`absolute cursor-pointer border-2 shadow-sm transition hover:bg-white/10 ${isDanger ? 'border-red-500' : 'border-blue-500'}`}
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
    >
      <div
        className={`absolute -left-0.5 -top-7 whitespace-nowrap px-2 py-1 text-[11px] font-bold text-white ${isDanger ? 'bg-red-500' : 'bg-blue-500'}`}
      >
        {label}
      </div>
    </div>
  );
}

function ImageToolbar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex h-12 items-center justify-between bg-slate-900/90 px-4 text-slate-300 backdrop-blur">
      <div className="flex items-center gap-4">
        <Icon name="hand" size={18} className="cursor-pointer hover:text-white" />
        <div className="h-4 w-px bg-slate-600" />
        <Icon name="zoomOut" size={18} className="cursor-pointer hover:text-white" />
        <Icon name="zoomIn" size={18} className="cursor-pointer hover:text-white" />
        <select className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs outline-none">
          <option>120%</option>
          <option>100%</option>
          <option>80%</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <Icon name="maximize" size={18} className="cursor-pointer hover:text-white" />
        <Icon name="rotate" size={18} className="cursor-pointer hover:text-white" />
        <Icon name="download" size={18} className="cursor-pointer hover:text-white" />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2">
      <div className="text-slate-500">{label}：</div>
      <div className="min-w-0 truncate font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const cls = risk === '高' ? 'bg-red-100 text-red-700' : risk === '中' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700';
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>{risk}</span>;
}

function DecisionButton({
  active,
  icon,
  label,
  onClick,
  variant = 'primary',
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'neutral' | 'warning';
}) {
  const activeCls =
    variant === 'primary'
      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
      : variant === 'warning'
        ? 'border-orange-400 bg-orange-50 text-orange-700'
        : 'border-slate-400 bg-slate-100 text-slate-700';

  return (
    <button
      onClick={onClick}
      className={`flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-lg border px-2 text-xs font-semibold transition ${
        active ? activeCls : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function CandidateTable() {
  return (
    <div className="col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">候选缺陷记录</h3>
        <span className="flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
          <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" /> SSE 推送中
        </span>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-100 text-slate-500">
          <tr>
            <th className="pb-2 font-medium">缩略图</th>
            <th className="pb-2 font-medium">部件</th>
            <th className="pb-2 font-medium">缺陷类型</th>
            <th className="pb-2 font-medium">AI置信度</th>
            <th className="pb-2 font-medium">状态</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {MOCK_LIST.map((item) => (
            <tr key={item.id} className="group cursor-pointer hover:bg-slate-50">
              <td className="py-2">
                <div className="h-8 w-12 overflow-hidden rounded bg-slate-200">
                  <img src={MOCK_DEFECT.image} alt="缩略图" className="h-full w-full object-cover transition group-hover:scale-110" />
                </div>
              </td>
              <td className="py-2 font-semibold text-slate-700">{item.component}</td>
              <td className="py-2 text-slate-600">{item.type}</td>
              <td className="py-2 text-slate-600">{item.confidence}</td>
              <td className="py-2"><StatusBadge status={item.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>共 128 条记录</span>
        <span className="space-x-1"><b className="rounded bg-blue-600 px-2 py-1 text-white">1</b><span>2</span><span>3</span><span>4</span><span>…</span><span>26</span></span>
      </div>
    </div>
  );
}

function StatusFlow() {
  return (
    <div className="relative col-span-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
      <h3 className="relative z-10 mb-5 font-bold text-slate-900">状态流转</h3>
      <div className="relative z-10 flex items-center justify-center gap-2 pt-2">
        <FlowBox icon={<Icon name="file" size={16} />} label="候选记录" sub="算法输出" color="blue" />
        <Arrow />
        <FlowBox icon={<Icon name="clock" size={16} />} label="待复核" sub="人工复核中" color="orange" />
        <Arrow />
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white/80 p-2">
          <FlowBox label="已确认" sub="真缺陷" color="green" compact />
          <FlowBox label="误检" sub="排除" color="slate" compact />
          <FlowBox label="待复查" sub="二次确认" color="orange" compact />
        </div>
        <Arrow />
        <FlowBox icon={<Icon name="database" size={16} />} label="缺陷台账" sub="入库" color="purple" />
        <Arrow />
        <FlowBox icon={<Icon name="siren" size={16} />} label="预警/派单" sub="处置" color="red" />
      </div>
      <div className="relative z-10 mt-5 flex flex-wrap justify-center gap-3 text-[10px] text-slate-500">
        <Legend color="bg-blue-500" text="候选" />
        <Legend color="bg-orange-500" text="待处理" />
        <Legend color="bg-green-500" text="有效缺陷" />
        <Legend color="bg-purple-500" text="入库" />
        <Legend color="bg-red-500" text="处置" />
      </div>
    </div>
  );
}

function LedgerTable() {
  return (
    <div className="col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">缺陷台账 / 预警派单</h3>
        <button className="text-xs font-medium text-blue-600 hover:underline">查看更多 &gt;</button>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-100 text-slate-500">
          <tr>
            <th className="pb-2 font-medium">缺陷编号</th>
            <th className="pb-2 font-medium">风险等级</th>
            <th className="pb-2 font-medium">当前状态</th>
            <th className="pb-2 font-medium">派单对象</th>
            <th className="pb-2 font-medium">创建时间</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {LEDGER_LIST.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className={`py-2 font-semibold ${item.risk === '高' ? 'text-red-600' : 'text-slate-700'}`}>{item.id}</td>
              <td className="py-2"><RiskBadge risk={item.risk} /></td>
              <td className="py-2"><LedgerStatusBadge status={item.status} /></td>
              <td className="py-2 text-slate-600">{item.assignee}</td>
              <td className="py-2 text-slate-500">{item.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>共 36 条记录</span>
        <span className="space-x-1"><b className="rounded bg-blue-600 px-2 py-1 text-white">1</b><span>2</span><span>3</span><span>4</span></span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    待复核: 'border-blue-200 bg-blue-50 text-blue-600',
    已确认: 'border-green-200 bg-green-50 text-green-600',
    误检: 'border-slate-200 bg-slate-100 text-slate-600',
    待复查: 'border-orange-200 bg-orange-50 text-orange-600',
  };
  return <span className={`rounded border px-2 py-0.5 text-[10px] font-medium ${styles[status] || styles.待复核}`}>{status}</span>;
}

function LedgerStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    待派单: 'bg-red-50 text-red-600',
    派单中: 'bg-orange-50 text-orange-600',
    处理中: 'bg-blue-50 text-blue-600',
    已完成: 'bg-green-50 text-green-600',
  };
  return <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

function FlowBox({
  icon,
  label,
  sub,
  color,
  compact = false,
}: {
  icon?: React.ReactNode;
  label: string;
  sub: string;
  color: 'blue' | 'orange' | 'green' | 'slate' | 'purple' | 'red';
  compact?: boolean;
}) {
  const styles = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-600',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    red: 'border-red-200 bg-red-50 text-red-700',
  };
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border text-center shadow-sm ${styles[color]} ${compact ? 'h-12 w-20 text-[10px]' : 'h-16 w-20 text-xs'}`}>
      {icon && <div className="mb-1">{icon}</div>}
      <span className="font-bold">{label}</span>
      <span className="mt-0.5 opacity-75">{sub}</span>
    </div>
  );
}

function Arrow() {
  return <div className="h-px w-5 bg-blue-300 after:float-right after:-mt-[3px] after:block after:h-0 after:w-0 after:border-y-4 after:border-l-4 after:border-y-transparent after:border-l-blue-300" />;
}

function Legend({ color, text }: { color: string; text: string }) {
  return <span className="flex items-center gap-1"><span className={`h-1.5 w-4 rounded-full ${color}`} />{text}</span>;
}
