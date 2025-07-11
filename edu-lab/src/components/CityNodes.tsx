/// <reference types="@react-three/fiber" />
import * as THREE from 'three';
import { useMemo, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3-geo';
import { useFrame } from '@react-three/fiber';
import { type Scenario } from './ScenarioControls';

interface City {
  name: string;
  coordinates: [number, number];
}

const SCENARIO_PARAMS = {
  normal: { pulseDelay: 1.0, breathSpeed: 2, pulseSpeed: 1.5 },
  peak: { pulseDelay: 0.33, breathSpeed: 3, pulseSpeed: 4 }, // 呼吸速度从5降到3
  failure: { pulseDelay: 3.0, breathSpeed: 1, pulseSpeed: 0.5 },
};

// 新的脉冲波动画组件
function AnimatedPulse({ delay, speed }: { delay: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const elapsedTime = clock.getElapsedTime() * speed;
    
    // 每个脉冲根据延迟计算自己的动画时间
    const animationTime = elapsedTime - delay;
    
    if (animationTime > 0) {
      // 动画持续2秒并循环
      const loopTime = animationTime % 2;
      const scale = loopTime * 4; 
      const opacity = 1.0 - (loopTime / 2);

      ref.current.scale.set(scale, scale, scale);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity > 0 ? opacity : 0;
    } else {
      // 动画开始前，脉冲是不可见的
      ref.current.scale.set(0, 0, 0);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  });

  return (
    <mesh ref={ref}>
      <ringGeometry args={[0.5, 0.8, 32]} />
      <meshBasicMaterial color="#dc2626" toneMapped={false} transparent={true} />
    </mesh>
  );
}


// 优化后的城市节点组件
function CityPoint({ position, scenario }: { position: [number, number, number], scenario: Scenario }) {
  const ref = useRef<THREE.Mesh>(null!);
  const params = SCENARIO_PARAMS[scenario];

  if (scenario === 'failure') {
    return null;
  }

  // 更平滑、细微的呼吸动画
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const time = clock.getElapsedTime();
    const scale = 0.8 + 0.1 * Math.sin(time * params.breathSpeed);
    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <group position={position}>
      {/* 中心呼吸点 */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color={'#dc2626'} toneMapped={false} />
      </mesh>
      
      {/* 在故障模式下隐藏脉冲波 */}
      <>
        <AnimatedPulse delay={0} speed={params.pulseSpeed} />
        <AnimatedPulse delay={params.pulseDelay} speed={params.pulseSpeed} />
        <AnimatedPulse delay={params.pulseDelay * 2} speed={params.pulseSpeed} />
      </>
    </group>
  );
}


// 主组件逻辑保持不变
export function CityNodes({ scenario }: { scenario: Scenario }) {
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    fetch('/majorCities.json')
      .then(response => response.json())
      .then(data => setCities(data))
      .catch(error => console.error('Error loading city data:', error));
  }, []);

  const cityPositions = useMemo(() => {
    if (cities.length === 0) return [];
    const projection = d3.geoMercator().center([104.0, 37.5]).scale(600).translate([0, 0]);
    return cities.map(city => {
      const [x, y] = projection(city.coordinates)!;
      return [x, -y, 0.1] as [number, number, number]; // z=0.1 使其在地图线上方
    });
  }, [cities]);

  return (
    <group>
      {cityPositions.map((pos, i) => (
        <CityPoint key={i} position={pos} scenario={scenario} />
      ))}
    </group>
  );
} 