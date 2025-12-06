import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../../services/history.service';

@Component({
    selector: 'app-recently-played',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-end animate-fade-in" (click)="close()">
        <div class="w-full max-w-xs h-full bg-zinc-950 border-l border-white/10 shadow-2xl animate-slide-in-right flex flex-col" (click)="$event.stopPropagation()">
            
            <!-- Header (Safe Area for Mobile) - Padding y Textos Reducidos -->
            <div class="pt-safe-top bg-zinc-950/95 backdrop-blur z-10 border-b border-white/5">
                <div class="p-3 flex items-center justify-between">
                    <h2 class="text-sm font-bold text-white flex items-center gap-2 truncate pr-2">
                        <i class='bx bx-history text-emerald-500 text-lg'></i> 
                        <span class="truncate tracking-wide">Historial</span>
                    </h2>
                    
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <div class="flex items-center gap-3 mr-1">
                             <!-- Espacio para Redes Sociales si se agregan dinámicamente -->
                        </div>
                        
                        <button (click)="clear()" *ngIf="(history$ | async)?.length" 
                            class="text-[10px] text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors uppercase tracking-wider">
                            Borrar
                        </button>
                        <button (click)="close()" 
                            class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors z-50 relative">
                            <i class='bx bx-x text-2xl'></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto p-2 md:p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <div *ngFor="let song of history$ | async" 
                     class="group flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5">
                    
                    <div class="relative w-10 h-10 rounded overflow-hidden shadow-lg group-hover:shadow-emerald-500/10 transition-shadow flex-shrink-0 bg-zinc-900">
                        <img [src]="song.img" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                             <i class='bx bx-play text-white opacity-0 group-hover:opacity-100 text-xl transform scale-50 group-hover:scale-100 transition-all'></i>
                        </div>
                    </div>

                    <div class="flex-1 min-w-0">
                        <h3 class="text-xs font-bold text-gray-200 truncate group-hover:text-emerald-400 transition-colors">{{ song.title }}</h3>
                        <p class="text-[10px] text-zinc-500 truncate">{{ song.artist }}</p>
                    </div>

                    <div class="flex flex-col items-end gap-1">
                        <span class="text-[9px] text-zinc-600 font-mono flex-shrink-0 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">
                            {{ getTimeAgo(song.timestamp) }}
                        </span>
                    </div>
                </div>

                <div *ngIf="(history$ | async)?.length === 0" class="h-full flex flex-col items-center justify-center text-zinc-600 pb-12">
                    <div class="w-12 h-12 rounded-full bg-zinc-900/50 border border-white/5 flex items-center justify-center mb-2 animate-pulse-slow">
                        <i class='bx bx-time-five text-2xl text-zinc-700'></i>
                    </div>
                    <p class="text-xs font-medium text-zinc-500">Sin historial reciente</p>
                </div>
            </div>
        </div>
    </div>
  `
})
export class RecentlyPlayedComponent {
    history$;

    constructor(private historyService: HistoryService) {
        this.history$ = this.historyService.history$;
    }

    close() {
        // Dispatch event to close in layout
        document.dispatchEvent(new CustomEvent('closeHistory'));
    }

    clear() {
        this.historyService.clearHistory();
    }

    getTimeAgo(timestamp: number): string {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Ahora';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return '1d+';
    }
}
