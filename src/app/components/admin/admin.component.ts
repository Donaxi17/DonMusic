import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService, Song, Artist } from '../../services/database.service';
import { MusicApiService } from '../../services/music-api.service';

interface UploadProgress {
  uploading: boolean;
  progress: number;
  message: string;
}

interface Album {
  id: string;
  name: string;
  artistId: string;
  year: number;
  coverUrl?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private dbService = inject(DatabaseService);
  private router = inject(Router);
  private musicApi = inject(MusicApiService);

  // Lists from Firebase
  artists = signal<Artist[]>([]);
  albums = signal<Album[]>([]);
  genres = signal<string[]>(['Reggaeton', 'Trap', 'Rap', 'Pop', 'Dancehall', 'R&B']);

  // Form data
  songData = {
    title: '',
    artistId: '',
    artistName: '', // Para mostrar en el form
    albumId: '',
    albumName: '',
    genre: '',
    year: new Date().getFullYear(),
    duration: ''
  };

  // New artist/album/genre
  newArtistName = '';
  newAlbumName = '';
  newGenre = '';

  // UI States
  showNewArtistForm = signal(false);
  showNewAlbumForm = signal(false);
  showNewGenreForm = signal(false);

  // Files
  audioFiles: File[] = [];
  imageFile: File | null = null;

  // Preview Data
  previewSongs = signal<{ title: string, file: File, duration: string }[]>([]);

  // Upload state
  uploadProgress = signal<UploadProgress>({
    uploading: false,
    progress: 0,
    message: ''
  });

  // Preview URLs
  audioPreview: string | null = null;
  imagePreview: string | null = null;

  // iTunes Search
  itunesSearchQuery = '';
  itunesSearchType: 'artist' | 'song' = 'artist';
  itunesSearchResults = signal<any[]>([]);
  itunesSearching = signal(false);
  selectedItunesItem = signal<any>(null);

  ngOnInit() {
    this.loadArtists();
    this.loadGenres();
  }

  loadArtists() {
    this.dbService.getArtists().subscribe(artists => {
      this.artists.set(artists);
    });
  }

  loadGenres() {
    // Cargar géneros desde localStorage o usar predeterminados
    const savedGenres = localStorage.getItem('customGenres');
    if (savedGenres) {
      const custom = JSON.parse(savedGenres);
      this.genres.set([...this.genres(), ...custom]);
    }
  }

  loadAlbumsForArtist(artistId: string) {
    // Cargar álbumes del artista desde localStorage
    const albumsKey = `albums_${artistId}`;
    const savedAlbums = localStorage.getItem(albumsKey);
    if (savedAlbums) {
      this.albums.set(JSON.parse(savedAlbums));
    } else {
      this.albums.set([]);
    }
  }

  onArtistChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const artistId = select.value;

    if (artistId === 'new') {
      this.showNewArtistForm.set(true);
      // No resetear artistId aquí para mantener el estado "new"
      this.songData.artistName = '';
      return;
    }

    this.showNewArtistForm.set(false);
    this.songData.artistId = artistId;

