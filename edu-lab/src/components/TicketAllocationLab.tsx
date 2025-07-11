import { useState, useEffect } from 'react';
import { TrainModelViewer } from './TrainModelViewer';
import { ChevronsLeft, ChevronsRight, User, Users, Ticket, Star, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 类型定义 ---
type Passenger = {
  id: number;
  name: string;
  pax: number; // 乘客数量
  request: string;
};

type Seat = {
  id: number;
  status: 'empty' | 'filled';
  passengerId: string | null;
};

type AllocationStrategy = 'COMPACT' | 'SCATTER' | 'GROUP_FRIENDLY';

// 新增成员类型
interface Member {
  id: string; // 唯一id
  name: string; // 如“家庭C-2”
  groupId: number; // 所属乘客id
  groupName: string; // 乘客名
  request: string;
  groupSize: number;
}


// --- 初始数据 ---
const TOTAL_SEATS = 10 * 3; // 10排 x 3座
const SEATS_PER_ROW = 3;

const initialPassengers: Passenger[] = [
  { id: 1, name: '商务旅客A', pax: 1, request: '优先靠窗' },
  { id: 2, name: '情侣B', pax: 2, request: '两人邻座' },
  { id: 3, name: '家庭C', pax: 4, request: '四人尽量在一起' },
  { id: 4, name: '独自旅行者D', pax: 1, request: '任意座位' },
  { id: 5, name: '朋友E', pax: 3, request: '三人同行' },
  { id: 6, name: '老年夫妇F', pax: 2, request: '两人邻座，优先底层' },
];

// --- 关卡数据结构 ---
type Level = {
  name: string;
  passengers: Passenger[];
  totalSeats: number;
  seatsPerRow: number;
};

const levels: Level[] = [
  {
    name: '基础关卡：小车厢',
    passengers: [
      { id: 1, name: '情侣A', pax: 2, request: '邻座' },
      { id: 2, name: '家庭B', pax: 4, request: '四人同排' },
      { id: 3, name: '独行者C', pax: 1, request: '任意' },
      { id: 4, name: '朋友D', pax: 3, request: '三人同行' },
    ],
    totalSeats: 4 * 3, // 4排3座
    seatsPerRow: 3,
  },
  {
    name: '进阶关卡：大车厢',
    passengers: [
      { id: 1, name: '家庭E', pax: 5, request: '尽量同排' },
      { id: 2, name: '老人F', pax: 2, request: '靠近门口' },
      { id: 3, name: '独行者G', pax: 1, request: '靠窗' },
      { id: 4, name: '情侣H', pax: 2, request: '邻座' },
      { id: 5, name: '朋友I', pax: 3, request: '三人同行' },
    ],
    totalSeats: 6 * 4, // 6排4座
    seatsPerRow: 4,
  },
  {
    name: '挑战关卡：复杂需求',
    passengers: [
      { id: 1, name: '家庭J', pax: 6, request: '必须同排' },
      { id: 2, name: '老人K', pax: 1, request: '靠近门口' },
      { id: 3, name: '儿童L', pax: 2, request: '靠近家长' },
      { id: 4, name: '独行者M', pax: 1, request: '靠窗' },
      { id: 5, name: '情侣N', pax: 2, request: '邻座' },
    ],
    totalSeats: 8 * 4, // 8排4座
    seatsPerRow: 4,
  },
];

// --- 子组件 (占位符) ---

// 关卡选择器
const LevelSelector = ({ levelIndex, onChange }: { levelIndex: number, onChange: (idx: number) => void }) => (
  <div className="flex gap-2 mb-2">
    {levels.map((lv, idx) => (
      <button
        key={lv.name}
        onClick={() => onChange(idx)}
        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all duration-200
          ${levelIndex === idx ? 'bg-blue-600 text-white border-blue-400' : 'bg-gray-700 text-gray-300 border-gray-500 hover:bg-gray-600'}`}
      >
        {lv.name}
      </button>
    ))}
  </div>
);

// 关卡历史对比卡片
const LevelHistory = ({ levelHistory, levelIndex }: { levelHistory: Array<{score: number, splitGroups: number}>, levelIndex: number }) => (
  <div className="bg-gray-800/60 p-2 rounded-lg mt-2 text-xs text-gray-200">
    <div className="font-bold text-blue-300 mb-1">关卡实验对比</div>
    <table className="w-full text-center">
      <thead>
        <tr className="text-gray-400">
          <th className="font-normal">关卡</th>
          <th className="font-normal">得分</th>
          <th className="font-normal">被拆散团体</th>
        </tr>
      </thead>
      <tbody>
        {levels.map((lv, idx) => (
          <tr key={lv.name} className={levelIndex === idx ? 'bg-blue-900/30' : ''}>
            <td>{lv.name}</td>
            <td>{levelHistory[idx]?.score ?? '-'}</td>
            <td>{levelHistory[idx]?.splitGroups ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// 计分板
const Scoreboard = ({ score }: { score: number }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg">
    <h3 className="text-lg font-bold text-center text-amber-300 mb-2">调度得分</h3>
    <div className="flex items-center justify-center gap-2">
      <Star className="text-amber-400" />
      <p className="text-2xl font-mono font-bold text-white">{score}</p>
    </div>
  </div>
);

// 策略选择器
const AllocationStrategyControl = ({ onSelect, onReset }: { onSelect: (strategy: AllocationStrategy) => void; onReset: () => void; }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg">
    <h3 className="text-lg font-bold text-center text-cyan-300 mb-4">选择分配策略</h3>
    <div className="space-y-3">
      <button onClick={() => onSelect('COMPACT')} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
        <Users size={20} /> 紧凑优先
      </button>
      <button onClick={() => onSelect('SCATTER')} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
        <User size={20} /> 分散优先
      </button>
      <button onClick={() => onSelect('GROUP_FRIENDLY')} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
        <BrainCircuit size={20} /> 团体智能
      </button>
    </div>
    <div className="mt-4 border-t border-gray-700 pt-4">
       <button onClick={onReset} className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
        <ChevronsLeft size={16} /> 重置实验 <ChevronsRight size={16} />
      </button>
    </div>
  </div>
);

// 乘客队列
const PassengerQueue = ({ passengers }: { passengers: Passenger[] }) => (
  <div className="h-full bg-gray-800/50 p-4 rounded-lg overflow-y-auto">
     <h3 className="text-lg font-bold text-center text-lime-300 mb-4">等待分配的乘客</h3>
     <div className="space-y-4">
      {passengers.map((p, index) => (
        <div key={p.id} className={`p-3 rounded-lg border-2 ${index === 0 ? 'bg-blue-900/50 border-blue-400' : 'bg-gray-700/50 border-gray-600'}`}>
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">{p.name}</span>
            <span className="flex items-center gap-1 text-sm bg-gray-600 px-2 py-1 rounded-full">
              <Users size={14} />{p.pax}
            </span>
          </div>
          <p className="text-sm text-gray-300 mt-1 flex items-center gap-2">
            <Ticket size={14} />
            {p.request}
          </p>
        </div>
      ))}
     </div>
  </div>
);

const GameIntro = ({ collapsed, onToggle }: { collapsed: boolean, onToggle: () => void }) => (
  <div className="bg-gray-700/60 p-4 rounded-lg mt-2 text-sm text-gray-200 relative">
    <button
      onClick={onToggle}
      className="absolute top-2 right-2 text-xs text-blue-300 hover:text-blue-500"
      title={collapsed ? '展开介绍' : '收起介绍'}
    >
      {collapsed ? '展开' : '收起'}
    </button>
    {!collapsed && <>
      <h4 className="font-bold text-lg text-blue-300 mb-2">游戏介绍</h4>
      <ul className="list-disc pl-5 space-y-1">
        <li>你是“12306调度员”，目标是用不同策略为所有乘客分配合适的座位，获得最高分！</li>
        <li>每轮会有不同类型的乘客（如情侣、家庭、独行者），每人有不同的座位需求。</li>
        <li>点击下方“分配策略”按钮，选择你认为最优的分配方式。</li>
        <li>分配成功可得分，失败会扣分，乘客会回到队尾。</li>
        <li>三种策略：<br/>
          <span className="text-blue-400">紧凑优先</span>：优先安排连续空位；<br/>
          <span className="text-purple-400">分散优先</span>：随机分散安排；<br/>
          <span className="text-green-400">团体智能</span>：尽量让团体坐在一起。
        </li>
        <li>点击“重置实验”可重新开始。</li>
      </ul>
    </>}
  </div>
);


export function TicketAllocationLab() {
  const [isQueueCollapsed, setQueueCollapsed] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>(initialPassengers);
  const [seats, setSeats] = useState<Seat[]>(() => 
    Array.from({ length: TOTAL_SEATS }, (_, i) => ({ id: i, status: 'empty', passengerId: null }))
  );
  const [score, setScore] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [consideredSeats, setConsideredSeats] = useState<number[]>([]); // 新增：被算法考虑过的座位
  const [algoExplanation, setAlgoExplanation] = useState<string>(''); // 新增：算法解释文本
  const [splitGroups, setSplitGroups] = useState<number>(0); // 新增：被拆散团体数
  const [levelIndex, setLevelIndex] = useState(0);
  const [levelHistory, setLevelHistory] = useState<Array<{score: number, splitGroups: number}>>([]);
  const [introCollapsed, setIntroCollapsed] = useState(false);
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<AllocationStrategy | null>(null);
  const [isAllocating, setIsAllocating] = useState(false);
  const [failedSeats, setFailedSeats] = useState<number[]>([]);
  const avatarColors = ['bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
  const [levelError, setLevelError] = useState<string | null>(null);

  // 每关开始弹窗说明关卡目标
  useEffect(() => {
    setShowLevelIntro(true);
  }, [levelIndex]);

  // 校验关卡合法性
  useEffect(() => {
    const paxSum = levels[levelIndex].passengers.reduce((sum, p) => sum + p.pax, 0);
    if (paxSum > levels[levelIndex].totalSeats) {
      setLevelError(`本关乘客总人数(${paxSum})大于座位数(${levels[levelIndex].totalSeats})，请调整关卡数据！`);
    } else {
      setLevelError(null);
    }
  }, [levelIndex]);

  // 分配后弹窗反馈
  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2200);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 关卡初始化时生成成员队列
  function getMembersFromLevel(levelIdx: number): Member[] {
    const members: Member[] = [];
    levels[levelIdx].passengers.forEach(p => {
      for (let i = 1; i <= p.pax; i++) {
        members.push({
          id: `${p.id}-${i}`,
          name: p.pax > 1 ? `${p.name}-${i}` : p.name,
          groupId: p.id,
          groupName: p.name,
          request: p.request,
          groupSize: p.pax,
        });
      }
    });
    return members;
  }
  const [members, setMembers] = useState<Member[]>(getMembersFromLevel(0));

  // 分配算法以成员为单位
  const handleAllocationStrategy = (strategy: AllocationStrategy) => {
    if (levelError) {
      showNotification(levelError, 'error');
      return;
    }
    if (members.length === 0) {
      showNotification("所有成员都已分配完毕！", 'success');
      setConsideredSeats([]);
      setAlgoExplanation('');
      showFeedback('本关已完成！可切换关卡或重试。');
      setFailedSeats([]);
      return;
    }
    const currentMember = members[0];
    const availableSeats = seats.filter(s => s.status === 'empty');
    let considered: number[] = [];
    let explanation = '';
    let allocatedSeatIds: number[] = [];
    // 团体策略：尝试为同groupId的连续成员分配连续座位
    if (strategy === 'GROUP_FRIENDLY' && currentMember.groupSize > 1) {
      // 找到队首成员所在团体的所有连续成员
      const groupMembers = members.filter(m => m.groupId === currentMember.groupId).slice(0, currentMember.groupSize);
      // 找连续空位
      for (let i = 0; i <= seats.length - groupMembers.length; i++) {
        const potentialGroup = seats.slice(i, i + groupMembers.length);
        const isContiguousInRow = Math.floor(potentialGroup[0].id / levels[levelIndex].seatsPerRow) === Math.floor(potentialGroup[potentialGroup.length - 1].id / levels[levelIndex].seatsPerRow);
        if (isContiguousInRow && potentialGroup.every(seat => seat.status === 'empty')) {
          considered = potentialGroup.map(seat => seat.id);
          allocatedSeatIds = considered;
          break;
        }
      }
      explanation = allocatedSeatIds.length > 0
        ? `团体智能：为${groupMembers[0].groupName}分配连续座位。`
        : `团体智能：未找到足够的连续空位，团体无法坐在一起。`;
      // 分配
      if (allocatedSeatIds.length === groupMembers.length) {
        setSeats(prevSeats =>
          prevSeats.map(seat =>
            allocatedSeatIds.includes(seat.id)
              ? { ...seat, status: 'filled', passengerId: groupMembers[allocatedSeatIds.indexOf(seat.id)].id }
              : seat
          )
        );
        setMembers(prev => prev.filter(m => m.groupId !== currentMember.groupId));
        setScore(prevScore => prevScore + groupMembers.length * 10);
        setConsideredSeats(considered);
        setAlgoExplanation(explanation);
        setFailedSeats([]);
        showFeedback('分配成功，团体未被拆散！');
        return;
      }
    }
    // 其他策略或团体策略失败时，单成员分配
    // COMPACT: 优先靠前空位，SCATTER: 随机空位
    let seatIdx = -1;
    if (strategy === 'COMPACT') {
      considered = availableSeats.slice(0, 2).map(s => s.id);
      seatIdx = availableSeats.length > 0 ? availableSeats[0].id : -1;
      explanation = '紧凑优先：优先选择靠前的空位。';
    } else if (strategy === 'SCATTER') {
      const shuffled = [...availableSeats].sort(() => 0.5 - Math.random());
      considered = shuffled.slice(0, 2).map(s => s.id);
      seatIdx = shuffled.length > 0 ? shuffled[0].id : -1;
      explanation = '分散优先：随机分配空位。';
    } else if (strategy === 'GROUP_FRIENDLY') {
      // 团体策略失败时，单成员分配
      considered = availableSeats.slice(0, 2).map(s => s.id);
      seatIdx = availableSeats.length > 0 ? availableSeats[0].id : -1;
      explanation = '团体智能：未找到连续空位，单独分配。';
    }
    setConsideredSeats(considered);
    setAlgoExplanation(explanation);
    setFailedSeats([]);
    if (seatIdx !== -1) {
      setSeats(prevSeats =>
        prevSeats.map(seat =>
          seat.id === seatIdx
            ? { ...seat, status: 'filled', passengerId: currentMember.id }
            : seat
        )
      );
      setMembers(prev => prev.slice(1));
      setScore(prevScore => prevScore + 10);
      showFeedback('分配成功！');
    } else {
      setFailedSeats(considered);
      showNotification('分配失败，原因：无合适座位。', 'error');
      setMembers(prev => [...prev.slice(1), currentMember]);
      setScore(prevScore => Math.max(0, prevScore - 5));
      showFeedback('分配失败，原因：无合适座位。');
    }
  };

  const handleReset = () => {
    setMembers(getMembersFromLevel(levelIndex));
    setSeats(Array.from({ length: levels[levelIndex].totalSeats }, (_, i) => ({ id: i, status: 'empty', passengerId: null })));
    setScore(0);
    setConsideredSeats([]);
    setAlgoExplanation('');
    setSplitGroups(0);
    setFailedSeats([]);
    showNotification("实验已重置", 'success');
  };

  const handleLevelChange = (idx: number) => {
    setLevelIndex(idx);
    setMembers(getMembersFromLevel(idx));
    setSeats(Array.from({ length: levels[idx].totalSeats }, (_, i) => ({ id: i, status: 'empty', passengerId: null }))); // 保持 seats 结构
    setScore(0);
    setConsideredSeats([]);
    setAlgoExplanation('');
    setSplitGroups(0);
    setNotification(null);
    setFailedSeats([]);
  };

  const handleLevelComplete = () => {
    setLevelHistory(prev => {
      const next = [...prev];
      next[levelIndex] = { score, splitGroups };
      return next;
    });
  };

  const allAllocated = members.length === 0;
  if (allAllocated && levelHistory[levelIndex]?.score !== score) {
    handleLevelComplete();
  }

  const currentAllocatedSeatIds = seats.filter(s => s.status === 'filled').map(s => s.id);

  // seatPassengerMap 以成员为单位
  const seatPassengerMap: Record<number, string> = {};
  seats.forEach(seat => {
    if (seat.status === 'filled' && seat.passengerId) {
      const member = getMembersFromLevel(levelIndex).find(m => m.id === seat.passengerId);
      if (member) seatPassengerMap[seat.id] = member.name;
    }
  });

  // 顶部实时提示当前乘客和需求
  const currentMember = members[0];
  const currentTip = currentMember
    ? `请为「${currentMember.name}」分配座位，需求：${currentMember.request}，所属：${currentMember.groupName}`
    : '本关已完成！可切换关卡或重试。';

  // 分配动画主逻辑
  const handleAllocate = () => {
    if (!selectedStrategy || isAllocating || members.length === 0) return;
    setIsAllocating(true);
    setTimeout(() => {
      handleAllocationStrategy(selectedStrategy);
      setIsAllocating(false);
      setSelectedStrategy(null);
    }, 900); // 动画时长
  };

  // 策略选择卡片（单选）
  const StrategyCard = ({ strategy, label, icon, color }: { strategy: AllocationStrategy, label: string, icon: React.ReactNode, color: string }) => (
    <button
      onClick={() => setSelectedStrategy(strategy)}
      disabled={isAllocating}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm border-2 transition-all duration-200 mb-1
        ${selectedStrategy === strategy ? `${color} border-4 scale-105` : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'}
        ${isAllocating ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {icon} {label}
    </button>
  );

  // 队首头像动画
  const getAvatar = (m: Member, idx: number) => (
    <motion.div
      key={m.id}
      className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white ${avatarColors[idx % avatarColors.length]}`}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.7, opacity: 0, y: 30 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {m.name}
    </motion.div>
  );

  // 统计当前等待队列（按 groupId 聚合剩余成员数）
  function getCurrentPassengerQueue(): Passenger[] {
    const groupMap: Record<number, { name: string; pax: number; request: string }> = {};
    members.forEach(m => {
      if (!groupMap[m.groupId]) {
        groupMap[m.groupId] = { name: m.groupName, pax: 0, request: m.request };
      }
      groupMap[m.groupId].pax += 1;
    });
    return Object.entries(groupMap).map(([groupId, info]) => ({
      id: Number(groupId),
      name: info.name,
      pax: info.pax,
      request: info.request,
    }));
  }

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex p-4 gap-4 font-sans relative">
      {/* 顶部实时提示 */}
      <div className="fixed left-1/2 top-2 -translate-x-1/2 z-40">
        <div className="bg-blue-900/80 px-6 py-2 rounded-full shadow-lg text-base font-bold border border-blue-400 animate-fadein flex items-center gap-2">
          <span className="text-blue-200">{currentTip}</span>
        </div>
      </div>
      {/* 关卡目标弹窗 */}
      {showLevelIntro && (
        <div className="fixed left-1/2 top-20 -translate-x-1/2 z-50 bg-gray-900/95 border-2 border-blue-400 rounded-xl shadow-2xl p-6 w-[380px] animate-fadein flex flex-col items-center">
          <h3 className="text-xl font-bold text-blue-300 mb-2">{levels[levelIndex].name}</h3>
          <div className="text-sm text-gray-200 mb-2">本关目标：为所有乘客合理分配座位，尽量避免团体被拆散，获得更高分数！</div>
          <ul className="text-xs text-gray-300 mb-4 list-disc pl-5 w-full">
            {levels[levelIndex].passengers.map(p => (
              <li key={p.id}>「{p.name}」需求：{p.request}，人数：{p.pax}</li>
            ))}
          </ul>
          <button onClick={() => setShowLevelIntro(false)} className="mt-2 px-4 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold">开始挑战</button>
        </div>
      )}
      {levelError && (
        <div className="fixed left-1/2 top-20 -translate-x-1/2 z-50 bg-red-900/95 border-2 border-red-400 rounded-xl shadow-2xl p-6 w-[380px] animate-fadein flex flex-col items-center">
          <h3 className="text-xl font-bold text-red-300 mb-2">关卡数据错误</h3>
          <div className="text-sm text-red-100 mb-2">{levelError}</div>
          <button onClick={() => setShowLevelIntro(false)} className="mt-2 px-4 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold">关闭</button>
        </div>
      )}
      {/* 分配反馈气泡 */}
      {feedback && (
        <div className="fixed left-1/2 top-24 -translate-x-1/2 z-50 animate-fadein">
          <div className="bg-yellow-700/90 text-yellow-100 px-6 py-2 rounded-full shadow-lg border border-yellow-400 font-bold">
            {feedback}
          </div>
        </div>
      )}
      {/* 右侧乘客队列 收缩/展开按钮 */}
      <button 
        onClick={() => setQueueCollapsed(!isQueueCollapsed)}
        className="absolute top-1/2 -translate-y-1/2 bg-gray-700 hover:bg-blue-600 text-white p-2 rounded-full z-20 transition-all duration-300"
        style={{ right: isQueueCollapsed ? '0.5rem' : 'calc(25% - 1.5rem)' }}
      >
        {isQueueCollapsed ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
      </button>
      {/* 左侧：控制与计分 */}
      <div className="w-1/4 h-full flex flex-col gap-4 overflow-y-auto pb-4" style={{ maxHeight: '100vh' }}>
        <GameIntro collapsed={introCollapsed} onToggle={() => setIntroCollapsed(c => !c)} />
        <hr className="my-2 border-gray-600" />
        <LevelSelector levelIndex={levelIndex} onChange={handleLevelChange} />
        <h2 className="text-2xl font-heading text-center">调度控制台</h2>
        {/* 队首乘客头像动画区 */}
        <div className="flex flex-col items-center mb-2">
          <AnimatePresence>
            {currentMember && getAvatar(currentMember, 0)}
          </AnimatePresence>
          {currentMember && (
            <div className="text-xs text-gray-300 mt-1">{currentMember.name}（{currentMember.groupName}）需求：{currentMember.request}</div>
          )}
        </div>
        {/* 策略选择卡片区 */}
        <div className="flex flex-col gap-1 mb-2">
          <StrategyCard strategy="COMPACT" label="紧凑优先" icon={<Users size={18} />} color="bg-blue-600 text-white border-blue-400" />
          <StrategyCard strategy="SCATTER" label="分散优先" icon={<User size={18} />} color="bg-purple-600 text-white border-purple-400" />
          <StrategyCard strategy="GROUP_FRIENDLY" label="团体智能" icon={<BrainCircuit size={18} />} color="bg-green-600 text-white border-green-400" />
        </div>
        {/* 分配按钮 */}
        <button
          onClick={handleAllocate}
          disabled={!selectedStrategy || isAllocating || !currentMember}
          className={`w-full py-2 rounded-lg font-bold text-lg mt-1 mb-2 transition-all duration-200
            ${selectedStrategy && !isAllocating && currentMember ? 'bg-amber-400 text-gray-900 hover:bg-amber-300' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
        >
          {isAllocating ? '分配中...' : '分配'}
        </button>
        <AllocationStrategyControl onSelect={handleAllocationStrategy} onReset={handleReset} />
        <Scoreboard score={score} />
        <div className="bg-pink-900/60 p-2 rounded-lg text-xs text-pink-200 mt-2">
          <span className="font-bold text-pink-300">被拆散团体数：</span> {splitGroups}
        </div>
        <LevelHistory levelHistory={levelHistory} levelIndex={levelIndex} />
        {/* 算法解释卡片 */}
        {algoExplanation && (
          <div className="bg-yellow-900/60 p-3 rounded-lg mt-2 text-xs text-yellow-200 border-l-4 border-yellow-400 animate-fadein">
            <span className="font-bold text-yellow-300">算法解释：</span> {algoExplanation}
          </div>
        )}
      </div>

      {/* 中间：3D车厢可视化 */}
      <div 
        className="h-full bg-black/30 rounded-lg p-4 flex flex-col transition-all duration-300 ease-in-out"
        style={{ width: isQueueCollapsed ? 'calc(75% - 2rem)' : 'calc(50% - 2rem)' }}
      >
        {notification && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-lg text-white font-bold z-10 transition-opacity duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {notification.message}
          </div>
        )}
        <h2 className="text-2xl font-heading text-center mb-4">车厢座位实时分配</h2>
        <div className="w-full flex-grow bg-gray-800 rounded-md">
            <TrainModelViewer
              allocatedSeats={currentAllocatedSeatIds}
              consideredSeats={consideredSeats}
              seatsPerRow={levels[levelIndex].seatsPerRow}
              totalSeats={levels[levelIndex].totalSeats}
              failedSeats={failedSeats}
              seatPassengerMap={seatPassengerMap}
            />
        </div>
      </div>
      
      {/* 右侧：乘客队列 */}
      <div
        className="h-full transition-all duration-300 ease-in-out"
        style={{ width: isQueueCollapsed ? '0' : '25%', padding: isQueueCollapsed ? '0' : '', overflow: 'hidden' }}
      >
         <div className={isQueueCollapsed ? 'opacity-0' : 'opacity-100 transition-opacity duration-100 h-full'}>
            <PassengerQueue passengers={getCurrentPassengerQueue()} />
         </div>
      </div>
    </div>
  );
} 