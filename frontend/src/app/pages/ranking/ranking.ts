import { Component, ChangeDetectorRef } from '@angular/core'; // <--- 1. Importar
import { CommonModule, DecimalPipe } from '@angular/common';
import { EvaluateService } from '../../services/evaluate.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './ranking.html',
})
export class RankingComponent {
  loading = false;
  ranking: any[] = [];

  // 2. Inyectar ChangeDetectorRef
  constructor(private evaluateSvc: EvaluateService, private cdr: ChangeDetectorRef) {}

  calcular() {
    this.loading = true;

    this.evaluateSvc.runEvaluation().subscribe({
      next: (res: any) => {
        this.ranking = res.ranking || [];
        this.loading = false;

        // 3. Forzar la actualización de la vista
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.loading = false;
        this.cdr.detectChanges(); // También aquí por si acaso
      },
    });
  }
}
