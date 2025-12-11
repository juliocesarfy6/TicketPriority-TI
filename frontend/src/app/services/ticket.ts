import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private url = 'http://localhost:3000/api/tickets';

  constructor(private http: HttpClient) {}

  getTickets() {
    return this.http.get<any[]>(this.url);
  }

  createTicket(data: any) {
    return this.http.post(this.url, data);
  }

  updateTicket(data: any) {
    return this.http.put(`${this.url}/${data.id}`, data);
  }

  deleteTicket(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
