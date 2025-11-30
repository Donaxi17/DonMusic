import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  requestArtist = '';
  requestSong = '';
  requestMessage = '';

  constructor(private router: Router) { }

  navigateToArtists(): void {
    this.router.navigate(['/artists']);
  }

  submitRequest(): void {
    if (!this.requestArtist || !this.requestSong) {
      alert('Por favor completa el nombre del artista y la canción/álbum');
      return;
    }

    console.log('Music Request:', {
      artist: this.requestArtist,
      song: this.requestSong,
      message: this.requestMessage
    });

    alert('¡Solicitud enviada con éxito! Trabajaremos para agregar tu música pronto.');

    // Reset form
    this.requestArtist = '';
    this.requestSong = '';
    this.requestMessage = '';
  }
}
