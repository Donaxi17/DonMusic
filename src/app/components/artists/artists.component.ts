import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Artist, ARTISTS_DATA } from '../../models/artists.data';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artists.component.html',
  styleUrl: './artists.component.css'
})
export class ArtistsComponent implements OnInit {
  private router = inject(Router);
  private seoService = inject(SeoService);

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

  ngOnInit() {
    this.seoService.setSeoData(
      'Artistas',
      'Descubre a los mejores artistas en DonMusica. Bad Bunny, Karol G, Feid y muchos más. Explora sus discografías completas.'
    );
  }

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
