/// <reference types="@react-three/fiber" />
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Html } from '@react-three/drei';
import { useSpring, a, config as springConfig } from '@react-spring/three';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SeatProps {
  position: [number, number, number];
  isAllocated: boolean;
  justAllocated: boolean;
  isConsidered?: boolean;
  children?: React.ReactNode;
}

// 粒子爆发动画（2D覆盖在3D上方）
function SeatParticles({ show }: { show: boolean }) {
  // 粒子参数
  const particles = Array.from({ length: 12 });
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          style={{ position: 'absolute', left: '50%', top: '50%', pointerEvents: 'none', zIndex: 10 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {particles.map((_, i) => (
            <motion.span
              key={i}
              style={{
                position: 'absolute',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: `hsl(${i * 30}, 90%, 60%)`,
                left: 0,
                top: 0,
              }}
              initial={{
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: Math.cos((i / particles.length) * Math.PI * 2) * 24,
                y: Math.sin((i / particles.length) * Math.PI * 2) * 24,
                scale: 0.7,
                opacity: 0,
              }}
              transition={{ duration: 0.8, delay: 0.05 * i }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Seat({ position, isAllocated, justAllocated, isConsidered, isFailed, children }: SeatProps & { isFailed?: boolean; children?: React.ReactNode }) {
  // 动画：被考虑时黄色强闪烁，分配时蓝色/金色高亮，失败时红色抖动
  const { color, scale, emissive } = useSpring({
    color: isFailed
      ? '#dc2626' // 失败红色
      : justAllocated
        ? '#22d3ee' // 分配瞬间高亮蓝色
        : isAllocated
          ? '#2563eb' // 已分配蓝色
          : isConsidered
            ? '#fde047' // 被考虑黄色
            : '#4b5563', // 默认灰色
    scale: justAllocated
      ? [1.5, 1.7, 1.5]
      : isAllocated
        ? [1, 1.2, 1]
        : isConsidered
          ? [1.1 + Math.sin(Date.now() / 120) * 0.08, 1.1 + Math.cos(Date.now() / 120) * 0.08, 1.1]
          : [1, 1, 1],
    emissive: justAllocated
      ? '#facc15'
      : isAllocated
        ? '#2563eb'
        : isConsidered
          ? '#fde047'
          : isFailed
            ? '#dc2626'
            : '#222',
    config: isFailed ? { tension: 800, friction: 5 } : springConfig.wobbly,
    loop: isConsidered ? { reverse: true } : undefined,
  });

  // 粒子爆发控制
  const [showParticles, setShowParticles] = useState(false);
  useEffect(() => {
    if (justAllocated) {
      setShowParticles(true);
      const t = setTimeout(() => setShowParticles(false), 900);
      return () => clearTimeout(t);
    }
  }, [justAllocated]);

  // 3D座位
  return (
    <group position={position}>
      <a.mesh scale={scale.to(s => (Array.isArray(s) ? [s[0], s[1], s[2]] : [1, 1, 1]) as [number, number, number])}>
        <boxGeometry args={[1, 1, 1]} />
        <a.meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={justAllocated ? 1.5 : isConsidered ? 1.0 : isFailed ? 1.2 : 0.5} />
      </a.mesh>
      {/* 粒子爆发（2D覆盖） */}
      {showParticles && (
        <Html center style={{ pointerEvents: 'none' }}>
          <SeatParticles show={showParticles} />
        </Html>
      )}
      {children}
    </group>
  );
}

// 图例说明组件
const SeatLegend = () => (
  <div className="absolute right-4 bottom-4 z-40 bg-gray-900/80 rounded-xl p-3 shadow-lg border border-gray-700 text-xs text-gray-200 flex flex-col gap-2 min-w-[180px]">
    <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded bg-blue-500 border-2 border-blue-300"></span> 已分配座位</div>
    <div className="flex items-center gap-2 animate-pulse"><span className="inline-block w-4 h-4 rounded bg-yellow-300 border-2 border-yellow-200"></span> 被算法考虑（高亮/闪烁）</div>
    <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded bg-cyan-400 border-2 border-yellow-300"></span> 刚刚分配（粒子爆发）</div>
    <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded bg-red-500 border-2 border-red-300"></span> 分配失败（抖动/变红）</div>
  </div>
);

interface TrainModelViewerProps {
    allocatedSeats: number[];
    consideredSeats?: number[];
    seatsPerRow?: number;
    totalSeats?: number;
    failedSeats?: number[];
    seatPassengerMap?: Record<number, string>; // 新增：座位id到乘客名
}

export function TrainModelViewer({ allocatedSeats, consideredSeats = [], seatsPerRow = 2, totalSeats = 16, failedSeats = [], seatPassengerMap = {} }: TrainModelViewerProps) {
  // 记录上一次分配的座位id
  const [lastAllocated, setLastAllocated] = useState<number | null>(null);
  const prevAllocated = useRef<number[]>([]);

  useEffect(() => {
    // 检查新分配的座位
    const newAllocated = allocatedSeats.find(id => !prevAllocated.current.includes(id));
    if (newAllocated !== undefined) {
      setLastAllocated(newAllocated);
    }
    prevAllocated.current = allocatedSeats;
  }, [allocatedSeats]);

  const seats = [];
  const rows = Math.ceil(totalSeats / seatsPerRow);
  const rowSpacing = 2;
  const seatSpacing = 2;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < seatsPerRow; j++) {
      const seatId = i * seatsPerRow + j;
      if (seatId >= totalSeats) continue;
      const passengerName = seatPassengerMap[seatId];
      seats.push(
        <Seat
          key={seatId}
          position={[j * seatSpacing - (seatSpacing * (seatsPerRow - 1)) / 2, 0, i * rowSpacing - (rowSpacing * (rows-1))/2]}
          isAllocated={allocatedSeats.includes(seatId)}
          justAllocated={lastAllocated === seatId}
          isConsidered={consideredSeats.includes(seatId)}
          isFailed={failedSeats?.includes(seatId)}
        >
          {/* 座位标注 */}
          {passengerName && (
            <Html center position={[0, 0.7, 0]} style={{ pointerEvents: 'none' }}>
              <div className="bg-gray-900/90 text-xs px-2 py-1 rounded shadow-lg border border-blue-400 text-blue-200 font-bold whitespace-nowrap">
                {passengerName.length > 4 ? passengerName.slice(0, 4) + '…' : passengerName}
              </div>
            </Html>
          )}
        </Seat>
      );
    }
  }

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [0, 10, 15], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls />
        <group>{seats}</group>
      </Canvas>
      <SeatLegend />
    </div>
  );
} 