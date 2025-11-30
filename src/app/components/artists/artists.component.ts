import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Artist, ARTISTS_DATA } from '../../models/artists.data';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artists.component.html',
  styleUrl: './artists.component.css'
})
export class ArtistsComponent {
  allArtists: Artist[] = ARTISTS_DATA;
  selectedGenre = signal<string>('all');

  // Lista de géneros únicos extraídos de los artistas
  genres = [
    { value: 'all', label: '🎵 Todos' },
    { value: 'Rap', label: '🎤 Rap / Hip-Hop' },
    { value: 'Reggaeton', label: '🔥 Reggaeton' },
    { value: 'Trap', label: '💎 Trap' },
    { value: 'Pop', label: '⭐ Pop' },
    { value: 'Dancehall', label: '🌴 Dancehall' },
    { value: 'R&B', label: '🎹 R&B' }
  ];

  // Artistas filtrados basados en el género seleccionado
  artists = computed(() => {
    const genre = this.selectedGenre();
    if (genre === 'all') {
      return this.allArtists;
    }
    return this.allArtists.filter(artist =>
      artist.genre.toLowerCase().includes(genre.toLowerCase())
    );
  });

  constructor(private router: Router) { }

  selectArtist(artist: Artist): void {
    // Navegar al reproductor con el ID del artista
    this.router.navigate(['/player'], {
      queryParams: { artistId: artist.id }
    });
  }

  onGenreChange(genre: string): void {
    this.selectedGenre.set(genre);
  }
}
