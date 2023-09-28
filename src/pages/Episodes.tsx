import { useEffect } from "react";
import Api from "../Api";

export function Episodes() {
  useEffect(() => {
    Api.GetUserEpisodes().then(console.log);
    Api.GetUserShows().then(console.log);
  }, []);
  return <></>;
}
