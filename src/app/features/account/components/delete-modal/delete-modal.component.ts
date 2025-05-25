import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css'
})
export class DeleteModalComponent {
  @Input() productName: string = '';
  @Output() onConfirm = new EventEmitter<void>(); 
  @Output() onCancel = new EventEmitter<void>(); 

  confirm() {
    this.onConfirm.emit(); 
  }

  cancel() {
    this.onCancel.emit(); 
  }
}
