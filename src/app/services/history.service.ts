import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface HistoryItem {
    id: string;
    title: string;
    artist: string;
    img: string;
    timestamp: number;
    type: 'video' | 'audio';
}

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private readonly STORAGE_KEY = 'donmusic_history';
    private historySubject = new BehaviorSubject<HistoryItem[]>([]);
    public history$ = this.historySubject.asObservable();

    constructor() {
        this.loadHistory();
    }

    private loadHistory() {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                try {
                    this.historySubject.next(JSON.parse(saved));
                } catch (e) {
                    console.error('Error loading history', e);
                }
            }
        }
    }

    addToHistory(song: any) {
        if (!song || !song.title) return;

        const newItem: HistoryItem = {
            id: song.videoId || song.id || 'unknown',
            title: song.title,
            artist: song.artist || 'Desconocido',
            img: song.img || song.thumbnail || 'assets/images/default-music.png',
            timestamp: Date.now(),
            type: song.videoId ? 'video' : 'audio'
        };

        let current = this.historySubject.value;
        current = current.filter(item => item.title !== newItem.title); // Evitar duplicados
        current.unshift(newItem);
        if (current.length > 20) current = current.slice(0, 20);

        this.historySubject.next(current);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
    }

    clearHistory() {
        this.historySubject.next([]);
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
