class Config {
  private readonly envParams: { [key: string]: string | undefined };
  constructor() {
    this.envParams = {
      // Secrets
      SPOTIFY_CLIENT_ID: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
      // Urls
      REDIRECT_URL: process.env.REACT_APP_REDIRECT_URL,
    };

    for (const paramName of Object.keys(this.envParams)) {
      if (this.envParams[paramName] === undefined) {
        throw new Error(`${paramName} not set in .env`);
      }
    }
  }

  GetSpotifyApiUrl() {
    return "https://api.spotify.com/v1";
  }

  GetSpotifyAuthUrl() {
    return "https://accounts.spotify.com/authorize";
  }

  GetSpotifyTokenUrl() {
    return "https://accounts.spotify.com/api/token";
  }

  GetGitHubUrl() {
    return "https://github.com/pipieter/spotify-playlist-builder";
  }

  GetSpotifyClientId() {
    return this.envParams["SPOTIFY_CLIENT_ID"] || "";
  }

  GetSpotifyClientSecret() {
    return this.envParams["SPOTIFY_CLIENT_SECRET"] || "";
  }

  GetRedirectUrl() {
    return this.envParams["REDIRECT_URL"] || "";
  }
}

export default new Config();
