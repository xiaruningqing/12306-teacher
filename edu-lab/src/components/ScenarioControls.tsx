import { Zap, Shield, Waves } from 'lucide-react';

export type Scenario = 'normal' | 'peak' | 'failure';

interface ScenarioControlsProps {
  currentScenario: Scenario;
  onScenarioChange: (scenario: Scenario) => void;
}

const scenarios: { id: Scenario; name: string; icon: React.ReactNode }[] = [
  { id: 'normal', name: '日常模式', icon: <Waves className="w-4 h-4 mr-2" /> },
  { id: 'peak', name: '春运高峰', icon: <Zap className="w-4 h-4 mr-2" /> },
  { id: 'failure', name: '故障模拟', icon: <Shield className="w-4 h-4 mr-2 text-red-500" /> },
];

export function ScenarioControls({ currentScenario, onScenarioChange }: ScenarioControlsProps) {
  return (
    <div className="absolute top-4 right-4 bg-gray-900/60 backdrop-blur-sm p-3 rounded-lg border border-gray-700 shadow-2xl w-64">
      <h3 className="text-md font-bold text-white mb-3 px-1">场景模拟控制</h3>
      <div className="flex flex-col space-y-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => onScenarioChange(s.id)}
            className={`
              flex items-center justify-start text-sm px-3 py-2 rounded-md transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
              ${
                currentScenario === s.id
                  ? 'bg-blue-600 text-white font-semibold shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 hover:text-white'
              }
            `}
          >
            {s.icon}
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
} 