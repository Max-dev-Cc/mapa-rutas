import {
  Component,
  OnInit,
  OnDestroy,
  input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import * as L from 'leaflet';
import { RutaData, PasoData } from '../../models/ruta';
import { DecimalPipe } from '@angular/common';

const iconDefault = L.icon({
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

const COLORES_RUTA = [
  '#E63946',
  '#2196F3',
  '#4CAF50',
  '#FF9800',
  '#9C27B0',
  '#00BCD4',
  '#FF5722',
  '#8BC34A',
];

@Component({
  selector: 'app-mapa-rutas',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './mapa-rutas.html',
  styleUrl: './mapa-rutas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaRutasComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  rutaData = input<RutaData | null>(null);

  private map!: L.Map;
  private layerGroup!: L.LayerGroup;
  private mapInitialized = false;

  private readonly PUEBLA_CENTER: L.LatLngExpression = [19.0414, -98.2063];
  private readonly ZOOM_INICIAL = 13;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      this.map.invalidateSize(); // <-- fuerza recalculo del tamaño
      this.mapInitialized = true;
      const data = this.rutaData();
      if (data) this.renderizarRuta(data);
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rutaData'] && this.mapInitialized) {
      const data = this.rutaData();
      if (data) {
        this.limpiarCapas();
        this.renderizarRuta(data);
      }
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: this.PUEBLA_CENTER,
      zoom: this.ZOOM_INICIAL,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.layerGroup = L.layerGroup().addTo(this.map);
  }

  private limpiarCapas(): void {
    this.layerGroup.clearLayers();
  }

  private renderizarRuta(ruta: RutaData): void {
    this.agregarMarcadorAlmacen(ruta.almacen.latitud, ruta.almacen.longitud);

    if (ruta.pasos_ruta && ruta.pasos_ruta.length > 0) {
      this.dibujarPasosRuta(ruta.pasos_ruta, ruta);
    } else {
      this.dibujarPuntosEntrega(ruta);
    }

    this.ajustarVista(ruta);
  }

  private agregarMarcadorAlmacen(lat: number, lon: number): void {
    const iconAlmacen = L.divIcon({
      className: '',
      html: `<div class="marker-almacen">🏭</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    L.marker([lat, lon], { icon: iconAlmacen })
      .bindPopup('<b>Almacén / Punto de partida</b>')
      .addTo(this.layerGroup);
  }

  private dibujarPasosRuta(pasos: PasoData[], ruta: RutaData): void {
    const viajes: PasoData[][] = [];
    let viajeActual: PasoData[] = [];

    pasos.forEach((paso, i) => {
      viajeActual.push(paso);
      if (paso.tipo === 'almacen' && i > 0) {
        viajes.push([...viajeActual]);
        viajeActual = [];
      }
    });

    if (viajeActual.length > 0) viajes.push(viajeActual);

    viajes.forEach((viaje, idx) => {
      const color = COLORES_RUTA[idx % COLORES_RUTA.length];
      const coordenadas: L.LatLngExpression[] = viaje.map((p) => [p.lat, p.lon]);

      L.polyline(coordenadas, { color, weight: 4, opacity: 0.8, dashArray: '8, 4' })
        .bindPopup(`<b>Viaje ${idx + 1}</b><br>${viaje.length} paradas`)
        .addTo(this.layerGroup);

      viaje.forEach((paso, orden) => {
        if (paso.tipo === 'entrega') {
          // <-- era 'cliente'
          const punto = ruta.puntos_entrega.find((p) => p.id === paso.cliente_id);
          this.agregarMarcadorCliente(paso, punto?.nombre, orden + 1, color);
        }
      });
    });
  }

  private dibujarPuntosEntrega(ruta: RutaData): void {
    const color = COLORES_RUTA[0];
    ruta.puntos_entrega.forEach((punto, idx) => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="marker-cliente" style="background:${color}">${idx + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([punto.latitud, punto.longitud], { icon })
        .bindPopup(`<b>${punto.nombre}</b><br>Garrafones: ${punto.garrafones}`)
        .addTo(this.layerGroup);
    });
  }

  private agregarMarcadorCliente(
    paso: PasoData,
    nombre: string | undefined,
    orden: number,
    color: string,
  ): void {
    const icon = L.divIcon({
      className: '',
      html: `<div class="marker-cliente" style="background:${color}">${orden}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker([paso.lat, paso.lon], { icon })
      .bindPopup(
        `
        <b>${nombre ?? 'Cliente ' + paso.cliente_id}</b><br>
        Orden: ${orden}<br>
        Distancia: ${(paso.distancia / 1000).toFixed(2)} km<br>
        Duración: ${Math.round(paso.duracion / 60)} min<br>
        Carga: ${paso.carga_camion} garrafones
      `,
      )
      .addTo(this.layerGroup);
  }

  private ajustarVista(ruta: RutaData): void {
    const puntos: L.LatLngExpression[] = [
      [ruta.almacen.latitud, ruta.almacen.longitud],
      ...ruta.puntos_entrega.map((p) => [p.latitud, p.longitud] as L.LatLngExpression),
    ];
    if (puntos.length > 1) {
      this.map.fitBounds(L.latLngBounds(puntos), { padding: [40, 40] });
    }
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }
}
