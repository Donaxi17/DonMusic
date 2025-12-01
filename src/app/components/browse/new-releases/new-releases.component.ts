import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdBannerComponent } from '../../shared/ad-banner/ad-banner.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { MusicApiService } from '../../../services/music-api.service';
import { Song } from '../../../services/playlist.service';
import { PlayerService } from '../../../services/player.service';
import { SeoService } from '../../../services/seo.service';

@Component({
    selector: 'app-new-releases',
    standalone: true,
    imports: [CommonModule, AdBannerComponent, SkeletonComponent],
    templateUrl: './new-releases.component.html'
})
export class NewReleasesComponent implements OnInit {
    private seoService = inject(SeoService);

    releases = signal<Song[]>([]);
    loading = signal(true);

    constructor(
        private musicApi: MusicApiService,
        private player: PlayerService
    ) { }

    ngOnInit() {
        this.seoService.setSeoData(
            'Nuevos Lanzamientos',
            'Escucha los últimos estrenos musicales. Lo más nuevo del reggaeton, trap y pop urbano.'
        );

        this.musicApi.getNewReleases('US', 30).subscribe(data => {
            this.releases.set(data);
            this.loading.set(false);
        });
    }

    playSong(song: Song) {
        this.player.playSong(song);
    }

    playAll() {
        if (this.releases().length > 0) {
            this.player.playSong(this.releases()[0]);
        }
    }
}
