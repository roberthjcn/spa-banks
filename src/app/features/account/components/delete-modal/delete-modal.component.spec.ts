import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteModalComponent } from './delete-modal.component';

describe('DeleteModalComponent', () => {
  let component: DeleteModalComponent;
  let fixture: ComponentFixture<DeleteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteModalComponent] 
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('debería recibir el nombre del producto correctamente', () => {
      const testName = 'Producto de prueba';
      component.productName = testName;
      fixture.detectChanges();

      expect(component.productName).toBe(testName);
    });

    it('debería tener un string vacío como nombre por defecto', () => {
      expect(component.productName).toBe('');
    });
  });

  describe('Outputs', () => {
    it('debería emitir evento onConfirm al llamar a confirm()', () => {
      jest.spyOn(component.onConfirm, 'emit');

      component.confirm();

      expect(component.onConfirm.emit).toHaveBeenCalled();
    });

    it('debería emitir evento onCancel al llamar a cancel()', () => {
      jest.spyOn(component.onCancel, 'emit');

      component.cancel();

      expect(component.onCancel.emit).toHaveBeenCalled();
    });
  });

  describe('Comportamiento', () => {
    it('no debería emitir eventos si no se llaman los métodos', () => {
      const confirmSpy = jest.spyOn(component.onConfirm, 'emit');
      const cancelSpy = jest.spyOn(component.onCancel, 'emit');

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(cancelSpy).not.toHaveBeenCalled();
    });
  });
});