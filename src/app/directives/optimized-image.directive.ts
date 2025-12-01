import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';
import { ImageOptimizationService } from '../services/image-optimization.service';

@Directive({
    selector: 'img[appOptimizedImage]',
    standalone: true
})
export class OptimizedImageDirective implements OnInit {
    @Input() appOptimizedImage?: number; // Optional width
    @Input() quality: number = 80;

    private el = inject(ElementRef<HTMLImageElement>);
    private imageService = inject(ImageOptimizationService);

    ngOnInit() {
        const img = this.el.nativeElement;
        const originalSrc = img.src || img.getAttribute('src') || '';

        if (originalSrc) {
            // Get optimized URL
            const optimizedSrc = this.imageService.getOptimizedImageUrl(
                originalSrc,
                this.appOptimizedImage,
                this.quality
            );

            // Set optimized source
            img.src = optimizedSrc;

            // Add loading="lazy" if not already set
            if (!img.loading) {
                img.loading = 'lazy';
            }

            // Add decoding="async" for better performance
            img.decoding = 'async';

            // Generate srcset for responsive images
            if (this.appOptimizedImage) {
                const srcset = this.imageService.generateSrcSet(originalSrc);
                img.srcset = srcset;
                img.sizes = `(max-width: 768px) 100vw, ${this.appOptimizedImage}px`;
            }
        }
    }
}
