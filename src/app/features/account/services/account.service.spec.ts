import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { throwError } from 'rxjs';
import { AccountService } from './account.service';
import { ErrorHandlerService } from './error-handler.service';
import { Account } from '../interfaces/account.interface';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;
  let mockErrorHandler: jest.Mocked<ErrorHandlerService>;

  const mockAccount: Account = {
    id: '1',
    name: 'Test Account',
    description: 'Test Description',
    logo: 'test.png',
    date_release: '2023-01-01',
    date_revision: '2024-01-01'
  };

  const mockApiResponse = {
    data: [mockAccount]
  };

  beforeEach(() => {
    mockErrorHandler = {
      handleError: jest.fn((error) => throwError(() => error))
    } as any;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AccountService,
        { provide: ErrorHandlerService, useValue: mockErrorHandler }
      ]
    });

    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('verificar cuenta existente', () => {
    it('debería verificar si la cuenta existe (true)', () => {
      const testId = '123';
      const mockResponse = true;

      service.verifyAccountExist(testId).subscribe(response => {
        expect(response).toBe(true);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/verification/${testId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('debería manejar errores correctamente', () => {
      const testId = '123';
      const mockError = new ErrorEvent('Network error');

      service.verifyAccountExist(testId).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/verification/${testId}`);
      req.error(mockError);
    });
  });

  describe('getAccounts', () => {
    it('debería obtener las cuentas y mapear la respuesta correctamente', () => {
      service.getAccounts().subscribe(accounts => {
        expect(accounts.length).toBe(1);
        expect(accounts[0]).toEqual(mockAccount);
      });

      const req = httpMock.expectOne(service['apiUrl']);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('debería manejar errores correctamente', () => {
      const mockError = new ErrorEvent('Network error');

      service.getAccounts().subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }
      });

      const req = httpMock.expectOne(service['apiUrl']);
      req.error(mockError);
    });
  });

  describe('addAccount', () => {
    it('debería agregar una nueva cuenta', () => {
      service.addAccount(mockAccount).subscribe(account => {
        expect(account).toEqual(mockAccount);
      });

      const req = httpMock.expectOne(service['apiUrl']);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockAccount);
      req.flush(mockAccount);
    });

    it('debería manejar errores al agregar cuenta', () => {
      const mockError = new ErrorEvent('Validation error');

      service.addAccount(mockAccount).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }
      });

      const req = httpMock.expectOne(service['apiUrl']);
      req.error(mockError);
    });
  });

  describe('editAccount', () => {
    it('debería editar una cuenta existente', () => {
      const updatedAccount = { ...mockAccount, name: 'Updated Name' };

      service.editAccount(mockAccount.id!, updatedAccount).subscribe(account => {
        expect(account).toEqual(updatedAccount);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/${mockAccount.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedAccount);
      req.flush(updatedAccount);
    });

    it('debería manejar errores al editar cuenta', () => {
      const mockError = new ErrorEvent('Not Found');

      service.editAccount(mockAccount.id!, mockAccount).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/${mockAccount.id}`);
      req.error(mockError);
    });
  });

  describe('deleteAccount', () => {
    it('debería eliminar una cuenta existente', () => {
      service.deleteAccount(mockAccount.id!).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/${mockAccount.id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('debería manejar errores al eliminar cuenta', () => {
      const mockError = new ErrorEvent('Forbidden');

      service.deleteAccount(mockAccount.id!).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(mockErrorHandler.handleError).toHaveBeenCalled();
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/${mockAccount.id}`);
      req.error(mockError);
    });
  });
});