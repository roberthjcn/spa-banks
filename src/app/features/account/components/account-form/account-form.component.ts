import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { AlertService } from '../../services/alert.service';
import { asyncIdValidator } from '../../validators/async-id.validator';
import { Account } from '../../interfaces/account.interface';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.css'
})
export class AccountFormComponent implements OnInit {
  accountForm: FormGroup;
  submitted = false;
  accountId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private _accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {
    this.accountId = this.route.snapshot.paramMap.get('id');
    this.accountForm = this.initForm();
  }

  ngOnInit(): void {
    this.loadAccountIfEditing();
  }

  private initForm(): FormGroup {
    const today = new Date();
    const todayTimestamp = new Date(
      today.toISOString().split('T')[0]
    ).getTime();

    return this.fb.group(
      {
        id: [
          { value: '', disabled: this.accountId !== null },
          [Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
          ],
          [asyncIdValidator(this._accountService)],
        ],
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(100),
          ],
        ],
        description: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(200),
          ],
        ],
        logo: ['', Validators.required],
        date_release: [
          '',
          [
            Validators.required,
            (control: AbstractControl) => {
              if (!control.value) return null;
              const inputTimestamp = new Date(control.value).getTime();
              return inputTimestamp >= todayTimestamp
                ? null
                : { minDate: true };
            },
          ],
        ],
        date_revision: [{ value: '', disabled: true }, [Validators.required]],
      },
      { validators: this.revisionDateValidator }
    );
  }

  public loadAccountIfEditing(): void {
    if (this.accountId) {
      this._accountService.getAccounts().subscribe({
        next: (accounts: Account[]) => {
          const account = accounts.find((acc) => acc.id === this.accountId);
          if (account) {
            this.accountForm.patchValue(account);
            this.calculateDateRevision();
          } else {
            this.router.navigate(['/account-list']);
          }
        },
        error: (error: unknown) => {
          this.handleError(error, 'Error al obtener las cuentas');
        },
      });
    }
  }

  private revisionDateValidator(group: FormGroup): ValidationErrors | null {
    const dateRelease = group.get('date_release')?.value;
    const dateRevision = group.get('date_revision')?.value;

    if (!dateRelease || !dateRevision) {
      return null;
    }

    const release = new Date(dateRelease);
    const review = new Date(dateRevision);

    const oneYearLater = new Date(release);
    oneYearLater.setFullYear(release.getFullYear() + 1);

    const releaseFormatted = oneYearLater.toISOString().split('T')[0];
    const reviewFormatted = review.toISOString().split('T')[0];

    return releaseFormatted === reviewFormatted ? null : { invalidReviewDate: true };
  }

  calculateDateRevision(): void {
    const dateRelease = this.accountForm.get('date_release')?.value;
    if (dateRelease) {
      const dateRevision = new Date(dateRelease);
      dateRevision.setFullYear(dateRevision.getFullYear() + 1);
      this.accountForm
        .get('date_revision')
        ?.setValue(dateRevision.toISOString().split('T')[0]);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.accountForm.valid) {
      const account: Account = this.accountForm.getRawValue();
      const operation = this.accountId
        ? this._accountService.editAccount(this.accountId, account)
        : this._accountService.addAccount(account);

      operation.subscribe({
        next: () => {
          this.alertService.showAlert(
            this.accountId ? 'Editado con éxito' : 'Guardado con éxito',
            'green'
          );
          this.router.navigate(['/account-list']);
        },
        error: (error: unknown) => {
          this.handleError(
            error,
            this.accountId
              ? 'No es posible editar la tarjeta'
              : 'No es posible guardar la tarjeta'
          );
        },
      });
    } else {
      this.alertService.showAlert('Formulario inválido', 'red');
    }
  }

  resetForm(): void {
    this.submitted = false;
    this.accountForm.reset({
      id: this.accountId ?? '',
      name: '',
      description: '',
      date_release: '',
      date_revision: { value: '', disabled: true }
    });
  }

  private handleError(error: unknown, message: string): void {
    this.alertService.showAlert(message, 'red');
  }
}
