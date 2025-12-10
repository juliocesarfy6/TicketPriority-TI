import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-criteria-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './criteria-form.html'
})
export class CriteriaFormComponent {

  criterio = {
    nombre: '',
    peso: 0
  };

  save() {
    console.log('Criterio guardado:', this.criterio);
  }

}
