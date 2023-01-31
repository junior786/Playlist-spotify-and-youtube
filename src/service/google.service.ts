import { type } from "os";
import { GoogleConstants } from "../constants/google.constant.js";

export class GoogleService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async createPlaylist(namePlaylist: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `https://content-youtube.googleapis.com/youtube/v3/playlists?part=id&part=snippet&alt=json&key=${GoogleConstants.key}`;
      const service = fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          snippet: {
            title: namePlaylist,
            description: "Criado pelo bot #01",
          },
        }),
      }).then((value) => value.json());
      resolve(service);
    });
  }

  async searchMusicAndVideo(name: string): Promise<any> {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${name}&key=${GoogleConstants.key}`;
    return new Promise((resolve, reject) => {
      const service = fetch(url, {
        method: "GET",
      })
        .then((resp) => resp.json())
        .then((resp) => resp.items[0]?.id.videoId);
      resolve(service);
    });
  }

  async addVideoInPlaylist(playlistId: string, videoId: string[]) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,id,snippet,status&key=${GoogleConstants.key}`;
    
    return new Promise((resolve, reject) => {
      const service = fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          snippet: {
            playlistId,
            resourceId: videoId.filter(value => value !== undefined).map(id => {
              return { kind: 'youtube#video', videoId: id };
            }),
          },
        }),
      }).then((resp) => resp.json());

      resolve(service);
    });
  }
}
