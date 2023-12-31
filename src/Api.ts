import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import Config from "./Config";
import { sleep } from "./util/util";

export interface TrackDetails {
  track: SpotifyApi.TrackObjectFull;
  features: SpotifyApi.AudioFeaturesObject;
  artists: SpotifyApi.ArtistObjectFull[];
}

// TODO more error handling and format asserts

class Api {
  instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: Config.GetSpotifyApiUrl(),
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.instance.interceptors.request.use((config) => {
      if (!config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer  ${this.GetAccessToken()}`;
      }
      return config;
    });

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error.response?.status;

        if (status === 401) {
          const refreshToken = this.GetRefreshToken();
          if (!refreshToken) {
            // eslint-disable-next-line no-console
            console.error(
              "Error: API request sent without a refresh token. This should mean the user is not logged in."
            );
            return undefined;
          }
          const { access_token } = await this.RefreshSpotifyAccessToken(
            refreshToken
          );
          if (!access_token) {
            // eslint-disable-next-line no-console
            console.error("Error: Could not retrieve access token");
            return undefined;
          }

          this.SetAccessToken(access_token);
          error.config.headers["Authorization"] = `Bearer  ${access_token}`;
          error.config.baseURL = undefined;
          return this.instance.request(error.config);
        }

        if (status === 429) {
          // eslint-disable-next-line no-console
          console.log("Hit spotify timeout limit, waiting 30 seconds...");
          await sleep(30_000);
          return this.instance.request(error.config);
        }

        return Promise.reject(error);
      }
    );
  }

  SpotifyLoginUrl(): string {
    const scopes = [
      "playlist-read-private",
      "playlist-read-collaborative",
      "playlist-modify-public",
      "playlist-modify-private",
      "user-top-read",
      "user-library-read",
      "user-read-playback-position",
    ];
    const scope = scopes.join(" ");
    const query = `client_id=${Config.GetSpotifyClientId()}&redirect_uri=${Config.GetRedirectUrl()}&response_type=code&scope=${scope}`;
    return `${Config.GetSpotifyAuthUrl()}?${query}`;
  }

  protected async Get<T>(path: string): Promise<T | undefined> {
    try {
      const response = await this.instance.get(path);
      if (response === undefined) {
        return undefined;
      }
      return response.data as T;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(`Axios ${error.status} error: ${error.cause}`);
      } else {
        console.log(error);
      }
      return undefined;
    }
  }

  protected async GetPaginated<T>(path: string): Promise<T[]> {
    const results: T[] = [];
    let next: string | null = path;
    while (next !== null) {
      const response = (await this.instance.get(next)) as
        | AxiosResponse<SpotifyApi.PagingObject<T>>
        | undefined;
      if (response === undefined || response.data === undefined) {
        return [];
      }
      results.push(...response.data.items);
      next = response.data.next;
    }
    return results;
  }

  protected async Post<T>(path: string, data: unknown): Promise<T | undefined> {
    const response = await this.instance.post(path, data);
    if (response === undefined) {
      return undefined;
    }
    return response.data as T;
  }

  async GetUserInfo(): Promise<SpotifyApi.UserObjectPublic | undefined> {
    return this.Get<SpotifyApi.UserObjectPublic>("me");
  }

  async GetUserPlaylists(
    userId: string
  ): Promise<SpotifyApi.PlaylistObjectSimplified[]> {
    return this.GetPaginated<SpotifyApi.PlaylistObjectSimplified>(
      `/users/${userId}/playlists?limit=50&offset=0`
    );
  }

  async GetCurrentUserPlaylists(): Promise<
    SpotifyApi.PlaylistObjectSimplified[]
  > {
    const user = await this.GetUserInfo();
    if (user === undefined) {
      return [];
    }
    return this.GetUserPlaylists(user.id);
  }

  async GetSearchTracks(query: string): Promise<SpotifyApi.TrackObjectFull[]> {
    const results: SpotifyApi.TrackObjectFull[] = [];
    let next: string | null = `/search?type=track&limit=50&q=${query}`;
    while (next !== null) {
      const response: SpotifyApi.TrackSearchResponse | undefined =
        await this.Get<SpotifyApi.TrackSearchResponse>(next);
      if (response === undefined) {
        return [];
      }
      results.push(...response.tracks.items);
      next = response.tracks.next;
    }
    return results;
  }

  async GetPlaylistTracks(
    playlistId: string
  ): Promise<SpotifyApi.PlaylistTrackObject[]> {
    return this.GetPaginated<SpotifyApi.PlaylistTrackObject>(
      `/playlists/${playlistId}/tracks?limit=50&offset=0`
    );
  }

  async GetPlaylistTrackIds(playlistId: string): Promise<string[]> {
    const tracks = await this.GetPlaylistTracks(playlistId).then(
      this.ExtractTracksFromPlaylist
    );
    return tracks.map((track) => track.id);
  }

  ExtractTracksFromPlaylist(
    playlistTracks: SpotifyApi.PlaylistTrackObject[]
  ): SpotifyApi.TrackObjectFull[] {
    const tracks: SpotifyApi.TrackObjectFull[] = [];
    for (const trackObject of playlistTracks) {
      const track = trackObject.track;
      if (track) {
        tracks.push(track);
      }
    }
    return tracks;
  }

  async GetArtists(
    artistIds: string[]
  ): Promise<SpotifyApi.ArtistObjectFull[]> {
    let nextIds = artistIds.splice(0, 20);
    const result: SpotifyApi.ArtistObjectFull[] = [];
    while (nextIds.length > 0) {
      const response = await this.Get<SpotifyApi.MultipleArtistsResponse>(
        `/artists?ids=${nextIds.join(",")}`
      );
      if (response === undefined) {
        return [];
      }
      result.push(...response.artists);
      nextIds = artistIds.splice(0, 20);
    }
    return result;
  }

  async GetRecommendations(
    artists: string[],
    tracks: string[],
    genres: string[],
    options: { name: string; value: string | number }[] = [],
    count = 100
  ): Promise<SpotifyApi.RecommendationTrackObject[]> {
    console.assert(artists.length + tracks.length + genres.length <= 5);

    // Get recommendations
    const artistSeeds = artists.join(",");
    const trackSeeds = tracks.join(",");
    const genreSeeds = genres.join(",");
    const optionsString = options
      .map((option) => `${option.name}=${option.value}`)
      .join("&");
    const url = `/recommendations?limit=${count}&seed_artists=${artistSeeds}&seed_genres=${genreSeeds}&seed_tracks=${trackSeeds}&${optionsString}`;

    const response =
      await this.Get<SpotifyApi.RecommendationsFromSeedsResponse>(url);
    if (response === undefined) {
      return [];
    }
    return response.tracks;
  }

  async CreatePlaylist(
    name: string,
    isPublic: boolean
  ): Promise<SpotifyApi.CreatePlaylistResponse | undefined> {
    // Create a playlist
    const user = await this.GetUserInfo();
    if (user === undefined) {
      return undefined;
    }
    return this.Post<SpotifyApi.CreatePlaylistResponse>(
      `/users/${user.id}/playlists`,
      {
        name: name,
        public: isPublic,
      }
    );
  }

  async AddTracksToPlaylist(
    playlistId: string,
    trackUris: string[]
  ): Promise<SpotifyApi.PlaylistTrackResponse | undefined> {
    if (trackUris.length === 0) {
      return undefined;
    }
    return this.Post<SpotifyApi.PlaylistTrackResponse>(
      `/playlists/${playlistId}/tracks`,
      {
        uris: trackUris,
      }
    );
  }

  async CreatePlaylistFromTracks(
    name: string,
    isPublic: boolean,
    trackUris: string[]
  ): Promise<SpotifyApi.CreatePlaylistResponse | undefined> {
    const playlist = await this.CreatePlaylist(name, isPublic);
    if (playlist === undefined) {
      return undefined;
    }
    await this.AddTracksToPlaylist(playlist.id, trackUris);
    return playlist;
  }

  async GetMultipleAudioFeatures(
    trackIds: string[]
  ): Promise<SpotifyApi.AudioFeaturesObject[]> {
    const features: SpotifyApi.AudioFeaturesObject[] = [];
    while (trackIds.length > 0) {
      const tracksToRequest = trackIds.splice(0, 100);
      const url = `/audio-features?ids=${tracksToRequest.join(",")}`;
      const response = await this.Get<SpotifyApi.MultipleAudioFeaturesResponse>(
        url
      );
      if (response === undefined) {
        return [];
      }
      features.push(...response.audio_features);
    }
    return features;
  }

  async GetTrackAnalysis(
    trackId: string
  ): Promise<SpotifyApi.AudioFeaturesResponse | undefined> {
    return await this.Get<SpotifyApi.AudioFeaturesResponse>(
      `/audio-features/${trackId}`
    );
  }

  async GetPlaylistDetailedStatistics(
    playlistId: string
  ): Promise<TrackDetails[]> {
    const tracks = this.ExtractTracksFromPlaylist(
      await this.GetPlaylistTracks(playlistId)
    );
    const trackIds = tracks.map((track) => track.id);
    const analyses = await this.GetMultipleAudioFeatures(trackIds);
    const artistIds = tracks
      .flatMap((track) => track.artists)
      .map((artist) => artist.id);
    const artists = await this.GetArtists(Array.from(new Set(artistIds)));

    const analysesObject: { [key: string]: SpotifyApi.AudioFeaturesObject } =
      {};
    const artistsObject: { [key: string]: SpotifyApi.ArtistObjectFull } = {};
    analyses.forEach((analysis) => (analysesObject[analysis.id] = analysis));
    artists.forEach((artist) => (artistsObject[artist.id] = artist));

    const trackDetails: TrackDetails[] = [];
    for (const track of tracks) {
      const trackAnalysis = analysesObject[track.id];
      const trackArtists = track.artists.map(
        (artist) => artistsObject[artist.id]
      );
      trackDetails.push({
        artists: trackArtists,
        features: trackAnalysis,
        track: track,
      });
    }
    return trackDetails;
  }

  async GetTracks(trackIds: string[]): Promise<SpotifyApi.TrackObjectFull[]> {
    const tracks = [];
    while (trackIds.length > 0) {
      const tracksToRequest = trackIds.splice(0, 50);
      const tracksString = tracksToRequest.join(",");
      const tracksResult: SpotifyApi.MultipleTracksResponse | undefined =
        await this.Get(`/tracks?ids=${tracksString}`);
      if (tracksResult) {
        tracks.push(...tracksResult.tracks);
      }
    }
    return tracks;
  }

  SetRefreshToken(refreshToken: string): void {
    localStorage.setItem("spotifyRefreshToken", refreshToken);
  }

  GetRefreshToken(): string | null {
    return localStorage.getItem("spotifyRefreshToken");
  }

  GetAccessToken(): string | null {
    return localStorage.getItem("spotifyAccessToken");
  }

  SetAccessToken(token: string): void {
    localStorage.setItem("spotifyAccessToken", token);
  }

  async RetrieveSpotifyCredentials(
    authorizationCode: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    const response = await axios.post(Config.GetSpotifyTokenUrl(), null, {
      params: {
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: Config.GetRedirectUrl(),
        client_id: Config.GetSpotifyClientId(),
        client_secret: Config.GetSpotifyClientSecret(),
      },
    });

    const { access_token, refresh_token } = response.data;
    return { access_token, refresh_token };
  }

  async RefreshSpotifyAccessToken(
    refreshToken: string
  ): Promise<{ access_token: string }> {
    const response = await axios.post(Config.GetSpotifyTokenUrl(), null, {
      params: {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        redirect_uri: Config.GetRedirectUrl(),
        client_id: Config.GetSpotifyClientId(),
        client_secret: Config.GetSpotifyClientSecret(),
      },
    });
    const { access_token } = response.data;
    return { access_token };
  }

  public UserIsLoggedIn() {
    return this.GetRefreshToken() !== null;
  }

  public Logout() {
    localStorage.removeItem("spotifyRefreshToken");
    localStorage.removeItem("spotifyAccessToken");
  }
}

export default new Api();
