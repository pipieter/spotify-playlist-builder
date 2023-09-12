import React, { useEffect, useState } from "react";
import Api from "../Api";
import { GenericList } from "./GenericList";
import { TrackListItem } from "./ListItem";

function trackFilter(entry: SpotifyApi.TrackObjectFull, query: string) {
  const name = entry.name.toLowerCase().includes(query.toLowerCase());
  const artists = entry.artists.map((artist) =>
    artist.name.toLowerCase().includes(query.toLowerCase())
  );
  return name || artists.some((a) => a);
}

export function SpotifyPlaylistTrackList(props: {
  playlist: SpotifyApi.PlaylistObjectSimplified | undefined;
  onClick: (playlist: SpotifyApi.TrackObjectFull | undefined) => void;
  selectedTrack: SpotifyApi.TrackObjectFull | undefined;
  tracks?: SpotifyApi.TrackObjectFull[];
  refreshFunction?: () => void;
}) {
  const { playlist, onClick, selectedTrack, refreshFunction } = props;

  const [tracks, setTracks] = useState<SpotifyApi.TrackObjectFull[]>([]);

  useEffect(() => {
    if (props.tracks !== undefined) {
      setTracks(props.tracks);
    } else if (playlist) {
      Api.GetPlaylistTracks(playlist.id)
        .then(Api.ExtractTracksFromPlaylist)
        .then(setTracks);
    } else {
      setTracks([]);
    }
  }, [playlist, props]);

  return (
    <GenericList<SpotifyApi.TrackObjectFull>
      columnCount={1}
      itemFunction={(entry, selected) => (
        <TrackListItem track={entry} selected={entry.id === selected?.id} />
      )}
      filterFunction={trackFilter}
      entries={tracks}
      selectedEntry={selectedTrack}
      onClick={onClick}
      refreshFunction={refreshFunction}
    />
  );
}
