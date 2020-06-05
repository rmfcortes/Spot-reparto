export interface Pedido {
    aceptado: boolean;
    cliente: Cliente;
    id: string;
    productos: Producto[];
    repartidor: Repartidor;
    total: number;
    formaPago: FormaPago;
    unRead?: number;
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
    complementos: Complemento[];
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
}

export interface Complemento {
    nombre: string;
    precio: number;
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
    notificado: number;
    segundos_left?: number; 
    region?: string;         
}
