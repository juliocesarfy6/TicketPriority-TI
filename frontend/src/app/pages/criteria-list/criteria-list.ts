import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CriteriaService } from '../../services/criteria'; // Importar servicio

@Component({
  selector: 'app-criteria-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './criteria-list.html',
})
export class CriteriaListComponent implements OnInit {
  criterios: any[] = []; // Array vacío al inicio

  constructor(private criteriaService: CriteriaService) {}

  ngOnInit(): void {
    this.loadCriteria();
  }

  loadCriteria() {
    this.criteriaService.getAll().subscribe({
      next: (data) => {
        this.criterios = data;
      },
      error: (err) => console.error('Error cargando criterios', err),
    });
  }
}
