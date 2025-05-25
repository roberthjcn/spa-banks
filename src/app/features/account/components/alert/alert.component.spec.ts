import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AlertComponent } from './alert.component';
import { of } from 'rxjs';
import { AlertService } from '../../services/alert.service';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let mockAlertService: jest.Mocked<AlertService>;

  beforeEach(async () => {
    mockAlertService = {
      alert$: of(null),
      hideAlert: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [
        { provide: AlertService, useValue: mockAlertService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización', () => {
    it('debería inicializar con valores por defecto', () => {
      expect(component.message).toBe('');
      expect(component.color).toBe('blue');
      expect(component.isVisible).toBe(false);
    });
  });

  describe('Manejo de alertas', () => {
    it('debería mostrar alerta cuando se recibe un mensaje', () => {
      const testAlert = { message: 'Test message', color: 'red' };
      mockAlertService.alert$ = of(testAlert);

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.message).toBe(testAlert.message);
      expect(component.color).toBe(testAlert.color);
      expect(component.isVisible).toBe(true);
    });

    it('debería ocultar alerta cuando se recibe null', () => {
      const testAlert = { message: 'Test message', color: 'red' };
      mockAlertService.alert$ = of(testAlert);
      component.ngOnInit();
      fixture.detectChanges();

      mockAlertService.alert$ = of(null);
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.isVisible).toBe(false);
    });

    it('debería cerrar automáticamente después de 2 segundos', fakeAsync(() => {
      jest.useFakeTimers();
      const testAlert = { message: 'Test message', color: 'green' };
      mockAlertService.alert$ = of(testAlert);

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.isVisible).toBe(true);

      tick(1999);
      expect(component.isVisible).toBe(true);

      tick(2);
      expect(component.isVisible).toBe(true);
      expect(mockAlertService.hideAlert).toHaveBeenCalled();
    }));
  });

  describe('Método close()', () => {
    it('debería llamar a hideAlert del servicio', () => {
      component.close();
      expect(mockAlertService.hideAlert).toHaveBeenCalled();
    });

    it('debería cancelar el timeout pendiente', fakeAsync(() => {
      jest.useFakeTimers();
      const testAlert = { message: 'Test message', color: 'green' };
      mockAlertService.alert$ = of(testAlert);

      component.ngOnInit();
      fixture.detectChanges();

      component.close();

      tick(2000);

      expect(mockAlertService.hideAlert).toHaveBeenCalledTimes(1);
    }));
  });

  describe('ngOnDestroy', () => {
    it('debería limpiar el timeout al destruir el componente', () => {
      const testAlert = { message: 'Test message', color: 'green' };
      mockAlertService.alert$ = of(testAlert);

      component.ngOnInit();
      fixture.detectChanges();

      const spy = jest.spyOn(window, 'clearTimeout');
      component.ngOnDestroy();

      expect(spy).toHaveBeenCalled();
    });

    it('no debería fallar si no hay timeout al destruir', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});