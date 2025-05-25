import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Account } from '../../interfaces/account.interface';

@Component({
  selector: 'app-account-table',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './account-table.component.html',
  styleUrl: './account-table.component.css'
})
export class AccountTableComponent {
  @Input() displayedAccounts: Account[] = [];
  @Input() filteredAccounts: Account[] = [];
  @Input() pageSize: number = 5;
  @Input() isLoading: boolean = false;

  @Output() onEdit = new EventEmitter<Account>();
  @Output() onDelete = new EventEmitter<Account>();
  @Output() onPageSizeChange = new EventEmitter<number>();

  changePageSize(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const pageSize = Number(selectElement.value);
    this.onPageSizeChange.emit(pageSize);
  }

}
