import React from 'react';

interface TeachingAssistantProps {
  avatar: string; // 将用于选择头像图标或图片
  scripts: string[];
}

export function TeachingAssistant({ avatar, scripts }: TeachingAssistantProps) {
  return (
    <div className="absolute bottom-8 left-8 flex items-start space-x-4 p-4 bg-black/50 backdrop-blur-sm rounded-lg max-w-sm text-white font-sans shadow-2xl">
      {/* 头像占位符 */}
      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-4xl flex-shrink-0">
        {avatar === 'tech_detective' ? '👨‍💻' : '🤖'}
      </div>
      <div>
        {scripts.map((script, index) => (
          <p
            key={index}
            className="text-lg mb-1"
            dangerouslySetInnerHTML={{ __html: script }} // 用于渲染HTML标签
          />
        ))}
      </div>
    </div>
  );
} 