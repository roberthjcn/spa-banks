import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlertService]
    });
    service = TestBed.inject(AlertService);
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('showAlert', () => {
    it('debería emitir una nueva alerta', (done) => {
      const testMessage = 'Test message';
      const testColor = 'green';

      service.alert$.subscribe(alert => {
        if (alert !== null) {
          expect(alert.message).toBe(testMessage);
          expect(alert.color).toBe(testColor);
          done();
        }
      });

      service.showAlert(testMessage, testColor);
    });

    it('debería usar el color azul por defecto', (done) => {
      const testMessage = 'Test message';

      service.alert$.subscribe(alert => {
        if (alert !== null) {
          expect(alert.color).toBe('blue');
          done();
        }
      });

      service.showAlert(testMessage);
    });
  });

  describe('hideAlert', () => {
    it('debería emitir null para ocultar la alerta', (done) => {
      service.showAlert('Test message');
      let alertsReceived = 0;
      service.alert$.subscribe(alert => {
        alertsReceived++;
        if (alertsReceived === 3) {
          expect(alert).toBeNull();
          done();
        }
      });

      service.hideAlert();
    });
  });

  describe('alert$ observable', () => {
    it('debería emitir el valor inicial null', (done) => {
      service.alert$.subscribe(initialAlert => {
        expect(initialAlert).toBeNull();
        done();
      });
    });

    it('debería emitir múltiples alertas correctamente', (done) => {
      const messages = ['First', 'Second', 'Third'];
      let count = 0;

      service.alert$.subscribe(alert => {
        if (alert !== null) {
          expect(alert.message).toBe(messages[count]);
          count++;

          if (count === messages.length) {
            done();
          }
        }
      });

      messages.forEach(msg => service.showAlert(msg));
    });
  });
});