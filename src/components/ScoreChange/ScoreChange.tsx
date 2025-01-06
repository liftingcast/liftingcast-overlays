import "./ScoreChange.css";
import { MeetApiResponse } from "../../types";
import { round } from "lodash";

export const ScoreChange = ({
  data,
  platformId,
}: {
  data: MeetApiResponse;
  platformId: string;
}) => {
  return (
    <div className="score-change">
      <ScoreChangeInner data={data} platformId={platformId} />
    </div>
  );
};

const ScoreChangeInner = ({
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

  const divisions = data.lifters?.[currentLifterId]?.divisions;
  if (!divisions || !divisions.length) {
    return null;
  }

  const firstLifterDivision = divisions[0];
  const firstDivisionId = firstLifterDivision?.divisionId;
  if (!firstDivisionId) {
    return null;
  }

  const currentScore = firstLifterDivision?.score;
  if (!currentScore) {
    return null;
  }

  const firstDivision = data.divisions?.[firstDivisionId];

  const units =
    firstDivision?.scoreBy === "Percent of record"
      ? "%"
      : firstDivision?.scoreBy === "Total"
      ? data.units
      : "";

  const roundedCurrentScore =
    typeof currentScore === "string" ? currentScore : round(currentScore);

  const possibleScore = currentAttempt.ifSuccessfulScores
    ? currentAttempt.ifSuccessfulScores[firstDivisionId]
    : null;

  if (!possibleScore) {
    return <div>{roundedCurrentScore}</div>;
  }

  const roundedPossibleScore =
    typeof possibleScore === "string" ? possibleScore : round(possibleScore);

  return (
    <div className="score-change-inner">
      {roundedCurrentScore} {units}
      <svg
        className="icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path d="M8 256c0 137 111 248 248 248s248-111 248-248S393 8 256 8 8 119 8 256zM256 40c118.7 0 216 96.1 216 216 0 118.7-96.1 216-216 216-118.7 0-216-96.1-216-216 0-118.7 96.1-216 216-216zm-32 88v64H120c-13.2 0-24 10.8-24 24v80c0 13.2 10.8 24 24 24h104v64c0 28.4 34.5 42.8 54.6 22.6l128-128c12.5-12.5 12.5-32.8 0-45.3l-128-128c-20.1-20-54.6-5.8-54.6 22.7zm160 128L256 384v-96H128v-64h128v-96l128 128z" />
      </svg>
      {roundedPossibleScore} {units}
    </div>
  );
};
