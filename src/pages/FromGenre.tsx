import { useState } from "react";
import Api from "../Api";
import { PlaylistList } from "../components/PlaylistList";

import "./FromGenre.css";
import { capitalize, notEmpty, shuffle } from "../util/util";
import { GenericList } from "../components/GenericList";
import { ListItem } from "../components/ListItem";
import { compareAudioFeatures } from "../util/math";
import EveryNoiseGenres from "../data/Genres";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

async function calculatePlaylist(
  genre: string,
  playlist: SpotifyApi.PlaylistObjectSimplified | undefined
) {
  const tracks = await Api.GetSearchTracks(`genre:${genre}`);
  let resultTrackUris: string[] = [];

  // If no playlist given, return 100 random entries
  if (playlist === undefined) {
    resultTrackUris = shuffle(tracks)
      .slice(0, 100)
      .map((track) => track.uri);
  }
  // Otherwise compare each recommendation to the playlist
  else {
    const playlistTracks = await Api.GetPlaylistTracks(playlist.id);
    const playlistTrackIds = playlistTracks
      .map((track) => track.track?.id)
      .filter(notEmpty);
    const trackIds = tracks.map((track) => track.id);

    const trackFeatures = await Api.GetMultipleTracksAnalyses(trackIds);
    const playlistTrackFeatures = await Api.GetMultipleTracksAnalyses(
      playlistTrackIds
    );

    const featureTrackArtists: { [key: string]: string[] } = {};
    tracks.forEach(
      (track) =>
        (featureTrackArtists[track.id] = track.artists.map((a) => a.id))
    );

    const featureScores: { score: number; id: string; uri: string }[] = [];
    for (const trackFeature of trackFeatures) {
      let score = 0;
      for (const playlistTrackFeature of playlistTrackFeatures) {
        score += compareAudioFeatures(trackFeature, playlistTrackFeature);
      }
      featureScores.push({
        score: score,
        id: trackFeature.id,
        uri: trackFeature.uri,
      });
    }
    featureScores.sort((a, b) => a.score - b.score);

    // Prevent the same artist from being show too many times
    const seenArtists = new Set<string>();
    for (
      let i = 0;
      i < featureScores.length && resultTrackUris.length < 100;
      i++
    ) {
      const artists = featureTrackArtists[featureScores[i].id];
      if (!artists.every((artist) => seenArtists.has(artist))) {
        resultTrackUris.push(featureScores[i].uri);
      }
      for (const artist of artists) {
        seenArtists.add(artist);
      }
    }
  }

  await Api.CreatePlaylistFromTracks(
    `Songs with genre ${genre}`,
    false,
    resultTrackUris
  );
}

export function FromGenre() {
  const { t } = useTranslation();
  const genres = [...EveryNoiseGenres].sort();

  const [selectedPlaylist, setSelectedPlaylist] = useState<
    SpotifyApi.PlaylistObjectSimplified | undefined
  >(undefined);
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(
    undefined
  );
  const [calculating, setCalculating] = useState(false);

  async function calculate() {
    if (selectedGenre) {
      setCalculating(true);
      await calculatePlaylist(selectedGenre, selectedPlaylist);
      setCalculating(false);
    }
  }

  return (
    <div className={"page"}>
      <div className={"page-block w-33"}>
        <GenericList<string>
          itemFunction={(genre) => (
            <ListItem
              title={capitalize(genre)}
              user={""}
              image={""}
              selected={selectedGenre === genre}
            />
          )}
          entries={genres}
          selectedEntry={selectedGenre}
          onClick={setSelectedGenre}
          columnCount={1}
          filterFunction={(genre, query) =>
            genre.toLowerCase().includes(query.toLowerCase())
          }
        />
      </div>
      <div className={"page-block w-33"}>
        <PlaylistList
          onClick={setSelectedPlaylist}
          selectedPlaylist={selectedPlaylist}
          columnCount={1}
        />
      </div>
      <div className={"page-block w-33 flex-col"}>
        <div className={"justify padding-16"}>
          <h1 className={"font-large"}>{t("FromGenre.howToUse.title")}</h1>
          <p>{t("FromGenre.howToUse.description1")}</p>
          <p>
            <Trans
              i18nKey={"FromGenre.howToUse.description2"}
              t={t}
              components={[
                <Link to={"https://everynoise.com/research.cgi?mode=genre"} />,
              ]}
            />
          </p>
        </div>
        <div className={"flex-col flex-center-around w-100"}>
          <button
            disabled={calculating || selectedGenre === undefined}
            onClick={calculate}
            className={"button-dark"}
          >
            {calculating ? "Calculating..." : "Create Playlist"}
          </button>
        </div>
      </div>
    </div>
  );
}
