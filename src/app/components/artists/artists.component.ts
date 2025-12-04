import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Artist as LocalArtist, ARTISTS_DATA } from '../../models/artists.data';
import { SeoService } from '../../services/seo.service';
import { DatabaseService, Artist as RemoteArtist } from '../../services/database.service';

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
  private dbService = inject(DatabaseService);

  // Usamos signal para manejar el estado de los artistas (Usamos RemoteArtist como base)
  allArtists = signal<RemoteArtist[]>([]);
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
    const artistsList = this.allArtists();

    if (genre === 'all') {
      return artistsList;
    }
    return artistsList.filter(artist =>
      artist.genre && artist.genre.toLowerCase().includes(genre.toLowerCase())
    );
  });

  ngOnInit() {
    this.seoService.setSeoData(
      'Artistas',
      'Descubre a los mejores artistas en DonMusica. Bad Bunny, Karol G, Feid y muchos más. Explora sus discografías completas.'
    );

    // Cargar artistas desde Firebase
    this.dbService.getArtists().subscribe(remoteArtists => {
      if (remoteArtists && remoteArtists.length > 0) {
        this.allArtists.set(remoteArtists);
      } else {
        // Si no hay datos en Firebase, usar locales convertidos a RemoteArtist
        const localArtistsConverted: RemoteArtist[] = ARTISTS_DATA.map(a => ({
          id: a.id.toString(),
          name: a.name,
          genre: a.genre,
          image: a.image,
          bio: a.description
        }));
        this.allArtists.set(localArtistsConverted);
      }
    });
  }

  selectArtist(artist: RemoteArtist): void {
    // Navegar al reproductor con el ID del artista
    this.router.navigate(['/player'], {
      queryParams: { artistId: artist.id }
    });
  }

  onGenreChange(genre: string): void {
    this.selectedGenre.set(genre);
  }

  // --- FUNCIÓN TEMPORAL PARA MIGRAR DATOS ---
  async uploadLocalDataToFirebase() {
    if (!confirm('¿Estás seguro de subir los datos locales a Firebase? Esto puede duplicar datos si ya existen.')) return;

    console.log('Iniciando subida...');
    let count = 0;
    for (const artist of ARTISTS_DATA) {
      // Convertir LocalArtist a RemoteArtist para subirlo
      const artistToUpload: RemoteArtist = {
        name: artist.name,
        genre: artist.genre,
        image: artist.image,
        bio: artist.description
      };

      await this.dbService.addArtist(artistToUpload);
      count++;
    }
    alert(`Se subieron ${count} artistas a Firebase exitosamente.`);
  }
}
