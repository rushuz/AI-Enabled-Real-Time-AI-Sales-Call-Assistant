import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ChatEntryProps extends React.HTMLAttributes<HTMLLIElement> {
  /** The locale to use for the timestamp. */
  locale: string;
  /** The timestamp of the message. */
  timestamp: number;
  /** The message to display. */
  message: string;
  /** The origin of the message. */
  messageOrigin: 'local' | 'remote';
  /** The sender's name. */
  name?: string;
  /** Whether the message has been edited. */
  hasBeenEdited?: boolean;
}

export const ChatEntry = ({
  name,
  locale,
  timestamp,
  message,
  messageOrigin,
  hasBeenEdited = false,
  className,
  ...props
}: ChatEntryProps) => {
  const time = new Date(timestamp);
  const title = time.toLocaleTimeString(locale, { timeStyle: 'full' });

  return (
    <li
      title={title}
      data-lk-message-origin={messageOrigin}
      className={cn('group flex w-full flex-col gap-1', className)}
      {...props}
    >
      <header
        className={cn(
          'flex items-center gap-2 text-sm font-semibold',
          messageOrigin === 'local' ? 'flex-row-reverse text-blue-600' : 'text-orange-600'
        )}
      >
        {name && <strong>{name}</strong>}
        <span className="font-mono text-xs text-gray-400 opacity-60 transition-opacity ease-linear group-hover:opacity-100">
          {hasBeenEdited && '*'}
          {time.toLocaleTimeString(locale, { timeStyle: 'short' })}
        </span>
      </header>
      <span
        className={cn(
          'max-w-4/5 rounded-2xl px-4 py-3 shadow-sm',
          messageOrigin === 'local'
            ? 'bg-blue-100 border border-blue-200 text-gray-800 ml-auto'
            : 'bg-orange-50 border border-orange-200 text-gray-800 mr-auto'
        )}
      >
        {message}
      </span>
    </li>
  );
};
