import React, { useEffect, useState } from "react";
import Api from "../Api";
import { Navigate } from "react-router-dom";
import { routes } from "../routes";

const SpotifyLogin = () => {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const handleTokenExchange = async (authorizationCode: string) => {
    try {
      const { access_token, refresh_token } =
        await Api.RetrieveSpotifyCredentials(authorizationCode);

      Api.SetAccessToken(access_token);
      Api.SetRefreshToken(refresh_token);
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error occurred during token exchange:", error);
    }
  };

  // Check for login callback when component mounts
  useEffect(() => {
    (async () => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const authorizationCode = urlSearchParams.get("code");

      if (authorizationCode) {
        await handleTokenExchange(authorizationCode);
      }
    })();
  }, []);

  if (
    accessToken &&
    refreshToken &&
    Api.GetAccessToken() &&
    Api.GetRefreshToken()
  ) {
    return <Navigate to={"/"} />;
  }

  return <></>;
};

export default SpotifyLogin;
