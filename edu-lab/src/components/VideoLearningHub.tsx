import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';

interface Video {
    type: 'iframe' | 'react-player';
    url: string;
    title: string;
    summary: string;
}

const videos: Video[] = [
    {
        type: 'iframe',
        url: 'https://player.bilibili.com/player.html?bvid=BV1bJ41177YD&as_wide=1&high_quality=1&danmaku=0',
        title: '深度解析12306的技术架构演进',
        summary: `### AI摘要：深度解析12306的技术架构演进

**1. 问题的本质：世界级的并发挑战**
- **业务场景**：典型的“秒杀”场景，但在规模和复杂度上远超常规电商。春运期间，百万甚至千万用户在同一秒涌入，对单一服务器或数据库是毁灭性打击。
- **核心矛盾**：海量的读请求（查票）和瞬时的高并发写请求（下单）之间的矛盾。读操作需快速响应，写操作需保证数据绝对一致（不能超卖）。

**2. 架构演进之路：从IOE到分布式**
- **早期架构 (IOE)**：采用IBM的服务器、Oracle数据库、EMC存储。优点是稳定可靠，但缺点是成本高昂、扩展性差，无法通过简单增加机器来应对流量洪峰，导致早期频繁崩溃。
- **去IOE化 (分布式改造)**：
    - **核心思想**：用大量廉价的PC服务器、MySQL等开源数据库，替代昂贵的小型机和商业数据库。通过“分而治之”的思想，将压力分散到成百上千台服务器上。
    - **分库分表**：将庞大的票务数据、订单数据水平拆分到不同的数据库实例中。例如，按车次或线路将余票库存分散存储，避免所有请求都落在同一个数据库上。

**3. 应对洪峰的核心技术**
- **消息队列 (Message Queue)**：
    - **作用**：“削峰填谷”的利器。用户的下单请求不再直接发往数据库，而是先快速写入高性能的消息队列（如Kafka/RocketMQ）中排队。
    - **流程**：后端系统根据自身处理能力，平稳地、按顺序地从队列中拉取请求进行处理。这样既保证了请求不丢失，又保护了脆弱的后端数据库不被冲垮。这是从“硬抗”到“疏导”的质变。
- **CDN与多级缓存 (Cache)**：
    - **CDN**：将静态资源（如HTML、CSS、图片、查询接口）部署到离用户最近的边缘节点，加速访问。
    - **分布式缓存 (Redis)**：将热门线路的余票、车次信息等高频读取的数据放入内存缓存中。95%以上的查票请求由缓存直接响应，无需访问数据库，极大地降低了数据库的读取压力。

**4. 总结**
12306的架构是一部典型的互联网后端架构进化史，其成功在于深刻理解业务场景，并综合运用了**分布式、缓存、消息队列**等一系列技术手段，将一个看似无解的世界级难题，成功地化解和驯服。`
    },
    {
        type: 'iframe',
        // NOTE: Replaced the second video with the new Bilibili link, using the reliable iframe method.
        url: 'https://player.bilibili.com/player.html?bvid=BV16i4y1R78A&as_wide=1&high_quality=1&danmaku=0',
        title: 'B站视频：中国高铁进化史',
        summary: `### AI摘要：中国高铁进化史

**1. 从“追赶者”到“引领者”**
- **起点（2004年）**：中国高铁技术最初通过“引进、消化、吸收、再创新”的模式起步，从国外引进时速200公里的动车组技术。
- **关键突破（CRH380系列）**：通过自主研发，中国成功研制出“和谐号”CRH380系列动车组，持续刷新世界铁路运营试验速度记录，标志着中国高铁技术已达到世界领先水平。
- **“复兴号”时代**：完全自主知识产权的“复兴号”动车组上线，覆盖时速160至350公里，实现了从技术引进到全面自主创新的跨越，成为中国高端制造业的“国家名片”。

**2. 核心技术与创新**
- **网络建设**：“八纵八横”高速铁路网的规划与建设，是世界上规模最大、覆盖最广的高铁网络，连接了中国几乎所有大中城市。
- **系统集成**：中国高铁的成功不仅在于车辆本身，更在于对轨道、通信信号、供电、调度指挥等多个子系统的强大系统集成能力。
- **智能技术**：自动驾驶（ATO）、智能调度、旅客服务系统等智能化技术的应用，大幅提升了高铁运营的效率、安全性和旅客体验。

**3. 社会经济影响**
- **时空压缩**：高铁极大地缩短了城市间的时空距离，形成了“一小时经济圈”、“同城化效应”，深刻改变了中国的经济地理格局。
- **产业带动**：带动了沿线地区的旅游、商业、房地产等相关产业的发展，促进了区域经济的协调发展。
- **改变生活**：高铁已经成为中国人商务出行、旅游、探亲的首选交通方式，深刻地融入并改变了亿万民众的日常生活。`
    },
    {
        type: 'iframe',
        // NOTE: Replaced the third video with the new Bilibili link, using the reliable iframe method.
        url: 'https://player.bilibili.com/player.html?bvid=BV18c411x7Sb&as_wide=1&high_quality=1&danmaku=0',
        title: 'B站视频：一个画时代App的诞生',
        summary: `### AI摘要：一个画时代App的诞生 - 12306幕后故事

**1. 时代背景与挑战**
- **背景**：在12306出现之前，春运购票是“上亿人次的线下大迁徙”，彻夜排队、黄牛猖獗是常态。将这一复杂的票务系统搬到线上，是前所未有的挑战。
- **技术难题**：这不仅是一个网站，更是一个对数据一致性、安全性、并发性要求极高的金融级交易系统。需要解决的技术难题包括但不限于：海量查询、瞬时下单、精准库存、支付安全等。

**2. 核心价值观：公平与普惠**
- **设计初衷**：12306的核心使命是利用技术手段，为最广泛的人民群众提供一个公平、透明的购票渠道，打破信息壁垒和地域限制。
- **功能取舍**：在设计上，功能的优先级始终围绕“公平”展开。例如，复杂的验证码机制虽然牺牲了一部分用户体验，但在当时是打击专业“刷票”软件、保障普通用户购票机会的必要手段。

**3. 技术之外的博弈**
- **与黄牛的斗争**：12306的每一次技术升级，背后都是与“黄牛”黑色产业链的一次攻防博弈。从图形验证码到候补购票，再到人脸识别验证，技术在不断进化，以维护平台的公平性。
- **社会影响**：12306的诞生，不仅是一次技术革命，更深刻地改变了中国人的出行方式和社会生态。它让“回家”这条路变得更加轻松和有尊严，是技术服务于民生的最佳典范之一。`
    }
];

