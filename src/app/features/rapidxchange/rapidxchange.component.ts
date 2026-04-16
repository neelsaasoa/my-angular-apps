import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RapidxchangeFormComponent } from './rapidxchange-form/rapidxchange-form.component';

@Component({
  selector: 'app-rapidxchange',
  standalone: true,
  imports: [CommonModule, RapidxchangeFormComponent],
  templateUrl: './rapidxchange.component.html',
  styleUrls: ['./rapidxchange.component.css']
})
export class RapidxchangeComponent {
  constructor() { }

  ngOnInit(): void {
  }
}
