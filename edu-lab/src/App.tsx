import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { SpringFestivalTheater } from './components/SpringFestivalTheater';
import { TicketAllocationLab } from './components/TicketAllocationLab';
import { ConcurrencyLab } from './components/ConcurrencyLab';
import { VideoLearningHub } from './components/VideoLearningHub';
import { InstructorDashboard } from './components/InstructorDashboard';
import { ScreenAnnotation } from './components/ScreenAnnotation';

export const APP_CONTENT_ID = 'app-content';

// 定义场景类型，加入 videoHub
export type Scene = 'springFestival' | 'ticketAllocation' | 'concurrency' | 'videoHub';

function App() {
  const [currentScene, setCurrentScene] = useState<Scene>('springFestival');
  const [isAnnotationActive, setIsAnnotationActive] = useState(false);
  const appContentRef = useRef<HTMLDivElement>(null);

  const handleSceneChange = (scene: Scene) => {
    setCurrentScene(scene);
  };

  const handleTakeSnapshot = () => {
    const element = appContentRef.current;
    if (!element) return;

    html2canvas(element, {
      useCORS: true, // Allow loading cross-origin images
      backgroundColor: '#111827' // bg-gray-900
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `12306-snapshot-${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <main className="font-sans bg-gray-900 text-white relative h-screen overflow-hidden">
      <InstructorDashboard 
        currentScene={currentScene} 
        onSceneChange={handleSceneChange}
        onToggleAnnotation={() => setIsAnnotationActive(!isAnnotationActive)}
        onTakeSnapshot={handleTakeSnapshot}
      />
      <ScreenAnnotation 
        isActive={isAnnotationActive}
        onClose={() => setIsAnnotationActive(false)}
      />

      <div id={APP_CONTENT_ID} ref={appContentRef} className="h-full">
        {currentScene === 'springFestival' && <SpringFestivalTheater />}
        {currentScene === 'ticketAllocation' && <TicketAllocationLab />}
        {currentScene === 'concurrency' && <ConcurrencyLab />}
        {currentScene === 'videoHub' && <VideoLearningHub />}
      </div>
    </main>
  );
}

export default App;
