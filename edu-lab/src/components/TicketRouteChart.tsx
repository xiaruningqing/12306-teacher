import React from 'react';
import ReactECharts from 'echarts-for-react';

export interface Route {
  from: string;
  to: string;
}

interface TicketRouteChartProps {
  onRouteSelect: (route: Route) => void;
}

const popularRoutes: Route[] = [
  { from: '北京', to: '上海' },
  { from: '广州', to: '重庆' },
  { from: '上海', to: '成都' },
  { from: '深圳', to: '武汉' },
  { from: '成都', to: '西安' },
  { from: '杭州', to: '郑州' },
];

export function TicketRouteChart({ onRouteSelect }: TicketRouteChartProps) {
  const getOption = () => ({
    title: {
      text: '热门购票区间',
      subtext: '点击线路触发3D动画',
      textStyle: {
        color: '#e0e0e0',
        fontSize: 18,
      },
      subtextStyle: {
        color: '#b0b0b0',
        fontSize: 12
      },
      left: 'center',
      top: 10,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '3%',
      top: '25%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      axisLine: { lineStyle: { color: '#888' } },
      splitLine: { show: true, lineStyle: { color: '#333'} },
      axisLabel: { color: '#ccc' }
    },
    yAxis: {
      type: 'category',
      data: popularRoutes.map(r => `${r.from}→${r.to}`).reverse(),
      axisLabel: {
        color: '#ccc',
        fontSize: 12,
      },
      axisLine: { lineStyle: { color: '#888' } },
    },
    series: [
      {
        name: '热度',
        type: 'bar',
        data: [18203, 23489, 29034, 30497, 33234, 34490].sort((a,b) => a-b),
        itemStyle: {
          borderRadius: [0, 5, 5, 0],
          color: '#2563eb'
        },
        label: {
          show: true,
          position: 'right',
          color: '#fff',
          formatter: '{c}k'
        }
      }
    ],
    backgroundColor: 'rgba(0,0,0,0)',
  });

  const onChartClick = (params: any) => {
    if (params.componentType === 'series') {
      const routeIndex = popularRoutes.length - 1 - params.dataIndex;
      const selectedRoute = popularRoutes[routeIndex];
      onRouteSelect(selectedRoute);
    }
  };

  return (
    <div className="absolute top-1/4 left-4 w-96 h-[400px] bg-gray-900/60 backdrop-blur-sm p-4 rounded-xl border border-gray-700 shadow-2xl">
      <ReactECharts
        option={getOption()}
        onEvents={{ 'click': onChartClick }}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
} 