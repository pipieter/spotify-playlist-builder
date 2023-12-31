import "./DataOverview.css";

import { useEffect, useState } from "react";
import Api from "../Api";
import { ListItem } from "../components/ListItem";
import { GenericList } from "../components/GenericList";
import { FilterBox } from "../components/FilterBox";
import { SelectElement } from "../components/html/SelectElement";
import { DateElement } from "../components/html/DateElement";
import { msToTime } from "../util/util";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface StreamingRawData {
  ts: string;
  username: string;
  platform: string;
  ms_played: number;
  conn_country: string;
  ip_addr_decrypted: string;
  user_agent_decrypted: string;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string;
  episode_name: string | null;
  episode_show_name: string | null;
  spotify_episode_uri: string | null;
  reason_start: string;
  reason_end: string;
  shuffle: boolean | null;
  skipped: boolean | null;
  offline: boolean | null;
  offline_timestamp: number;
  incognito_mode: boolean | null;
}

interface StreamingTrackSummary {
  uri: string;
  name: string;
  totalTimesPlayed: number;
  totalMsPlayed: number;
}

interface StreamingDataFile {
  name: string;
  data: StreamingRawData[];
}

interface StreamingTrackSummaryWithTrack {
  track: SpotifyApi.TrackObjectFull | undefined;
  totalTimesPlayed: number;
  totalMsPlayed: number;
}

enum OrderByField {
  time = "Hours Listened",
  count = "Times listened",
  alpha = "Alphabetically",
}

enum OrderDirection {
  ascending = "Ascending",
  descending = "Descending",
}

function visualizeData(data: StreamingTrackSummaryWithTrack) {
  const time = msToTime(data.totalMsPlayed);

  const name = data.track?.name || "";
  const subtitle = `${time} - ${data.totalTimesPlayed} times`;
  const image = data.track?.album.images[0].url || "logo256.png";

  return (
    <ListItem title={name} subtitle={subtitle} image={image} selected={false} />
  );
}

