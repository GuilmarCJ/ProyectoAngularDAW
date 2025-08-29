import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConteoComponent } from './conteo';
import { ConteoService } from '../../services/conteo.service';
import { of } from 'rxjs';

describe('ConteoComponent', () => {  
  //  define el bloque de pruebas para el componente ConteoComponent

  let component: ConteoComponent;                   //  instancia del componente que se va a probar
  let fixture: ComponentFixture<ConteoComponent>;   //  wrapper que permite acceder al HTML y al componente
  let conteoServiceSpy: jasmine.SpyObj<ConteoService>; //  "espía" (mock) del servicio ConteoService

  beforeEach(async () => {
    //  crea un objeto espía del servicio ConteoService
    conteoServiceSpy = jasmine.createSpyObj('ConteoService', ['registrarConteo']);

    //  configura el módulo de pruebas de Angular
    await TestBed.configureTestingModule({
      imports: [ConteoComponent, HttpClientTestingModule], //  importa el componente standalone y el módulo de pruebas de HTTP
      providers: [
        { provide: ConteoService, useValue: conteoServiceSpy }, //  sustituye el servicio real por el espía
        provideRouter([]) // agrega un router vacío para que funcione Router en las pruebas
      ]
    }).compileComponents();

    //  crea la "instancia de pruebas" del componente
    fixture = TestBed.createComponent(ConteoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit y data binding
  });

  it('should create', () => {
    //  prueba básica: verifica que el componente se haya creado correctamente
    expect(component).toBeTruthy();
  });

  it('debería registrar conteo correctamente', () => {
    //  simula que el servicio responde bien (retorna un observable vacío)
    conteoServiceSpy.registrarConteo.and.returnValue(of({}));

    // prepara datos de prueba en el componente
    component.conteoData = { materialId: 1, conteo: 5, obs: 'ok' };

    // llama al método que queremos probar
    component.registrarConteo();

    // verifica que el servicio fue llamado con los mismos datos que tenía el componente
    expect(conteoServiceSpy.registrarConteo).toHaveBeenCalledWith(component.conteoData);

    // verifica que el mensaje cambió a éxito
    expect(component.mensaje).toContain('Conteo registrado');
  });
});

