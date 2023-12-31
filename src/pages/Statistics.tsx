import React, { useEffect, useState } from "react";
import { TabDiv } from "../components/TabDiv";
import { PlaylistList } from "../components/PlaylistList";
import Api, { TrackDetails } from "../Api";
import { GenreChart } from "../components/chart/GenreChart";
import { SpotifyOptionType } from "../data/SpotifyOption";
import { StatisticsListItem } from "../components/ListItem";
import { GenericList } from "../components/GenericList";
import { capitalize } from "../util/util";
import { OptionChart } from "../components/chart/OptionChart";
import { useTranslation } from "react-i18next";

export function Statistics() {
  const { t } = useTranslation();
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    SpotifyApi.PlaylistObjectSimplified | undefined
  >(undefined);
  const [playlistStatistics, setPlaylistStatistics] = useState<TrackDetails[]>(
    []
  );
  const [selectedGenre, setSelectedGenre] = useState<
    { genre: string; inclusion: "included" | "excluded" } | undefined
  >(undefined);
  const [selectedField, setSelectedField] = useState<
    SpotifyOptionType | undefined
  >(undefined);
  const [relevantTracks, setRelevantTracks] = useState<
    {
      track: SpotifyApi.TrackObjectFull;
      subtitle: string;
    }[]
  >([]);

  useEffect(() => {
    if (selectedPlaylist) {
      Api.GetPlaylistDetailedStatistics(selectedPlaylist.id).then(
        setPlaylistStatistics
      );
    } else {
      setPlaylistStatistics([]);
    }
  }, [selectedPlaylist]);

  useEffect(() => {
    const tracks: {
      track: SpotifyApi.TrackObjectFull;
      subtitle: string;
    }[] = [];
    if (selectedGenre) {
      for (const details of playlistStatistics) {
        const genres = details.artists.flatMap((artist) => artist.genres);
        if (
          (selectedGenre.inclusion === "included" &&
            genres.includes(selectedGenre.genre)) ||
          (selectedGenre.inclusion === "excluded" &&
            !genres.includes(selectedGenre.genre))
        ) {
          const genresUnique = Array.from(new Set(genres)).map((genre) =>
            capitalize(genre)
          );
          genresUnique.sort((a, b) => a.localeCompare(b));
          tracks.push({
            track: details.track,
            subtitle: genresUnique.join(", "),
          });
        }
      }
    } else if (selectedField) {
      const statisticsCopy = [...playlistStatistics];
      statisticsCopy.sort(
        (a, b) => a.features[selectedField] - b.features[selectedField]
      );
      for (const details of statisticsCopy) {
        tracks.push({
          track: details.track,
          subtitle: `${capitalize(selectedField)} ${details.features[
            selectedField
          ].toFixed(2)}`,
        });
      }
    } else {
      for (const details of playlistStatistics) {
        const genres = details.artists.flatMap((artist) => artist.genres);
        const genresUnique = Array.from(new Set(genres)).map((genre) =>
          capitalize(genre)
        );
        genresUnique.sort((a, b) => a.localeCompare(b));
        tracks.push({
          track: details.track,
          subtitle: genresUnique.join(", "),
        });
      }
    }
    setRelevantTracks(tracks);
  }, [selectedGenre, selectedField, playlistStatistics]);

  function toggleGenre(genre: string) {
    if (genre === selectedGenre?.genre) {
      if (selectedGenre.inclusion === "included") {
        setSelectedGenre({ genre: genre, inclusion: "excluded" });
      } else {
        setSelectedGenre(undefined);
      }
    } else {
      setSelectedGenre({ genre: genre, inclusion: "included" });
    }
  }

  return (
    <div className={"page"}>
      <div className={"page-block w-33"}>
        <PlaylistList
          onClick={setSelectedPlaylist}
          selectedPlaylist={selectedPlaylist}
          columnCount={1}
        />
      </div>
      <div className={"page-block w-33"}>
        <TabDiv
          names={["Genres", "Statistics"]}
          className={"w-100 padding-16 h-5"}
        >
          <div className={"padding-8"}>
            <GenreChart
              tracks={playlistStatistics}
              selected={selectedGenre}
              onClick={toggleGenre}
            />
          </div>
          <div className={"padding-8"}>
            <OptionChart
              tracks={playlistStatistics}
              onClick={(field) => {
                if (field === selectedField) {
                  setSelectedField(undefined);
                } else {
                  setSelectedField(field);
                }
                setSelectedGenre(undefined);
              }}
              selected={selectedField}
            />
          </div>
        </TabDiv>
      </div>
      <div className={"page-block w-33"}>
        {selectedPlaylist === undefined ? (
          <div className={"justify padding-16"}>
            <h1 className={"font-large"}>{t("Statistics.howToUse.title")}</h1>
            <p>{t("Statistics.howToUse.description")}</p>
          </div>
        ) : (
          <GenericList<{
            track: SpotifyApi.TrackObjectFull;
            subtitle: string;
          }>
            itemFunction={StatisticsListItem}
            entries={relevantTracks}
            selectedEntry={undefined}
            columnCount={1}
          />
        )}
      </div>
    </div>
  );
}
