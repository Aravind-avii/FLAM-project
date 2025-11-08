class WebSocketManager {
  constructor() {
    this.ws = null;
    this.userId = null;
    this.onMessageCallback = null;
  }

  connect(onMessage) {
    this.onMessageCallback = onMessage;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('Connected');
      document.getElementById('statusText').textContent = 'Connected';
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'init') this.userId = message.userId;
      if (this.onMessageCallback) this.onMessageCallback(message);
    };
    
    this.ws.onerror = () => {
      document.getElementById('statusText').textContent = 'Connection Error';
    };
    
    this.ws.onclose = () => {
      document.getElementById('statusText').textContent = 'Disconnected';
    };
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}