import { useEffect, useState } from "react";
import Api from "../Api";

import "./FromPlaylist.css";
import { notEmpty } from "../util/util";
import { PlaylistList } from "../components/PlaylistList";
import { compareAudioFeatures } from "../util/math";
import { useTranslation } from "react-i18next";

async function calculatePlaylist(
  playlist: SpotifyApi.PlaylistObjectSimplified
) {
  const tracks = await Api.GetPlaylistTracks(playlist.id);
  const trackIds = tracks
    .map((track) => track.track?.id)
    .filter(notEmpty) as string[];
  const recommendationPromises = trackIds.map((trackId) =>
    Api.GetRecommendations(new Set(), new Set([trackId]), new Set(), [], 100)
  );
  const recommendations = (await Promise.all(recommendationPromises)).flat();
  const recommendationIds = new Set<string>(
    recommendations.map((rec) => rec.id)
  );

  for (const trackId of trackIds) {
    recommendationIds.delete(trackId);
  }

  const recommendationFeatures = await Api.GetMultipleTracksAnalyses(
    Array.from(recommendationIds)
  );
  const trackFeatures = await Api.GetMultipleTracksAnalyses(trackIds);
  const scores: { uri: string; score: number }[] = [];

  for (const recommendationFeature of recommendationFeatures) {
    let score = 0;
    for (const trackFeature of trackFeatures) {
      score += compareAudioFeatures(recommendationFeature, trackFeature);
    }
    scores.push({ uri: recommendationFeature.uri, score: score });
  }

  // Note: we want the lowest scores
  scores.sort((a, b) => a.score - b.score);
  const topTracks = scores.slice(0, 100).map((track) => track.uri);

  await Api.CreatePlaylistFromTracks(
    `Playlist similar to ${playlist.name}`,
    false,
    topTracks
  );
}

export function FromPlaylist() {
  const { t } = useTranslation();

  const [playlists, setPlaylists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    SpotifyApi.PlaylistObjectSimplified | undefined
  >(undefined);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    Api.GetCurrentUserPlaylists().then(setPlaylists);
  }, []);

  async function calculate() {
    if (selectedPlaylist) {
      setCalculating(true);
      await calculatePlaylist(selectedPlaylist);
      setCalculating(false);
    }
  }

  return (
    <div className={"page"}>
      <div className={"page-block w-55"}>
        {playlists && (
          <PlaylistList
            onClick={setSelectedPlaylist}
            columnCount={3}
            selectedPlaylist={selectedPlaylist}
          />
        )}
      </div>
      <div className={"page-block w-25 flex-col"}>
        <div className={"justify padding-16"}>
          <h1 className={"font-large"}>{t("FromPlaylist.howToUse.title")}</h1>
          <p>{t("FromPlaylist.howToUse.description")}</p>
        </div>
        <div className={"flex-col flex-center-around w-100"}>
          <button
            disabled={calculating || selectedPlaylist === undefined}
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
