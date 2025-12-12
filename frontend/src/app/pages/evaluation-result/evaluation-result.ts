import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket';
import { EvaluateService } from '../../services/evaluate.service';
@Component({
  selector: 'app-evaluation-result',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluation-result.html',
})
export class EvaluationResultComponent implements OnInit {
  modoSeleccion = true;
  isLoading = false;

  tickets: any[] = [];
  selectedIds: Set<number> = new Set();

  resultados: any[] = [];

  constructor(
    private ticketService: TicketService,
    private evaluateService: EvaluateService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // <--- CRUCIAL: Para arreglar el problema de refresco
  ) {}

  ngOnInit() {
    this.cargarTickets();
  }

  cargarTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando tickets', err),
    });
  }

  toggleSelection(id: number) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.tickets.forEach((t) => this.selectedIds.add(t.id));
    } else {
      this.selectedIds.clear();
    }
  }

  calcular() {
    if (this.selectedIds.size === 0) {
      alert('Selecciona al menos un ticket.');
      return;
    }

    this.isLoading = true;
    const idsParaEnviar = Array.from(this.selectedIds);

    this.evaluateService.runEvaluation(idsParaEnviar).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.resultados = res.ranking || res;
          this.modoSeleccion = false;
          this.isLoading = false;

          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        alert('Error al calcular los resultados.');
      },
    });
  }

  volverASeleccionar() {
    this.modoSeleccion = true;
    this.selectedIds.clear();
    this.resultados = [];
  }
}
