import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DeleteModalComponent } from '../../components/delete-modal/delete-modal.component';
import { AccountTableComponent } from '../../components/account-table/account-table.component';
import { AlertComponent } from '../../components/alert/alert.component';
import { Account } from '../../interfaces/account.interface';
import { AccountService } from '../../services/account.service';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
  imports: [CommonModule, RouterModule, DeleteModalComponent, AccountTableComponent, AlertComponent],
})
export class AccountComponent implements OnInit {
  pageSize: number = 5;
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  selectedAccount: Account | null = null;
  isModalVisible: boolean = false;
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private _accountService: AccountService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.getAccounts();
  }

  getAccounts(): void {
    this.isLoading = true;
    this._accountService.getAccounts().subscribe(
      (data) => {
        this.accounts = data;
        this.filteredAccounts = [...this.accounts];
        this.isLoading = false;
      },
      (error) => {
        this.alertService.showAlert(`¡A ocurrido un error! ${error}`, 'red');
        this.isLoading = false;
      }
    );
  }

  onSearch(searchText: Event): void {
    const input = searchText.target as HTMLInputElement;
    this.filteredAccounts = this.accounts.filter((account) =>
      account.name.toLowerCase().includes(input.value.toLowerCase())
    );
  }

  get displayedAccounts(): Account[] {
    return this.filteredAccounts.slice(0, this.pageSize);
  }

  changePageSize(event: number): void {
    this.pageSize = event;
  }

  addNewAccount(): void {
    this.router.navigate(['/account-form']);
  }

  editAccount(account: Account) {
    this.router.navigate([`/account-form/${account.id}`]);
  }

  deleteAccount(account: Account) {
    this.selectedAccount = account;
    this.isModalVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedAccount) {
      this._accountService.deleteAccount(this.selectedAccount.id!).subscribe(
        () => {
          this.getAccounts();
          this.selectedAccount = null;
          this.isModalVisible = false;
          this.alertService.showAlert('¡Eliminado correctamente!', 'green');
        },
        (error) => {
          this.alertService.showAlert(`¡A ocurrido un error! ${error}`, 'red');
        }
      );
    }
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

}
