# Spotify Playlist Builder

Website to create Spotify playlists based on a user's already built playlists. These playlists can be based on
pre-existing playlists, on songs within playlists, or genres that Spotify supports.

## Running the application

### Requirements:

In order for the application to be run, you will need
to [create a Spotify App](https://developer.spotify.com/documentation/web-api/concepts/apps) and define the following
environment variables:

- `REACT_APP_SPOTIFY_CLIENT_ID` - The client id of the app.
- `REACT_APP_SPOTIFY_CLIENT_SECRET` - The client secret of the app.
- `REACT_APP_REDIRECT_URL` - The redirect URL for the app.

A .env.example file has been prepared.

### Starting a server:

In the project directory, you can run

```
npm install
npm start
```

which will run the app locally on URL [http://localhost:3000/](http://localhost:3000/).

### Building the application:

You can build a static version of the application using

```
npm install
npm run build
```
