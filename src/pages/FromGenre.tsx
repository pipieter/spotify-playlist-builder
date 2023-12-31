import { useState } from "react";
import { PlaylistList } from "../components/PlaylistList";

import "./FromGenre.css";
import { capitalize } from "../util/util";
import { GenericList } from "../components/GenericList";
import { ListItem } from "../components/ListItem";
import EveryNoiseGenres from "../data/Genres";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CreatePlaylistFromGenre } from "../CreatePlaylist";

export function FromGenre() {
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
}
