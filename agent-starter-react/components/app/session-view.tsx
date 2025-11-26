'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useSessionContext, useSessionMessages } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { SentimentAnalysis } from '@/components/app/sentiment-analysis';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { useConnection } from '@/hooks/useConnection';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';

const MotionBottom = motion.create('div');

const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
};

interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const { isConnectionActive, startDisconnectTransition } = useConnection();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: false, // Disable camera for this view
    screenShare: false, // Disable screen share
  };

  // Get room ID from session
  const roomId = session?.room?.name || 'default-room';

  // Get timestamp of last message for triggering sentiment updates
  const lastMessageTimestamp = messages.at(-1)?.timestamp;

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="relative z-10 h-screen w-full overflow-hidden bg-white" {...props}>
      {/* Split Layout Container */}
      <div className="h-[calc(100vh-240px)] pt-4 flex">
        {/* Left Side - Sentiment Analysis */}
        <div className="w-1/3 border-r-2 border-orange-200 h-full">
          <SentimentAnalysis roomId={roomId} lastMessageTimestamp={lastMessageTimestamp} />
        </div>

        {/* Right Side - Chat Transcript */}
        <div className="w-2/3 h-full bg-white">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 border-b-2 border-orange-700">
              <h2 className="text-xl font-bold">Conversation Transcript</h2>
              <p className="text-sm text-orange-100">Real-time sales conversation</p>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎙️</div>
                    <p className="text-xl text-gray-600 font-semibold mb-2">
                      Conversation Starting...
                    </p>
                    <p className="text-gray-500">
                      The AI sales assistant is ready to engage with customers
                    </p>
                  </div>
                </div>
              ) : (
                <ChatTranscript
                  messages={messages}
                  className="space-y-4"
                />
              )}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-0 bottom-0 z-50 bg-white border-t-2 border-orange-200"
      >
        <div className="container mx-auto px-6 py-4">
          <AgentControlBar
            controls={controls}
            isConnectionActive={isConnectionActive}
            onDisconnect={startDisconnectTransition}
          />
        </div>
      </MotionBottom>
    </section>
  );
};
