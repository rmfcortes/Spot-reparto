export interface Pedido {
    aceptado: any;
    avances: Avance[];
    calificacion?: Calificacion;
    cliente: Cliente;
    createdAt: number;
    comision: number;
    entrega: string;
    entregado?: number;
    envio: number;
    id?: string;
    negocio: Negocio;
    formaPago: FormaPago;
    productos: Producto[];
    propina: number;
    repartidor?: RepartidorPedido;
    total: number;
    last_notification?: number;
    last_notificado?: string;
    last_solicitud?: number;
    cancelado_by_negocio?: number;
    razon_cancelacion?: string;
    repartidor_solicitado: boolean;
    recolectado?: boolean;
    unRead: number;
    repartidor_llego: boolean;
}

export interface Avance {
    fecha: number;
    concepto: string;
}

export interface Calificacion {
    negocio: CalificacionDetalles;
    repartidor: CalificacionDetalles;
}

export interface CalificacionDetalles {
    comentarios: string
    puntos: number
    idPedido: string
    fecha: number
}

export interface Negocio {
    categoria: string;
    direccion: Direccion;
    envio: number;
    idNegocio: string;
    logo: string;
    nombreNegocio: string;
    telefono: string;
    repartidores_propios: boolean;
}

export interface RepartidorPedido {
    nombre: string;
    telefono: string;
    foto: string;
    lat?: number;
    lng?: number;
    id: string;
    externo: boolean;
    ganancia?: number;
}

export interface FormaPago {
    forma: string;
    id: string;
    tipo: string;
}

export interface Cliente {
    direccion: Direccion;
    nombre: string;
    telefono?: string;
    uid: string;
    pedido_nuevo?: boolean;
}

export interface Direccion {
    direccion: string;
    lat: number;
    lng: number;
}

export interface Producto{
    cantidad: number;
    codigo?: string;
    complementos?: ListaComplementosElegidos[];
    descripcion: string;
    id: string;
    nombre: string;
    observaciones: string;
    pasillo: string;
    precio: number;
    total: number;
    unidad?: string;
    url: string;
    variables: boolean;
    checked: boolean;
}

export interface ListaComplementosElegidos {
    titulo: string;
    complementos: ProductoComplemento[];
}

export interface ProductoComplemento {
    nombre: string;
    precio?: any;
}

export interface Repartidor {
    foto: string;
    id: string;
    nombre: string;
    telefono: string;
}

export interface Notificacion {
    idPedido: string;
    idNegocio: string;                                
    negocio: string;                              
    negocio_direccion: string;                         
    negocio_lat: number;                               
    negocio_lng: number;                               
    cliente: string;         
    cliente_direccion: string;                       
    cliente_lat: number;                             
    cliente_lng: number;
    createdAt: number;
    distancia: number;
    notificado: number;
    segundos_left?: number; 
    region?: string;       
    ganancia: number;
    propina: number;  
}
