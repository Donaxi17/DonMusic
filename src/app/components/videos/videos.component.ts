import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SafePipe } from '../../pipes/safe.pipe';

interface Video {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  views: string;
}

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, SafePipe],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.css'
})
export class VideosComponent {
  currentVideoUrl = signal<string | null>(null);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  isVideoLoading = signal<boolean>(false);
  watchOnYoutubeUrl = signal<string | null>(null);

  private readonly API_URL = 'https://itunes.apple.com/search';

  videos = signal<Video[]>([
    {
      id: '1',
      title: 'LUNA',
      artist: 'Feid & ATL Jacob',
      thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Video116/v4/9c/32/32/9c323260-243e-3b6d-3663-752109f78a0d/Job249c5306-695f-40c2-902e-36043234033c-159648939-PreviewImage_preview_image_nonvideo_sdr-Time1701363715625.png/600x600bb.jpg',
      views: 'Popular'
    },
    {
      id: '2',
      title: 'PERRO NEGRO',
      artist: 'Bad Bunny & Feid',
      thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Video126/v4/64/0e/0e/640e0e0e-0e0e-0e0e-0e0e-0e0e0e0e0e0e/Job249c5306-695f-40c2-902e-36043234033c-159648939-PreviewImage_preview_image_nonvideo_sdr-Time1701363715625.png/600x600bb.jpg',
      views: 'Tendencia'
    },
    {
      id: '3',
      title: 'QLONA',
      artist: 'Karol G & Peso Pluma',
      thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/12/34/56/12345678-1234-1234-1234-1234567890ab/cover.jpg/600x600bb.jpg',
      views: 'Top 10'
    }
  ]);

  constructor(private http: HttpClient) {
    this.searchQuery.set('Feid');
    this.search();
  }

  search() {
    const query = this.searchQuery();
    if (!query.trim()) return;
    this.isLoading.set(true);
    this.http.get<any>(this.API_URL, {
      params: {
        term: query,
        media: 'music',
        entity: 'musicVideo',
        limit: '20'
      }
    }).subscribe({
      next: (response) => {
        const mappedVideos: Video[] = response.results.map((item: any) => ({
          id: item.trackId.toString(),
          title: item.trackName,
          artist: item.artistName,
          thumbnail: item.artworkUrl100.replace('100x100', '600x600'),
          views: item.primaryGenreName
        }));
        this.videos.set(mappedVideos);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error buscando en iTunes:', err);
        this.isLoading.set(false);
      }
    });
  }

  playVideo(video: Video) {
    this.isVideoLoading.set(true);
    const query = `${video.title} ${video.artist}`;

    // Llamar a nuestra API serverless
    this.http.get<any>(`/api/video-proxy?query=${encodeURIComponent(query)}`).subscribe({
      next: (response) => {
        if (response.videoId) {
          // Usar el embed de YouTube con el video ID específico
          this.currentVideoUrl.set(response.embedUrl);
          this.watchOnYoutubeUrl.set(response.watchUrl);
        } else {
          throw new Error('No video ID');
        }
        this.isVideoLoading.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        console.error('Error fetching video:', err);
        // Fallback a búsqueda de YouTube
        const searchQuery = encodeURIComponent(query);
        this.currentVideoUrl.set(`https://www.youtube.com/embed?listType=search&list=${searchQuery}&autoplay=1`);
        this.watchOnYoutubeUrl.set(`https://www.youtube.com/results?search_query=${searchQuery}`);
        this.isVideoLoading.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  closeVideo() {
    this.currentVideoUrl.set(null);
    this.watchOnYoutubeUrl.set(null);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  updateQuery(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }
}
