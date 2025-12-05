import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface VideoInfo {
    title: string;
    thumbnail: string;
    duration: string;
    channel: string;
    views: string;
    videoId: string;
}

export interface ConversionResult {
    success: boolean;
    title?: string;
    downloadUrl?: string; // URL directa para descargar
    format?: string;
    quality?: string;
    thumbnail?: string;
    duration?: string;
    error?: string;
    channel?: string;
    views?: number;
    videoId?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConverterService {
    private apiUrl = 'http://localhost:5000/api'; // API local

    constructor(private http: HttpClient) { }

    getVideoInfo(url: string): Observable<VideoInfo> {
        return this.http.post<any>(`${this.apiUrl}/convert`, { url, quality: 'medium' }).pipe( // Usamos /convert para info también si se quiere, o mock
            map(res => {
                // Hack: usaremos la API de conversión para obtener info también si se puede
                // Por ahora, usaremos lógica cliente para no saturar
                const videoId = this.extractVideoId(url);
                return {
                    title: 'Video de YouTube',
                    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    duration: '...',
                    channel: 'YouTube',
                    views: '',
                    videoId: videoId || ''
                };
            })
        );
    }

    convertLink(youtubeUrl: string, quality: 'high' | 'medium' = 'high'): Observable<ConversionResult> {
        return this.http.post<any>(`${this.apiUrl}/convert`, {
            url: youtubeUrl,
            quality: quality
        }).pipe(
            map((response: any) => {
                if (response.success) {
                    return response;
                } else {
                    return { success: false, error: response.error || 'Error al convertir' };
                }
            }),
            catchError((error) => {
                console.error('API error:', error);
                return [{ success: false, error: error.error?.error || 'Error de conexión. Intenta nuevamente.' }];
            })
        );
    }

    // Mantener compatibilidad con el componente
    convertLinkObservable(youtubeUrl: string): Observable<ConversionResult> {
        return this.convertLink(youtubeUrl);
    }

    private extractVideoId(url: string): string | null {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length == 11) ? match[7] : null;
    }
}
