import { Component, OnInit, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-converter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './converter.component.html',
    styleUrls: ['./converter.component.css']
})
export class ConverterComponent implements OnInit {
    youtubeUrl: string = '';
    isLoading: boolean = false;
    showResult: boolean = false;
    error: string = '';

    // Resultados
    videoTitle: string = '';
    videoThumb: string = '';
    downloadUrl: string = '';
    audioFormat: string = 'MP3'; // Por defecto MP3

    // Alias para el HTML que espera 'downloadLink'
    get downloadLink(): string {
        return this.downloadUrl;
    }

    constructor(
        private http: HttpClient,
        private toastService: ToastService,
        private titleService: Title,
        private metaService: Meta
    ) { }

    ngOnInit() {
        // --- 1. SEO OPTIMIZATION ---
        this.titleService.setTitle('Convertidor YouTube a MP3 Seguro - DonMusica');

        // Meta Tags básicos
        this.metaService.updateTag({ name: 'description', content: 'Convierte videos de YouTube a MP3 o M4A gratis en DonMusica. Rápido, seguro y compatible con iPhone y Android.' });
        this.metaService.updateTag({ name: 'keywords', content: 'youtube mp3, convertidor youtube, descargar musica, donmusica, youtube a m4a' });
        this.metaService.updateTag({ name: 'robots', content: 'index, follow' });

        // Open Graph & Canonical
        this.metaService.updateTag({ property: 'og:url', content: 'https://donmusica.online/converter' });
        this.metaService.updateTag({ property: 'og:title', content: 'Descarga Música de YouTube Gratis - DonMusica' });
        this.metaService.updateTag({ property: 'og:description', content: 'Convertidor rápido y seguro. Pega tu link y baja tu canción en alta calidad.' });
        this.metaService.updateTag({ property: 'og:image', content: 'https://donmusica.online/assets/icons/icon-512x512.png' });
        this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }

    onUrlChange() {
        this.showResult = false;
        this.error = '';
    }

    convert() {
        if (!this.youtubeUrl) {
            this.toastService.error('Por favor ingresa una URL');
            return;
        }

        this.isLoading = true;
        this.error = '';

        // --- 2. SMART API ROUTING ---
        // En local usamos localhost:5000, en Vercel usamos ruta relativa /api
        const apiUrl = isDevMode()
            ? 'http://localhost:5000/api/convert'
            : '/api/convert';

        this.http.post<any>(apiUrl, { url: this.youtubeUrl }).subscribe({
            next: (res) => {
                this.isLoading = false;

                if (res.success) {
                    this.showResult = true;
                    this.videoTitle = res.title || 'Audio Listo';
                    this.videoThumb = res.thumbnail || '';
                    this.audioFormat = res.format || 'M4A';

                    // Si es entorno local y M4A, usamos el proxy de descarga
                    if (isDevMode() && res.originalUrl) {
                        const encodedUrl = encodeURIComponent(res.originalUrl);
                        this.downloadUrl = `http://localhost:5000/api/download?url=${encodedUrl}`;
                    } else {
                        // En producción (Vercel) o si ya viene el link directo MP3
                        this.downloadUrl = res.downloadUrl;
                    }

                    this.toastService.success(`¡Convertido a ${this.audioFormat}!`);
                } else {
                    this.error = res.error || 'No se pudo procesar.';
                    this.toastService.error(this.error);
                }
            },
            error: (err) => {
                this.isLoading = false;
                console.error(err);
                this.error = 'Error de conexión. Intenta de nuevo.';
                this.toastService.error(this.error);
            }
        });
    }

    downloadFile() {
        if (this.downloadUrl) {
            window.open(this.downloadUrl, '_blank');
        }
    }

    clearForm() {
        this.youtubeUrl = '';
        this.showResult = false;
        this.downloadUrl = '';
        this.error = '';
    }
}
