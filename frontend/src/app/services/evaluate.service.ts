import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluateService {

  private API = 'http://localhost:3000/api/evaluate';

  constructor(private http: HttpClient) { }

  evaluateAll(): Observable<any> {
    return this.http.post(`${this.API}/`, {});  // POST /
  }

  getMatrix(): Observable<any> {
    return this.http.get(`${this.API}/matrix`); // GET /matrix
  }
}

