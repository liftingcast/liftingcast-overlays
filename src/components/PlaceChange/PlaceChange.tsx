import "./PlaceChange.css";
import { MeetApiResponse } from "../../types";

export const PlaceChange = ({
  data,
  platformId,
}: {
  data: MeetApiResponse;
  platformId: string;
}) => {
  return (
    <div className="place-change">
      <PlaceChangeInner data={data} platformId={platformId} />
    </div>
  );
};

const PlaceChangeInner = ({
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

  const firstDivision = divisions[0];
  const firstDivisionId = firstDivision?.divisionId;
  if (!firstDivisionId) {
    return null;
  }

  const currentPlace = firstDivision?.place;
  if (!currentPlace) {
    return null;
  }

  const possiblePlace = currentAttempt.ifSuccessfulPlaces
    ? currentAttempt.ifSuccessfulPlaces[firstDivisionId]
    : null;

  if (!possiblePlace) {
    return <div>{currentPlace}</div>;
  }

  return (
    <div className="place-change-inner">
      {currentPlace}
      <svg
        className="icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path d="M8 256c0 137 111 248 248 248s248-111 248-248S393 8 256 8 8 119 8 256zM256 40c118.7 0 216 96.1 216 216 0 118.7-96.1 216-216 216-118.7 0-216-96.1-216-216 0-118.7 96.1-216 216-216zm-32 88v64H120c-13.2 0-24 10.8-24 24v80c0 13.2 10.8 24 24 24h104v64c0 28.4 34.5 42.8 54.6 22.6l128-128c12.5-12.5 12.5-32.8 0-45.3l-128-128c-20.1-20-54.6-5.8-54.6 22.7zm160 128L256 384v-96H128v-64h128v-96l128 128z" />
      </svg>
      {possiblePlace}
    </div>
  );
};
