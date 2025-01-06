import "./Flag.css";
import { MeetApiResponse } from "../../types";

// if available this should point to a local server
const flagSvgBaseUrl = "https://liftingcast.com/flags";

export const Flag = ({
  data,
  platformId,
}: {
  data: MeetApiResponse;
  platformId: string;
}) => {
  return (
    <div className="flag">
      <FlagImage data={data} platformId={platformId} />
    </div>
  );
};

const FlagImage = ({
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

  const currentLifterId = currentAttempt.lifter.id;

  const currentLifter = data?.lifters?.[currentLifterId];
  const country = currentLifter?.country;
  if (!country) {
    return null;
  }
  const flagSvg = `${flagSvgBaseUrl}/${country.toLowerCase()}.svg`;

  return (
    <div
      className="flag-image"
      style={{
        backgroundImage: `url('${flagSvg}')`,
      }}
    ></div>
  );
};
