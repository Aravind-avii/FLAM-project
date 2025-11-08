const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const DrawingState = require('./drawing-state');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

const drawingState = new DrawingState();
const clients = new Map();

function generateUserColor(userId) {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

wss.on('connection', (ws) => {
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const userColor = generateUserColor(userId);
  
  clients.set(userId, { ws, color: userColor });
  console.log(`User connected: ${userId} (Total: ${clients.size})`);

  ws.send(JSON.stringify({
    type: 'init',
    userId: userId,
    color: userColor,
    operations: drawingState.getOperations(),
    users: Array.from(clients.entries()).map(([id, client]) => ({
      id, color: client.color
    }))
  }));

  broadcast({ type: 'user-joined', userId, color: userColor, totalUsers: clients.size }, userId);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'draw':
          drawingState.addOperation(message);
          broadcast(message, userId);
          break;
        case 'cursor':
          broadcast({ ...message, userId, color: userColor }, userId);
          break;
        case 'undo':
          drawingState.undo();
          broadcast({ type: 'undo', userId });
          break;
        case 'redo':
          drawingState.redo();
          broadcast({ type: 'redo', userId });
          break;
        case 'clear':
          drawingState.clear();
          broadcast({ type: 'clear', userId });
          break;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(userId);
    console.log(`User disconnected: ${userId}`);
    broadcast({ type: 'user-left', userId, totalUsers: clients.size });
  });
});

function broadcast(message, excludeUserId = null) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client, userId) => {
    if (userId !== excludeUserId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
}

server.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log('📱 Open multiple tabs to test collaboration!\n');
});