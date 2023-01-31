export interface PlaylistSpotify {
  tracks: Track;
}

export interface Track {
  items: [
    {
      track: {
        name: string;
        album: {
            artists: [ {
                name: string,
            }]
        }
      };
    }
  ];
  artits: {
    name: string;
  };
}

export interface musicSelected {
  artist?: string;
  nameMusic?: string;
}
