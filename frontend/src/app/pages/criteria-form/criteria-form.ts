import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CriteriaService } from '../../services/criteria';
import { Router } from '@angular/router';

@Component({
  selector: 'app-criteria-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './criteria-form.html',
})
export class CriteriaFormComponent {
  criterio = {
    nombre: '',
    peso: 0,
  };

  constructor(private criteriaService: CriteriaService, private router: Router) {}

  save() {
    this.criteriaService.create(this.criterio).subscribe({
      next: () => {
        alert('Criterio guardado');
        this.router.navigate(['/criteria']); // Volver a la lista
      },
      error: (err) => alert('Error al guardar'),
    });
  }
}
