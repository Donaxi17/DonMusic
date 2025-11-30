import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { ArtistsComponent } from './components/artists/artists.component';
import { PlayerComponent } from './components/player/player.component';
import { DownloadPageComponent } from './components/download-page/download-page.component';
import { DiscoverComponent } from './components/discover/discover.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'home', redirectTo: '', pathMatch: 'full' },
            { path: 'artists', component: ArtistsComponent },
            { path: 'player', component: PlayerComponent },
            { path: 'discover', component: DiscoverComponent },
            { path: 'videos', loadComponent: () => import('./components/videos/videos.component').then(m => m.VideosComponent) },
            { path: 'radio', loadComponent: () => import('./components/radio/radio.component').then(m => m.RadioComponent) },
            { path: 'playlists', loadComponent: () => import('./components/playlists/playlists.component').then(m => m.PlaylistsComponent) }
        ]
    },
    { path: 'download', component: DownloadPageComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
