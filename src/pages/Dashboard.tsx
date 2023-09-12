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
      route: routes.fromPlaylist
    },
    {
      name: t("Dashboard.links.fromSong.name"),
      description: t("Dashboard.links.fromSong.description"),
      route: routes.fromSong
    },
    {
      name: t("Dashboard.links.fromGenre.name"),
      description: t("Dashboard.links.fromGenre.description"),
      route: routes.fromGenre
    }
  ];

  const credits = [
    {
      name: t("Dashboard.credits.spotify.name"),
      url: t("Dashboard.credits.spotify.url"),
      description: t("Dashboard.credits.spotify.description")
    },
    {
      name: t("Dashboard.credits.everynoise.name"),
      url: t("Dashboard.credits.everynoise.url"),
      description: t("Dashboard.credits.everynoise.description")
    }
  ];

  return (
    <div className={"page"}>
      <div className={"page-block w-80 h-100 flex-col"}>
        <div className={"dashboard-title padding-16"}>
          <img src={"logo256.png"} alt={""} />
          <h1>{t("Dashboard.title")}</h1>
        </div>
        <div className={"padding-16"}>
          <div>
            <h2>{t("Dashboard.links.title")}</h2>
            <p>{t("Dashboard.description")}</p>
            <table>
              <tbody>
              {links.map((link) => (
                <tr>
                  <td>
                    <Link to={link.route} className={"link active"}>
                      {link.name}
                    </Link>
                  </td>
                  <td className={"padding-8-horizontal"}>
                    <p className={"no-pad "}>{link.description}</p>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>

          </div>
          <div className={"block"}>
            <h2>{t("Dashboard.credits.title")}</h2>
            <table>
              <tbody>
              {credits.map((credit) => (
                <tr>
                  <td>
                    <Link to={credit.url} className={"link active"}>
                      {credit.name}
                    </Link>
                  </td>
                  <td className={"padding-8-horizontal"}>
                    <p className={"no-pad"}>{credit.description}</p>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
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
