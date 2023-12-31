import React, { useEffect, useState } from "react";
import Api from "../Api";
import "./FromSong.css";
import api from "../Api";
import { OptionList } from "../components/OptionList";
import { TabDiv } from "../components/TabDiv";
import { spotifyDefaultOptions, SpotifyOption } from "../data/SpotifyOption";
import { PlaylistList } from "../components/PlaylistList";
import { SpotifyPlaylistTrackList } from "../components/TrackList";
import { useTranslation } from "react-i18next";
import { CreatePlaylistFromTrack } from "../CreatePlaylist";

export function FromSong() {
  const { t } = useTranslation();

  const [playlistTracks, setPlaylistTracks] = useState<
    SpotifyApi.TrackObjectFull[]
  >([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    SpotifyApi.PlaylistObjectSimplified | undefined
  >(undefined);
  const [selectedTrack, setSelectedTrack] = useState<
    SpotifyApi.TrackObjectFull | undefined
  >(undefined);
  const [selectedTrackStats, setSelectedTrackStats] = useState<
    SpotifyApi.AudioFeaturesObject | undefined
  >(undefined);
  const [calculationStatus, setCalculationStatus] = useState(false);
  const [options, setOptions] = useState<SpotifyOption[]>([]);
  const [hoveredOption, setHoveredOption] = useState<SpotifyOption | undefined>(
    undefined
  );

  useEffect(() => {
    if (selectedPlaylist) {
      Api.GetPlaylistTracks(selectedPlaylist.id)
        .then(Api.ExtractTracksFromPlaylist)
        .then(setPlaylistTracks);
    } else {
      setPlaylistTracks([]);
    }
  }, [selectedPlaylist]);

  useEffect(() => {
    setSelectedTrack(undefined);
  }, [selectedPlaylist]);

  useEffect(() => {
    if (selectedTrack) {
      api.GetTrackAnalysis(selectedTrack.id).then(setSelectedTrackStats);
    } else {
      setSelectedTrackStats(undefined);
    }
  }, [selectedTrack]);

  useEffect(() => {
    if (selectedTrackStats) {
      setOptions(spotifyDefaultOptions(selectedTrackStats));
    } else {
      setOptions([]);
    }
  }, [selectedTrackStats]);

  function toggleOptions(optionsToChange: SpotifyOption[], enabled: boolean) {
    const copy: SpotifyOption[] = [];
    const optionsToChangeNames = optionsToChange.map((option) => option.name);
    for (const option of options) {
      if (optionsToChangeNames.includes(option.name)) {
        option.enabled = enabled;
      }
      copy.push(option);
    }
    setOptions(copy);
  }

  function setOptionValue(optionToChange: SpotifyOption, value: string) {
    const copy: SpotifyOption[] = [];
    for (const option of options) {
      if (option.name === optionToChange.name) {
        option.value = parseFloat(value);
      }
      copy.push(option);
    }
    setOptions(copy);
  }

  async function calculate() {
    if (!selectedTrack) return;

    setCalculationStatus(true);
    await CreatePlaylistFromTrack(selectedTrack, playlistTracks, options);
    setCalculationStatus(false);
  }

  function resetSelectedOptions(optionsToReset: SpotifyOption[]) {
    // TODO use structuredClone to full reset
    if (selectedTrackStats === undefined) return;

    const optionsCopy = Array.from(options);
    const names = new Set(optionsToReset.map((option) => option.name));
    const defaultOptions = spotifyDefaultOptions(selectedTrackStats);

    for (const option of defaultOptions) {
      if (names.has(option.name)) {
        for (let i = 0; i < optionsCopy.length; i++) {
          if (optionsCopy[i].name === option.name) {
            optionsCopy[i] = option;
          }
        }
      }
    }
    setOptions(optionsCopy);
  }

  const nonAdvancedOptions = options.filter((option) => !option.advanced);
  const nonAdvancedCount = nonAdvancedOptions.filter(
    (option) => option.enabled
  ).length;
  const advancedOptions = options.filter((option) => option.advanced);
  const advancedCount = advancedOptions.filter(
    (option) => option.enabled
  ).length;
  const enabledCount = advancedCount + nonAdvancedCount;

  // TODO create infobox component
  let infoTitle = "";
  let infoDescription: string[] = [];
  // If no track selected, show how to use.
  if (selectedTrack === undefined) {
    infoTitle = t("FromSong.howToUse.title");
    infoDescription = [
      t("FromSong.howToUse.description1"),
      t("FromSong.howToUse.description2"),
    ];
  }
  // If a track is selected and the user hovers over an option, show option description
  else if (hoveredOption !== undefined) {
    infoTitle = hoveredOption.display_name;
    infoDescription = [hoveredOption.description];
  }
  // If a track is selected and the user doesn't hover over an option, warn them if they have no option enabled
  else if (enabledCount === 0) {
    infoTitle = t("FromSong.warningNoneSelected.title");
    infoDescription = [t("FromSong.warningNoneSelected.description")];
  }

  return (
    <div className="page">
      {/* Playlist selection */}
      <div className="page-block w-33">
        <PlaylistList
          onClick={setSelectedPlaylist}
          selectedPlaylist={selectedPlaylist}
          columnCount={1}
        />
      </div>

      {/* Song selection */}
      <div className="page-block w-33">
        <SpotifyPlaylistTrackList
          playlist={selectedPlaylist}
          onClick={setSelectedTrack}
          selectedTrack={selectedTrack}
          tracks={playlistTracks}
          refreshFunction={() => {
            if (selectedPlaylist) {
              Api.GetPlaylistTracks(selectedPlaylist.id)
                .then(Api.ExtractTracksFromPlaylist)
                .then(setPlaylistTracks);
            }
          }}
        />
      </div>

      {/* Options */}
      <div className="page-block w-33 from-song-data-div">
        {selectedTrack && (
          <div>
            <div className={"h-80px flex-col flex-center-around"}>
              <button
                onClick={calculate}
                disabled={calculationStatus}
                className={"button-dark"}
              >
                {calculationStatus ? "Calculating..." : "Create Playlist"}
              </button>
            </div>
            <div className={"from-song-info-table-div"}>
              <TabDiv
                names={[
                  `Normal (${nonAdvancedCount})`,
                  `Advanced (${advancedCount})`,
                ]}
                className={"w-100 h-100"}
              >
                <OptionList
                  options={nonAdvancedOptions}
                  onHover={setHoveredOption}
                  toggleOptions={toggleOptions}
                  setValue={setOptionValue}
                  resetOptions={resetSelectedOptions}
                />
                <OptionList
                  options={advancedOptions}
                  onHover={setHoveredOption}
                  toggleOptions={toggleOptions}
                  setValue={setOptionValue}
                  resetOptions={resetSelectedOptions}
                />
              </TabDiv>
            </div>
          </div>
        )}

        <div className={"from-song-option-description"}>
          <h1 className={"font-large"}>{infoTitle}</h1>
          {infoDescription.map((description) => (
            <p>{description}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
