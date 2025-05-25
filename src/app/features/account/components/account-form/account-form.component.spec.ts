import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Account } from '../../interfaces/account.interface';
import { AlertService } from '../../services/alert.service';
import { AccountService } from '../../services/account.service';
import { AccountFormComponent } from './account-form.component';


describe('AccountFormComponent', () => {
  let component: AccountFormComponent;
  let fixture: ComponentFixture<AccountFormComponent>;
  let mockAccountService: jest.Mocked<AccountService>;
  let mockAlertService: jest.Mocked<AlertService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;

  const mockAccount: Account = {
    id: '1',
    name: 'Test Account',
    description: 'Test Description',
    logo: 'test.png',
    date_release: '2023-01-01',
    date_revision: '2024-01-01'
  };

  beforeEach(async () => {
    mockAccountService = {
      getAccounts: jest.fn(() => of([mockAccount])),
      addAccount: jest.fn(() => of({})),
      editAccount: jest.fn(() => of({})),
      checkIdAvailability: jest.fn(() => of(true))
    } as any;

    mockAlertService = {
      showAlert: jest.fn()
    } as any;

    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn(() => null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        AccountFormComponent
      ],
      providers: [
        FormBuilder,
        { provide: AccountService, useValue: mockAccountService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización', () => {
    it('debería inicializar el formulario correctamente', () => {
      expect(component.accountForm).toBeDefined();
      expect(component.accountForm.controls['id']).toBeDefined();
      expect(component.accountForm.controls['name']).toBeDefined();
      expect(component.accountForm.controls['description']).toBeDefined();
      expect(component.accountForm.controls['logo']).toBeDefined();
      expect(component.accountForm.controls['date_release']).toBeDefined();
      expect(component.accountForm.controls['date_revision']).toBeDefined();
    });

    it('debería cargar la cuenta si está en modo edición', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');
      mockAccountService.getAccounts.mockReturnValueOnce(of([mockAccount]));

      const newFixture = TestBed.createComponent(AccountFormComponent);
      const editComponent = newFixture.componentInstance;

      newFixture.detectChanges();
      editComponent.ngOnInit();
      tick();

      expect(editComponent.accountForm.get('name')?.value).toBe(mockAccount.name);
      expect(editComponent.accountForm.get('id')?.disabled).toBe(true);
    }));
  });

  describe('CargarCuentaSiEsEditando', () => {
    it('debería cargar la cuenta cuando hay accountId', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');

      const editFixture = TestBed.createComponent(AccountFormComponent);
      const editComponent = editFixture.componentInstance;

      editComponent.ngOnInit();
      tick();

      expect(mockAccountService.getAccounts).toHaveBeenCalled();
      expect(editComponent.accountForm.get('id')?.disabled).toBe(true);
      expect(editComponent.accountForm.value.name).toBe(mockAccount.name);
      expect(editComponent.accountForm.value.date_revision).toBe('2024-01-01');
    }));

    it('debería redirigir si la cuenta no existe', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('99');
      mockAccountService.getAccounts.mockReturnValueOnce(of([mockAccount]));

      const newFixture = TestBed.createComponent(AccountFormComponent);
      const editComponent = newFixture.componentInstance;

      newFixture.detectChanges();
      editComponent.ngOnInit();
      tick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/account-list']);
    }));

    it('debería manejar error al obtener cuentas', fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');
      mockAccountService.getAccounts.mockReturnValueOnce(throwError(() => new Error('Error')));

      const editFixture = TestBed.createComponent(AccountFormComponent);
      const editComponent = editFixture.componentInstance;

      editComponent.ngOnInit();
      tick();

      expect(mockAlertService.showAlert).toHaveBeenCalledWith('Error al obtener las cuentas', 'red');
    }));

    it('no debería hacer nada cuando no hay accountId', () => {
      const getAccountsSpy = jest.spyOn(mockAccountService, 'getAccounts');
      component.loadAccountIfEditing();
      expect(getAccountsSpy).not.toHaveBeenCalled();
    });
  });

  describe('Validaciones de formulario', () => {
    it('debería ser inválido cuando está vacío', () => {
      expect(component.accountForm.valid).toBeFalsy();
    });

    it('debería validar el ID correctamente', fakeAsync(() => {
      const idControl = component.accountForm.get('id');
      idControl?.setValue('test');
      tick();
      expect(idControl?.errors).toBeNull();
    }));

    it('debería requerir nombre entre 5 y 100 caracteres', () => {
      const nameControl = component.accountForm.get('name');

      nameControl?.setValue('test');
      expect(nameControl?.errors?.['minlength']).toBeDefined();

      nameControl?.setValue('a'.repeat(101));
      expect(nameControl?.errors?.['maxlength']).toBeDefined();

      nameControl?.setValue('Valid Name');
      expect(nameControl?.errors).toBeNull();
    });

    it('debería requerir descripción entre 10 y 200 caracteres', () => {
      const descControl = component.accountForm.get('description');

      descControl?.setValue('short');
      expect(descControl?.errors?.['minlength']).toBeDefined();

      descControl?.setValue('a'.repeat(201));
      expect(descControl?.errors?.['maxlength']).toBeDefined();

      descControl?.setValue('Valid Description');
      expect(descControl?.errors).toBeNull();
    });

    it('debería validar fecha de lanzamiento futura', () => {
      const releaseControl = component.accountForm.get('date_release');
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      releaseControl?.setValue(pastDate.toISOString().split('T')[0]);
      expect(releaseControl?.errors?.['minDate']).toBeDefined();

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      releaseControl?.setValue(futureDate.toISOString().split('T')[0]);
      expect(releaseControl?.errors).toBeNull();
    });

    it('debería calcular fecha de revisión correctamente', () => {
      const releaseDate = '2023-01-01';
      const releaseControl = component.accountForm.get('date_release');
      const revisionControl = component.accountForm.get('date_revision');

      releaseControl?.setValue(releaseDate);
      component.calculateDateRevision();

      expect(revisionControl?.value).toBe('2024-01-01');
    });

    it('debería validar que fecha de revisión sea exactamente 1 año después', () => {
      component.accountForm.patchValue({
        date_release: '2023-01-01',
        date_revision: '2024-01-02'
      });

      expect(component.accountForm.errors?.['invalidReviewDate']).toBeDefined();

      component.accountForm.patchValue({
        date_release: '2023-01-01',
        date_revision: '2024-01-01'
      });

      expect(component.accountForm.errors).toBeNull();
    });
  });

  describe('onSubmit', () => {
    const setupValidForm = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextYear = new Date(tomorrow);
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      component.accountForm.patchValue({
        id: 'vali',
        name: 'Nombre válido con más de 5 caracteres',
        description: 'Descripción válida con más de 10 caracteres como requiere',
        logo: 'logo-valid.png',
        date_release: tomorrow.toISOString().split('T')[0],
        date_revision: nextYear.toISOString().split('T')[0]
      });

      component.accountForm.updateValueAndValidity();

      Object.keys(component.accountForm.controls).forEach(key => {
        component.accountForm.get(key)?.markAsTouched();
      });
    };

    beforeEach(() => {
      setupValidForm();
    });

    it('debería entrar al bloque if cuando el formulario es válido', fakeAsync(() => {
      expect(component.accountForm.valid).toBeTruthy();

      const addAccountSpy = jest.spyOn(mockAccountService, 'addAccount');

      component.onSubmit();
      tick();

      expect(addAccountSpy).toHaveBeenCalled();
    }));
  });

  describe('Envío del formulario', () => {
    beforeEach(() => {
      component.accountForm.patchValue({
        id: 'test',
        name: 'Test Account',
        description: 'Test Description',
        logo: 'test.png',
        date_release: '2023-01-01',
        date_revision: '2024-01-01'
      });
    });

    it('debería llamar a addAccount para nueva cuenta', fakeAsync(() => {
      component.onSubmit();
      tick();

      expect(mockAccountService.addAccount).toHaveBeenCalled();
      expect(mockAlertService.showAlert).toHaveBeenCalledWith('Guardado con éxito', 'green');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/account-list']);
    }));

    it('debería llamar a editAccount para edición', fakeAsync(() => {
      component.accountId = '1';
      component.onSubmit();
      tick();

      expect(mockAccountService.editAccount).toHaveBeenCalled();
      expect(mockAlertService.showAlert).toHaveBeenCalledWith('Editado con éxito', 'green');
    }));

    it('debería manejar error en addAccount', fakeAsync(() => {
      mockAccountService.addAccount.mockReturnValueOnce(throwError(() => new Error('Error')));
      component.onSubmit();
      tick();

      expect(mockAlertService.showAlert).toHaveBeenCalledWith('Formulario inválido', 'red');
    }));

    it('debería mostrar error si el formulario es inválido', () => {
      component.accountForm.reset();
      component.submitted = true;
      component.onSubmit();

      expect(mockAlertService.showAlert).toHaveBeenCalledWith('Formulario inválido', 'red');
    });
  });

  describe('resetForm', () => {
    it('debería resetear el formulario correctamente', () => {
      component.accountForm.patchValue({
        id: 'test',
        name: 'Test'
      });
      component.submitted = true;

      component.resetForm();

      expect(component.accountForm.get('id')?.value).toBe('');
      expect(component.accountForm.get('name')?.value).toBe('');
      expect(component.submitted).toBe(false);
    });
  });
});