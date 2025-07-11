import type { Scene } from "../App";
import { Pencil, Camera, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface InstructorDashboardProps {
    currentScene: Scene;
    onSceneChange: (scene: Scene) => void;
    onToggleAnnotation: () => void;
    onTakeSnapshot: () => void;
}

const sceneConfig = [
    { id: 'springFestival', name: '春运剧场' },
    { id: 'ticketAllocation', name: '余票分配' },
    { id: 'concurrency', name: '高并发' },
    { id: 'videoHub', name: '视频中心' },
];

export function InstructorDashboard({ currentScene, onSceneChange, onToggleAnnotation, onTakeSnapshot }: InstructorDashboardProps) {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className="fixed top-4 left-4 z-50 flex flex-col items-start">
            {/* 伸缩按钮 */}
            <button
                onClick={() => setCollapsed(c => !c)}
                className="mb-2 p-2 rounded-full bg-gray-800/80 hover:bg-blue-600 text-white shadow-lg border border-gray-700 transition-all"
                title={collapsed ? '展开导航' : '收起导航'}
            >
                {collapsed ? <Menu size={22} /> : <X size={22} />}
            </button>
            {/* 导航栏主体 */}
            <div className={`transition-all duration-300 ${collapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100'} overflow-hidden`}
                style={{ minWidth: collapsed ? 0 : 240 }}
            >
                <div className="bg-gray-800/70 backdrop-blur-sm p-2 rounded-xl flex items-center gap-2 border border-gray-700 shadow-lg">
                    {sceneConfig.map((scene) => (
                        <button
                            key={scene.id}
                            onClick={() => onSceneChange(scene.id as Scene)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75
                                ${currentScene === scene.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {scene.name}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-gray-600 mx-2"></div>
                    <button
                        onClick={onToggleAnnotation}
                        className="p-2 rounded-lg text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        title="屏幕标记"
                    >
                        <Pencil size={20} />
                    </button>
                    <button
                        onClick={onTakeSnapshot}
                        className="p-2 rounded-lg text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        title="实验快照"
                    >
                        <Camera size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
} 