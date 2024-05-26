import "./Dashboard.css";
import { useMeetData } from "../../lib/useMeetData";
import { CurrentLifterBanner } from "../CurrentLifterBanner/CurrentLifterBanner";
import { UpcomingLifters } from "../UpcomingLifters/UpcomingLifters";
import { Standings } from "../Standings/Standings";
import React from "react";
import classNames from "classnames";
import { Clock } from "../Clock/Clock";
import { round } from "lodash";

export const Dashboard = ({
  meetId,
  password,
  apiKey,
  apiBaseUrl,
}: {
  meetId: string;
  password: string;
  apiKey: string;
  apiBaseUrl: string;
}) => {
  const [updating, setUpdating] = React.useState(false);
  // latency is the round trip for the websocket connection. It does not include latency for the
  // cloud database to the websocket server which likely adds 200 - 500 more ms.
  const { data, status, error, wait, latency } = useMeetData({
    meetId,
    password,
    apiKey,
    apiBaseUrl,
  });

  React.useEffect(() => {
    setUpdating(true);
    const timer = setTimeout(() => {
      setUpdating(false);
    }, 500);

    return () => timer && clearTimeout(timer);
  }, [data]);

  return (
    <>
      <div className="dashboard">
        <div>
          <div className="connection-info">
            <div className="connection-info-first-row">
              <div>
                STATUS: {status}{" "}
                {status === "RECONNECTING" &&
                  wait &&
                  ` after ${wait / 1000} second wait.`}
              </div>
              <div
                className={classNames(
                  "sync-indicator",
                  status === "CONNECTED" && "sync-indicator-connected",
                  updating && "sync-indicator-updating"
                )}
              ></div>
              Latency: {round(latency)}ms
              <div>{meetId}</div>
            </div>
            <div>{error}</div>
          </div>
          {data &&
            data.platforms &&
            Object.values(data.platforms).map((platform) => {
              return (
                <div key={platform.id} className="platform-wrapper">
                  <div className="platform-column-one">
                    <div className="platform-name">{platform.name}</div>
                    <CurrentLifterBanner data={data} platformId={platform.id} />
                    <Clock
                      data={data}
                      platformId={platform.id}
                      latency={latency}
                    />
                  </div>
                  <UpcomingLifters data={data} platformId={platform.id} />
                </div>
              );
            })}
        </div>

        {data && (
          <div>
            <Standings data={data} />
            <Standings data={data} />
          </div>
        )}
      </div>
    </>
  );
};
