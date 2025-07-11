import * as THREE from 'three';
import { useMemo, useState, useEffect } from 'react';
import * as d3 from 'd3-geo';

// 定义 GeoJSON feature 的类型
interface GeoJsonFeature {
  type: string;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

// 定义整个 GeoJSON 对象的类型
interface GeoJsonObject {
    type: string;
    features: GeoJsonFeature[];
}

export function GeoMap() {
  const [mapData, setMapData] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    fetch('/china.json')
      .then(response => response.json())
      .then(data => setMapData(data))
      .catch(error => console.error('Error loading map data:', error));
  }, []);

  const lineSegments = useMemo(() => {
    if (!mapData) return null;

    const projection = d3.geoMercator().center([104.0, 37.5]).scale(600).translate([0, 0]);
    const allLinePoints: number[] = [];

    mapData.features.forEach(feature => {
      const { type, coordinates } = feature.geometry;

      const processPolygon = (polygonRings: number[][][]) => {
        polygonRings.forEach(ring => {
          for (let i = 0; i < ring.length - 1; i++) {
            const p1 = projection(ring[i] as [number, number]);
            const p2 = projection(ring[i + 1] as [number, number]);
            if (p1 && p2) {
              allLinePoints.push(p1[0], -p1[1], 0);
              allLinePoints.push(p2[0], -p2[1], 0);
            }
          }
        });
      };

      if (type === 'Polygon') {
        processPolygon(coordinates as number[][][]);
      } else if (type === 'MultiPolygon') {
        (coordinates as number[][][][]).forEach(polygon => processPolygon(polygon));
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(allLinePoints, 3));
    return geometry;

  }, [mapData]);

  if (!lineSegments) {
    return null; // 数据加载时返回空
  }

  return (
    <lineSegments geometry={lineSegments}>
      <lineBasicMaterial color="#2563eb" />
    </lineSegments>
  );
} 