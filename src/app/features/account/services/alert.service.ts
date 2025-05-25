import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<{ message: string; color: string } | null>(null);
  alert$ = this.alertSubject.asObservable(); 


  showAlert(message: string, color: string = 'blue') {
    this.alertSubject.next({ message, color });
  }

  hideAlert() {
    this.alertSubject.next(null);
  }
}
