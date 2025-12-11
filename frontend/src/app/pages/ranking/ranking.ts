import { Component } from '@angular/core';
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

  constructor(private evaluateSvc: EvaluateService) {}

  calcular() {
    this.loading = true;

    this.evaluateSvc.evaluateAll().subscribe({
      next: (res: any) => {
        this.ranking = res.ranking || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }
}
