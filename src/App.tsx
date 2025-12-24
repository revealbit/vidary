import { useEffect, useState, useRef } from 'react';
import { PanelLeftOpen } from 'lucide-react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { VideoPlayer } from './components/VideoPlayer/VideoPlayer';
import { useVideoStore } from './stores/videoStore';

function App() {
  const loadItems = useVideoStore((state) => state.loadItems);
  const [sidebarVisible, setSidebarVisible] = useState(() => {
    const saved = localStorage.getItem('sidebarVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : 320;
  });
  const isResizing = useRef(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    localStorage.setItem('sidebarVisible', JSON.stringify(sidebarVisible));
  }, [sidebarVisible]);

  useEffect(() => {
    localStorage.setItem('sidebarWidth', String(sidebarWidth));
  }, [sidebarWidth]);

  const handleMouseDown = () => {
    isResizing.current = true;
    setShowOverlay(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = Math.max(200, Math.min(600, e.clientX));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    setShowOverlay(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="h-screen flex bg-gray-900 overflow-hidden">
      {sidebarVisible ? (
        <>
          <Sidebar width={sidebarWidth} onToggle={() => setSidebarVisible(false)} />
          <div
            className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-colors"
            onMouseDown={handleMouseDown}
          />
        </>
      ) : (
        <button
          onClick={() => setSidebarVisible(true)}
          className="absolute top-2 left-2 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
          title="Show panel"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}

      <div className="flex-1 flex min-w-0 relative">
        <VideoPlayer />
        {showOverlay && (
          <div className="absolute inset-0 z-10 cursor-col-resize" />
        )}
      </div>
    </div>
  );
}

export default App;
