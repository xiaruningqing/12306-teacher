import React, { useState, useEffect } from 'react';

interface Activity {
  name: string;
  duration: number; // 单位：分钟
}

interface ClassTimerProps {
  activities: Activity[];
}

export function ClassTimer({ activities }: ClassTimerProps) {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const currentActivity = activities[currentActivityIndex];
  const totalDuration = activities.reduce((sum, act) => sum + act.duration, 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentActivityIndex]);

  const handleNext = () => {
    const nextIndex = currentActivityIndex + 1;
    if (nextIndex < activities.length) {
      setCurrentActivityIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    const prevIndex = currentActivityIndex - 1;
    if (prevIndex >= 0) {
      setCurrentActivityIndex(prevIndex);
    }
  };

  return (
    <div className="absolute top-8 right-8 p-4 bg-black/50 backdrop-blur-sm rounded-lg text-white font-sans w-72 shadow-2xl">
      <h3 className="text-xl font-bold border-b border-gray-500 pb-2 mb-3 text-center">课堂流程</h3>
      <ul>
        {activities.map((activity, index) => (
          <li
            key={index}
            className={`py-2 px-3 my-1 rounded-md transition-all duration-300 ${
              index === currentActivityIndex
                ? 'bg-blue-600 shadow-lg'
                : 'text-gray-400 bg-gray-800/50'
            }`}
          >
            <span className="font-semibold">{activity.name}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={handleNext}
        disabled={currentActivityIndex >= activities.length - 1}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        下一个环节
      </button>
    </div>
  );
} 