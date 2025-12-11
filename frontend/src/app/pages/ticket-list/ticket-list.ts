import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TicketService} from '../../services/ticket';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.html',
    imports: [CommonModule]
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
}
