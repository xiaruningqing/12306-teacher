import * as THREE from 'three';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as d3 from 'd3-geo';
import { type Scenario } from './ScenarioControls';

interface City {
    name: string;
    coordinates: [number, number];
}

interface Route {
    from: string;
    to: string;
}

interface AnimatedRouteProps {
    route: Route | null;
    scenario: Scenario;
}

const projection = d3.geoMercator().center([104.0, 37.5]).scale(600).translate([0, 0]);

export function AnimatedRoute({ route, scenario }: AnimatedRouteProps) {
    const lineRef = useRef<any>(null);
    const [cityCoords, setCityCoords] = useState<{ [key: string]: [number, number] }>({});

    useEffect(() => {
        fetch('/majorCities.json')
            .then(response => response.json())
            .then((cities: City[]) => {
                const coords: { [key: string]: [number, number] } = {};
                cities.forEach(city => {
                    coords[city.name] = city.coordinates;
                });
                setCityCoords(coords);
            })
            .catch(error => console.error('Error loading city data for routes:', error));
    }, []);

    const points = useMemo(() => {
        if (!route || !cityCoords[route.from] || !cityCoords[route.to]) return [];

        const startCoords = cityCoords[route.from];
        const endCoords = cityCoords[route.to];

        const [startX, startY] = projection(startCoords)!;
        const [endX, endY] = projection(endCoords)!;

        const startVec = new THREE.Vector3(startX, -startY, 0.2);
        const endVec = new THREE.Vector3(endX, -endY, 0.2);
        
        const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
        const distance = startVec.distanceTo(endVec);
        midPoint.z += distance * 0.3; // 让弧线有高度

        const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
        return curve.getPoints(50);

    }, [route, cityCoords]);

    useFrame((_, delta) => {
        if (lineRef.current) {
            // 通过改变dashOffset来实现流动效果
            lineRef.current.material.dashOffset -= delta * 50; // 加快速度
        }
    });

    if (scenario === 'failure' || !route || points.length === 0) {
        return null;
    }

    return (
        <Line
            ref={lineRef}
            points={points}
            color={'#ff4d4d'}
            lineWidth={4}
            dashed={true}
            dashSize={3}
            gapSize={1.5}
            transparent
            opacity={0.9}
        />
    );
} 