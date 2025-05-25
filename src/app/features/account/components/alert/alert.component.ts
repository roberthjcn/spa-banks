import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent implements OnInit, OnDestroy {
  message: string = '';
  color: string = 'blue';
  isVisible: boolean = false;
  private timeoutId: any;

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    this.alertService.alert$.subscribe((alert: any) => {
      if (alert) {
        this.message = alert.message;
        this.color = alert.color;
        this.isVisible = true;
        this.timeoutId = setTimeout(() => {
          this.close();
        }, 2000);
      } else {
        this.isVisible = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
  close() {
    this.alertService.hideAlert();
  }
}
