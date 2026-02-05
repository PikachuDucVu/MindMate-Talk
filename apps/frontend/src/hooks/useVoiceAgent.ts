import { useConversation } from '@elevenlabs/react';
import { useCallback, useState, useRef } from 'react';
import { getAgentSignedUrl } from '../services/api';

export type AgentStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type AgentMode = 'listening' | 'speaking' | 'idle';

interface UseVoiceAgentOptions {
  onMessage?: (role: 'user' | 'assistant', content: string, id: string) => void;
}

export function useVoiceAgent(options: UseVoiceAgentOptions = {}) {
  const [status, setStatus] = useState<AgentStatus>('disconnected');
  const [mode, setMode] = useState<AgentMode>('idle');
  const [error, setError] = useState<string | null>(null);
  const messageIdRef = useRef(0);
  const onMessageRef = useRef(options.onMessage);

  // Keep ref updated
  onMessageRef.current = options.onMessage;

  const conversation = useConversation({
    onConnect: () => {
      setStatus('connected');
      setError(null);
    },
    onDisconnect: () => {
      setStatus('disconnected');
      setMode('idle');
    },
    onMessage: (message) => {
      if (message.source === 'user' && message.message) {
        const id = `user-${Date.now()}-${++messageIdRef.current}`;
        onMessageRef.current?.('user', message.message, id);
      } else if (message.source === 'ai' && message.message) {
        const id = `assistant-${Date.now()}-${++messageIdRef.current}`;
        onMessageRef.current?.('assistant', message.message, id);
      }
    },
    onModeChange: (newMode) => {
      if (newMode.mode === 'speaking') {
        setMode('speaking');
      } else if (newMode.mode === 'listening') {
        setMode('listening');
      } else {
        setMode('idle');
      }
    },
    onError: (err) => {
      setError(err.message || 'An error occurred');
      setStatus('error');
    },
  });

  const connect = useCallback(async () => {
    try {
      setStatus('connecting');
      setError(null);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from backend
      const signedUrl = await getAgentSignedUrl();

      // Start the conversation
      await conversation.startSession({ signedUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setStatus('error');
    }
  }, [conversation]);

  const disconnect = useCallback(async () => {
    await conversation.endSession();
    setStatus('disconnected');
    setMode('idle');
  }, [conversation]);

  return {
    status,
    mode,
    error,
    connect,
    disconnect,
  };
}
