import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private animationId: number = 0;

  constructor(private elementRef: ElementRef) {
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.currentSong = null;
    });
  }

  ngOnInit() {
    const canvas = this.elementRef.nativeElement.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.ctx = canvas.getContext('2d')!;

    this.createParticles();
    this.animate();

    this.audio.src = this.urlMusicaActual;
    this.audio.load();
    this.audio.play();
    this.isPlaying = true;
    this.audio.addEventListener('ended', () => this.playNextSong());
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  createParticles() {
    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.particles.forEach(particle => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x < 0 || particle.x > window.innerWidth) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > window.innerHeight) particle.speedY *= -1;

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.fill();
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.audio.pause();
    this.audio.src = '';
  }

  playlistInfoTextButtons = "bx-caret-right"
  tituloMusicaActual = "Es Épico";
  artistaMusicaActual = "Canserbero";
  urlMusicaActual = "assets/audio/Canserbero - Es Épico [Muerte].mp3";
  imgMusicaActual = "/assets/img/Epico-canserbero.jpg";
  idMusicaActual = 1;
  isPlaying = false;
  clickMusica = false;
  currentSong: any = null;
  private audio = new Audio();

  playlist = [
    {
      id: 1,
      img: "/assets/img/Epico-canserbero.jpg",
      title: "Es Épico",
      artist: "Canserbero",
      duration: "6:20",
      url: "assets/audio/Canserbero - Es Épico [Muerte].mp3"
    },
    {
      id: 2,
      img: "/assets/img/Muerte.jpg",
      title: "Mundo de Piedra",
      artist: "Canserbero",
      duration: "4:45",
      url: "assets/audio/Canserbero -  Mundo de Piedra [Muerte].mp3"
    }, {
      id: 3,
      img: "/assets/img/Muerte.jpg",
      title: "Maquiavélico",
      artist: "Canserbero",
      duration: "4:45",
      url: "assets/audio/Canserbero -  Maquiavélico [Muerte].mp3"
    }, {
      id: 4,
      img: "/assets/img/Muerte.jpg",
      title: "Jeremías 17:5",
      artist: "Canserbero",
      duration: "5:18",
      url: "assets/audio/Canserbero - Jeremías 17_5 [Muerte].mp3"
    }, {
      id: 5,
      img: "/assets/img/Stupid Love Story.jpg",
      title: "Stupid Love Story",
      artist: "Canserbero",
      duration: "4:42",
      url: "assets/audio/Canserbero  Stupid Love Story [Apa y Can].mp3"
    }, {
      id: 6,
      img: "/assets/img/Querer Querernos.jpg",
      title: "Querer Querernos",
      artist: "Canserbero",
      duration: "3:58",
      url: "assets/audio/Canserbero - Querer Querernos (Versión Acústica).mp3"
    }, {
      id: 7,
      img: "/assets/img/Vida.jpg",
      title: "Pensando en Tí",
      artist: "Canserbero",
      duration: "4:04",
      url: "assets/audio/Canserbero - Pensando en Tí [Vida].mp3"
    }, {
      id: 8,
      img: "/assets/img/Cuando Vayas Conmigo.jpg",
      title: "Cuando Vayas Conmigo",
      artist: "Canserbero",
      duration: "4:17",
      url: "assets/audio/Cuando Vayas Conmigo.mp3"
    }, {
      id: 9,
      img: "/assets/img/Vida.jpg",
      title: "¿Y la Felicidad Qué?",
      artist: "Canserbero",
      duration: "4:56",
      url: "assets/audio/Canserbero - Y la Felicidad Qué_ [Vida].mp3"
    }, {
      id: 10,
      img: "/assets/img/Muerte.jpg",
      title: "El Primer Trago",
      artist: "Canserbero",
      duration: "6:22",
      url: "assets/audio/Canserbero -  El Primer Trago [Muerte].mp3"
    }
  ];

  clickInint(id: number) {

    this.tituloMusicaActual = this.playlist[id - 1].title;
    this.artistaMusicaActual = this.playlist[id - 1].artist;
    this.imgMusicaActual = this.playlist[id - 1].img;
    this.idMusicaActual = id;
    // alert(this.idMusicaActual)
    // this.clickMusica = true;


    if (this.currentSong === id) {
      // Si es la misma canción, toggle play/pause
      if (this.isPlaying) {
        this.audio.pause();
        this.playlistInfoTextButtons = "bx-caret-right";
      } else {
        this.audio.play();
        this.playlistInfoTextButtons = "bx-pause";
      }
      this.isPlaying = !this.isPlaying;
    } else {
      // Si es una canción diferente
      const song = this.playlist.find(s => s.id === id);
      if (song) {
        // Si hay una canción reproduciéndose, la detenemos
        if (this.isPlaying) {
          this.audio.pause();
          this.playlistInfoTextButtons = "bx-caret-right";
        }
        this.audio.src = song.url;
        this.audio.play();
        this.currentSong = id;
        this.isPlaying = true;
        this.playlistInfoTextButtons = "bx-pause";
      }
    }
  }

  playNextSong() {
    if (this.idMusicaActual === this.playlist.length) {
      this.idMusicaActual = 0;
    }
    const nextSong = this.playlist[this.idMusicaActual];
    this.idMusicaActual++;
    this.audio.src = nextSong.url;
    this.audio.load();
    this.audio.play();
    this.currentSong = nextSong.id;
    this.isPlaying = true;
    this.playlistInfoTextButtons = "bx-pause";
    this.updateCurrentSongInfo(nextSong);
  }

  updateCurrentSongInfo(song: { id: any; img: any; title: any; artist: any; duration?: string; url?: string; }) {
    this.tituloMusicaActual = song.title;
    this.artistaMusicaActual = song.artist;
    this.imgMusicaActual = song.img;
    this.idMusicaActual = song.id;
  }

  downloadMusic(id: number): void {
    const musicPath = this.playlist[id - 1].url;
    const link = document.createElement('a');
    link.href = musicPath;
    link.download = this.playlist[id - 1].title + '.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  shareLink(): void {
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: this.tituloMusicaActual,
        url: url
      })
        .catch((error) => console.log('Error compartiendo:', error));
    } else {
      navigator.clipboard.writeText(url)
        .then(() => alert('Link copiado al portapapeles'))
        .catch(() => alert('Error al copiar el link'));
    }
  }

  shareOnWhatsApp() {
    const text = 'Escucha esta canción: ';
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
  }
}
