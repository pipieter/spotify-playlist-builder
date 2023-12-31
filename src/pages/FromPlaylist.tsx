import { useEffect, useState } from "react";
import Api from "../Api";

import "./FromPlaylist.css";
import { PlaylistList } from "../components/PlaylistList";
import { useTranslation } from "react-i18next";
import { CreatePlaylistFromPlaylist } from "../CreatePlaylist";

export function FromPlaylist() {
  const { t } = useTranslation();

  const [playlists, setPlaylists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    SpotifyApi.PlaylistObjectSimplified | undefined
  >(undefined);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    Api.GetCurrentUserPlaylists().then(setPlaylists);
  }, []);

  async function calculate() {
    if (selectedPlaylist) {
      setCalculating(true);
      await CreatePlaylistFromPlaylist(selectedPlaylist);
      setCalculating(false);
    }
  }

  return (
    <div className={"page"}>
      <div className={"page-block w-66"}>
        {playlists && (
          <PlaylistList
            onClick={setSelectedPlaylist}
            columnCount={3}
            selectedPlaylist={selectedPlaylist}
          />
        )}
      </div>
      <div className={"page-block w-33 flex-col"}>
        <div className={"justify padding-16"}>
          <h1 className={"font-large"}>{t("FromPlaylist.howToUse.title")}</h1>
          <p>{t("FromPlaylist.howToUse.description")}</p>
        </div>
        <div className={"flex-col flex-center-around w-100"}>
          <button
            disabled={calculating || selectedPlaylist === undefined}
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
