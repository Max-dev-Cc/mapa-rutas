import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaRutasComponent } from './mapa-rutas';

describe('MapaRutasComponent', () => {
  let component: MapaRutasComponent;
  let fixture: ComponentFixture<MapaRutasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaRutasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaRutasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
