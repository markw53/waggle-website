// src/components/ThemeDebug.tsx
import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';

export function ThemeDebug() {
  const { theme, setTheme } = useTheme();
  const [htmlClass, setHtmlClass] = useState(document.documentElement.className);

  useEffect(() => {
    // Update displayed class whenever it changes
    const interval = setInterval(() => {
      setHtmlClass(document.documentElement.className);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 p-4 rounded-lg shadow-2xl z-9999 border-2 
                    bg-white dark:bg-zinc-800 
                    text-black dark:text-white 
                    border-gray-300 dark:border-zinc-600">
      <p className="font-bold mb-2">🎨 Theme Debug</p>
      
      <div className="space-y-2 text-sm">
        <p>
          <strong>React State:</strong>{' '}
          <code className="bg-gray-200 dark:bg-zinc-700 px-2 py-1 rounded">
            {theme}
          </code>
        </p>
        
        <p>
          <strong>HTML Class:</strong>{' '}
          <code className="bg-gray-200 dark:bg-zinc-700 px-2 py-1 rounded">
            {htmlClass || 'none'}
          </code>
        </p>
        
        <p>
          <strong>localStorage:</strong>{' '}
          <code className="bg-gray-200 dark:bg-zinc-700 px-2 py-1 rounded">
            {localStorage.getItem('theme') || 'not set'}
          </code>
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-zinc-600">
        <p className="text-xs mb-2 font-semibold">Quick Test:</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log('🔘 Debug button: Setting light');
              setTheme('light');
            }}
            className="px-3 py-1 text-xs rounded bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
          >
            ☀️ Light
          </button>
          <button
            onClick={() => {
              console.log('🔘 Debug button: Setting dark');
              setTheme('dark');
            }}
            className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            🌙 Dark
          </button>
          <button
            onClick={() => {
              console.log('🔘 Debug button: Setting system');
              setTheme('system');
            }}
            className="px-3 py-1 text-xs rounded bg-gray-400 hover:bg-gray-500 text-white font-medium"
          >
            💻 Auto
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-zinc-600">
        <p className="text-xs">
          This box should change color with theme!
        </p>
      </div>
    </div>
  );
}