async function getTopSummaries(
  streamingData: StreamingRawData[],
  filter: string,
  orderField: OrderByField,
  orderDirection: OrderDirection,
  startDate: Date,
  endDate: Date,
  page: number
): Promise<{
  tracks: StreamingTrackSummaryWithTrack[];
  page: number;
  pageCount: number;
}> {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  const filteredEntries = streamingData.filter((entry) => {
    const has_uri = entry.spotify_track_uri !== null;
    const matches_filter = entry.master_metadata_track_name
      ?.toLowerCase()
      .includes(filter.toLowerCase());

    const dataTime = new Date(entry.ts).getTime();
    const inbetween_time = startTime <= dataTime && dataTime && endTime;

    return has_uri && matches_filter && inbetween_time;
  });

  // TODO use better name
  const uris = new Set<string>();
  const names: { [key: string]: string } = {};
  const totalTimesPlayed: { [key: string]: number } = {};
  const totalMsPlayed: { [key: string]: number } = {};

  const entries: StreamingTrackSummary[] = [];

  for (const entry of filteredEntries) {
    const uri = entry.spotify_track_uri;
    uris.add(uri);
    names[uri] = names[uri] || entry.master_metadata_track_name || "";
    totalTimesPlayed[uri] = (totalTimesPlayed[uri] || 0) + 1;
    totalMsPlayed[uri] = (totalMsPlayed[uri] || 0) + entry.ms_played;
  }
  for (const uri of uris) {
    entries.push({
      uri: uri,
      name: names[uri] || "",
      totalMsPlayed: totalMsPlayed[uri] || 0,
      totalTimesPlayed: totalTimesPlayed[uri] || 0,
    });
  }

  switch (orderField) {
    case OrderByField.time:
      entries.sort((a, b) => b.totalMsPlayed - a.totalMsPlayed);
      break;
    case OrderByField.count:
      entries.sort((a, b) => b.totalTimesPlayed - a.totalTimesPlayed);
      break;
    case OrderByField.alpha:
      entries.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  if (orderDirection == OrderDirection.ascending) {
    entries.reverse();
  }

  const pageCount = Math.ceil(entries.length / 50);
  const top = entries.splice(page * 50, 50);
  const trackIds = top.map((t) => t.uri.replace("spotify:track:", ""));
  const tracks = await Api.GetTracks(trackIds);

  const trackMap = new Map<string, SpotifyApi.TrackObjectFull>();
  for (const track of tracks) {
    trackMap.set(track.uri, track);
  }
  const summaries: StreamingTrackSummaryWithTrack[] = [];
  for (const t of top) {
    summaries.push({
      track: trackMap.get(t.uri),
      totalMsPlayed: t.totalMsPlayed,
      totalTimesPlayed: t.totalTimesPlayed,
    });
  }
  return { tracks: summaries, page: page, pageCount: pageCount };
}

function getLatestDate(data: StreamingRawData[]) {
  return Math.max(...data.map((d) => new Date(d.ts).getTime()));
}

export function DataOverview() {
  const { t } = useTranslation();

  const [files, setFiles] = useState<StreamingDataFile[]>([]);
  // TODO remove this
  const [streamingData, setStreamingData] = useState<StreamingRawData[]>([]);
  const [page, setPage] = useState(0);
  const [topEntries, setTopEntries] = useState<{
    tracks: StreamingTrackSummaryWithTrack[];
    page: number;
    pageCount: number;
  }>({ tracks: [], page: 0, pageCount: 0 });
  const [filter, setFilter] = useState("");
  const [orderField, setOrderField] = useState<OrderByField>(OrderByField.time);
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(
    OrderDirection.descending
  );
  const [startDate, setStartDate] = useState<Date>(new Date(2000, 1, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedTrack, setSelectedTrack] = useState<
    StreamingTrackSummaryWithTrack | undefined
  >(undefined);

  useEffect(() => {
    setStreamingData(files.map((f) => f.data).flat());
  }, [files]);

  useEffect(() => {
    getTopSummaries(
      streamingData,
      filter,
      orderField,
      orderDirection,
      startDate,
      endDate,
      page
    ).then(setTopEntries);
  }, [
    streamingData,
    filter,
    orderField,
    orderDirection,
    startDate,
    endDate,
    page,
  ]);

  useEffect(() => {
    setPage(0);
  }, [streamingData, filter, orderField, orderDirection, startDate, endDate]);

  function setDatesAllTime() {
    setStartDate(new Date(2000, 1, 1));
    setEndDate(new Date(getLatestDate(streamingData)));
  }

  function setDatesLastYear() {
    const yearAgo = new Date(getLatestDate(streamingData));
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    setStartDate(yearAgo);
    setEndDate(new Date(getLatestDate(streamingData)));
  }

  function setDatesLastMonth() {
    const monthAgo = new Date(getLatestDate(streamingData));
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    setStartDate(monthAgo);
    setEndDate(new Date(getLatestDate(streamingData)));
  }

  async function addFiles(input: React.ChangeEvent<HTMLInputElement>) {
    const filesToAdd: StreamingDataFile[] = [];

    const inputFiles = input.target.files || new FileList();
    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles.item(i);
      if (file) {
        try {
          const contents = await file.text();
          const data = JSON.parse(contents) as StreamingRawData[];
          filesToAdd.push({
            name: file.name,
            data: data,
          });
        } catch (_) {
          console.log(`Error reading ${file.name}. Skipping...`);
        }
      }
    }
    const newFiles = files.concat(filesToAdd);
    newFiles.sort((a, b) => a.name.localeCompare(b.name));
    setFiles(newFiles);
  }

  async function removeFile(index: number) {
    files.splice(index, 1);
    setFiles([...files]);
  }

  return (
    <div className="page">
      {/* Upload files */}
      <div className="page-block w-33 flex-col">
        <div className="file-item-list">
          {files.map((f, i) => (
            <div className="file-item">
              <div className="file-item-text">{f.name}</div>
              <div className="file-item-delete" onClick={() => removeFile(i)}>
                x
              </div>
            </div>
          ))}
        </div>
        <label className="data-overview-input">
          +
          <input type="file" onChange={addFiles} multiple accept=".json" />
        </label>
      </div>
      {/* Filters */}
      <div className="page-block w-33 flex-col">
        <div>
          <FilterBox filterFunction={setFilter} />
        </div>
        <hr className="w-90" />
        <div className="flex-left pad-left-5">
          <h1 className={"font-large"}>Sort by</h1>
          <div className="date-overview-small-offset">
            <SelectElement<OrderByField>
              value={orderField}
              onChange={setOrderField}
              options={Object.values(OrderByField)}
            />
            <SelectElement<OrderDirection>
              value={orderDirection}
              onChange={setOrderDirection}
              options={Object.values(OrderDirection)}
            />
          </div>
        </div>
        <div className="flex-left pad-left-5">
          <h1 className={"font-large"}>Select dates</h1>
          <DateElement date={startDate} onChange={setStartDate} />
          <DateElement date={endDate} onChange={setEndDate} />
          <br></br>
          <br></br>
          <button className="button-dark w-150px" onClick={setDatesLastMonth}>
            Last 30 days
          </button>
          <button className="button-dark w-150px" onClick={setDatesLastYear}>
            Last year
          </button>
          <button className="button-dark w-150px" onClick={setDatesAllTime}>
            All time
          </button>
        </div>
        <hr className="w-90" />
        <div className="w-100 flex-center margin-16 date-overview-page-controls">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 0}
            className="button-dark"
          >
            prev
          </button>
          <p>
            {page + 1}/{topEntries.pageCount}
          </p>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= topEntries.pageCount - 1}
            className="button-dark"
          >
            next
          </button>
        </div>
      </div>
      {/* Overview */}
      <div className="page-block w-33">
        {files.length === 0 ? (
          <div className={"justify padding-16"}>
            <h1 className={"font-large"}>{t("DataOverview.howToUse.title")}</h1>
            <p>
              <Trans
                i18nKey={"DataOverview.howToUse.description1"}
                t={t}
                components={[
                  <Link to={"https://www.spotify.com/us/account/privacy/"} />,
                ]}
              />
            </p>
            <p>{t("DataOverview.howToUse.description2")}</p>
          </div>
        ) : (
          <GenericList<StreamingTrackSummaryWithTrack>
            itemFunction={(summary) => visualizeData(summary)}
            entries={topEntries.tracks}
            selectedEntry={selectedTrack}
            onClick={setSelectedTrack}
          />
        )}
      </div>
    </div>
  );
}
