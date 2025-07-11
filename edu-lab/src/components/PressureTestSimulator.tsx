import React, { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/slider.tsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.tsx';
import { useInterval } from '../hooks/useInterval';

type Mode = 'direct' | 'queued';

// Set server capacity to 50 million as requested
const SERVER_CAPACITY = 50000000;
const BASE_RESPONSE_TIME = 50;

const scaleToUsers = (value: number) => {
    const minp = 1; // Slider minimum value
    const maxp = 100; // Slider maximum value
    const minv = Math.log(100); // Start from 100 users
    const maxv = Math.log(100000000); // End at 100,000,000 users
    const scale = (maxv - minv) / (maxp - minp);
    return Math.ceil(Math.exp(minv + scale * (value - minp)));
};

const CanvasAnimation = ({ mode, users, serverCapacity }: { mode: Mode; users: number; serverCapacity: number; }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<any[]>([]).current;
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw Server & Queue Area
            const serverY = canvas.height * 0.1;
            const queueY = canvas.height * 0.7;
            ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'; // bg-blue-600
            ctx.fillRect(canvas.width / 2 - 50, serverY - 15, 100, 30);
            ctx.fillStyle = 'white';
            ctx.font = '12px sans-serif';
            ctx.fillText('SERVER', canvas.width / 2 - 25, serverY);
            
            if (mode === 'queued') {
                ctx.strokeStyle = '#6b7280'; // border-gray-500
                ctx.strokeRect(canvas.width / 2 - 100, queueY - 20, 200, 40);
                ctx.fillStyle = '#9ca3af'; // text-gray-400
                 ctx.fillText('REQUEST QUEUE', canvas.width / 2 - 50, queueY);
            }

            // Update and draw particles
            particles.forEach((p, index) => {
                p.update();
                p.draw(ctx);
                if (p.life <= 0) {
                    particles.splice(index, 1);
                }
            });
            
            animationFrameId = window.requestAnimationFrame(render);
        };
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [mode]);

    // Particle generation
    const requestsPerTick = Math.min(Math.ceil(users / 1000000), 50);
    const tickDelay = 50;

    useInterval(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        for (let i = 0; i < requestsPerTick; i++) {
            // For direct mode, if users > capacity, ALL new particles are red.
            // This creates a very clear visual shift when the server is overloaded.
            const isSuccessForAnimation = (mode === 'direct')
                ? users <= serverCapacity
                : true; // Queued mode particles handle their own color via state.

            particles.push(new Particle(canvas, mode, isSuccessForAnimation));
        }
    }, tickDelay);

    return <canvas ref={canvasRef} className="w-full h-full" />;
};

class Particle {
    x: number; y: number;
    vx: number; vy: number;
    life: number;
    color: string;
    mode: Mode;
    isSuccess: boolean;
    canvas: HTMLCanvasElement;
    status: 'to_queue' | 'in_queue' | 'to_server' | 'done' = 'to_queue';
    queueTime: number = 0;

    constructor(canvas: HTMLCanvasElement, mode: Mode, isSuccess: boolean) {
        this.canvas = canvas;
        this.mode = mode;
        this.isSuccess = isSuccess;
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 10;
        
        const serverX = canvas.width / 2 + (Math.random() - 0.5) * 50;
        const serverY = canvas.height * 0.1;
        const angle = Math.atan2(serverY - this.y, serverX - this.x);
        const speed = 2 + Math.random() * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.life = 200;
        this.color = mode === 'direct' ? (isSuccess ? '#4ade80' : '#f87171') : '#facc15';
    }

