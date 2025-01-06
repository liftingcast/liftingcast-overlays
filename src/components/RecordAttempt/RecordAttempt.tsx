import "./RecordAttempt.css";
import { MeetApiResponse } from "../../types";
import { capitalize } from "lodash";

export const RecordAttempt = ({
  data,
  platformId,
}: {
  data: MeetApiResponse;
  platformId: string;
}) => {
  return (
    <div className="record-attempt">
      <RecordAttemptInner data={data} platformId={platformId} />
    </div>
  );
};

const RecordAttemptInner = ({
  data,
  platformId,
}: {
  data: MeetApiResponse;
  platformId: string;
}) => {
  const platform = data?.platforms?.[platformId];
  const currentAttempt = platform?.currentAttempt;
  if (!currentAttempt) {
    return null;
  }
  const currentLifterId = currentAttempt?.lifter.id;
  if (!currentLifterId) {
    return null;
  }

  const currentLifter = data.lifters?.[currentLifterId];
  if (!currentLifter) {
    return null;
  }

  const currentLiftName = currentAttempt.liftName;

  const currentAttemptNumber = currentAttempt.attemptNumber;

  const currentLifterAttempt =
    currentLifter.lifts?.[currentLiftName]?.[currentAttemptNumber];

  if (!currentLifterAttempt) {
    return null;
  }

  const records = currentLifterAttempt.records;

  if (!records || !records.length) {
    return null;
  }

  const isWordRecordAttempt = records.find((r) => r.location === "W");
  const isNationalRecordAttempt = records.find((r) => r.location === "N");
  const isStateRecordAttempt = records.find((r) => r.location?.startsWith("S"));

  const formattedLiftName = capitalize(currentLiftName);

  if (isWordRecordAttempt) {
    return (
      <div className="record-attempt-inner">
        World Record Attempt {formattedLiftName}
      </div>
    );
  }

  if (isNationalRecordAttempt) {
    return (
      <div className="record-attempt-inner">
        National Record Attempt {formattedLiftName}
      </div>
    );
  }

  if (isStateRecordAttempt) {
    return (
      <div className="record-attempt-inner">
        State Record Attempt {formattedLiftName}
      </div>
    );
  }

  return null;
};
