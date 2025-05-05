let socket: WebSocket | null = null;

export const connectWebSocket = (
  onMessage: (data: string) => void,
  onOpen?: () => void,
  onClose?: () => void,
  onError?: (e: Event) => void
) => {
  socket = new WebSocket('ws://IP_ADRESIN:PORT/ws');

  socket.onopen = () => {
    console.log('WebSocket bağlantısı açıldı');
    onOpen && onOpen();
  };

  socket.onmessage = (event) => {
    console.log('Veri alındı:', event.data);
    onMessage(event.data);
  };

  socket.onerror = (error) => {
    console.log('WebSocket hatası:', error);
    onError && onError(error);
  };

  socket.onclose = () => {
    console.log('WebSocket bağlantısı kapandı');
    onClose && onClose();
  };
};

export const sendWebSocketMessage = (msg: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(msg);
  }
};

export const closeWebSocket = () => {
  socket?.close();
};
