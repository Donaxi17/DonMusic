import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of, catchError, switchMap } from 'rxjs';
import { Song } from './playlist.service';
import { environment } from '../../environments/environment';

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string; id: string }>;
    album: {
        name: string;
        images: Array<{ url: string; height: number; width: number }>;
    };
    duration_ms: number;
    preview_url: string | null;
}

export interface iTunesTrack {
    trackId: number;
    trackName: string;
    artistName: string;
    collectionName: string;
    artworkUrl100: string;
    previewUrl: string;
    trackTimeMillis: number;
    primaryGenreName: string;
}

@Injectable({
    providedIn: 'root'
})
export class MusicApiService {
    private readonly SPOTIFY_API_URL = 'https://api.spotify.com/v1';
    private readonly SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
    private readonly LYRICS_API_URL = 'https://api.lyrics.ovh/v1';
    private readonly GENIUS_API_URL = 'https://api.genius.com';
    private spotifyToken: string | null = null;

    constructor(private http: HttpClient) {
        this.getSpotifyToken();
    }

    private getSpotifyToken(): Observable<string> {
        if (this.spotifyToken) {
            return of(this.spotifyToken);
        }

        const body = 'grant_type=client_credentials';
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${environment.spotify.clientId}:${environment.spotify.clientSecret}`)
        });

        return this.http.post<any>(this.SPOTIFY_TOKEN_URL, body, { headers }).pipe(
            map(response => {
                this.spotifyToken = response.access_token;
                return response.access_token;
            }),
            catchError(err => {
                console.error('Error getting Spotify token:', err);
                return of('');
            })
        );
    }

    getTrending(region: string = 'US'): Observable<Song[]> {
        console.log('Getting trending for region:', region);
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) {
                    console.log('No token, using fallback');
                    return this.getFallbackTrending(region);
                }

                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });

                return this.http.get<any>(`${this.SPOTIFY_API_URL}/browse/featured-playlists?country=${region}&limit=1`, { headers }).pipe(
                    switchMap(playlistResponse => {
                        if (playlistResponse.playlists?.items?.length > 0) {
                            const playlistId = playlistResponse.playlists.items[0].id;
                            return this.http.get<any>(`${this.SPOTIFY_API_URL}/playlists/${playlistId}/tracks?limit=20`, { headers }).pipe(
                                map(tracksResponse => {
                                    if (tracksResponse.items) {
                                        return tracksResponse.items
                                            .filter((item: any) => item.track)
                                            .map((item: any) => this.convertSpotifyToSong(item.track));
                                    }
                                    return [];
                                })
                            );
                        }
                        return this.getFallbackTrending(region);
                    }),
                    catchError(err => {
                        console.error('Error fetching Spotify trending:', err);
                        return this.getFallbackTrending(region);
                    })
                );
            })
        );
    }

    search(query: string): Observable<Song[]> {
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) {
                    return this.searchITunes(query);
                }

                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });

                return this.http.get<any>(`${this.SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=20`, { headers }).pipe(
                    map(response => {
                        if (response.tracks?.items) {
                            return response.tracks.items.map((track: SpotifyTrack) => this.convertSpotifyToSong(track));
                        }
                        return [];
                    }),
                    catchError(err => {
                        console.error('Error searching Spotify:', err);
                        return this.searchITunes(query);
                    })
                );
            })
        );
    }

    private searchITunes(query: string): Observable<Song[]> {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`;

        return this.http.get<any>(url).pipe(
            map(response => {
                if (response.results && response.results.length > 0) {
                    return response.results.map((track: iTunesTrack) => this.convertITunesToSong(track));
                }
                return [];
            }),
            catchError(err => {
                console.error('Error searching iTunes:', err);
                return of([]);
            })
        );
    }

    getNewReleases(country: string = 'US', limit: number = 20): Observable<Song[]> {
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) return of([]);

                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });

                return this.http.get<any>(`${this.SPOTIFY_API_URL}/browse/new-releases?country=${country}&limit=${limit}`, { headers }).pipe(
                    map(response => {
                        if (response.albums?.items) {
                            return response.albums.items.map((album: any) => ({
                                id: album.id,
                                artistId: 0,
                                title: album.name,
                                artist: album.artists.map((a: any) => a.name).join(', '),
                                album: album.name,
                                img: album.images[0]?.url || 'https://via.placeholder.com/300',
                                url: '',
                                duration: '3:00',
                                genre: album.genres?.[0] || 'Pop',
                                isStreamUrlFetched: false
                            }));
                        }
                        return [];
                    }),
                    catchError(() => of([]))
                );
            })
        );
    }

    getFeaturedPlaylists(country: string = 'US', limit: number = 20): Observable<any[]> {
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) return of([]);

                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });

                return this.http.get<any>(`${this.SPOTIFY_API_URL}/browse/featured-playlists?country=${country}&limit=${limit}`, { headers }).pipe(
                    map(response => {
                        if (response.playlists?.items) {
                            return response.playlists.items.map((playlist: any) => ({
                                id: playlist.id,
                                name: playlist.name,
                                description: playlist.description,
                                img: playlist.images[0]?.url || 'https://via.placeholder.com/300',
                                tracks: playlist.tracks.total
                            }));
                        }
                        return [];
                    }),
                    catchError(() => of([]))
                );
            })
        );
    }

    getGenres(): Observable<string[]> {
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) {
                    return of(this.getFallbackGenres());
                }

                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });

                return this.http.get<any>(`${this.SPOTIFY_API_URL}/recommendations/available-genre-seeds`, { headers }).pipe(
                    map(response => response.genres || this.getFallbackGenres()),
                    catchError(() => of(this.getFallbackGenres()))
                );
            })
        );
    }

    private getFallbackGenres(): string[] {
        return [
            'pop', 'rock', 'hip-hop', 'electronic', 'latin', 'reggaeton',
            'indie', 'r-n-b', 'jazz', 'classical', 'metal', 'country',
            'blues', 'funk', 'soul', 'disco', 'house', 'techno',
            'salsa', 'bachata', 'merengue', 'cumbia', 'vallenato', 'tango'
        ];
    }

    getTracksByGenre(genre: string, limit: number = 20): Observable<Song[]> {
        return this.getSpotifyToken().pipe(
            switchMap(token => {
                if (!token) {
                    return of(this.getFallbackTracksByGenre(genre));
                }

                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });

                return this.http.get<any>(`${this.SPOTIFY_API_URL}/recommendations?seed_genres=${genre}&limit=${limit}`, { headers }).pipe(
                    map(response => {
                        if (response.tracks && response.tracks.length > 0) {
                            return response.tracks.map((track: SpotifyTrack) => this.convertSpotifyToSong(track));
                        }
                        return this.getFallbackTracksByGenre(genre);
                    }),
                    catchError(() => of(this.getFallbackTracksByGenre(genre)))
                );
            })
        );
    }

    private getFallbackTracksByGenre(genre: string): Song[] {
        const genreSongs: { [key: string]: Song[] } = {
            'reggaeton': [
                { id: '1', artistId: 1, title: 'Tusa', artist: 'Karol G ft. Nicki Minaj', img: 'https://i.ytimg.com/vi/tbneQDc2H3I/maxresdefault.jpg', url: '', duration: '3:21', album: 'Ocean', genre: 'Reggaeton' },
                { id: '2', artistId: 2, title: 'Hawái', artist: 'Maluma', img: 'https://i.ytimg.com/vi/tbneQDc2H3I/maxresdefault.jpg', url: '', duration: '3:20', album: 'Papi Juancho', genre: 'Reggaeton' },
                { id: '3', artistId: 3, title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', img: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg', url: '', duration: '3:47', album: 'VIDA', genre: 'Reggaeton' }
            ],
            'pop': [
                { id: '4', artistId: 4, title: 'Blinding Lights', artist: 'The Weeknd', img: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg', url: '', duration: '3:20', album: 'After Hours', genre: 'Pop' },
                { id: '5', artistId: 5, title: 'Shape of You', artist: 'Ed Sheeran', img: 'https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg', url: '', duration: '3:53', album: '÷', genre: 'Pop' },
                { id: '6', artistId: 6, title: 'Levitating', artist: 'Dua Lipa', img: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/maxresdefault.jpg', url: '', duration: '3:23', album: 'Future Nostalgia', genre: 'Pop' }
            ],
            'rock': [
                { id: '7', artistId: 7, title: 'Bohemian Rhapsody', artist: 'Queen', img: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg', url: '', duration: '5:55', album: 'A Night at the Opera', genre: 'Rock' },
                { id: '8', artistId: 8, title: 'Stairway to Heaven', artist: 'Led Zeppelin', img: 'https://i.ytimg.com/vi/QkF3oxziUI4/maxresdefault.jpg', url: '', duration: '8:02', album: 'Led Zeppelin IV', genre: 'Rock' },
                { id: '9', artistId: 9, title: 'Hotel California', artist: 'Eagles', img: 'https://i.ytimg.com/vi/BciS5krYL80/maxresdefault.jpg', url: '', duration: '6:30', album: 'Hotel California', genre: 'Rock' }
            ],
            'latin': [
                { id: '10', artistId: 10, title: 'La Gota Fría', artist: 'Carlos Vives', img: 'https://i.ytimg.com/vi/2qlcRLdVmPw/maxresdefault.jpg', url: '', duration: '3:45', album: 'Clásicos de la Provincia', genre: 'Vallenato' },
                { id: '11', artistId: 11, title: 'Vivir Mi Vida', artist: 'Marc Anthony', img: 'https://i.ytimg.com/vi/YXnjy5YlDwk/maxresdefault.jpg', url: '', duration: '4:02', album: '3.0', genre: 'Salsa' },
                { id: '12', artistId: 12, title: 'Bailando', artist: 'Enrique Iglesias', img: 'https://i.ytimg.com/vi/NUsoVlDFqZg/maxresdefault.jpg', url: '', duration: '4:03', album: 'Sex and Love', genre: 'Latin Pop' }
            ]
        };

        return genreSongs[genre] || genreSongs['pop'];
    }

    getLyrics(artist: string, title: string): Observable<string> {
        const cleanTitle = title
            .replace(/(\(.*?\)|\[.*?\])/g, '')
            .replace(/ft\..*|feat\..*|featuring.*/gi, '')
            .replace(/official video|lyric video|audio|music video/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

        const cleanArtist = artist
            .replace(/ - Topic/g, '')
            .replace(/,.*/, '')
            .trim();

        const geniusHeaders = new HttpHeaders({
            'Authorization': `Bearer ${environment.genius.accessToken}`
        });

        const searchQuery = `${cleanArtist} ${cleanTitle}`;

        return this.http.get<any>(`${this.GENIUS_API_URL}/search?q=${encodeURIComponent(searchQuery)}`, { headers: geniusHeaders }).pipe(
            switchMap(response => {
                if (response.response?.hits?.length > 0) {
                    const songUrl = response.response.hits[0].result.url;
                    return of(`🎵 Letra encontrada en Genius!\n\n` +
                        `📝 "${title}" de ${artist}\n\n` +
                        `Para ver la letra completa, visita:\n${songUrl}\n\n` +
                        `💡 Genius tiene la letra completa con anotaciones.`);
                }
                throw new Error('Not found on Genius');
            }),
            catchError(() => {
                return this.http.get<any>(`${this.LYRICS_API_URL}/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`).pipe(
                    map(res => {
                        if (res && res.lyrics) {
                            return res.lyrics;
                        }
                        throw new Error('No lyrics found');
                    }),
                    catchError(() => {
                        return of(`🎵 Letra no disponible para "${title}" de ${artist}.\n\n` +
                            `💡 Sugerencias:\n` +
                            `• Busca en Genius.com\n` +
                            `• Intenta en Google: "${cleanArtist} ${cleanTitle} lyrics"`);
                    })
                );
            })
        );
    }

    private convertSpotifyToSong(track: SpotifyTrack): Song {
        const image = track.album.images[0]?.url || 'https://via.placeholder.com/300';

        return {
            id: track.id,
            artistId: 0,
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            img: image,
            url: track.preview_url || '',
            duration: this.formatDuration(track.duration_ms / 1000),
            genre: 'Pop',
            isStreamUrlFetched: !!track.preview_url
        };
    }

    private convertITunesToSong(track: iTunesTrack): Song {
        const artwork = track.artworkUrl100.replace('100x100', '600x600');

        return {
            id: track.trackId.toString(),
            artistId: 0,
            title: track.trackName,
            artist: track.artistName,
            album: track.collectionName || 'Single',
            img: artwork,
            url: track.previewUrl || '',
            duration: this.formatDuration(track.trackTimeMillis / 1000),
            genre: track.primaryGenreName || 'Pop',
            isStreamUrlFetched: true
        };
    }

    private getFallbackTrending(region: string = 'US'): Observable<Song[]> {
        const colombiaSongs: Song[] = [
            { id: '1', artistId: 1, title: 'La Gota Fría', artist: 'Carlos Vives', img: 'https://picsum.photos/seed/lagotefria/600/600', url: '', duration: '3:45', album: 'Clásicos de la Provincia', genre: 'Vallenato' },
            { id: '2', artistId: 2, title: 'Hawái', artist: 'Maluma', img: 'https://picsum.photos/seed/hawai/600/600', url: '', duration: '3:20', album: 'Papi Juancho', genre: 'Reggaeton' },
            { id: '3', artistId: 3, title: 'Tusa', artist: 'Karol G ft. Nicki Minaj', img: 'https://picsum.photos/seed/tusa/600/600', url: '', duration: '3:21', album: 'Ocean', genre: 'Reggaeton' },
            { id: '4', artistId: 4, title: 'Provenza', artist: 'Karol G', img: 'https://picsum.photos/seed/provenza/600/600', url: '', duration: '3:32', album: 'Mañana Será Bonito', genre: 'Reggaeton' },
            { id: '5', artistId: 5, title: 'Bichota', artist: 'Karol G', img: 'https://picsum.photos/seed/bichota/600/600', url: '', duration: '2:52', album: 'KG0516', genre: 'Reggaeton' },
            { id: '6', artistId: 6, title: 'Pepas', artist: 'Farruko', img: 'https://picsum.photos/seed/pepas/600/600', url: '', duration: '4:30', album: 'La 167', genre: 'Reggaeton' },
            { id: '7', artistId: 7, title: 'Tattoo', artist: 'Rauw Alejandro', img: 'https://picsum.photos/seed/tattoo/600/600', url: '', duration: '3:15', album: 'Saturno', genre: 'Reggaeton' },
            { id: '8', artistId: 8, title: 'La Difícil', artist: 'Blessd', img: 'https://picsum.photos/seed/ladificil/600/600', url: '', duration: '3:05', album: 'Hecho en Medellín', genre: 'Reggaeton' },
            { id: '9', artistId: 9, title: 'Sobrio', artist: 'Maluma', img: 'https://picsum.photos/seed/sobrio/600/600', url: '', duration: '3:18', album: 'The Love & Sex Tape', genre: 'Reggaeton' },
            { id: '10', artistId: 10, title: 'Colombia Tierra Querida', artist: 'Jorge Celedón', img: 'https://picsum.photos/seed/colombia/600/600', url: '', duration: '3:40', album: 'Clásicos', genre: 'Vallenato' }
        ];

        const mexicoSongs: Song[] = [
            { id: '11', artistId: 11, title: 'Ella Baila Sola', artist: 'Eslabon Armado x Peso Pluma', img: 'https://picsum.photos/seed/ellabailasola/600/600', url: '', duration: '2:48', album: 'Nostalgia', genre: 'Regional Mexicano' },
            { id: '12', artistId: 12, title: 'AMG', artist: 'Natanael Cano x Peso Pluma', img: 'https://picsum.photos/seed/amg/600/600', url: '', duration: '2:54', album: 'Génesis', genre: 'Corridos Tumbados' },
            { id: '13', artistId: 13, title: 'La Chona', artist: 'Los Tucanes de Tijuana', img: 'https://picsum.photos/seed/lachona/600/600', url: '', duration: '3:42', album: 'Tucanes de Plata', genre: 'Norteño' },
            { id: '14', artistId: 14, title: 'PRC', artist: 'Peso Pluma x Natanael Cano', img: 'https://picsum.photos/seed/prc/600/600', url: '', duration: '3:10', album: 'Génesis', genre: 'Corridos Tumbados' },
            { id: '15', artistId: 15, title: 'El Azul', artist: 'Junior H x Peso Pluma', img: 'https://picsum.photos/seed/elazul/600/600', url: '', duration: '3:25', album: '$ad Boyz 4 Life II', genre: 'Corridos Tumbados' },
            { id: '16', artistId: 16, title: 'Cielito Lindo', artist: 'Mariachi Vargas', img: 'https://picsum.photos/seed/cielitolindo/600/600', url: '', duration: '3:15', album: 'Clásicos', genre: 'Mariachi' },
            { id: '17', artistId: 17, title: 'Un x100to', artist: 'Grupo Frontera x Bad Bunny', img: 'https://picsum.photos/seed/unx100to/600/600', url: '', duration: '3:35', album: 'El Comienzo', genre: 'Regional Mexicano' },
            { id: '18', artistId: 18, title: 'La Bebe', artist: 'Peso Pluma x Yng Lvcas', img: 'https://picsum.photos/seed/labebe/600/600', url: '', duration: '2:55', album: 'Génesis', genre: 'Corridos Tumbados' },
            { id: '19', artistId: 19, title: 'Siempre Pendientes', artist: 'Peso Pluma x Luis R Conriquez', img: 'https://picsum.photos/seed/siemprependientes/600/600', url: '', duration: '3:20', album: 'Génesis', genre: 'Corridos Tumbados' },
            { id: '20', artistId: 20, title: 'El Sonidito', artist: 'Hechizeros Band', img: 'https://picsum.photos/seed/elsonidito/600/600', url: '', duration: '3:28', album: 'Single', genre: 'Banda' }
        ];

        const globalSongs: Song[] = [
            { id: '21', artistId: 21, title: 'Blinding Lights', artist: 'The Weeknd', img: 'https://picsum.photos/seed/blindinglights/600/600', url: '', duration: '3:20', album: 'After Hours', genre: 'Pop' },
            { id: '22', artistId: 22, title: 'Shape of You', artist: 'Ed Sheeran', img: 'https://picsum.photos/seed/shapeofyou/600/600', url: '', duration: '3:53', album: '÷', genre: 'Pop' },
            { id: '23', artistId: 23, title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', img: 'https://picsum.photos/seed/despacito/600/600', url: '', duration: '3:47', album: 'VIDA', genre: 'Reggaeton' },
            { id: '24', artistId: 24, title: 'Bohemian Rhapsody', artist: 'Queen', img: 'https://picsum.photos/seed/bohemianrhapsody/600/600', url: '', duration: '5:55', album: 'A Night at the Opera', genre: 'Rock' },
            { id: '25', artistId: 25, title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', img: 'https://picsum.photos/seed/uptownfunk/600/600', url: '', duration: '4:30', album: 'Uptown Special', genre: 'Funk' },
            { id: '26', artistId: 26, title: 'Someone Like You', artist: 'Adele', img: 'https://picsum.photos/seed/someonelikeyou/600/600', url: '', duration: '4:45', album: '21', genre: 'Pop' },
            { id: '27', artistId: 27, title: 'Levitating', artist: 'Dua Lipa', img: 'https://picsum.photos/seed/levitating/600/600', url: '', duration: '3:23', album: 'Future Nostalgia', genre: 'Pop' },
            { id: '28', artistId: 28, title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', img: 'https://picsum.photos/seed/starboy/600/600', url: '', duration: '3:50', album: 'Starboy', genre: 'Pop' },
            { id: '29', artistId: 29, title: 'Bad Guy', artist: 'Billie Eilish', img: 'https://picsum.photos/seed/badguy/600/600', url: '', duration: '3:14', album: 'When We All Fall Asleep', genre: 'Pop' },
            { id: '30', artistId: 30, title: 'Flowers', artist: 'Miley Cyrus', img: 'https://picsum.photos/seed/flowers/600/600', url: '', duration: '3:20', album: 'Endless Summer Vacation', genre: 'Pop' }
        ];

        const regionMap: { [key: string]: Song[] } = {
            'CO': colombiaSongs,
            'MX': mexicoSongs,
            'ES': globalSongs,
            'AR': globalSongs,
            'US': globalSongs
        };

        return of(regionMap[region] || globalSongs);
    }

    private formatDuration(seconds: number): string {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getStreamUrl(videoId: string): Observable<string | null> {
        return of(null);
    }
}
