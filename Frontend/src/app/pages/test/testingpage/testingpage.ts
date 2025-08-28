import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../shared/atoms/spinner/loading-spinner.component';

@Component({
  selector: 'app-testingpage',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  templateUrl: './testingpage.html',
  styleUrl: './testingpage.css',
})
export class Testingpage {}
