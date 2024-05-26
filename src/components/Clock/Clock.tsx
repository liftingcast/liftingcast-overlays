import "./Clock.css";
import { MeetApiResponse } from "../../types";
import React from "react";
import { max } from "lodash";

// This clock may not be very accurate depending on network latency.
// Updates from the websocket are a bit slower than on the main LiftingCast App.
// Recent round trim time latency is calculated for you and passed into this component.
// You can attempt to adjust further by adjusting this number but you may still
// see inconsistent latency.
const CLOCK_LATENCY_MS = 400;

export const Clock = ({
  data,
  platformId,
  latency,
}: {
  data: MeetApiResponse;
  platformId: string;
  latency: number;
}) => {
  const platform = data?.platforms?.[platformId];
  const clockTimerLength = platform?.clockTimerLength ?? 60000;
  const clockState = platform?.clockState;
  const previousClockState = React.useRef(clockState);
  const [timeRemaining, setTimeRemaining] = React.useState(clockTimerLength);
  const [clockStartedAt, setClockStartedAt] = React.useState<number | null>(
    null
  );

  React.useEffect(() => {
    if (previousClockState.current === "initial" && clockState === "started") {
      setClockStartedAt(Date.now() - CLOCK_LATENCY_MS - latency);
      previousClockState.current = clockState;
    } else if (clockState === "initial") {
      setClockStartedAt(null);
      setTimeRemaining(clockTimerLength);
      previousClockState.current = clockState;
    }
  }, [clockState, clockTimerLength, latency]);

  React.useEffect(() => {
    let timerId = null;
    if (clockStartedAt) {
      timerId = setInterval(() => {
        const clockRunningForMs = Date.now() - clockStartedAt;
        const time = max([clockTimerLength - clockRunningForMs, 0]);
        if (time) {
          setTimeRemaining(time);
        }
      }, 100);
    }

    return () => {
      timerId && clearInterval(timerId);
    };
  }, [clockStartedAt, clockTimerLength]);

  return <div className="clock">{formatTimer(timeRemaining)}</div>;
};

const formatTimer = (d: number) => {
  const ms = Math.floor((d % 1000) / 100);
  d /= 1000;
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);
  const hours = h > 0 ? h : "";
  let minutes = `${m}`;
  if (h > 0 && m < 10) {
    minutes = `0${minutes}`;
  }
  const seconds = s > 0 ? (s >= 10 ? s : "0" + s) : "00";

  if (h > 0) {
    return `${hours}:${minutes}:${seconds}`;
  }

  return `${minutes}:${seconds}.${ms}`;
};
