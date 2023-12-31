import Api from "./Api";
import { SpotifyOption, SpotifyOptionType } from "./data/SpotifyOption";

// TODO cleanup
// TODO fix inconsistent features/analyses naming

function RootSquaredSum(values: number[]): number {
  const result = values.reduce((sum, value) => sum + value * value, 0);
  return Math.sqrt(result);
}

function calculateAudioFeaturesMSQR(
  features1: SpotifyApi.AudioFeaturesObject,
  features2: SpotifyApi.AudioFeaturesObject,
  options: SpotifyOptionType[] = [
    "acousticness",
    "danceability",
    "energy",
    "instrumentalness",
    "liveness",
    "speechiness",
  ]
) {
  const values = options.map((option) => features1[option] - features2[option]);
  return RootSquaredSum(values);
}

async function calculateTopSimilarAudioFeature(
  inputTrackIds: string[],
  compareTrackIds: string[]
): Promise<{ id: string; uri: string; featureDifference: number }[]> {
  const inputAudioFeatures = await Api.GetMultipleAudioFeatures(inputTrackIds);
  const compareAudioFeatures = await Api.GetMultipleAudioFeatures(
    compareTrackIds
  );

  const results: { id: string; uri: string; featureDifference: number }[] = [];

  for (const inputAudioFeature of inputAudioFeatures) {
    const comparedFeatures = compareAudioFeatures.map((features) =>
      calculateAudioFeaturesMSQR(inputAudioFeature, features)
    );
    results.push({
      id: inputAudioFeature.id,
      uri: inputAudioFeature.uri,
      featureDifference: RootSquaredSum(comparedFeatures),
    });
  }

  results.sort((f1, f2) => f1.featureDifference - f2.featureDifference);

  return results;
}

async function FindRecommendationsFromTracks(
  trackIds: string[]
): Promise<string[]> {
  const recommendationPromises = trackIds.map((trackId) =>
    Api.GetRecommendations([], [trackId], [], [], 100)
  );
  const recommendations = (await Promise.all(recommendationPromises)).flat();
  const recommendationIds = new Set<string>(
    recommendations.map((rec) => rec.id)
  );
  for (const trackId of trackIds) {
    recommendationIds.delete(trackId); // Remove tracks already in playlist
  }
  return Array.from(recommendationIds);
}

export async function CreatePlaylistFromPlaylist(
  playlist: SpotifyApi.PlaylistObjectSimplified
): Promise<void> {
  const playlistTrackIds = await Api.GetPlaylistTrackIds(playlist.id);
  const recommendationIds = await FindRecommendationsFromTracks(
    playlistTrackIds
  );
  const recommendationFeatureScores = await calculateTopSimilarAudioFeature(
    Array.from(recommendationIds),
    playlistTrackIds
  );
  const topScores = recommendationFeatureScores.slice(0, 100);

  await Api.CreatePlaylistFromTracks(
    `Playlist similar to ${playlist.name}`,
    false,
    topScores.map((score) => score.uri)
  );
}

//TODO add optional extra deep search mode where we also look at artists similar to the artists in the playlist
//  and see if those artists have the desired genre. Then pick N songs from those artists and add them to the features list
export async function CreatePlaylistFromGenre(
  genre: string,
  playlist: SpotifyApi.PlaylistObjectSimplified
) {
  // TODO also search for artists with said genre and pick up to N of their songs to include in the recommendations

  const tracks = await Api.GetSearchTracks(`genre:${genre}`);
  const resultTrackUris: string[] = [];

  const playlistTracks = await Api.GetPlaylistTracks(playlist.id).then(
    Api.ExtractTracksFromPlaylist
  );
  const playlistTrackIds = playlistTracks.map((track) => track.id);
  const trackIds = tracks.map((track) => track.id);

  const trackFeatures = await Api.GetMultipleAudioFeatures(trackIds);
  const playlistTrackFeatures = await Api.GetMultipleAudioFeatures(
    playlistTrackIds
  );

  const featureTrackArtists: { [key: string]: string[] } = {};
  tracks.forEach(
    (track) => (featureTrackArtists[track.id] = track.artists.map((a) => a.id))
  );

  const featureScores: { score: number; id: string; uri: string }[] = [];
  for (const trackFeature of trackFeatures) {
    let score = 0;
    for (const playlistTrackFeature of playlistTrackFeatures) {
      score += calculateAudioFeaturesMSQR(trackFeature, playlistTrackFeature);
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

  await Api.CreatePlaylistFromTracks(
    `Songs with genre ${genre}`,
    false,
    resultTrackUris
  );
}

export async function CreatePlaylistFromTrack(
  track: SpotifyApi.TrackObjectFull,
  tracks: SpotifyApi.TrackObjectFull[],
  options: SpotifyOption[]
) {
  // Find recommendations
  const trackSeeds = new Set(tracks.map((track) => track.id));
  const recommendationOptions = options
    .filter((option) => option.enabled)
    .map((option) => ({
      name: option.target_name,
      value: option.value,
    }));

  const recommendationPromises = Array.from(trackSeeds).map((seed) =>
    Api.GetRecommendations([], [seed], [], recommendationOptions, 100)
  );
  const recommendations = (await Promise.all(recommendationPromises)).flat();
  const recommendationIds = new Set(recommendations.map((rec) => rec.id));

  for (const track of tracks) {
    recommendationIds.delete(track.id); // Remove from recommendations the tracks that are already in the playlist
  }
  recommendationIds.delete(track.id);

  // Calculate feature scores
  const recommendationFeatureScores = await calculateTopSimilarAudioFeature(
    Array.from(recommendationIds),
    [track.id]
  );
  const topScores = recommendationFeatureScores.slice(0, 100);

  await Api.CreatePlaylistFromTracks(
    `Songs similar to ${track.name}`,
    false,
    topScores.map((score) => score.id)
  );
}

// TODO remove code duplication
export async function CreatePlaylistFromArtist(
  artist: SpotifyApi.ArtistObjectFull,
  playlist: SpotifyApi.PlaylistObjectSimplified
) {
  const tracks = await Api.GetRecommendations([artist.id], [], [], [], 100);

  const playlistTracks = await Api.GetPlaylistTracks(playlist.id).then(
    Api.ExtractTracksFromPlaylist
  );
  const playlistTrackIds = playlistTracks.map((track) => track.id);
  const trackIds = tracks.map((track) => track.id);

  const trackFeatures = await Api.GetMultipleAudioFeatures(trackIds);
  const playlistTrackFeatures = await Api.GetMultipleAudioFeatures(
    playlistTrackIds
  );

  const featureTrackArtists: { [key: string]: string[] } = {};
  tracks.forEach(
    (track) => (featureTrackArtists[track.id] = track.artists.map((a) => a.id))
  );

  const featureScores: { score: number; id: string; uri: string }[] = [];
  for (const trackFeature of trackFeatures) {
    let score = 0;
    for (const playlistTrackFeature of playlistTrackFeatures) {
      score += calculateAudioFeaturesMSQR(trackFeature, playlistTrackFeature);
    }
    featureScores.push({
      score: score,
      id: trackFeature.id,
      uri: trackFeature.uri,
    });
  }
  featureScores.sort((a, b) => a.score - b.score);

  const resultTrackUris: string[] = featureScores.map((score) => score.uri);

  await Api.CreatePlaylistFromTracks(
    `Songs based on ${artist.name}`,
    false,
    resultTrackUris
  );
}