    update() {
        if (this.mode === 'direct') {
            if (this.y < this.canvas.height * 0.1 && !this.isSuccess) {
                // do nothing, freeze failed particles
            } else {
                 this.x += this.vx;
                 this.y += this.vy;
            }
        } else { // Queued
             const queueY = this.canvas.height * 0.7;
            if (this.status === 'to_queue') {
                if (this.y <= queueY) {
                    this.status = 'in_queue';
                    this.vx = 0;
                    this.vy = 0;
                }
            } else if (this.status === 'in_queue') {
                this.queueTime++;
                if (this.queueTime > 50) { // Wait in queue
                    this.status = 'to_server';
                    this.color = '#4ade80'; // Turn green
                    const serverX = this.canvas.width / 2 + (Math.random() - 0.5) * 50;
                    const serverY = this.canvas.height * 0.1;
                    const angle = Math.atan2(serverY - this.y, serverX - this.x);
                    const speed = 2 + Math.random();
                    this.vx = Math.cos(angle) * speed;
                    this.vy = Math.sin(angle) * speed;
                }
            }
            this.x += this.vx;
            this.y += this.vy;
        }
        this.life--;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function PressureTestSimulator({ mode }: { mode: Mode }) {
  const [sliderValue, setSliderValue] = useState(1);
  const [concurrentUsers, setConcurrentUsers] = useState(scaleToUsers(1));
  const [metrics, setMetrics] = useState({
    avgResponseTime: 0,
    successRate: 1,
    queueSize: 0,
    serverPressure: 0,
  });

  useEffect(() => {
    const users = scaleToUsers(sliderValue);
    setConcurrentUsers(users);

    const simulationLogic = () => {
      let successRate: number, avgResponseTime: number, queueSize: number, serverPressure: number;
      
      if (mode === 'direct') {
        const overloadFactor = users / SERVER_CAPACITY;
        successRate = Math.min(1, SERVER_CAPACITY / users);
        avgResponseTime = BASE_RESPONSE_TIME + Math.min(4000, (overloadFactor - 1) * 50);
        queueSize = 0;
        // Direct mode pressure grows much faster to represent risk and chaos.
        // It will hit 100% well before the user count reaches server capacity.
        serverPressure = Math.min(100, overloadFactor * 250); 
      } else { // queued mode
        successRate = 1;
        const currentQueue = Math.max(0, users - SERVER_CAPACITY);
        queueSize = currentQueue;
        avgResponseTime = BASE_RESPONSE_TIME + (currentQueue / SERVER_CAPACITY) * 200;
        // The queue protects the server. Pressure reflects a high but "safe" workload.
        // Capping it lower (e.g., 80%) creates a more dramatic visual difference.
        const requestsBeingProcessed = Math.min(users, SERVER_CAPACITY);
        serverPressure = (requestsBeingProcessed / SERVER_CAPACITY) * 80;
      }
      
      setMetrics({
        avgResponseTime: Math.max(BASE_RESPONSE_TIME, avgResponseTime),
        successRate,
        queueSize,
        serverPressure: Math.round(serverPressure),
      });
    };
    
    const interval = setInterval(simulationLogic, 250);
    return () => clearInterval(interval);

  }, [sliderValue, mode]);
  
  const formatUsers = (num: number) => {
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(2)} 亿人`;
    }
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)} 万人`;
    }
    return `${Math.round(num)} 人`;
  };


  return (
    <Card className="bg-gray-800/50 border-gray-700 w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center text-blue-300">
          {mode === 'direct' ? '普通模式' : '队列模式'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium text-gray-300">并发用户数</span>
            <span className="font-bold text-2xl text-white">{formatUsers(concurrentUsers)}</span>
          </div>
          <Slider
            value={[sliderValue]}
            onValueChange={(value: number[]) => setSliderValue(value[0])}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <MetricCard title="平均响应时间" value={`${metrics.avgResponseTime.toFixed(0)} ms`} />
          <MetricCard title="请求成功率" value={`${(metrics.successRate * 100).toFixed(1)} %`} />
          <MetricCard title="排队用户数" value={formatUsers(metrics.queueSize)} />
          <MetricCard title="服务器压力" value={`${metrics.serverPressure.toFixed(0)}%`} isProgress />
        </div>
        
        <div className="h-64 bg-black/40 rounded-lg -mx-6 -mb-6 border-t border-gray-700 overflow-hidden relative">
            <CanvasAnimation 
                mode={mode} 
                users={concurrentUsers} 
                serverCapacity={SERVER_CAPACITY}
            />
        </div>

      </CardContent>
    </Card>
  );
}

function MetricCard({ title, value, isProgress = false }: { title: string; value: string; isProgress?: boolean }) {
    const progress = isProgress ? parseFloat(value) : 0;
    const colorClass = progress > 90 ? 'bg-red-600' : progress > 70 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div className="bg-gray-900/50 p-3 rounded-lg">
            <h4 className="text-sm text-gray-400 mb-1">{title}</h4>
            {!isProgress ? (
                <p className="text-2xl font-semibold text-white">{value}</p>
            ) : (
                <div className="w-full bg-gray-600 rounded-full h-6">
                    <div
                        className={`h-6 rounded-full ${colorClass} transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                    >
                        <span className="flex items-center justify-center h-full text-xs font-bold text-white">{value}</span>
                    </div>
                </div>
            )}
        </div>
    );
} 