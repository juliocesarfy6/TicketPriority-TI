import { Component } from '@angular/core';
import { TicketService } from '../../services/ticket';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.html',
  imports: [FormsModule]
})
export class TicketFormComponent {
  ticket = {
    descripcion: '',
    severidad: 1,
    impacto: 1,
    usuarios: 1
  };

  constructor(private ticketService: TicketService) {}

  save() {
    this.ticketService.createTicket(this.ticket).subscribe();
  }
}
