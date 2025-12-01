import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto animate-slide-in-right bg-zinc-900 border rounded-xl shadow-2xl overflow-hidden min-w-[280px] max-w-md"
          [class.border-emerald-500]="toast.type === 'success'"
          [class.border-red-500]="toast.type === 'error'"
          [class.border-blue-500]="toast.type === 'info'"
          [class.border-yellow-500]="toast.type === 'warning'">
          
          <div class="flex items-start gap-3 p-4">
            <!-- Icon -->
            <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              @if (toast.type === 'success') {
                <i class='bx bx-check-circle text-2xl text-emerald-500'></i>
              }
              @if (toast.type === 'error') {
                <i class='bx bx-error-circle text-2xl text-red-500'></i>
              }
              @if (toast.type === 'info') {
                <i class='bx bx-info-circle text-2xl text-blue-500'></i>
              }
              @if (toast.type === 'warning') {
                <i class='bx bx-error text-2xl text-yellow-500'></i>
              }
            </div>

            <!-- Message -->
            <p class="flex-1 text-sm text-white font-medium leading-relaxed">
              {{ toast.message }}
            </p>

            <!-- Close Button -->
            <button 
              (click)="toastService.remove(toast.id)"
              class="flex-shrink-0 w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
              <i class='bx bx-x text-xl'></i>
            </button>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    @keyframes slide-in-right {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }
  `]
})
export class ToastContainerComponent {
    toastService = inject(ToastService);
}
