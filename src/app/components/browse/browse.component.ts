import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-browse',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './browse.component.html'
})
export class BrowseComponent { }
