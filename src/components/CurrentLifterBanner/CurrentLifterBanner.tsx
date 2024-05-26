import {
  Attempt,
  AttemptNumber,
  LiftName,
  Lifter,
  MeetApiResponse,
  RefLight,
  RefLights,
} from "../../types";
import { every, first } from "lodash";
import classNames from "classnames";
import "./CurrentLifterBanner.css";
import React from "react";
import logo from "/logo.svg";

// @ts-expect-error types are not working for react-fitty
import { ReactFitty } from "react-fitty";

export const CurrentLifterBanner = ({
  data,
  platformId,
}: {
  data: MeetApiResponse;
  platformId: string;
}) => {
  const platform = data?.platforms?.[platformId];
  const lifters = data.lifters;
  const divisions = data.divisions;

  if (!platform || !lifters || !divisions) {
    return null;
  }

  const currentAttempt = platform.currentAttempt ?? null;
  const currentLifterId = currentAttempt?.lifter.id;
  const currentLifter =
    currentLifterId && lifters[currentLifterId]
      ? lifters[currentLifterId] ?? null
      : null;
  const firstLifterDivision = first(currentLifter?.divisions);
  const firstDivisionId = firstLifterDivision?.divisionId;
  const firstDivision =
    firstDivisionId && divisions ? divisions[firstDivisionId] : null;
  const firstWeightClassId = firstLifterDivision?.weightClassId;
  const firstWeightClass = firstWeightClassId
    ? firstDivision?.weightClasses[firstWeightClassId]
    : null;

  return (
    <div className="current-lifter-banner">
      <div className="current-lifter-banner-column-one">
        <img src={logo} className="logo" alt="logo" />
      </div>
      <div className="current-lifter-banner-column-two">
        <div className="current-lifter-banner-name">
          <AutoSize>
            {currentLifter?.name} {!!currentLifter?.team && " : "}
            {currentLifter?.team}
          </AutoSize>
        </div>

        {firstDivision && firstWeightClass && (
          <div className="current-lifter-banner-category">
            <AutoSize>
              {firstDivision?.name} - {firstWeightClass?.name}
            </AutoSize>
          </div>
        )}
      </div>
      <div className="current-lifter-banner-column-three">
        <div className="current-lifter-banner-attempts">
          <div className="current-lifter-banner-lift-name">
            {currentAttempt?.liftName}
          </div>
          <Attempts currentAttempt={currentAttempt} lifter={currentLifter} />
        </div>
      </div>
      <div className="current-lifter-banner-column-four">
        <Lights refLights={platform.refLights} />
      </div>
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

const AttemptCell = ({
  liftName,
  attemptNumber,
  isCurrent,
  lifter,
}: {
  liftName: LiftName | undefined;
  attemptNumber: AttemptNumber | undefined;
  isCurrent: boolean;
  lifter: Lifter | null;
}) => {
  const attempt =
    lifter && liftName && attemptNumber
      ? lifter.lifts[liftName][attemptNumber]
      : null;
  return (
    <div
      className={classNames(
        "current-lifter-banner-attempt",
        isCurrent && "current-lifter-banner-attempt-current",
        attempt?.result === "good" && "current-lifter-banner-attempt-good",
        attempt?.result === "bad" && "current-lifter-banner-attempt-bad"
      )}
    >
      {attempt?.weight}
    </div>
  );
};

const Attempts = ({
  currentAttempt,
  lifter,
}: {
  currentAttempt: Attempt | null;
  lifter: Lifter | null;
}) => {
  return (
    <>
      <AttemptCell
        isCurrent={currentAttempt?.attemptNumber === "1"}
        liftName={currentAttempt?.liftName}
        attemptNumber="1"
        lifter={lifter}
      />
      <AttemptCell
        isCurrent={currentAttempt?.attemptNumber === "2"}
        liftName={currentAttempt?.liftName}
        attemptNumber="2"
        lifter={lifter}
      />
      <AttemptCell
        isCurrent={currentAttempt?.attemptNumber === "3"}
        liftName={currentAttempt?.liftName}
        attemptNumber="3"
        lifter={lifter}
      />
    </>
  );
};

// Optional delay when turning lights off so they stay on long enough to read.
const lightsOffDelaySeconds = import.meta.env
  .VITE_LIFTINGCAST_LIGHTS_OFF_DELAY_SECONDS as string | undefined;
const Lights = ({ refLights }: { refLights: RefLights }) => {
  const [refLightsInternal, setRefLightsInternal] =
    React.useState<RefLights>(refLights);

  React.useEffect(() => {
    const allSelectedCurrent = every(
      refLights,
      (rl) => rl.decision === "good" || rl.decision === "bad"
    );

    const allSelectedPrevious = every(
      refLightsInternal,
      (rl) => rl.decision === "good" || rl.decision === "bad"
    );
    if (allSelectedPrevious && !allSelectedCurrent) {
      setTimeout(
        () => setRefLightsInternal(refLights),
        Number(lightsOffDelaySeconds ?? "0") * 1000
      );
    } else {
      setRefLightsInternal(refLights);
    }
  }, [refLights, refLightsInternal]);

  return (
    <div className="current-lifter-banner-lights">
      <Light refLight={refLightsInternal.left} refLights={refLightsInternal} />
      <Light refLight={refLightsInternal.head} refLights={refLightsInternal} />
      <Light refLight={refLightsInternal.right} refLights={refLightsInternal} />
    </div>
  );
};

const Light = ({
  refLight,
  refLights,
}: {
  refLight: RefLight;
  refLights: RefLights;
}) => {
  const allSelected = every(
    refLights,
    (rl) => rl.decision === "good" || rl.decision === "bad"
  );

  return (
    <div
      className={classNames(
        "current-lifter-banner-light",
        allSelected &&
          refLight.decision === "bad" &&
          "current-lifter-banner-light-red",
        allSelected &&
          refLight.decision === "good" &&
          "current-lifter-banner-light-white"
      )}
    ></div>
  );
};
