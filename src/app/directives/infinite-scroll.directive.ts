import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
    selector: '[appInfiniteScroll]',
    standalone: true
})
export class InfiniteScrollDirective {
    @Output() scrolled = new EventEmitter<void>();

    @HostListener('window:scroll', ['$event'])
    onScroll(): void {
        const scrollPosition = window.pageYOffset + window.innerHeight;
        const pageHeight = document.documentElement.scrollHeight;
        const threshold = 200; // Trigger 200px before reaching bottom

        if (scrollPosition >= pageHeight - threshold) {
            this.scrolled.emit();
        }
    }
}
