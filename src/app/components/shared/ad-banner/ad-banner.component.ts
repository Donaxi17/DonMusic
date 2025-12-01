import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full my-6 flex justify-center items-center flex-col">
      <!-- Placeholder Visual (Visible para debug) -->
      <div class="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 max-w-4xl w-full text-center relative overflow-hidden group mb-4">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        
        <div class="flex flex-col items-center justify-center gap-2">
          <span class="text-xs font-bold text-zinc-500 uppercase tracking-widest border border-zinc-600 px-2 py-0.5 rounded">Publicidad</span>
          <h3 class="text-zinc-300 font-medium">{{ adName }}</h3>
          <p class="text-zinc-500 text-xs font-mono mt-1">
            <span class="text-cyan-500">Slot ID: {{ adSlot || 'No asignado' }}</span> 
            <span class="mx-2">|</span> 
            Formato: {{ adFormat }}
          </p>
        </div>
      </div>

      <!-- Código Real de AdSense -->
      <div *ngIf="adSlot" class="w-full flex justify-center">
          <ins class="adsbygoogle"
               style="display:block"
               [attr.data-ad-client]="adClient"
               [attr.data-ad-slot]="adSlot"
               [attr.data-ad-format]="adFormat"
               [attr.data-full-width-responsive]="true"></ins>
          <script>
               (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
  `]
})
export class AdBannerComponent {
  @Input() adName: string = 'Banner Publicitario';
  @Input() adSlot: string = '';
  @Input() adFormat: string = 'auto';
  @Input() adClient: string = 'ca-pub-8359193264058620';
}
