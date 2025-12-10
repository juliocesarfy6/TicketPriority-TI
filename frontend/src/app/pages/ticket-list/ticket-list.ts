import { Component, OnInit } from '@angular/core';
import { TicketService} from '../../services/ticket';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.html',
    imports: [CommonModule]
})
export class TicketListComponent implements OnInit {
  tickets: any[] = [];

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.ticketService.getTickets().subscribe(res => {
      this.tickets = res;
    });
  }
}
