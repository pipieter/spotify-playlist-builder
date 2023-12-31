import { TrackDetails } from "../../Api";
import { SpotifyOptionType } from "../../data/SpotifyOption";
import "./OptionChart.css";
import { capitalize } from "../../util/util";
import { Tooltip } from "../Tooltip";

// TODO rename field to option

function quantile(arr: number[], q: number): number {
  const sorted = arr.sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

function OptionChartBoxplot(props: {
  tracks: TrackDetails[];
  field: SpotifyOptionType;
  selected: boolean;
}) {
  const { tracks, field, selected } = props;

  if (tracks.length === 0) {
    return <></>;
  }

  const values = tracks.map((track) => track.features[field]);
  const q25 = quantile(values, 0.25);
  const q50 = quantile(values, 0.5);
  const q75 = quantile(values, 0.75);
  const iqr = q75 - q25;

  const min = Math.max(quantile(values, 0.0), q25 - 1.5 * iqr);
  const max = Math.min(quantile(values, 1.0), q75 + 1.5 * iqr);

  const min_width = min;
  const q25_width = q25 - min;
  const q50_width = q50 - q25;
  const q75_width = q75 - q50;
  const max_width = max - q75;

  const absolute_min = Math.min(...values);
  const absolute_max = Math.max(...values);

  return (
    <Tooltip
      text={[
        ["Option", field],
        ["Absolute minimum", absolute_min.toFixed(2)],
        ["Absolute maximum", absolute_max.toFixed(2)],
        ["Q0", min.toFixed(2)],
        ["Q1", q25.toFixed(2)],
        ["Q2", q50.toFixed(2)],
        ["Q3", q75.toFixed(2)],
        ["Q4", max.toFixed(2)],
      ]}
    >
      <div className={"boxplot-outer w-max"}>
        <div className={`boxplot ${selected ? "selected" : ""}`}>
          <div
            style={{ width: `${100 * min_width}%` }}
            className={"boxplot-entry min"}
          />
          <div
            style={{ width: `${100 * q25_width}%` }}
            className={"boxplot-entry q25"}
          >
            <hr />
          </div>
          <div
            style={{ width: `${100 * q50_width}%` }}
            className={"boxplot-entry q50"}
          />
          <div
            style={{ width: `${100 * q75_width}%` }}
            className={"boxplot-entry q75"}
          />
          <div
            style={{ width: `${100 * max_width}%` }}
            className={"boxplot-entry max"}
          >
            <hr />
          </div>
        </div>
      </div>
    </Tooltip>
  );
}

export function OptionChart(props: {
  tracks: TrackDetails[];
  selected?: string;
  onClick?: (field: SpotifyOptionType) => void;
}) {
  const { tracks, selected, onClick } = props;

  const options: SpotifyOptionType[] = [
    "acousticness",
    "danceability",
    "energy",
    "instrumentalness",
    "liveness",
    "speechiness",
    "valence",
  ];
  return (
    <div>
      <table className={"w-100 option-table"}>
        <tbody>
          {options.map((option) => (
            <>
              <tr className={"option-name"}>
                <td>{capitalize(option)}</td>
              </tr>
              <tr>
                <td
                  className={"w-100"}
                  onClick={() => onClick && onClick(option)}
                >
                  <OptionChartBoxplot
                    tracks={tracks}
                    field={option}
                    selected={option === selected}
                  />
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
