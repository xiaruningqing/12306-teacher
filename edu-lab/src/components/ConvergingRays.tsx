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
const CONVERGENCE_POINT = new THREE.Vector3(0, 0, 50); // 所有光线汇聚到中心点上空

const Ray = ({ start, delay }: { start: THREE.Vector3, delay: number }) => {
    const ref = useRef<THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>>(null!);

    const points = useMemo(() => [start, CONVERGENCE_POINT], [start]);

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const elapsedTime = clock.getElapsedTime() - delay;
        if (elapsedTime > 0) {
            const progress = (elapsedTime % 2) / 2; // 2秒一个动画周期
            ref.current.material.opacity = Math.sin(progress * Math.PI) * 0.7;
        } else {
            ref.current.material.opacity = 0;
        }
    });

    return (
        <line ref={ref}>
            <bufferGeometry attach="geometry" setFromPoints={points} />
            <lineBasicMaterial attach="material" color="#ff4d4d" transparent opacity={0} />
        </line>
    );
};

export function ConvergingRays({ scenario }: { scenario: Scenario }) {
    const [mapVertices, setMapVertices] = useState<THREE.Vector3[]>([]);

    useEffect(() => {
        fetch('/china.json')
            .then(res => res.json())
            .then((data: GeoJsonObject) => {
                const vertices: THREE.Vector3[] = [];
                data.features.forEach(feature => {
                    const polygons = feature.geometry.type === 'Polygon'
                        ? [feature.geometry.coordinates]
                        : feature.geometry.coordinates;

                    polygons.forEach(polygon => {
                        polygon.forEach(ring => {
                            ring.forEach(coord => {
                                const [x, y] = projection(coord as [number, number])!;
                                if (x && y) {
                                    vertices.push(new THREE.Vector3(x, -y, 0.1));
                                }
                            });
                        });
                    });
                });
                setMapVertices(vertices);
            });
    }, []);

    const activeRays = useMemo(() => {
        if (scenario !== 'peak' || mapVertices.length === 0) return [];
        
        const rayCount = 200; // 在高峰期生成200条汇聚光线
        const rays = [];
        for (let i = 0; i < rayCount; i++) {
            rays.push({
                start: mapVertices[Math.floor(Math.random() * mapVertices.length)],
                delay: Math.random() * 2, // 随机延迟，错开动画
            });
        }
        return rays;
    }, [scenario, mapVertices]);

    if (scenario !== 'peak') return null;

    return (
        <group>
            {activeRays.map((ray, i) => (
                <Ray key={i} start={ray.start} delay={ray.delay} />
            ))}
        </group>
    );
} 