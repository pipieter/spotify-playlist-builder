import React, { useEffect, useState } from "react";
import { TabDiv } from "../components/TabDiv";
import { PlaylistList } from "../components/PlaylistList";
import Api, { TrackDetails } from "../Api";
import { GenreChart } from "../components/GenreChart";
import { SpotifyOptionType } from "../data/SpotifyOption";
import { ListItem } from "../components/ListItem";
import { GenericList } from "../components/GenericList";
import { capitalize } from "../util/util";
import { OptionChart } from "../components/OptionChart";

interface StatisticsListItemInterface {
  track: SpotifyApi.TrackObjectFull;
  subtitle: string;
}

function StatisticsListItem(track: StatisticsListItemInterface) {
  return (
    <ListItem
      title={track.track.name}
      subtitle={track.subtitle}
      image={track.track.album.images[0].url}
      selected={false}
    />
  );
}

export function Statistics() {
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
    StatisticsListItemInterface[]
  >([]);

  useEffect(() => {
    if (selectedPlaylist) {
      Api.GetPlaylistDetailedStatistics(selectedPlaylist.id).then(
        setPlaylistStatistics
      );
    }
  }, [selectedPlaylist]);

  useEffect(() => {
    const tracks: StatisticsListItemInterface[] = [];
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
        <GenericList<StatisticsListItemInterface>
          itemFunction={StatisticsListItem}
          entries={relevantTracks}
          selectedEntry={undefined}
          columnCount={1}
        />
      </div>
    </div>
  );
}
