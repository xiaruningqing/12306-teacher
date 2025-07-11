import React, { useRef, useEffect, useState } from 'react';

interface ScreenAnnotationProps {
  isActive: boolean;
  onClose: () => void;
}

export function ScreenAnnotation({ isActive, onClose }: ScreenAnnotationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#dc2626'); // 中国红

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Resize canvas to fill the screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = 5;

  }, [color]);

  if (!isActive) {
    return null;
  }

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.beginPath();
    context.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  const colors = ['#dc2626', '#2563eb', '#7c3aed', '#0891b2', '#ffffff'];

  return (
    <div className="absolute top-0 left-0 w-full h-full z-40">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-full cursor-crosshair"
      />
      <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl flex flex-col items-center gap-4 border border-gray-700">
        <div className="flex flex-col gap-2">
            {colors.map(c => (
                 <button 
                    key={c} 
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all duration-200 border-2 ${color === c ? 'border-white ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : 'border-transparent hover:border-gray-400'}`}
                    style={{ backgroundColor: c }}
                />
            ))}
        </div>
        <button onClick={clearCanvas} className="w-full px-2 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors text-sm">
            清空
        </button>
        <button onClick={onClose} className="w-full px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
            退出
        </button>
      </div>
    </div>
  );
} 