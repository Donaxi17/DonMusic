import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private seoService = inject(SeoService);

  requestArtist = '';
  requestSong = '';
  requestMessage = '';

  ngOnInit() {
    this.seoService.setSeoData(
      'Inicio',
      'Bienvenido a DonMusica. Escucha y descarga tu música favorita gratis. La mejor calidad de sonido y los artistas del momento.'
    );
  }

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
