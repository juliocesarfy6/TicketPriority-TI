import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-evaluation-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-result.html'
})
export class EvaluationResultComponent {

  resultados = [
    { ticket: 'Error en servidor', puntaje: 0.89 },
    { ticket: 'No funciona impresora', puntaje: 0.42 },
    { ticket: 'Problemas de red', puntaje: 0.71 }
  ];

}