    const artist = this.artists().find(a => a.id === artistId);
    if (artist) {
      this.songData.artistName = artist.name;
      this.songData.genre = artist.genre || '';
      this.loadAlbumsForArtist(artistId);
    }
  }

  cancelNewArtist() {
    this.showNewArtistForm.set(false);
    this.newArtistName = '';
    this.songData.artistId = '';
  }

  async createNewArtist() {
    if (!this.newArtistName.trim()) {
      alert('Por favor ingresa el nombre del artista');
      return;
    }

    try {
      const newArtist: Artist = {
        name: this.newArtistName.trim(),
        genre: this.songData.genre,
        image: '/assets/img/default-artist.jpg', // Imagen por defecto
        bio: ''
      };

      await this.dbService.addArtist(newArtist);

      // Recargar artistas
      this.loadArtists();

      // Limpiar y cerrar form
      this.newArtistName = '';
      this.showNewArtistForm.set(false);

      alert('✅ Artista creado exitosamente');
    } catch (error) {
      console.error('Error al crear artista:', error);
      alert('❌ Error al crear artista');
    }
  }

  onAlbumChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const albumId = select.value;

    if (albumId === 'new') {
      this.showNewAlbumForm.set(true);
      // No resetear albumId aquí
      this.songData.albumName = '';
      return;
    }

    if (albumId === 'none') {
      this.songData.albumId = '';
      this.songData.albumName = 'Sin Álbum';
      this.showNewAlbumForm.set(false);
      return;
    }

    this.showNewAlbumForm.set(false);
    this.songData.albumId = albumId;

    const album = this.albums().find(a => a.id === albumId);
    if (album) {
      this.songData.albumName = album.name;
      this.songData.year = album.year;
    }
  }

  createNewAlbum() {
    if (!this.newAlbumName.trim()) {
      alert('Por favor ingresa el nombre del álbum');
      return;
    }

    if (!this.songData.artistId) {
      alert('Por favor selecciona un artista primero');
      return;
    }

    const newAlbum: Album = {
      id: Date.now().toString(),
      name: this.newAlbumName.trim(),
      artistId: this.songData.artistId,
      year: this.songData.year
    };

    // Guardar en localStorage
    const albumsKey = `albums_${this.songData.artistId}`;
    const currentAlbums = this.albums();
    currentAlbums.push(newAlbum);
    localStorage.setItem(albumsKey, JSON.stringify(currentAlbums));

    this.albums.set(currentAlbums);
    this.songData.albumId = newAlbum.id;
    this.songData.albumName = newAlbum.name;

    // Limpiar y cerrar form
    this.newAlbumName = '';
    this.showNewAlbumForm.set(false);

    alert('✅ Álbum creado exitosamente');
  }

  cancelNewAlbum() {
    this.showNewAlbumForm.set(false);
    this.newAlbumName = '';
    this.songData.albumId = '';
  }

  onGenreChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const genre = select.value;

    if (genre === 'new') {
      this.showNewGenreForm.set(true);
      // No resetear genre aquí
      return;
    }

    this.showNewGenreForm.set(false);
    this.songData.genre = genre;
  }

  cancelNewGenre() {
    this.showNewGenreForm.set(false);
    this.newGenre = '';
    this.songData.genre = '';
  }

  createNewGenre() {
    if (!this.newGenre.trim()) {
      alert('Por favor ingresa el nombre del género');
      return;
    }

    const currentGenres = this.genres();
    if (!currentGenres.includes(this.newGenre.trim())) {
      currentGenres.push(this.newGenre.trim());
      this.genres.set(currentGenres);

      // Guardar en localStorage
      const customGenres = currentGenres.filter(g =>
        !['Reggaeton', 'Trap', 'Rap', 'Pop', 'Dancehall', 'R&B'].includes(g)
      );
      localStorage.setItem('customGenres', JSON.stringify(customGenres));

      this.songData.genre = this.newGenre.trim();
    }

    // Limpiar y cerrar form
    this.newGenre = '';
    this.showNewGenreForm.set(false);

    alert('✅ Género creado exitosamente');
  }

  // Helper methods for bulk upload
  formatTitle(filename: string): string {
    // Eliminar extensión y posibles números iniciales (ej: "01. Cancion.mp3" -> "Cancion")
    return filename.replace(/\.[^/.]+$/, "").replace(/^\d+\s*[-.]?\s*/, "").replace(/_/g, " ");
  }

  detectDuration(file: File): Promise<string> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      });
      audio.addEventListener('error', () => resolve('Unknown'));
    });
  }

  async onAudioFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Convertir FileList a Array
      const files = Array.from(input.files).filter(file => file.type.startsWith('audio/'));

      if (files.length === 0) {
        alert('Por favor selecciona archivos de audio válidos');
        return;
      }

      this.audioFiles = files;

      // Generar preview data
      const previews = [];
      for (const file of files) {
        const duration = await this.detectDuration(file);
        previews.push({
          title: this.formatTitle(file.name),
          file: file,
          duration: duration
        });
      }
      this.previewSongs.set(previews);

      // Si es solo uno, mantenemos comportamiento anterior
      if (files.length === 1) {
        this.audioPreview = URL.createObjectURL(files[0]);
        this.songData.title = previews[0].title;
        this.songData.duration = previews[0].duration;
      } else {
        this.audioPreview = null;
        this.songData.title = `Carga Masiva (${files.length} canciones)`;
        this.songData.duration = 'Varios';
      }
    }
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        input.value = '';
        return;
      }

      this.imageFile = file;
      this.imagePreview = URL.createObjectURL(file);
    }
  }

  async uploadSong(): Promise<void> {
    // Validaciones básicas
    if (!this.songData.artistName) {
      alert('Por favor selecciona un artista');
      return;
    }

    if (this.audioFiles.length === 0) {
      alert('Por favor selecciona archivos de audio');
      return;
    }

    if (!this.imageFile && !this.imagePreview) {
      alert('Por favor selecciona una imagen de portada o busca en iTunes');
      return;
    }

    try {
      this.uploadProgress.set({
        uploading: true,
        progress: 0,
        message: 'Iniciando carga...'
      });

      // 1. Obtener URL de imagen (Subir archivo o usar iTunes)
      let imageUrl = '';

      if (this.imageFile) {
        this.uploadProgress.set({
          uploading: true,
          progress: 5,
          message: 'Subiendo imagen de portada...'
        });

        const imagePath = `covers/${this.songData.artistName}/${Date.now()}_${this.imageFile.name}`;
        imageUrl = await this.dbService.uploadFile(imagePath, this.imageFile);
      } else if (this.imagePreview) {
        imageUrl = this.imagePreview;
      }

      // 2. Iterar sobre cada canción
      const totalFiles = this.audioFiles.length;
      const previews = this.previewSongs();

      for (let i = 0; i < totalFiles; i++) {
        const file = this.audioFiles[i];
        const preview = previews[i];
        const currentNum = i + 1;

        this.uploadProgress.set({
          uploading: true,
          progress: Math.round(((i) / totalFiles) * 100),
          message: `Subiendo ${currentNum}/${totalFiles}: ${preview.title}...`
        });

        // Subir audio
        const audioPath = `songs/${this.songData.artistName}/${this.songData.albumName || 'Sin Album'}/${Date.now()}_${file.name}`;
        const audioUrl = await this.dbService.uploadFile(audioPath, file);

        const song: Song = {
          title: preview.title,
          artist: this.songData.artistName,
          url: audioUrl,
          img: imageUrl, // Usamos la misma imagen para todas
          duration: preview.duration,
          album: this.songData.albumName || 'Sin Álbum',
          genre: this.songData.genre,
          year: this.songData.year
        };

        await this.dbService.addSong(song);
      }

      this.uploadProgress.set({
        uploading: false,
        progress: 100,
        message: `✅ ¡${totalFiles} canciones subidas exitosamente!`
      });

      this.resetForm();
      setTimeout(() => {
        this.uploadProgress.set({ uploading: false, progress: 0, message: '' });
      }, 4000);

    } catch (error) {
      console.error('Error al subir:', error);
      this.uploadProgress.set({
        uploading: false,
        progress: 0,
        message: '❌ Error en la subida. Revisa la consola.'
      });
    }
  }

  resetForm(): void {
    this.songData = {
      title: '',
      artistId: '',
      artistName: '',
      albumId: '',
      albumName: '',
      genre: '',
      year: new Date().getFullYear(),
      duration: ''
    };
    this.audioFiles = [];
    this.previewSongs.set([]);
    this.imageFile = null;
    this.audioPreview = null;
    this.imagePreview = null;

    // Reset file inputs
    const audioInput = document.querySelector('input[type="file"][accept="audio/*"]') as HTMLInputElement;
    const imageInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    if (audioInput) audioInput.value = '';
    if (imageInput) imageInput.value = '';
  }

  logout(): void {
    // Limpiar autenticación
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUser');

    // Redirigir al login
    this.router.navigate(['/admin-login']);
  }

  // ===== ITUNES SEARCH METHODS =====

  searchITunes(): void {
    if (!this.itunesSearchQuery || this.itunesSearchQuery.trim().length < 2) {
      return;
    }

    this.itunesSearching.set(true);
    this.itunesSearchResults.set([]);

    if (this.itunesSearchType === 'artist') {
      this.musicApi.searchArtistInITunes(this.itunesSearchQuery).subscribe({
        next: (results) => {
          this.itunesSearchResults.set(results);
          this.itunesSearching.set(false);
        },
        error: (error) => {
          console.error('Error searching iTunes:', error);
          this.itunesSearching.set(false);
          alert('Error buscando en iTunes. Intenta de nuevo.');
        }
      });
    } else {
      this.musicApi.searchTrack(this.itunesSearchQuery).subscribe({
        next: (results) => {
          this.itunesSearchResults.set(results);
          this.itunesSearching.set(false);
        },
        error: (error) => {
          console.error('Error searching iTunes:', error);
          this.itunesSearching.set(false);
          alert('Error buscando en iTunes. Intenta de nuevo.');
        }
      });
    }
  }

  selectItunesItem(item: any): void {
    this.selectedItunesItem.set(item);
    this.imageFile = null; // Clear manual file if iTunes item is selected

    if (this.itunesSearchType === 'artist') {
      // Pre-fill artist name with iTunes data
      this.newArtistName = item.artistName;
      // Set image preview from iTunes
      this.imagePreview = item.artworkUrl600 || item.artworkUrl100;
      console.log('Artist image URL:', this.imagePreview);
    } else {
      // Pre-fill song data
      this.songData.title = item.title;
      this.songData.artistName = item.artist;
      this.songData.albumName = item.album;
      this.songData.duration = item.duration;
      // Set image preview from iTunes
      this.imagePreview = item.img;
      console.log('Song image URL:', this.imagePreview);
    }
  }

  clearItunesSearch(): void {
    this.itunesSearchQuery = '';
    this.itunesSearchResults.set([]);
    this.selectedItunesItem.set(null);
  }

  useItunesImageForArtist(): string {
    const selected = this.selectedItunesItem();
    if (selected && selected.artworkUrl600) {
      // Instead of uploading, we'll save this URL directly to Firestore
      return selected.artworkUrl600;
    }
    return '';
  }
}
