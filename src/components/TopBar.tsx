import React, { useEffect, useState } from "react";
import Api from "../Api";
import { routes } from "../routes";
import { Link, useLocation } from "react-router-dom";
import "./TopBar.css";
import Config from "../Config";

function TopBarIcon() {
  const location = useLocation();

  const [userInfo, setUserInfo] = useState<
    SpotifyApi.UserObjectPublic | undefined
  >(undefined);
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (Api.UserIsLoggedIn()) {
      Api.GetUserInfo().then(setUserInfo);
    }
  }, [location]);

  useEffect(() => {
    if (userInfo && userInfo.images) {
      setImage(userInfo.images[0]?.url);
    }
  }, [userInfo]);

  if (!Api.UserIsLoggedIn()) {
    return (
      <Link className={"button-light"} to={Api.SpotifyLoginUrl()}>
        Login
      </Link>
    );
  }

  return (
    <details className={"topbar-icon"}>
      <summary>
        <img src={image} alt={""} />
      </summary>
      <ul className={"topbar-icon-list"}>
        {Config.GetGitHubUrl() && (
          <>
            <li>
              <Link to={Config.GetGitHubUrl()}>GitHub</Link>
            </li>
            <li>
              <hr />
            </li>
          </>
        )}
        <li
          className={"topbar-icon-logout"}
          onClick={() => {
            Api.Logout();
            window.location.reload();
          }}
        >
          Log out
        </li>
      </ul>
    </details>
  );
}

function TopBarLink(props: { title: string; path: string }) {
  const location = useLocation();
  const { title, path } = props;

  return (
    <Link
      className={`link ${path === location.pathname && "active"}`}
      to={path}
    >
      {title}
    </Link>
  );
}

export default function TopBar() {
  return (
    <div className="topbar-div">
      <div className={"topbar-dashboard-div"}>
        <TopBarLink title={"Dashboard"} path={routes.dashboard} />
      </div>
      <div className={"topbar-links-div"}>
        <TopBarLink title={"From Playlist"} path={routes.fromPlaylist} />
        <TopBarLink title={"From Song"} path={routes.fromSong} />
        <TopBarLink title={"From Genre"} path={routes.fromGenre} />
        <TopBarLink title={"Statistics"} path={routes.statistics} />
      </div>
      <div className={"topbar-icon-div"}>{<TopBarIcon />}</div>
    </div>
  );
}
