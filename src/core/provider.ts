import type { PlaylistDetails } from "./playlist"
import type { TrackCollection } from "./track"

export interface ProviderService {
  getAlbumTracks(url: string): Promise<TrackCollection>
  getLibraryTracks(): Promise<TrackCollection>
  getPlaylistTracks(url: string): Promise<TrackCollection>
  replaceTracksInPlaylist(url: string, tracks: TrackCollection): Promise<void>
  updatePlaylistDetails(
    url: string,
    details: Partial<PlaylistDetails>
  ): Promise<void>
}
