'use client';

import { AnimatePresence, motion, type HTMLMotionProps, type Variants } from 'motion/react';
import { type ReceivedMessage } from '@livekit/components-react';
import { ChatEntry } from '@/components/livekit/chat-entry';

/* ------------------------------------------------------------------ */
/* Motion components */
/* ------------------------------------------------------------------ */

const MotionContainer = motion.create('div');
const MotionChatEntry = motion.create(ChatEntry);

/* ------------------------------------------------------------------ */
/* Variants */
/* ------------------------------------------------------------------ */

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: {
      ease: 'easeOut',
      duration: 0.3,
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.2,
      ease: 'easeOut',
      duration: 0.3,
      staggerChildren: 0.1,
      staggerDirection: 1,
    },
  },
};

const messageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

/* ------------------------------------------------------------------ */
/* Motion props */
/* ------------------------------------------------------------------ */

const CONTAINER_MOTION_PROPS: HTMLMotionProps<'div'> = {
  variants: containerVariants,
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

const MESSAGE_MOTION_PROPS = {
  variants: messageVariants,
};

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */

interface ChatTranscriptProps {
  hidden?: boolean;
  messages?: ReceivedMessage[];
}

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export function ChatTranscript({
  hidden = false,
  messages = [],
  ...props
}: ChatTranscriptProps & Omit<HTMLMotionProps<'div'>, 'ref'>) {
  return (
    <AnimatePresence>
      {!hidden && (
        <MotionContainer {...CONTAINER_MOTION_PROPS} {...props}>
          {messages.map((receivedMessage) => {
            const { id, timestamp, from, message } = receivedMessage;

            const locale = typeof navigator !== 'undefined'
              ? navigator.language
              : 'en-US';

            const messageOrigin = from?.isLocal ? 'local' : 'remote';

            const hasBeenEdited =
              receivedMessage.type === 'chatMessage' &&
              !!receivedMessage.editTimestamp;

            return (
              <MotionChatEntry
                key={id}
                locale={locale}
                timestamp={timestamp}
                message={message}
                messageOrigin={messageOrigin}
                hasBeenEdited={hasBeenEdited}
                {...MESSAGE_MOTION_PROPS}
              />
            );
          })}
        </MotionContainer>
      )}
    </AnimatePresence>
  );
}
