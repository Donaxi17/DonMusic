import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicApiService } from '../../../services/music-api.service';

import { SeoService } from '../../../services/seo.service';

@Component({
    selector: 'app-playlists',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-8 animate-fade-in">
        <header class="mb-8">
            <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                Playlists Destacadas
            </h2>
            <p class="text-zinc-400 mt-2">Playlists curadas por Spotify para ti.</p>
        </header>

        <div *ngIf="loading()" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <!-- Playlists Grid -->
        <div *ngIf="!loading()" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div *ngFor="let playlist of playlists()" class="group cursor-pointer">
                <div class="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-3 shadow-lg">
                    <img [src]="playlist.img" [alt]="playlist.name" (error)="handleImageError($event)" class="w-full h-full object-cover">
                    <div
                        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <i
                            class='bx bx-play-circle text-5xl text-white scale-50 group-hover:scale-100 transition-transform duration-300'></i>
                    </div>
                </div>
                <h4 class="font-bold truncate group-hover:text-blue-400 transition-colors">{{playlist.name}}</h4>
                <p class="text-sm text-zinc-500 truncate">{{playlist.tracks}} canciones</p>
            </div>
        </div>
    </div>
    `
})
export class PlaylistsComponent implements OnInit {
    playlists = signal<any[]>([]);
    loading = signal(true);

    constructor(
        private musicApi: MusicApiService,
        private seoService: SeoService
    ) { }

    ngOnInit() {
        this.seoService.setSeoData(
            'Playlists Destacadas 2025 | Spotify Curated | DonMusic',
            'Escucha las mejores playlists curadas del 2025. Listas de reproducción para cada momento: fiesta, relax, ejercicio y más. Actualizadas diariamente.'
        );

        this.musicApi.getFeaturedPlaylists('US', 24).subscribe({
            next: (data) => {
                this.playlists.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading playlists:', err);
                this.loading.set(false);
            }
        });
    }

    handleImageError(event: Event) {
        const img = event.target as HTMLImageElement;
        img.src = 'https://placehold.co/300x300/18181b/3b82f6?text=Playlist';
    }
}
