import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConteoComponent } from './conteo';
import { ConteoService } from '../../services/conteo.service';
import { of } from 'rxjs';

describe('ConteoComponent', () => {
  let component: ConteoComponent;
  let fixture: ComponentFixture<ConteoComponent>;
  let conteoServiceSpy: jasmine.SpyObj<ConteoService>;

  beforeEach(async () => {
    conteoServiceSpy = jasmine.createSpyObj('ConteoService', ['registrarConteo']);

    await TestBed.configureTestingModule({
      imports: [ConteoComponent, HttpClientTestingModule], // 👈 standalone
      providers: [
        { provide: ConteoService, useValue: conteoServiceSpy },
        provideRouter([]) // 👈 para que funcione el Router en pruebas
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConteoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería registrar conteo correctamente', () => {
    conteoServiceSpy.registrarConteo.and.returnValue(of({}));
    component.conteoData = { materialId: 1, conteo: 5, obs: 'ok' };

    component.registrarConteo();

    expect(conteoServiceSpy.registrarConteo).toHaveBeenCalledWith(component.conteoData);
    expect(component.mensaje).toContain('Conteo registrado');
  });
});
