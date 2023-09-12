import { SpotifyOptionType } from "../data/SpotifyOption";

export function compareAudioFeatures(
  features1: SpotifyApi.AudioFeaturesObject,
  features2: SpotifyApi.AudioFeaturesObject
) {
  let result = 0;
  for (const option of [
    "acousticness",
    "danceability",
    "energy",
    "instrumentalness",
    "liveness",
    "speechiness",
  ] as SpotifyOptionType[]) {
    const diff = features1[option] - features2[option];
    result += diff * diff;
  }
  return Math.sqrt(result);
}
