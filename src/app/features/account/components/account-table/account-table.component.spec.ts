import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountTableComponent } from './account-table.component';
import { DatePipe } from '@angular/common';
import { Account } from '../../interfaces/account.interface';


describe('AccountTableComponent', () => {
  let component: AccountTableComponent;
  let fixture: ComponentFixture<AccountTableComponent>;

  const mockAccounts: Account[] = [
    {
      id: '1',
      name: 'Account 1',
      description: 'Description 1',
      logo: 'logo1.png',
      date_release: '2023-01-01',
      date_revision: '2024-01-01'
    },
    {
      id: '2',
      name: 'Account 2',
      description: 'Description 2',
      logo: 'logo2.png',
      date_release: '2023-02-01',
      date_revision: '2024-02-01'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTableComponent, DatePipe]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountTableComponent);
    component = fixture.componentInstance;
    component.displayedAccounts = mockAccounts;
    component.filteredAccounts = mockAccounts;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('debería recibir displayedAccounts correctamente', () => {
      expect(component.displayedAccounts).toEqual(mockAccounts);
    });

    it('debería recibir filteredAccounts correctamente', () => {
      expect(component.filteredAccounts).toEqual(mockAccounts);
    });

    it('debería recibir pageSize correctamente', () => {
      component.pageSize = 10;
      fixture.detectChanges();
      expect(component.pageSize).toBe(10);
    });

    it('debería recibir isLoading correctamente', () => {
      component.isLoading = true;
      fixture.detectChanges();
      expect(component.isLoading).toBe(true);
    });
  });

  describe('Outputs', () => {
    it('debería emitir evento onEdit con la cuenta correcta', () => {
      jest.spyOn(component.onEdit, 'emit');
      const accountToEdit = mockAccounts[0];

      component.onEdit.emit(accountToEdit);

      expect(component.onEdit.emit).toHaveBeenCalledWith(accountToEdit);
    });

    it('debería emitir evento onDelete con la cuenta correcta', () => {
      jest.spyOn(component.onDelete, 'emit');
      const accountToDelete = mockAccounts[1];

      component.onDelete.emit(accountToDelete);

      expect(component.onDelete.emit).toHaveBeenCalledWith(accountToDelete);
    });

    it('debería emitir evento onPageSizeChange con el tamaño correcto', () => {
      jest.spyOn(component.onPageSizeChange, 'emit');
      const mockEvent = { target: { value: '10' } } as unknown as Event;

      component.changePageSize(mockEvent);

      expect(component.onPageSizeChange.emit).toHaveBeenCalledWith(10);
    });
  });

  describe('Método changePageSize', () => {
    it('debería manejar correctamente el cambio de tamaño de página', () => {
      jest.spyOn(component.onPageSizeChange, 'emit');
      const selectElement = document.createElement('select');
      selectElement.value = '10';
      const event = { target: selectElement } as unknown as Event;

      component.changePageSize(event);

      expect(component.onPageSizeChange.emit).toHaveBeenCalledWith(10);
    });

    it('debería emitir 5 si el valor no es un número', () => {
      jest.spyOn(component.onPageSizeChange, 'emit');
      const selectElement = document.createElement('select');
      selectElement.value = 'invalid';
      const event = { target: selectElement } as unknown as Event;

      component.changePageSize(event);

      expect(component.onPageSizeChange.emit).toHaveBeenCalledWith(5);
    });
  });

  describe('Comportamiento del template', () => {
    it('debería mostrar el mensaje de carga cuando isLoading es true', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const loadingElement = fixture.nativeElement.querySelector('.loading-message');
      expect(loadingElement).toBeTruthy();
    });

    it('debería mostrar la tabla cuando isLoading es false', () => {
      component.isLoading = false;
      fixture.detectChanges();

      const tableElement = fixture.nativeElement.querySelector('table');
      expect(tableElement).toBeTruthy();
    });

    it('debería mostrar el número correcto de filas', () => {
      component.isLoading = false;
      component.displayedAccounts = [...mockAccounts];
      fixture.detectChanges();
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(mockAccounts.length);
    });
  });
});