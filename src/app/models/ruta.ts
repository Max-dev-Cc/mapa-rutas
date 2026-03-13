export interface PuntoEntrega {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  garrafones: number;
  prioridad: number;
  ventana_tiempo_inicia?: number;
  ventana_tiempo_fin?: number;
  estado: string;
}

export interface Almacen {
  latitud: number;
  longitud: number;
  tiempo_recarga: number;
}

export interface PasoData {
  cliente_id: number;
  tipo: string;
  lat: number;
  lon: number;
  distancia: number;
  duracion: number;
  servicio: number;
  carga_camion: number;
}

export interface RutaData {
  id_ruta: string;
  fecha_creacion: string;
  almacen: Almacen;
  puntos_entrega: PuntoEntrega[];
  capacidad_camion: number;
  num_camiones: number;
  hash_peticion: string;
  pasos_ruta?: PasoData[];
  distancia_total: number;
  numero_viajes: number;
  total_garrafones: number;
}
