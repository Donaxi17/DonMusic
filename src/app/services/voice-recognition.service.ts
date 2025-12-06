import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

@Injectable({
    providedIn: 'root'
})
export class VoiceRecognitionService {
    recognition: any;
    isListening = false;
    text$ = new Subject<string>();
    isSupported = true;

    constructor() {
        if (typeof window !== 'undefined') {
            if ('webkitSpeechRecognition' in window) {
                this.recognition = new webkitSpeechRecognition();
            } else if ('SpeechRecognition' in window) {
                this.recognition = new SpeechRecognition();
            } else {
                this.isSupported = false;
                return;
            }

            this.recognition.continuous = false;
            this.recognition.lang = 'es-ES';
            this.recognition.interimResults = false;

            this.recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                this.text$.next(transcript);
                this.stop();
            };

            this.recognition.onerror = (event: any) => {
                this.stop();
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };
        }
    }

    start() {
        if (!this.isSupported || !this.recognition) return;
        this.isListening = true;
        try { this.recognition.start(); } catch (e) { }
    }

    stop() {
        if (!this.isSupported || !this.recognition) return;
        this.isListening = false;
        this.recognition.stop();
    }
}
