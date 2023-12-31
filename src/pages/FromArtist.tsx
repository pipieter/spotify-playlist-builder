import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PlaylistList } from "../components/PlaylistList";
import Api from "../Api";
import { GenericList } from "../components/GenericList";
import { ArtistListItem } from "../components/ListItem";
import { CreatePlaylistFromArtist } from "../CreatePlaylist";

export function FromArtist() {
  const { t } = useTranslation();

  const [selectedPlaylist, setSelectedPlaylist] = useState<
    SpotifyApi.PlaylistObjectSimplified | undefined
  >(undefined);
  const [artists, setArtists] = useState<SpotifyApi.ArtistObjectFull[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<
    SpotifyApi.ArtistObjectFull | undefined
  >(undefined);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    setSelectedArtist(undefined);
    if (selectedPlaylist) {
      Api.GetPlaylistTracks(selectedPlaylist.id)
        .then((tracks) => {
          const artistIds = tracks.flatMap(
            (track) => track.track?.artists.map((artist) => artist.id) || []
          );
          const uniqueArtistIds = Array.from(new Set(artistIds));
          return Api.GetArtists(uniqueArtistIds);
        })
        .then((artists) => {
          const sortedArtists = artists.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setArtists(sortedArtists);
        });
    } else {
      setArtists([]);
    }
  }, [selectedPlaylist]);

  async function calculate() {
    if (selectedPlaylist && selectedArtist) {
      setCalculating(true);
      await CreatePlaylistFromArtist(selectedArtist, selectedPlaylist);
      setCalculating(false);
    }
  }

  return (
    <div className="page">
      {/* Playlists */}
      <div className="page-block w-33">
        <PlaylistList
          onClick={setSelectedPlaylist}
          selectedPlaylist={selectedPlaylist}
          columnCount={1}
        />
      </div>

      {/* Artists */}
      <div className="page-block w-33">
        <GenericList<SpotifyApi.ArtistObjectFull>
          itemFunction={(entry, selected) => (
            <ArtistListItem
              artist={entry}
              selected={entry.id === selected?.id}
            />
          )}
          entries={artists}
          selectedEntry={selectedArtist}
          filterFunction={(artist, query) =>
            artist.name.toLowerCase().includes(query.toLocaleLowerCase())
          }
          onClick={setSelectedArtist}
        />
      </div>

      {/* Create */}
      <div className={"page-block w-33 flex-col"}>
        <div className={"justify padding-16"}>
          <h1 className={"font-large"}>{t("FromArtist.howToUse.title")}</h1>
          <p>{t("FromArtist.howToUse.description")}</p>
        </div>
        <div className={"flex-col flex-center-around w-100"}>
          <button
            className="button-dark"
            disabled={calculating || !selectedArtist || !selectedPlaylist}
            onClick={calculate}
          >
            {calculating ? "Calculating..." : "Create Playlist"}
          </button>
        </div>
      </div>
    </div>
  );
}

/*

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
    if (selectedGenre && selectedPlaylist) {
      setCalculating(true);
      await CreatePlaylistFromGenre(selectedGenre, selectedPlaylist);
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
              subtitle={""}
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
            disabled={
              calculating ||
              selectedGenre === undefined ||
              selectedPlaylist === undefined
            }
            onClick={calculate}
            className={"button-dark"}
          >
            {calculating ? "Calculating..." : "Create Playlist"}
          </button>
        </div>
      </div>
    </div>
  );
*/
