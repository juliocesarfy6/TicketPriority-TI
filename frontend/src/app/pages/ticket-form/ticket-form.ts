import { Component } from '@angular/core';
import { TicketService } from '../../services/ticket';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.html',
  imports: [FormsModule]
})
export class TicketFormComponent {
  ticket = {
    id: undefined,
    descripcion: '',
    severidad: 1,
    impacto: 1,
    usuarios: 1
  };

  constructor(private ticketService: TicketService, private router: Router) {
    const state = history.state;
    if (state && state.ticket) {
      this.ticket = state.ticket;
    }
  }

  save() {
    if (this.ticket.id) {
      this.ticketService.updateTicket(this.ticket).subscribe({
        next: () => {
          alert('Ticket actualizado con éxito');
        },
        error: (err: any) => {
          console.error('Error al actualizar el ticket:', err);
          alert('Error al actualizar el ticket');
        }
      });
    } else {
      this.ticketService.createTicket(this.ticket).subscribe({
        next: () => {
          alert('Ticket guardado con éxito');
        },
        error: (err: any) => {
          console.error('Error al guardar el ticket:', err);
          alert('Error al guardar el ticket');
        }
      });
    }
  }
}
