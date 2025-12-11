import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TicketService} from '../../services/ticket';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.html',
    imports: [CommonModule, RouterModule]
})
export class TicketListComponent implements OnInit {
  tickets: any[] = [];

  constructor(
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.router.events.subscribe(() => {
      this.loadTickets();
    });
  }

  ngOnInit() {
    this.loadTickets();
  }

  private loadTickets() {
    this.ticketService.getTickets().subscribe(res => {
      this.tickets = res;
      this.cdr.detectChanges();
    });
  }

  editTicket(ticket: any) {
    this.router.navigate(['/tickets/new'], { state: { ticket } });
  }

  deleteTicket(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este ticket?')) {
      this.ticketService.deleteTicket(id).subscribe({
        next: () => {
          alert('Ticket eliminado con éxito');
          this.loadTickets();
        },
        error: (err: any) => {
          console.error('Error al eliminar el ticket:', err);
          alert('Error al eliminar el ticket');
        }
      });
    }
  }
}
