import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaRutas } from './mapa-rutas';

describe('MapaRutas', () => {
  let component: MapaRutas;
  let fixture: ComponentFixture<MapaRutas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaRutas],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaRutas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
