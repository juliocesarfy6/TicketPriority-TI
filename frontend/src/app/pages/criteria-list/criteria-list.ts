import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-criteria-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './criteria-list.html'
})
export class CriteriaListComponent implements OnInit {

  criterios = [
    { nombre: 'Severidad', peso: 0.4 },
    { nombre: 'Impacto', peso: 0.35 },
    { nombre: 'Usuarios afectados', peso: 0.25 }
  ];

  ngOnInit(): void {}
}
