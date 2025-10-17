import type { AgentState } from "@livekit/components-react";
import { useEffect, useRef, useState } from "react";

interface NoAgentNotificationProps extends React.PropsWithChildren<object> {
  state: AgentState;
}

/**
 * Renders some user info when no agent connects to the room after a certain time.
 */
export function NoAgentNotification(props: NoAgentNotificationProps) {

}
