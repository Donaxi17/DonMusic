import { Injectable } from '@angular/core';

export interface SavedLyric {
    id: string;
    title: string;
    artist: string;
    content: string;
    savedAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class LyricsService {
    private readonly STORAGE_KEY = 'donmusic_saved_lyrics';

    constructor() { }

    getSavedLyrics(): SavedLyric[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            const lyrics = data ? JSON.parse(data) : [];
            console.log('Letras guardadas cargadas:', lyrics.length);
            return lyrics;
        } catch (error) {
            console.error('Error al cargar letras:', error);
            return [];
        }
    }

    saveLyric(title: string, artist: string, content: string): void {
        try {
            const lyrics = this.getSavedLyrics();

            // Check if already saved
            const exists = lyrics.some(l => l.title === title && l.artist === artist);
            if (exists) {
                console.log('Letra ya existe:', title, artist);
                return;
            }

            const newLyric: SavedLyric = {
                id: Date.now().toString(),
                title,
                artist,
                content,
                savedAt: new Date()
            };

            lyrics.unshift(newLyric); // Add to beginning
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lyrics));
            console.log('Letra guardada exitosamente:', title, artist);
            console.log('Total de letras guardadas:', lyrics.length);
        } catch (error) {
            console.error('Error al guardar letra:', error);
        }
    }

    deleteLyric(id: string): void {
        let lyrics = this.getSavedLyrics();
        lyrics = lyrics.filter(l => l.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lyrics));
    }

    isSaved(title: string, artist: string): boolean {
        const lyrics = this.getSavedLyrics();
        return lyrics.some(l => l.title === title && l.artist === artist);
    }
}
