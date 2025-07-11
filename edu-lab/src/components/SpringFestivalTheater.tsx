import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { GeoMap } from './GeoMap';
import { CityNodes } from './CityNodes';
import { TeachingAssistant } from './TeachingAssistant';
import { ScenarioControls, type Scenario } from './ScenarioControls';
import { TicketRouteChart, type Route } from './TicketRouteChart';
import { AnimatedRoute } from './AnimatedRoute';
import { RequestPulses } from './RequestPulses';
import { ConvergingRays } from './ConvergingRays';
import { useState } from 'react';

const assistantScripts = [
  "欢迎来到春运系统实验室！",
  "当前模拟实时购票请求：<span class='text-red-500 font-bold'>1,240,851</span> 次/秒"
];

const classActivities = [
  { name: "情境导入：春运大挑战", duration: 5 },
  { name: "核心实验：余票分配", duration: 15 },
  { name: "自主探索：并发压力", duration: 10 },
  { name: "复盘总结", duration: 5 },
];

export function SpringFestivalTheater() {
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [currentScenario, setCurrentScenario] = useState<Scenario>('normal');

    const handleRouteSelect = (route: Route) => {
        setSelectedRoute(null); // Reset first to re-trigger animation
        setTimeout(() => setSelectedRoute(route), 50);
    };

  return (
    <div className="w-full h-full flex items-stretch">
      <div className="w-[450px] flex-shrink-0 p-4">
        <TicketRouteChart onRouteSelect={handleRouteSelect} />
      </div>
      <div className="flex-1 relative">
        <Canvas
          camera={{
            position: [0, 0, 150], // 将相机拉远，以展示更完整的地图
            fov: 55,
          }}
        >
          {/* 添加深蓝色背景和动态星空 */}
          <color attach="background" args={['#0a0f2a']} />
          <Stars radius={150} depth={50} count={5000} factor={6} saturation={0} fade speed={1.5} />

          <ambientLight intensity={1.0} />
          <pointLight position={[100, 100, 100]} intensity={0.6} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={40}     // 允许更近地观察
            maxDistance={400}    // 允许更远地拉开
            target={[0, 0, 0]}
          />
          <GeoMap />
          <CityNodes key={`nodes-${currentScenario}`} scenario={currentScenario} />
          <AnimatedRoute key={`route-${currentScenario}`} route={selectedRoute} scenario={currentScenario} />
          <RequestPulses scenario={currentScenario} />
          <ConvergingRays scenario={currentScenario} />
        </Canvas>
      </div>

      {/* 教学UI组件 */}
      <TeachingAssistant avatar="tech_detective" scripts={assistantScripts} />
      <ScenarioControls 
        currentScenario={currentScenario} 
        onScenarioChange={setCurrentScenario} 
      />
    </div>
  );
} 