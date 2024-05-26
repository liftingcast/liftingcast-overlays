import { first, last, round, sortBy, take } from "lodash";
import { LifterAttempts, MeetApiResponse } from "../../types";
import "./Standings.css";
import React from "react";

// @ts-expect-error types are not working for react-fitty
import { ReactFitty } from "react-fitty";

export const Standings = ({ data }: { data: MeetApiResponse }) => {
  const divisionOptions = sortBy(
    Object.values(data.divisions ?? {}).map((d) => ({
      label: d.name,
      value: d.id,
    })),
    "label"
  );

  const [selectedDivisionId, setSelectedDivisionId] = React.useState<
    string | null
  >(first(divisionOptions)?.value ?? null);

  const selectedDivision =
    selectedDivisionId && data.divisions
      ? data.divisions[selectedDivisionId]
      : null;

  const weightClassOptions = sortBy(
    Object.keys(selectedDivision ? selectedDivision.weightClasses : []).map(
      (wId) => ({
        label: selectedDivision?.weightClasses[wId]?.name ?? "",
        value: wId,
      })
    ),
    (w) => Number(w.label)
  );

  const [selectedWeightClassId, setSelectedWeightClassId] = React.useState(
    selectedDivision ? first(weightClassOptions)?.value : null
  );

  const selectedWeightClass =
    selectedDivision && selectedWeightClassId
      ? selectedDivision.weightClasses[selectedWeightClassId]
      : null;

  const [forecasted, setForecasted] = React.useState(false);

  // Remove the word Points from scoreBy as it takes up too much space.
  const scoreBy = selectedDivision?.scoreBy
    ? selectedDivision.scoreBy.replace("Points", "")
    : null;

  const topLifters = useCategoryRankings({
    divisionId: selectedDivisionId,
    weightClassId: selectedWeightClassId ?? null,
    maxRows: 10,
    forecasted,
    data,
  });

  return (
    <div className="standings">
      <div className="standings-config-bar">
        <div>
          <div>Division</div>
          <select
            onChange={(e) => {
              const newDivisionId = e.target.value;
              setSelectedDivisionId(newDivisionId);

              // Reset weight class whenever division changes.
              const selectedDivision =
                newDivisionId && data.divisions
                  ? data.divisions[newDivisionId]
                  : null;
              setSelectedWeightClassId(
                selectedDivision
                  ? first(Object.keys(selectedDivision.weightClasses))
                  : null
              );
            }}
          >
            {divisionOptions.map((d) => {
              return (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <div>Weight Class</div>
          <select onChange={(e) => setSelectedWeightClassId(e.target.value)}>
            {weightClassOptions.map((w) => {
              return (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <div>Forecasted</div>
          <select onChange={(e) => setForecasted(e.target.value === "true")}>
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
        </div>
      </div>
      <div className="standings-category-name">
        {forecasted ? "Forecasted" : ""} {selectedDivision?.name} -{" "}
        {selectedWeightClass?.name}
      </div>
      <div>
        <div className="standings-row">
          <div className="standing-item"></div>
          <div className="standing-item"></div>
          <div className="standing-item">Squat</div>
          <div className="standing-item">Bench</div>
          <div className="standing-item">Dead</div>
          <div className="standing-item">{scoreBy}</div>
        </div>
        {topLifters.map((l) => {
          const place = forecasted
            ? l.selectedDivision?.forecastedPlace
            : l.selectedDivision?.place;
          const score = forecasted
            ? l.selectedDivision?.forecastedScore
            : l.selectedDivision?.score;
          return (
            <div key={l.id} className="standings-row">
              <div className="standing-item">{place || "-"}</div>
              <div className="standing-item">
                <AutoSize>{l.name}</AutoSize>
              </div>
              <div className="standing-item">{l.bestSquat}</div>
              <div className="standing-item">{l.bestBench}</div>
              <div className="standing-item">{l.bestDead}</div>
              <div className="standing-item">
                {score ? round(Number(score), 2) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// In order to reduce payload size the placings are only listed under the lifter objects.
// This hook turns that placement data from lifters into an ordered list of lifters for
// a given division and weight class.
const useCategoryRankings = ({
  data,
  maxRows,
  forecasted,
  divisionId,
  weightClassId,
}: {
  data: MeetApiResponse;
  maxRows: number;
  forecasted: boolean;
  divisionId: string | null;
  weightClassId: string | null;
}) => {
  const lifters = data.lifters;
  if (!lifters) {
    return [];
  }
  const allLiftersInSelectedCategory = Object.values(lifters)
    .filter((l) => {
      return l.divisions.some((ld) => {
        return (
          ld.divisionId === divisionId && ld.weightClassId === weightClassId
        );
      });
    })
    .map((l) => {
      return {
        ...l,
        bestSquat: getBestLift({ forecasted, attempts: l.lifts.squat }),
        bestBench: getBestLift({ forecasted, attempts: l.lifts.bench }),
        bestDead: getBestLift({ forecasted, attempts: l.lifts.dead }),
        selectedDivision: l.divisions.find(
          (ld) =>
            ld.divisionId === divisionId && ld.weightClassId === weightClassId
        ),
      };
    });

  const sortedLifters = sortBy(allLiftersInSelectedCategory, (l) =>
    forecasted ? l.selectedDivision?.forecastedPlace : l.selectedDivision?.place
  );

  const topLifters = take(sortedLifters, maxRows);

  return topLifters;
};

const getBestLift = ({
  forecasted,
  attempts,
}: {
  forecasted: boolean;
  attempts: LifterAttempts;
}) => {
  return last(
    sortBy(
      Object.values(attempts).filter(
        (lift) => lift.weight && (forecasted || lift.result === "good")
      ),
      (lift) => lift.weight
    )
  )?.weight;
};

const AutoSize = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactFitty minSize={8} maxSize={16} wrapText={false}>
      {children}
    </ReactFitty>
  );
};
