import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicApiService } from '../../../services/music-api.service';
import { Song } from '../../../services/playlist.service';
import { PlayerService } from '../../../services/player.service';
import { SeoService } from '../../../services/seo.service';

@Component({
    selector: 'app-genres',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './genres.component.html'
})
export class GenresComponent implements OnInit {
    private seoService = inject(SeoService);

    genres = signal<string[]>([]);
    selectedGenre = signal<string>('');
    tracks = signal<Song[]>([]);
    loading = signal(true);
    loadingTracks = signal(false);

    // Genre colors mapping
    genreColors: { [key: string]: string } = {
        'reggaeton': 'bg-yellow-600',
        'pop': 'bg-pink-600',
        'rock': 'bg-red-700',
        'electronic': 'bg-purple-600',
        'hip-hop': 'bg-orange-700',
        'latin': 'bg-green-600',
        'indie': 'bg-teal-600',
        'r-n-b': 'bg-indigo-700',
        'k-pop': 'bg-rose-500',
        'metal': 'bg-zinc-700',
        'classical': 'bg-blue-800',
        'jazz': 'bg-amber-800',
        'default': 'bg-gradient-to-br from-purple-600 to-pink-600'
    };

    constructor(
        private musicApi: MusicApiService,
        private player: PlayerService
    ) { }

    ngOnInit() {
        this.seoService.setSeoData(
            'Géneros Musicales',
            'Explora música por género: Reggaeton, Pop, Rock, Electrónica y más. Encuentra tu estilo.'
        );

        this.musicApi.getGenres().subscribe(data => {
            this.genres.set(data.slice(0, 24)); // Show first 24 genres
            this.loading.set(false);
        });
    }

    selectGenre(genre: string) {
        this.selectedGenre.set(genre);
        this.loadingTracks.set(true);
        this.musicApi.getTracksByGenre(genre, 20).subscribe(data => {
            this.tracks.set(data);
            this.loadingTracks.set(false);
        });
    }

    getGenreColor(genre: string): string {
        const normalized = genre.toLowerCase().replace(/\s+/g, '-');
        return this.genreColors[normalized] || this.genreColors['default'];
    }

    playSong(song: Song) {
        this.player.playSong(song);
    }

    playAll() {
        if (this.tracks().length > 0) {
            this.player.playSong(this.tracks()[0]);
        }
    }
}
