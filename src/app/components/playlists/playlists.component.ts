import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlaylistService, Playlist, Song } from '../../services/playlist.service';
import { PlayerService } from '../../services/player.service';
import { FavoritesComponent } from '../favorites/favorites.component';
import { PlaylistDetailComponent } from '../playlist-detail/playlist-detail.component';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, FormsModule, FavoritesComponent, PlaylistDetailComponent],
  templateUrl: './playlists.component.html',
  styleUrl: './playlists.component.css'
})
export class PlaylistsComponent implements OnInit {
  userPlaylists: Playlist[] = [];
  favorites: Song[] = [];
  selectedPlaylist: Playlist | null = null;
  currentSongId: number | string | null = null;
  isPlaying = false;

  showCreateModal: boolean = false;
  newPlaylistName: string = '';
  newPlaylistDescription: string = '';

  constructor(
    private playlistService: PlaylistService,
    private playerService: PlayerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();

    // Subscribe to player state
    this.playerService.currentSong$.subscribe(song => {
      this.currentSongId = song?.id || null;
    });

    this.playerService.isPlaying$.subscribe(playing => {
      this.isPlaying = playing;
    });
  }

  loadData(): void {
    this.userPlaylists = this.playlistService.getPlaylists();
    this.favorites = this.playlistService.getFavorites();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newPlaylistName = '';
    this.newPlaylistDescription = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createPlaylist(): void {
    if (!this.newPlaylistName.trim()) {
      alert('Por favor ingresa un nombre para la playlist');
      return;
    }

    this.playlistService.createPlaylist(this.newPlaylistName, this.newPlaylistDescription);
    this.loadData();
    this.closeCreateModal();
  }

  deletePlaylist(playlistId: string): void {
    if (confirm('¿Estás seguro de eliminar esta playlist?')) {
      this.playlistService.deletePlaylist(playlistId);
      this.loadData();
      if (this.selectedPlaylist?.id === playlistId) {
        this.selectedPlaylist = null;
      }
    }
  }

  selectPlaylist(playlist: Playlist): void {
    this.selectedPlaylist = playlist;
  }

  removeSongFromPlaylist(playlistId: string, songId: number | string): void {
    if (confirm('¿Quitar esta canción de la playlist?')) {
      this.playlistService.removeSongFromPlaylist(playlistId, songId);
      this.loadData();
      // Refresh selected playlist
      if (this.selectedPlaylist?.id === playlistId) {
        this.selectedPlaylist = this.userPlaylists.find(p => p.id === playlistId) || null;
      }
    }
  }

  removeFromFavorites(songId: number | string): void {
    if (confirm('¿Quitar de favoritos?')) {
      this.playlistService.removeFromFavorites(songId);
      this.loadData();
    }
  }

  sharePlaylist(playlist: Playlist): void {
    this.playlistService.sharePlaylist(playlist);
  }

  playFavorites(): void {
    if (this.favorites.length === 0) {
      alert('No tienes canciones en favoritos');
      return;
    }
    // Set playlist and play first song
    this.playerService.setPlaylist(this.favorites, true);
    this.playerService.playSong(this.favorites[0]);
    // Navigate to player
    this.router.navigate(['/player']);
  }

  playPlaylistSongs(playlist: Playlist): void {
    if (playlist.songs.length === 0) {
      alert('Esta playlist está vacía');
      return;
    }
    // Set playlist and play first song
    this.playerService.setPlaylist(playlist.songs, false);
    this.playerService.playSong(playlist.songs[0]);
    // Navigate to player
    this.router.navigate(['/player']);
  }

  playSong(song: Song): void {
    // Play single song
    this.playerService.setPlaylist([song], false);
    this.playerService.playSong(song);
    // Navigate to player
    this.router.navigate(['/player']);
  }

  backToList(): void {
    this.selectedPlaylist = null;
  }
}
