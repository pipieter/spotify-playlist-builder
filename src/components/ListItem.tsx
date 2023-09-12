import "./ListItem.css";
import React from "react";

export function TrackListItem(props: {
  track: SpotifyApi.TrackObjectFull;
  selected: boolean;
}) {
  const { track, selected } = props;
  const artists = track.artists.map((artist) => artist.name).join(", ") || "";
  return (
    <ListItem
      title={track.name}
      user={artists}
      image={track.album.images[0].url || "logo256.png"}
      selected={selected}
    />
  );
}

export function ArtistListItem(props: {
  artist: SpotifyApi.ArtistObjectFull;
  selected: boolean;
}) {
  const { artist, selected } = props;
  return (
    <ListItem
      title={artist.name}
      user={""}
      image={artist.images[0].url || "logo256.png"}
      selected={selected}
    />
  );
}

export function PlaylistListItem(props: {
  playlist: SpotifyApi.PlaylistObjectSimplified;
  selected: boolean;
}) {
  const { playlist, selected } = props;
  return (
    <ListItem
      title={playlist.name}
      user={playlist.owner?.display_name || ""}
      image={playlist.images[0].url || "logo256.png"}
      selected={selected}
    />
  );
}

export function ListItem(props: {
  title: string;
  user: string;
  image: string;
  selected: boolean;
}) {
  const { title, user, image, selected } = props;

  return (
    <div className={`list-item ${selected && "selected"}`}>
      <div className="w-100 h-100">
        {image.length > 0 && (
          <img src={image} className={"list-item-image"} alt=""></img>
        )}
      </div>
      <div className="no-pad list-item-data">
        <p className="no-pad list-item-name">{title}</p>
        <p className="no-pad list-item-user">{user}</p>
      </div>
    </div>
  );
}
