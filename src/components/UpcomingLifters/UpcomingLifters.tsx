import { take } from "lodash";
import { MeetApiResponse } from "../../types";
import "./UpcomingLifters.css";

// @ts-expect-error types are not working for react-fitty
import { ReactFitty } from "react-fitty";

export const UpcomingLifters = ({
  data,
  platformId,
}: {
  data: MeetApiResponse;
  platformId: string;
}) => {
  const platform = data?.platforms?.[platformId];
  const lifters = data.lifters;

  if (!platform || !lifters) {
    return null;
  }

  const nextFiveAttempts = take(platform.nextAttempts, 5);
  return (
    <div className="upcoming-lifters">
      {nextFiveAttempts.map((attempt) => {
        return (
          <div key={attempt.id} className="upcoming-lifters-lifter-name">
            <AutoSize>{lifters[attempt.lifter.id]?.name}</AutoSize>
          </div>
        );
      })}
    </div>
  );
};

const AutoSize = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactFitty minSize={8} maxSize={16} wrapText={false}>
      {children}
    </ReactFitty>
  );
};
