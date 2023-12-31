import { TrackDetails } from "../../Api";
import React from "react";
import "./GenreChart.css";
import { capitalize } from "../../util/util";
import { Tooltip } from "../Tooltip";

export function GenreChart(props: {
  tracks: TrackDetails[];
  selected?: { genre: string; inclusion: "included" | "excluded" };
  onClick?: (genre: string) => void;
}) {
  const { tracks, selected, onClick } = props;

  if (tracks.length === 0) {
    return <></>;
  }

  const trackCount = tracks.length;
  const trackGenreCount: { [genre: string]: number } = {};
  for (const track of tracks) {
    const trackGenres = track.artists.flatMap((artist) => artist.genres);
    const trackGenresUnique = new Set(trackGenres);
    for (const genre of trackGenresUnique) {
      trackGenreCount[genre] = (trackGenreCount[genre] || 0) + 1;
    }
  }

  interface GenrePercentage {
    genre: string;
    percentage: number;
  }

  const percentages: GenrePercentage[] = Object.entries(trackGenreCount).map(
    ([genre, count]) => ({
      genre: genre,
      percentage: (100 * count) / trackCount,
    })
  );
  percentages.sort((p1, p2) => p2.percentage - p1.percentage);
  const maxPercent = Math.max(...percentages.map((genre) => genre.percentage));

  return (
    <div>
      <table className={"w-100"}>
        <tbody>
          {percentages.map((entry) => (
            <tr>
              <td className={"chart-name"}>
                <p>{capitalize(entry.genre)}</p>
              </td>
              <td className={"w-max"}>
                <Tooltip
                  text={[
                    ["Genre", capitalize(entry.genre)],
                    [
                      "Count",
                      `${trackGenreCount[
                        entry.genre
                      ].toString()}/${trackCount}`,
                    ],
                    ["Percent", `${entry.percentage.toFixed(2)}%`],
                  ]}
                >
                  <div
                    className={`chart-bar ${
                      entry.genre === selected?.genre
                        ? selected.inclusion === "included"
                          ? "included"
                          : "excluded"
                        : ""
                    }`}
                    style={{
                      width: `${(100 * entry.percentage) / maxPercent}%`,
                    }}
                    onClick={() => onClick && onClick(entry.genre)}
                  ></div>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