// 题库：每个视频对应一组题目
const videoQuestions = [
  [ // 视频1
    {
      question: '12306系统在春运期间面临的最大技术挑战是什么？',
      options: ['高并发读写请求', '页面美观', '广告投放', '用户登录难度'],
      answer: 0,
      explanation: '春运期间最大挑战是高并发的读写请求，尤其是瞬时下单和查票。'
    },
    {
      question: '12306采用消息队列的主要作用是？',
      options: ['削峰填谷，保护后端', '美化界面', '加快支付', '防止黄牛'],
      answer: 0,
      explanation: '消息队列用于削峰填谷，防止后端数据库被冲垮。'
    },
    {
      question: '12306系统采用分库分表的主要目的是？',
      options: ['提升扩展性和并发能力', '节省存储空间', '方便开发', '增加广告位'],
      answer: 0,
      explanation: '分库分表是为了解决单点瓶颈，提升系统扩展性和并发能力。'
    },
    {
      question: '下列哪项不是12306高并发架构的核心技术？',
      options: ['区块链', '消息队列', '分布式缓存', '分库分表'],
      answer: 0,
      explanation: '区块链不是12306高并发架构的核心技术。'
    }
  ],
  [ // 视频2
    {
      question: '中国高铁“复兴号”动车组的最大特点是？',
      options: ['完全自主知识产权', '进口技术', '只在国外运行', '没有智能化'],
      answer: 0,
      explanation: '“复兴号”是中国完全自主知识产权的动车组。'
    },
    {
      question: '中国高铁“八纵八横”网络的主要意义是？',
      options: ['覆盖全国主要城市', '减少列车数量', '降低票价', '只服务大城市'],
      answer: 0,
      explanation: '“八纵八横”实现了全国主要城市的高速互联互通。'
    },
    {
      question: '高铁系统集成能力的体现不包括？',
      options: ['单一车辆制造', '轨道通信信号', '供电系统', '调度指挥'],
      answer: 0,
      explanation: '高铁的成功不仅靠车辆制造，更靠系统集成，单一制造不是集成能力。'
    },
    {
      question: '高铁智能化技术应用的效果不包括？',
      options: ['增加广告收入', '提升运营效率', '提升安全性', '改善旅客体验'],
      answer: 0,
      explanation: '智能化技术主要提升效率、安全和体验，与广告收入无关。'
    }
  ],
  [ // 视频3
    {
      question: '12306系统设计的核心价值观是？',
      options: ['公平与普惠', '盈利优先', '广告最大化', '娱乐至上'],
      answer: 0,
      explanation: '12306的核心价值观是公平与普惠，保障购票机会。'
    },
    {
      question: '12306系统为防止黄牛采取了哪些措施？',
      options: ['验证码、人脸识别等', '降价促销', '增加广告', '延长购票时间'],
      answer: 0,
      explanation: '验证码、人脸识别等技术用于防止黄牛。'
    },
    {
      question: '12306系统的社会影响不包括？',
      options: ['增加线下排队', '改变出行方式', '促进公平', '提升购票体验'],
      answer: 0,
      explanation: '12306让购票更便捷，减少了线下排队。'
    },
    {
      question: '下列哪项不是12306系统的技术难题？',
      options: ['天气预报', '数据一致性', '高并发处理', '支付安全'],
      answer: 0,
      explanation: '天气预报不是12306系统的核心技术难题。'
    }
  ]
];

