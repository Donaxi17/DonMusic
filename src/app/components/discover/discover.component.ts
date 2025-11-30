import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JamendoService } from '../../services/jamendo.service';
import { PlayerService } from '../../services/player.service';
import { PlaylistService, Song } from '../../services/playlist.service';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.css'
})
export class DiscoverComponent implements OnInit {
  songs = signal<Song[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  selectedGenre = signal<string>('popular');
  searchQuery = signal<string>('');

  genres = [
    { value: 'popular', label: '🔥 Populares' },
    { value: 'pop', label: '🎤 Pop' },
    { value: 'rock', label: '🎸 Rock' },
    { value: 'electronic', label: '🎹 Electrónica' },
    { value: 'jazz', label: '🎺 Jazz' },
    { value: 'classical', label: '🎻 Clásica' },
    { value: 'ambient', label: '🌊 Ambient' },
    { value: 'world', label: '🌍 Mundial' },
    { value: 'folk', label: '🪕 Folk' },
    { value: 'hiphop', label: '🎤 Hip Hop' }
  ];

  constructor(
    private jamendoService: JamendoService,
    private playerService: PlayerService,
    private playlistService: PlaylistService
  ) { }

  ngOnInit() {
    this.loadPopularTracks();
  }

  loadPopularTracks() {
    this.loading.set(true);
    this.error.set('');

    this.jamendoService.getPopularTracks(40).subscribe({
      next: (tracks) => {
        this.songs.set(tracks);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading tracks:', err);
        this.error.set('Error al cargar la música. Por favor, intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }

  onGenreChange(genre: string) {
    this.selectedGenre.set(genre);
    this.searchQuery.set('');
    this.loading.set(true);
    this.error.set('');

    if (genre === 'popular') {
      this.loadPopularTracks();
    } else {
      this.jamendoService.searchByGenre(genre, 40).subscribe({
        next: (tracks) => {
          this.songs.set(tracks);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading genre:', err);
          this.error.set('Error al cargar el género. Por favor, intenta de nuevo.');
          this.loading.set(false);
        }
      });
    }
  }

  onSearch() {
    const query = this.searchQuery().trim();
    if (!query) {
      this.loadPopularTracks();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.jamendoService.searchTracks(query, 40).subscribe({
      next: (tracks) => {
        this.songs.set(tracks);
        this.loading.set(false);
        if (tracks.length === 0) {
          this.error.set('No se encontraron resultados. Intenta con otra búsqueda.');
        }
      },
      error: (err) => {
        console.error('Error searching:', err);
        this.error.set('Error en la búsqueda. Por favor, intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }

  playSong(song: Song) {
    this.playerService.playSong(song);
  }

  playAll() {
    const currentSongs = this.songs();
    if (currentSongs.length > 0) {
      this.playerService.setPlaylist(currentSongs, false);
      this.playerService.playSong(currentSongs[0]);
    }
  }

  addToFavorites(song: Song, event: Event) {
    event.stopPropagation();
    const added = this.playlistService.addToFavorites(song);
    if (added) {
      alert(`✅ "${song.title}" agregada a favoritos`);
    } else {
      alert(`ℹ️ "${song.title}" ya está en favoritos`);
    }
  }

  isFavorite(songId: number | string): boolean {
    return this.playlistService.isFavorite(songId as number);
  }

  getCurrentSong(): Song | null {
    return this.playerService.currentSong;
  }

  isPlaying(): boolean {
    return this.playerService.isPlaying;
  }

  isCurrentSong(song: Song): boolean {
    const current = this.getCurrentSong();
    return current?.id === song.id;
  }
}
