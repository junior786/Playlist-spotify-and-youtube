import { musicSelected, PlaylistSpotify } from "../src/model/music.spotify.js";
import { GoogleConstants } from "./constants/google.constant.js";
import { google } from "googleapis";
import open from "open";
import express from "express";
import { OAuth2Client } from "google-auth-library";
import { GoogleService } from "./service/google.service.js";

const getSpotify = async () => {
  const url = "https://api.spotify.com/v1/playlists/37i9dQZF1DX0FOF1IUWK1W";
  const token =
    "BQBPXJ6bn-QQug614UhHE_c23pYm8dLJZqgPz9gieGmQ8_4TkJcWo6jclrm6W7VAXDcKvwqJ_fJE3qHHQQgvrssQu8XESoTT4F1XWH9xLBJm3VHA0EC_1IhnFBheUzjMcXa-IYTx3tspLwwy4lS_2xp7vkq_86o_8ZN02f_pjKoaMQ";
  let musicArray: musicSelected[] = [];
  try {
    await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => resp.json())
      .then(
        (resp: PlaylistSpotify) =>
          (musicArray = resp.tracks.items.map((x) => {
            return {
              nameMusic: x.track.name,
              artist: x.track.album.artists[0]?.name,
            };
          }))
      );

      playListYoutubeMusic(musicArray);

  } catch (error) {
    console.error("TOKEN EXPIRADO");
  }
};

const playListYoutubeMusic = async (musicArray?: musicSelected[]) => {
  const webServer = await startServer();
  const oauth2Client = new google.auth.OAuth2(
    GoogleConstants.client_id,
    GoogleConstants.client_secret,
    "http://localhost:5000"
  );
  const scopes = ["https://www.googleapis.com/auth/youtube"];

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
  });
  open(authorizationUrl);
  const token: any = await waitForGoogleCallBack(webServer);
  const { access_token } = await requestTokens(token, oauth2Client);
  const googleService = new GoogleService(access_token);
    
  const playlist = await googleService.createPlaylist('Name playlist')
  const musicsId: string[] = [];
  console.log('playlist', playlist, 'token', access_token);
  
  for(const prop in musicArray) {
    if (musicArray[Number(prop)]) {
      const title = `${musicArray[Number(prop)]?.artist} ${musicArray[Number(prop)]?.nameMusic}`      
      const searchAll = await googleService
      .searchMusicAndVideo(title);
      musicsId.push(searchAll);
    }  
    if (musicArray.length === musicsId.length) {
      console.log(musicsId);
      await googleService.addVideoInPlaylist(playlist.id, musicsId);
    }
  }
  
};

async function requestTokens(
  token: string,
  oauth2Client: OAuth2Client
): Promise<any> {
  return new Promise((resolve, reject) => {
    oauth2Client.getToken(token, (error, tokens: any) => {
      if (error) reject(error);
      oauth2Client.setCredentials(tokens);
      resolve(tokens);
    });
  });
}

async function startServer() {
  return new Promise((resolve, reject) => {
    const port = 5000;
    const app = express();

    const server = app.listen(port, () => {
      console.log(`app listen on http://localhost:${port}`);
      resolve({
        app,
        server,
      });
    });
  });
}

async function waitForGoogleCallBack(webserver: any) {
  return new Promise((resolve, reject) => {
    console.log("AWAIT for user...");
    webserver.app.get("/", (req: any, res: any) => {
      const authCode = req.query.code;
      console.log(`consent given: ${authCode}`);
      res.send("");
      resolve(authCode);
    });
  });
}
getSpotify();

