import { ErrorHandlerService } from './error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new ErrorHandlerService();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('handleError', () => {
    it('debería manejar ErrorEvent (error del cliente)', (done) => {
      const mockErrorEvent = new ErrorEvent('Error de red', {
        message: 'Failed to fetch'
      });

      const mockError = {
        error: mockErrorEvent,
        status: 0,
        message: 'Error de red'
      } as HttpErrorResponse;

      service.handleError(mockError).subscribe({
        error: (error) => {
          expect(error.message).toBe('Error del cliente: Failed to fetch');
          expect(consoleSpy).toHaveBeenCalledWith('Error del cliente: Failed to fetch');
          done();
        }
      });
    });

    it('debería manejar 404 Not Found', (done) => {
      const mockError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: 'Recurso no encontrado'
      });

      service.handleError(mockError).subscribe({
        error: (error) => {
          expect(error.message).toBe('Recurso no encontrado');
          expect(consoleSpy).toHaveBeenCalledWith('Recurso no encontrado');
          done();
        }
      });
    });

    it('debería manejar 500 Internal Server Error', (done) => {
      const mockError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: 'Error en el servidor'
      });

      service.handleError(mockError).subscribe({
        error: (error) => {
          expect(error.message).toBe('Error interno del servidor');
          expect(consoleSpy).toHaveBeenCalledWith('Error interno del servidor');
          done();
        }
      });
    });

    it('debería manejar otros códigos de estado HTTP', (done) => {
      const mockError = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden',
        error: 'Acceso denegado'
      });

      service.handleError(mockError).subscribe({
        error: (error) => {
          expect(error.message).toBe('Error del servidor: 403 - Http failure response for (unknown url): 403 Forbidden');
          expect(consoleSpy).toHaveBeenCalledWith('Error del servidor: 403 - Http failure response for (unknown url): 403 Forbidden');
          done();
        }
      });
    });

    it('debería manejar errores sin información específica', (done) => {
      const mockError = new HttpErrorResponse({});

      service.handleError(mockError).subscribe({
        error: (error) => {
          expect(error.message).toBe('Error del servidor: 0 - Http failure response for (unknown url): undefined undefined');
          expect(consoleSpy).toHaveBeenCalledWith('Error del servidor: 0 - Http failure response for (unknown url): undefined undefined');
          done();
        }
      });
    });
  });
});