import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ImageOptimizationService {

    /**
     * Converts an image URL to WebP format if supported by the browser
     * Falls back to original format if WebP is not supported
     */
    getOptimizedImageUrl(originalUrl: string, width?: number, quality: number = 80): string {
        if (!originalUrl) return '';

        // Check if browser supports WebP
        const supportsWebP = this.checkWebPSupport();

        // Handle Unsplash images
        if (originalUrl.includes('unsplash.com')) {
            let optimizedUrl = originalUrl;

            // Add width parameter
            if (width) {
                optimizedUrl = this.addUrlParam(optimizedUrl, 'w', width.toString());
            }

            // Add quality parameter
            optimizedUrl = this.addUrlParam(optimizedUrl, 'q', quality.toString());

            // Add WebP format if supported
            if (supportsWebP) {
                optimizedUrl = this.addUrlParam(optimizedUrl, 'fm', 'webp');
            }

            // Enable auto format and fit
            optimizedUrl = this.addUrlParam(optimizedUrl, 'auto', 'format');
            optimizedUrl = this.addUrlParam(optimizedUrl, 'fit', 'crop');

            return optimizedUrl;
        }

        // Handle Picsum images
        if (originalUrl.includes('picsum.photos')) {
            if (supportsWebP && width) {
                // Picsum supports WebP via extension
                return originalUrl.replace(/\/([\d]+)\/([\d]+)/, `/${width}/${width}.webp`);
            }
        }

        // Handle iTunes/Apple Music images
        if (originalUrl.includes('mzstatic.com')) {
            if (width) {
                // Replace size in URL (e.g., 100x100 -> 600x600)
                return originalUrl.replace(/\/(\d+)x(\d+)bb\./, `/${width}x${width}bb.`);
            }
        }

        // Return original URL if no optimization is possible
        return originalUrl;
    }

    /**
     * Generates srcset for responsive images
     */
    generateSrcSet(baseUrl: string, sizes: number[] = [320, 640, 960, 1280, 1920]): string {
        return sizes
            .map(size => `${this.getOptimizedImageUrl(baseUrl, size)} ${size}w`)
            .join(', ');
    }

    /**
     * Check if browser supports WebP
     */
    private checkWebPSupport(): boolean {
        // Check if already cached
        const cached = sessionStorage.getItem('webp-support');
        if (cached !== null) {
            return cached === 'true';
        }

        // Create a test image
        const canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
            const result = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            sessionStorage.setItem('webp-support', result.toString());
            return result;
        }

        return false;
    }

    /**
     * Helper to add URL parameters
     */
    private addUrlParam(url: string, key: string, value: string): string {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${key}=${value}`;
    }

    /**
     * Preload critical images
     */
    preloadImage(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = url;
        });
    }

    /**
     * Lazy load images with Intersection Observer
     */
    lazyLoadImage(img: HTMLImageElement): void {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target as HTMLImageElement;
                        const src = lazyImage.dataset['src'];
                        if (src) {
                            lazyImage.src = src;
                            lazyImage.classList.add('loaded');
                            observer.unobserve(lazyImage);
                        }
                    }
                });
            });

            observer.observe(img);
        } else {
            // Fallback for browsers without Intersection Observer
            const src = img.dataset['src'];
            if (src) {
                img.src = src;
            }
        }
    }
}
