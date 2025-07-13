import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RedesSocialesComponent } from './components/redes-sociales/redes-sociales.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RedesSocialesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DonMusic';
}
