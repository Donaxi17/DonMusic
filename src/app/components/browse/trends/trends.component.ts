import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdBannerComponent } from '../../shared/ad-banner/ad-banner.component';
import { InfiniteScrollDirective } from '../../../directives/infinite-scroll.directive';
import { MusicApiService } from '../../../services/music-api.service';
import { PlayerService } from '../../../services/player.service';
import { Song } from '../../../services/playlist.service';
import { SeoService } from '../../../services/seo.service';

@Component({
    selector: 'app-trends',
    standalone: true,
    imports: [CommonModule, AdBannerComponent, InfiniteScrollDirective],
    templateUrl: './trends.component.html'
})
export class TrendsComponent implements OnInit {
    private seoService = inject(SeoService);

    trendingSongs = signal<Song[]>([]);
    loading = signal(true);
    loadingMore = signal(false);
    currentPage = 1;
    itemsPerPage = 10;
    hasMore = true;

    constructor(
        private musicApi: MusicApiService,
        private playerService: PlayerService
    ) { }

    ngOnInit() {
        this.seoService.setSeoData(
            'Tendencias Musicales',
            'Las canciones más populares del momento. Descubre qué está sonando ahora en todo el mundo.'
        );

        this.loadInitialData();
    }

    loadInitialData() {
        this.musicApi.getTrending('US').subscribe(songs => {
            this.trendingSongs.set(songs);
            this.loading.set(false);
        });
    }

    loadMore() {
        if (this.loadingMore() || !this.hasMore || this.loading()) return;

        this.loadingMore.set(true);
        this.currentPage++;

        // Simulate loading more data (in real app, you'd fetch next page)
        setTimeout(() => {
            this.musicApi.getTrending('US').subscribe(newSongs => {
                // Simulate pagination by taking different slices
                const start = this.currentPage * this.itemsPerPage;
                const end = start + this.itemsPerPage;
                const paginatedSongs = newSongs.slice(start, end);

                if (paginatedSongs.length === 0) {
                    this.hasMore = false;
                } else {
                    this.trendingSongs.update(songs => [...songs, ...paginatedSongs]);
                }
                this.loadingMore.set(false);
            });
        }, 500);
    }

    playSong(song: Song) {
        this.playerService.playSong(song);
    }
}
