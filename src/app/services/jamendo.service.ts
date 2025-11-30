import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Song } from './playlist.service';

interface JamendoTrack {
    id: string;
    name: string;
    artist_name: string;
    album_name: string;
    album_image: string;
    image: string;
    audio: string;
    audiodownload: string;
    duration: number;
    license_ccurl: string;
    musicinfo?: {
        tags?: {
            genres?: string[];
            instruments?: string[];
            vartags?: string[];
        };
    };
}

interface JamendoResponse {
    headers: {
        status: string;
        code: number;
        results_count: number;
    };
    results: JamendoTrack[];
}

@Injectable({
    providedIn: 'root'
})
export class JamendoService {
    private readonly apiUrl = 'https://api.jamendo.com/v3.0';
    private readonly clientId = '22cf1948'; // Tu client ID de Jamendo

    constructor(private http: HttpClient) { }

    /**
     * Obtener canciones populares
     */
    getPopularTracks(limit: number = 30): Observable<Song[]> {
        return this.http.get<JamendoResponse>(`${this.apiUrl}/tracks`, {
            params: {
                client_id: this.clientId,
                format: 'json',
                limit: limit.toString(),
                order: 'popularity_total',
                audioformat: 'mp32',
                include: 'musicinfo'
            }
        }).pipe(
            map(response => this.convertToSongs(response.results))
        );
    }

    /**
     * Buscar canciones por género
     */
    searchByGenre(genre: string, limit: number = 30): Observable<Song[]> {
        return this.http.get<JamendoResponse>(`${this.apiUrl}/tracks`, {
            params: {
                client_id: this.clientId,
                format: 'json',
                limit: limit.toString(),
                tags: genre,
                include: 'musicinfo',
                audioformat: 'mp32',
                order: 'popularity_month'
            }
        }).pipe(
            map(response => this.convertToSongs(response.results))
        );
    }

    /**
     * Buscar canciones por texto
     */
    searchTracks(query: string, limit: number = 30): Observable<Song[]> {
        return this.http.get<JamendoResponse>(`${this.apiUrl}/tracks`, {
            params: {
                client_id: this.clientId,
                format: 'json',
                search: query,
                limit: limit.toString(),
                audioformat: 'mp32',
                include: 'musicinfo'
            }
        }).pipe(
            map(response => this.convertToSongs(response.results))
        );
    }

    /**
     * Obtener canciones por artista
     */
    getArtistTracks(artistName: string, limit: number = 20): Observable<Song[]> {
        return this.http.get<JamendoResponse>(`${this.apiUrl}/tracks`, {
            params: {
                client_id: this.clientId,
                format: 'json',
                artist_name: artistName,
                limit: limit.toString(),
                audioformat: 'mp32',
                include: 'musicinfo'
            }
        }).pipe(
            map(response => this.convertToSongs(response.results))
        );
    }

    /**
     * Obtener canciones por diferentes géneros (mix)
     */
    getGenreMix(limit: number = 40): Observable<Song[]> {
        const genres = ['pop', 'rock', 'electronic', 'jazz', 'classical', 'ambient'];
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];
        return this.searchByGenre(randomGenre, limit);
    }

    /**
     * Convertir respuesta de Jamendo a formato Song
     */
    private convertToSongs(tracks: JamendoTrack[]): Song[] {
        return tracks.map((track, index) => ({
            id: `jamendo-${track.id}`,
            artistId: 999, // ID especial para música de Jamendo
            img: track.album_image || track.image || '/assets/img/default-album.jpg',
            title: track.name,
            artist: track.artist_name,
            duration: this.formatDuration(track.duration),
            url: track.audio,
            album: track.album_name,
            genre: track.musicinfo?.tags?.genres?.join(', ') || 'Varios',
            license: track.license_ccurl
        }));
    }

    /**
     * Formatear duración de segundos a mm:ss
     */
    private formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
