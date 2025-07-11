import * as THREE from 'three';
import { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as d3 from 'd3-geo';
import { type Scenario } from './ScenarioControls';

interface GeoJsonFeature {
    type: string;
    geometry: {
        type: 'Polygon' | 'MultiPolygon';
        coordinates: number[][][] | number[][][][];
    };
}

interface GeoJsonObject {
    type: string;
    features: GeoJsonFeature[];
}

const projection = d3.geoMercator().center([104.0, 37.5]).scale(600).translate([0, 0]);

const Pulse = ({ position, delay }: { position: [number, number, number], delay: number }) => {
    const ref = useRef<THREE.Mesh>(null!);

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime() - delay;
        if (elapsedTime > 0) {
            const loopTime = elapsedTime % 3; // 3秒一个循环
            const scale = (loopTime / 3) * 1.5;
            const opacity = Math.sin(loopTime * Math.PI) * 0.8; // 中间亮两边暗
            
            ref.current.scale.set(scale, scale, scale);
            (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity;
        } else {
            ref.current.scale.set(0,0,0);
            (ref.current.material as THREE.MeshBasicMaterial).opacity = 0;
        }
    });

    return (
        <mesh position={position} ref={ref}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#ff4d4d" toneMapped={false} transparent />
        </mesh>
    );
};

export function RequestPulses({ scenario }: { scenario: Scenario }) {
    const [mapVertices, setMapVertices] = useState<[number, number, number][]>([]);

    useEffect(() => {
        fetch('/china.json')
            .then(res => res.json())
            .then((data: GeoJsonObject) => {
                const vertices: [number, number, number][] = [];
                data.features.forEach(feature => {
                    const polygons = feature.geometry.type === 'Polygon'
                        ? [feature.geometry.coordinates]
                        : feature.geometry.coordinates;

                    polygons.forEach(polygon => {
                        polygon.forEach(ring => {
                            ring.forEach(coord => {
                                const [x, y] = projection(coord as [number, number])!;
                                if (x && y) {
                                    vertices.push([x, -y, 0.1]);
                                }
                            });
                        });
                    });
                });
                setMapVertices(vertices);
            });
    }, []);

    const activePulses = useMemo(() => {
        if (scenario !== 'peak' || mapVertices.length === 0) return [];
        
        const pulseCount = 100; // 脉冲点从300减少到100
        const pulses = [];
        for (let i = 0; i < pulseCount; i++) {
            const vertex = mapVertices[Math.floor(Math.random() * mapVertices.length)];
            pulses.push({
                position: vertex,
                delay: Math.random() * 3, // 随机延迟，错开动画
            });
        }
        return pulses;
    }, [scenario, mapVertices]);

    if (scenario !== 'peak') return null;

    return (
        <group>
            {activePulses.map((pulse, i) => (
                <Pulse key={i} position={pulse.position} delay={pulse.delay} />
            ))}
        </group>
    );
} 