import { useEffect, useState } from "react";
import Api from "../Api";
import { PlaylistListItem } from "./ListItem";
import { GenericList } from "./GenericList";

function playlistFilter(
  entry: SpotifyApi.PlaylistObjectSimplified,
  query: string
): boolean {
  return entry.name.toLowerCase().includes(query.toLowerCase());
}

export function PlaylistList(props: {
  onClick: (playlist: SpotifyApi.PlaylistObjectSimplified | undefined) => void;
  selectedPlaylist: SpotifyApi.PlaylistObjectSimplified | undefined;
  columnCount: number;
}) {
  const { selectedPlaylist, onClick, columnCount } = props;

  const [playlists, setPlaylists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);

  useEffect(() => {
    Api.GetCurrentUserPlaylists().then(setPlaylists);
  }, []);

  return (
    <GenericList<SpotifyApi.PlaylistObjectSimplified>
      columnCount={columnCount}
      itemFunction={(entry, selected) => (
        <PlaylistListItem
          playlist={entry}
          selected={entry.id === selected?.id}
        />
      )}
      filterFunction={playlistFilter}
      entries={playlists}
      selectedEntry={selectedPlaylist}
      onClick={onClick}
      refreshFunction={() => Api.GetCurrentUserPlaylists().then(setPlaylists)}
    />
  );
}
