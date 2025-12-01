import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdBannerComponent } from '../../shared/ad-banner/ad-banner.component';
import { MusicApiService } from '../../../services/music-api.service';
import { PlayerService } from '../../../services/player.service';
import { Song } from '../../../services/playlist.service';
import { SeoService } from '../../../services/seo.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule, AdBannerComponent],
    templateUrl: './search.component.html'
})
export class SearchComponent {
    private seoService = inject(SeoService);

    searchQuery = signal('');
    isSearching = signal(false);
    showLyrics = signal(false);
    selectedSongLyrics = signal('');
    selectedSongTitle = signal('');
    searchResults = signal<Song[]>([]);

    constructor(
        private musicApi: MusicApiService,
        private playerService: PlayerService
    ) {
        this.seoService.setSeoData(
            'Buscar Música',
            'Busca tus canciones, artistas y álbumes favoritos. Encuentra lo que quieras escuchar.'
        );
    }

    onSearch() {
        if (!this.searchQuery()) return;
        this.isSearching.set(true);

        this.musicApi.search(this.searchQuery()).subscribe(songs => {
            this.searchResults.set(songs);
            this.isSearching.set(false);
        });
    }

    playSong(song: Song) {
        this.playerService.playSong(song);
    }

    viewLyrics(song: Song) {
        this.selectedSongTitle.set(`${song.title} - ${song.artist}`);
        this.selectedSongLyrics.set('Cargando letra...');
        this.showLyrics.set(true);

        this.musicApi.getLyrics(song.artist, song.title).subscribe(lyrics => {
            this.selectedSongLyrics.set(lyrics || 'No se encontró la letra de esta canción.');
        });
    }

    closeLyrics() {
        this.showLyrics.set(false);
    }
}
