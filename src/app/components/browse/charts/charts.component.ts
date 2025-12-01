import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdBannerComponent } from '../../shared/ad-banner/ad-banner.component';
import { MusicApiService } from '../../../services/music-api.service';
import { PlayerService } from '../../../services/player.service';
import { Song } from '../../../services/playlist.service';
import { SeoService } from '../../../services/seo.service';

@Component({
    selector: 'app-charts',
    standalone: true,
    imports: [CommonModule, AdBannerComponent],
    templateUrl: './charts.component.html'
})
export class ChartsComponent implements OnInit {
    private seoService = inject(SeoService);

    countries = [
        { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
        { code: 'MX', name: 'México', flag: '🇲🇽' },
        { code: 'US', name: 'Todo el Mundo', flag: '🌍' }
    ];
    selectedCountry = 'CO';
    chartSongs = signal<Song[]>([]);
    loading = signal(true);

    constructor(
        private musicApi: MusicApiService,
        private playerService: PlayerService
    ) { }

    ngOnInit() {
        this.seoService.setSeoData(
            'Rankings Globales',
            'Descubre las canciones más escuchadas en Colombia, México y el mundo. El Top 50 actualizado.'
        );
        this.loadCharts(this.selectedCountry);
    }

    selectCountry(code: string) {
        this.selectedCountry = code;
        this.loadCharts(code);
    }

    loadCharts(countryCode: string) {
        this.loading.set(true);
        this.musicApi.getTrending(countryCode).subscribe(songs => {
            this.chartSongs.set(songs);
            this.loading.set(false);
        });
    }

    playSong(song: Song) {
        this.playerService.playSong(song);
    }
}
