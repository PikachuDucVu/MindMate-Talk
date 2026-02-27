import { useEffect, useRef } from 'react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import type { Message as MessageType } from '../../types';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">💬</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Chào bạn!
        </h2>
        <p className="text-gray-500 max-w-sm">
          Mình là MindMate, người bạn đồng hành của bạn.
          Hãy chia sẻ với mình những gì bạn đang nghĩ nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
