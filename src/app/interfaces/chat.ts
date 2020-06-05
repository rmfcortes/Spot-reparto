export interface UnreadMsg {
    idPedido: string;
    cantidad: number;
    nombreCliente: string;
    idCliente: string;
}

export interface Mensaje {
    isMe: boolean;
    createdAt: number;
    msg: string;
    idCliente: string;
    repartidor: string;
}
