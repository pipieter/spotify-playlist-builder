import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { routes } from "../routes";

import "./Dashboard.css";
import Config from "../Config";

export function Dashboard() {
  const { t } = useTranslation();

  const links = [
    {
      name: t("Dashboard.links.fromPlaylist.name"),
      description: t("Dashboard.links.fromPlaylist.description"),
      route: routes.fromPlaylist,
    },
    {
      name: t("Dashboard.links.fromSong.name"),
      description: t("Dashboard.links.fromSong.description"),
      route: routes.fromSong,
    },
    {
      name: t("Dashboard.links.fromGenre.name"),
      description: t("Dashboard.links.fromGenre.description"),
      route: routes.fromGenre,
    },
  ];

  const credits = [
    {
      name: t("Dashboard.credits.spotify.name"),
      url: t("Dashboard.credits.spotify.url"),
      description: t("Dashboard.credits.spotify.description"),
    },
    {
      name: t("Dashboard.credits.everynoise.name"),
      url: t("Dashboard.credits.everynoise.url"),
      description: t("Dashboard.credits.everynoise.description"),
    },
  ];

  return (
    <div className={"page"}>
      <div className={"page-block w-80 flex-col h-100"}>
        <div className={"dashboard-title padding-16"}>
          <img src={"logo256.png"} alt={""} />
          <h1>{t("Dashboard.title")}</h1>
        </div>
        <div className={"padding-16 h-100 flex-col"}>
          <div>
            <h2>{t("Dashboard.links.title")}</h2>
            <p>{t("Dashboard.description")}</p>
            <div className={"dashboard-grid"}>
              {links.map((link) => (
                <>
                  <div>
                    <Link to={link.route} className={"link active"}>
                      {link.name}
                    </Link>
                  </div>
                  <div>
                    <p className={"no-pad"}>{link.description}</p>
                  </div>
                </>
              ))}
            </div>
          </div>
          <div>
            <h2>{t("Dashboard.credits.title")}</h2>
            <div className={"dashboard-grid"}>
              {credits.map((credit) => (
                <>
                  <div>
                    <Link to={credit.url} className={"link active"}>
                      {credit.name}
                    </Link>
                  </div>
                  <div>
                    <p className={"no-pad"}>{credit.description}</p>
                  </div>
                </>
              ))}
            </div>
          </div>
        </div>
        <div className={"flex-center github-link"}>
          {Config.GetGitHubUrl() && (
            <Link to={Config.GetGitHubUrl()} className={"text-color-light"}>
              GitHub
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
