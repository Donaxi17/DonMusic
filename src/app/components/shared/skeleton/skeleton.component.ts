import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="animate-pulse">
      @if (type === 'card') {
        <div class="bg-zinc-800/50 rounded-xl overflow-hidden">
          <div class="aspect-square bg-zinc-700/50"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 bg-zinc-700/50 rounded w-3/4"></div>
            <div class="h-3 bg-zinc-700/50 rounded w-1/2"></div>
          </div>
        </div>
      }
      
      @if (type === 'list-item') {
        <div class="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/40">
          <div class="w-12 h-12 md:w-16 md:h-16 bg-zinc-700/50 rounded-lg flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-zinc-700/50 rounded w-3/4"></div>
            <div class="h-3 bg-zinc-700/50 rounded w-1/2"></div>
          </div>
        </div>
      }
      
      @if (type === 'text') {
        <div class="h-4 bg-zinc-700/50 rounded" [style.width]="width"></div>
      }
      
      @if (type === 'circle') {
        <div class="bg-zinc-700/50 rounded-full" [style.width]="size" [style.height]="size"></div>
      }
      
      @if (type === 'rectangle') {
        <div class="bg-zinc-700/50 rounded-lg" [style.width]="width" [style.height]="height"></div>
      }
    </div>
  `,
    styles: [`
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class SkeletonComponent {
    @Input() type: 'card' | 'list-item' | 'text' | 'circle' | 'rectangle' = 'card';
    @Input() width = '100%';
    @Input() height = '100px';
    @Input() size = '50px';
}
