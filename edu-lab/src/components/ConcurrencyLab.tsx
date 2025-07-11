import React from 'react';
import { PressureTestSimulator } from './PressureTestSimulator';

export function ConcurrencyLab() {
  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col p-4 gap-4 font-sans">
      <div className="text-center py-2">
        <h1 className="text-3xl font-heading text-cyan-300">高并发流量压力测试</h1>
        <p className="text-gray-400">对比「直接处理」与「队列缓冲」两种模式在不同并发压力下的系统表现</p>
      </div>

      <div className="flex-grow flex gap-4">
        {/* 左侧：直接处理模式 */}
        <div className="w-1/2 h-full bg-gray-800/50 rounded-lg p-4">
          <PressureTestSimulator mode="direct" />
        </div>

        {/* 右侧：队列缓冲模式 */}
        <div className="w-1/2 h-full bg-gray-800/50 rounded-lg p-4">
          <PressureTestSimulator mode="queued" />
        </div>
      </div>
    </div>
  );
} 