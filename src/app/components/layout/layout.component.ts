import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { Song } from '../../services/playlist.service';
import { filter } from 'rxjs/operators';

import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  currentSong: Song | null = null;
  isPlaying = false;
  isFavoritesPlaying = false;
  showMoreMenu = false;
  showMobileMoreMenu = false;
  private previousRoute: string = '/';

  toggleMoreMenu() {
    this.showMoreMenu = !this.showMoreMenu;
  }

  closeMoreMenu() {
    this.showMoreMenu = false;
  }

  toggleMobileMoreMenu() {
    this.showMobileMoreMenu = !this.showMobileMoreMenu;
  }

  closeMobileMoreMenu() {
    this.showMobileMoreMenu = false;
  }

  constructor(
    public playerService: PlayerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Suscribirse al estado del reproductor
    this.playerService.currentSong$.subscribe(song => {
      this.currentSong = song;
    });

    this.playerService.isPlaying$.subscribe(playing => {
      this.isPlaying = playing;
    });

    this.playerService.isFavoritesPlaying$.subscribe(isFav => {
      this.isFavoritesPlaying = isFav;
    });

    // Track navigation to remember where we came from
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Only update previousRoute if we're not going to player
      if (!event.url.startsWith('/player')) {
        this.previousRoute = event.url;
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    const currentUrl = this.router.url;

    // Exact match for home route
    if (route === '/' || route === '') {
      return currentUrl === '/' || currentUrl === '';
    }

    // Special handling for /player route
    if (currentUrl.startsWith('/player')) {
      // Check if we're checking the artists route
      if (route === '/artists') {
        // Only highlight artists if we came from artists or have artistId in URL
        return currentUrl.includes('artistId') || this.previousRoute === '/artists';
      }
      // Check if we're checking playlists route
      if (route === '/playlists') {
        // Highlight playlists if we came from playlists
        return this.previousRoute === '/playlists';
      }
      return false;
    }

    // For other routes, check if URL starts with the route
    return currentUrl.startsWith(route);
  }

  togglePlayPause(): void {
    if (this.currentSong) {
      if (this.isPlaying) {
        this.playerService.pause();
      } else {
        this.playerService.play();
      }
    }
  }

  previousTrack(): void {
    this.playerService.previousTrack();
  }

  nextTrack(): void {
    this.playerService.nextTrack();
  }

  closePlayer(): void {
    this.playerService.stop();
  }

  openPlayer(): void {
    this.router.navigate(['/player']);
  }
}
