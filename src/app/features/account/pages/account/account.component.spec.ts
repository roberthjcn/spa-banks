import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountComponent } from './account.component';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { AlertService } from '../../services/alert.service';


describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
  let mockAccountService: jest.Mocked<AccountService>;
  let mockAlertService: jest.Mocked<AlertService>;
  let mockRouter: jest.Mocked<Router>;

  const mockAccounts = [
    { id: '1', name: 'Cuenta A', description: 'Descripción A', logo: 'logo1.png', date_release: '2025-01-01', date_revision: '2026-01-01' },
    { id: '2', name: 'Cuenta B', description: 'Descripción B', logo: 'logo2.png', date_release: '2025-02-01', date_revision: '2026-02-01' },
    { id: '3', name: 'Otra Cuenta', description: 'Descripción C', logo: 'logo3.png', date_release: '2025-03-01', date_revision: '2026-03-01' }
  ];

  beforeEach(async () => {
    mockAccountService = {
      getAccounts: jest.fn(() => of([])),
      deleteAccount: jest.fn(),
    } as any;

    mockAlertService = {
      showAlert: jest.fn(),
    } as any;

    mockRouter = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [AccountComponent],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería obtener las cuentas correctamente', () => {
    const mockAccounts = [{
      id: '1', name: 'Test', description: 'Description is other test one, two', logo: 'www.golglg.ocm',
      date_release: '2025-05-25',
      date_revision: '2025-06-25'
    }];
    mockAccountService.getAccounts.mockReturnValueOnce(of(mockAccounts));

    component.getAccounts();

    expect(mockAccountService.getAccounts).toHaveBeenCalled();
    expect(component.accounts).toEqual(mockAccounts);
    expect(component.filteredAccounts).toEqual(mockAccounts);
    expect(component.isLoading).toBe(false);
  });

  it('debería manejar el error al obtener las cuentas', () => {
    mockAccountService.getAccounts.mockReturnValue(throwError(() => 'Error'));

    component.getAccounts();

    expect(mockAlertService.showAlert).toHaveBeenCalledWith('¡A ocurrido un error! Error', 'red');
    expect(component.isLoading).toBe(false);
  });

  it('debería cambiar el tamaño de página', () => {
    component.changePageSize(10);
    expect(component.pageSize).toBe(10);
  });

  it('debería navegar para crear una nueva cuenta', () => {
    component.addNewAccount();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/account-form']);
  });

  it('debería navegar para editar una cuenta', () => {
    const account = { id: 5 } as any;
    component.editAccount(account);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/account-form/5']);
  });

  it('debería abrir el modal para eliminar una cuenta', () => {
    const account = { id: 2, name: 'Test' } as any;
    component.deleteAccount(account);
    expect(component.selectedAccount).toEqual(account);
    expect(component.isModalVisible).toBe(true);
  });

  it('debería cerrar el modal', () => {
    component.isModalVisible = true;
    component.closeModal();
    expect(component.isModalVisible).toBe(false);
  });

  describe('onSearch', () => {
    beforeEach(() => {
      component.accounts = mockAccounts;
      component.filteredAccounts = [...mockAccounts];
    });

    it('debería filtrar cuentas por nombre (coincidencia exacta)', () => {
      const mockEvent = { target: { value: 'Cuenta A' } } as unknown as Event;
      component.onSearch(mockEvent);
      expect(component.filteredAccounts.length).toBe(1);
      expect(component.filteredAccounts[0].name).toBe('Cuenta A');
    });

    it('debería filtrar cuentas por nombre (coincidencia parcial)', () => {
      const mockEvent = { target: { value: 'Cuenta' } } as unknown as Event;
      component.onSearch(mockEvent);
      expect(component.filteredAccounts.length).toBe(3);
      expect(component.filteredAccounts.map(a => a.name)).toEqual(['Cuenta A', 'Cuenta B']);
    });

    it('debería filtrar cuentas sin distinguir mayúsculas/minúsculas', () => {
      const mockEvent = { target: { value: 'cuenta a' } } as unknown as Event;
      component.onSearch(mockEvent);
      expect(component.filteredAccounts.length).toBe(1);
      expect(component.filteredAccounts[0].name).toBe('Cuenta A');
    });

    it('debería retornar todas las cuentas si el search está vacío', () => {
      const mockEvent = { target: { value: '' } } as unknown as Event;
      component.onSearch(mockEvent);
      expect(component.filteredAccounts.length).toBe(3);
    });

    it('debería retornar array vacío si no hay coincidencias', () => {
      const mockEvent = { target: { value: 'XYZ' } } as unknown as Event;
      component.onSearch(mockEvent);
      expect(component.filteredAccounts.length).toBe(0);
    });
  });

  describe('displayedAccounts', () => {
    beforeEach(() => {
      component.accounts = mockAccounts;
      component.filteredAccounts = [...mockAccounts];
    });

    it('debería retornar el número correcto de cuentas según pageSize', () => {
      component.pageSize = 2;
      expect(component.displayedAccounts.length).toBe(2);

      component.pageSize = 1;
      expect(component.displayedAccounts.length).toBe(1);
    });

    it('debería retornar las primeras cuentas según pageSize', () => {
      component.pageSize = 2;
      expect(component.displayedAccounts.map(a => a.id)).toEqual(['1', '2']);
    });
  });

  describe('confirmDelete', () => {
    it('debería eliminar la cuenta y actualizar la lista cuando es exitoso', () => {
      mockAccountService.deleteAccount.mockReturnValueOnce(of({}));

      const testAccount = { id: '123', name: 'Test Account' } as any;
      component.selectedAccount = testAccount;
      component.isModalVisible = true;

      const getAccountsSpy = jest.spyOn(component, 'getAccounts');

      component.confirmDelete();

      expect(mockAccountService.deleteAccount).toHaveBeenCalledWith('123');
      expect(getAccountsSpy).toHaveBeenCalled();
      expect(component.selectedAccount).toBeNull();
      expect(component.isModalVisible).toBe(false);
      expect(mockAlertService.showAlert).toHaveBeenCalledWith('¡Eliminado correctamente!', 'green');
    });

    it('debería manejar el error cuando falla la eliminación', () => {
      mockAccountService.deleteAccount.mockReturnValueOnce(throwError(() => new Error('Error')));

      const testAccount = { id: '123', name: 'Test Account' } as any;
      component.selectedAccount = testAccount;
      component.isModalVisible = true;

      component.confirmDelete();

      expect(mockAccountService.deleteAccount).toHaveBeenCalledWith('123');
      expect(mockAlertService.showAlert).toHaveBeenCalledWith('¡A ocurrido un error! Error: Error', 'red');
      expect(component.selectedAccount).toEqual(testAccount);
      expect(component.isModalVisible).toBe(true);
    });

    it('no debería hacer nada cuando no hay cuenta seleccionada', () => {
      component.selectedAccount = null;

      component.confirmDelete();

      expect(mockAccountService.deleteAccount).not.toHaveBeenCalled();
      expect(mockAlertService.showAlert).not.toHaveBeenCalled();
    });
  });

});