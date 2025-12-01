import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService, BlogPost } from '../../services/blog.service';
import { AdBannerComponent } from '../shared/ad-banner/ad-banner.component';
import { SeoService } from '../../services/seo.service';

@Component({
    selector: 'app-blog',
    standalone: true,
    imports: [CommonModule, AdBannerComponent],
    templateUrl: './blog.component.html'
})
export class BlogComponent implements OnInit {
    private blogService = inject(BlogService);
    private seoService = inject(SeoService);

    posts = signal<BlogPost[]>([]);
    loading = signal(true);
    selectedPost = signal<BlogPost | null>(null);
    showModal = signal(false);

    ngOnInit() {
        this.seoService.setSeoData(
            'Blog de Música',
            'Noticias, reseñas y novedades del mundo de la música urbana. Mantente al día con DonMusica.'
        );

        this.blogService.getPosts().subscribe(data => {
            this.posts.set(data);
            this.loading.set(false);
        });
    }

    openPost(post: BlogPost) {
        this.selectedPost.set(post);
        this.showModal.set(true);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.showModal.set(false);
        this.selectedPost.set(null);
        document.body.style.overflow = 'auto';
    }

    onImageError(event: any, id: any) {
        event.target.src = `https://picsum.photos/seed/music${id}/800/500`;
    }
}