const SmartVideoPlayer = ({ video, onVideoSelect }: { video: Video; onVideoSelect: (index: number) => void }) => {
  const [activeTab, setActiveTab] = useState('chapters');
  const [qaState, setQaState] = useState<{ current: number; selected: number | null; correct: boolean | null; showFeedback: boolean; score: number }>({ current: 0, selected: null, correct: null, showFeedback: false, score: 0 });
  const videoIdx = videos.findIndex(v => v.url === video.url);
  const questions = videoQuestions[videoIdx] || [];

  const handleOptionClick = (idx: number) => {
    if (qaState.showFeedback) return;
    const isCorrect = idx === questions[qaState.current].answer;
    setQaState(prev => ({ ...prev, selected: idx, correct: isCorrect, showFeedback: true, score: prev.score + (isCorrect ? 1 : 0) }));
    setTimeout(() => {
      if (qaState.current < questions.length - 1) {
        setQaState({ current: qaState.current + 1, selected: null, correct: null, showFeedback: false, score: qaState.score + (isCorrect ? 1 : 0) });
      } else {
        setQaState(prev => ({ ...prev, showFeedback: false }));
      }
    }, 1200);
  };
  const handleRestart = () => setQaState({ current: 0, selected: null, correct: null, showFeedback: false, score: 0 });

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col h-full">
      <div className="bg-black aspect-video rounded-md flex items-center justify-center text-gray-500 mb-4 overflow-hidden">
        {video.type === 'iframe' ? (
          <iframe
            src={video.url}
            width="100%"
            height="100%"
            scrolling="no"
            frameBorder="0"
            allowFullScreen={true}
          ></iframe>
        ) : (
          // @ts-ignore - Bypassing a persistent type issue with react-player
          <ReactPlayer url={video.url} width="100%" height="100%" controls={true} />
        )}
      </div>
      <div className="flex border-b border-gray-600 mb-4">
        <TabButton title="课程章节" isActive={activeTab === 'chapters'} onClick={() => setActiveTab('chapters')} />
        <TabButton title="互动问答" isActive={activeTab === 'qa'} onClick={() => setActiveTab('qa')} />
      </div>
      <div className="flex-grow overflow-y-auto text-sm">
        {activeTab === 'chapters' && (
            <ul>
                {videos.map((v, index) => (
                    <li key={index} 
                        onClick={() => onVideoSelect(index)}
                        className={`p-2 rounded-md cursor-pointer transition-colors ${video.url === v.url ? 'bg-blue-600/50 text-white' : 'hover:bg-gray-700/50'}`}>
                        {v.title}
                    </li>
                ))}
            </ul>
        )}
        {activeTab === 'qa' && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            {questions.length === 0 ? (
              <div className="text-gray-400">暂无互动题目</div>
            ) : qaState.current < questions.length ? (
              <motion.div
                key={qaState.current}
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-xl bg-gray-900/80 rounded-lg p-6 shadow-lg mb-4 qa-scrollable"
                style={{ maxHeight: '320px', minHeight: '220px', overflowY: 'scroll', scrollbarGutter: 'stable' }}
              >
                <div className="text-base font-bold mb-4 text-blue-200">Q{qaState.current + 1}：{questions[qaState.current].question}</div>
                <div className="flex flex-col gap-3">
                  {questions[qaState.current].options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ scale: 1.04 }}
                      className={`px-4 py-2 rounded-lg border-2 text-left font-semibold transition-all duration-200 break-words whitespace-pre-line
                        ${qaState.selected === idx
                          ? qaState.correct == null
                            ? 'border-blue-400 bg-blue-900/60'
                            : qaState.correct && idx === questions[qaState.current].answer
                              ? 'border-green-400 bg-green-900/60 animate-pulse'
                              : 'border-red-400 bg-red-900/60 animate-shake'
                          : 'border-gray-600 bg-gray-800 hover:bg-gray-700'}`}
                      disabled={qaState.showFeedback}
                      onClick={() => handleOptionClick(idx)}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence>
                  {qaState.showFeedback && (
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -30, opacity: 0 }}
                      className={`mt-4 px-4 py-2 rounded-full font-bold text-center shadow-lg
                        ${qaState.correct ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                    >
                      {qaState.correct ? '回答正确！' : '回答错误！'}
                      <span className="ml-2 text-xs">{questions[qaState.current].explanation}</span>
                      <div className="mt-2 text-xs font-normal text-white/80">
                        当前得分：{qaState.score + (qaState.correct ? 1 : 0)} / {qaState.current + 1}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="mt-4 text-xs text-gray-400 text-right">第 {qaState.current + 1} / {questions.length} 题</div>
                <motion.div
                  className="w-full h-2 bg-gray-700 rounded mt-2 overflow-hidden"
                  initial={false}
                  animate={{}}
                >
                  <motion.div
                    className="h-2 bg-blue-400 rounded"
                    initial={{ width: 0 }}
                    animate={{ width: `${((qaState.current + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="w-full max-w-xl bg-green-900/80 rounded-lg p-8 shadow-2xl flex flex-col items-center relative"
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
                  className="text-3xl font-bold text-amber-300 mb-2 drop-shadow-lg"
                >
                  🎉
                </motion.div>
                <div className="text-2xl font-bold text-green-200 mb-2">答题完成！</div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.2 }}
                  className="text-lg text-white mb-4"
                >
                  你的得分：<span className="text-amber-300 font-mono text-2xl">{qaState.score} / {questions.length}</span>
                </motion.div>
                <motion.div
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.3 }}
                  className="absolute top-2 right-2 z-10"
                >
                  <button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow">关闭</button>
                </motion.div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.04 }}
                  onClick={handleRestart}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold mt-2"
                >
                  再答一次
                </motion.button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ title, isActive, onClick }: { title: string; isActive: boolean; onClick: () => void; }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
            isActive ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
        }`}
    >
        {title}
    </button>
)

const NotesEditor = ({ onGenerateNotes, notes, setNotes }: { onGenerateNotes: () => void; notes: string; setNotes: (notes: string) => void; }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">课堂笔记</h3>
        <div>
          <button onClick={onGenerateNotes} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm mr-2">AI生成笔记</button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm">导出笔记</button>
        </div>
      </div>
      <textarea 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full flex-grow bg-gray-900/70 text-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="点击“AI生成笔记”自动总结视频内容，或在此手动记录..."
      ></textarea>
    </div>
  );
}

export function VideoLearningHub() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [notes, setNotes] = useState('');

  const handleGenerateNotes = () => {
      setNotes(videos[currentVideoIndex].summary);
  };
  
  return (
    <div className="w-full h-screen bg-gray-900 text-white p-8">
      <div className="grid grid-cols-2 gap-8 h-full">
        <div className="col-span-1">
          <SmartVideoPlayer video={videos[currentVideoIndex]} onVideoSelect={setCurrentVideoIndex} />
        </div>
        
        <div className="col-span-1">
          <NotesEditor onGenerateNotes={handleGenerateNotes} notes={notes} setNotes={setNotes} />
        </div>
      </div>
    </div>
  );
} 

/* 互动问答区滚动条样式 */
// .qa-scrollable::-webkit-scrollbar {
//   width: 8px;
// }
// .qa-scrollable::-webkit-scrollbar-thumb {
//   background: #374151;
//   border-radius: 4px;
// }
// .qa-scrollable::-webkit-scrollbar-track {
//   background: #111827;
// } 