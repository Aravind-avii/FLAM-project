<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Collaborative Drawing Canvas</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      overflow: hidden;
      background: #f3f4f6;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    /* Toolbar */
    .toolbar {
      background: white;
      border-bottom: 2px solid #e5e7eb;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .tool-group {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-right: 20px;
      border-right: 1px solid #e5e7eb;
    }

    .tool-group:last-child {
      border-right: none;
    }

    .tool-btn {
      padding: 10px;
      border: none;
      background: #f3f4f6;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tool-btn:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .tool-btn.active {
      background: #3b82f6;
      color: white;
    }

    .tool-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .tool-btn.danger:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .color-palette {
      gap: 6px;
    }

    .color-btn {
      width: 32px;
      height: 32px;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .color-btn:hover {
      transform: scale(1.1);
    }

    .color-btn.active {
      border-color: #1f2937;
      transform: scale(1.15);
      box-shadow: 0 0 0 2px white, 0 0 0 4px #1f2937;
    }

    .slider-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: #374151;
    }

    #strokeWidth {
      width: 100px;
    }

    #strokeValue {
      min-width: 35px;
      font-weight: 500;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
      padding: 8px 16px;
      background: #ecfdf5;
      border-radius: 6px;
      color: #059669;
      font-weight: 500;
    }

    /* Canvas */
    .canvas-container {
      flex: 1;
      position: relative;
      overflow: hidden;
      background: white;
    }

    #drawingCanvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: crosshair;
    }

    #cursors {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .cursor {
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      transform: translate(-50%, -50%);
      transition: all 0.1s ease-out;
      pointer-events: none;
    }

    /* Status Bar */
    .status-bar {
      background: #1f2937;
      color: white;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .instructions {
      font-size: 13px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="tool-group">
        <button id="brushTool" class="tool-btn active" title="Brush">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
          </svg>
        </button>
        <button id="eraserTool" class="tool-btn" title="Eraser">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 20H7L3 16 12 7l9 9-1 4z"/>
            <path d="M16 16l4 4"/>
          </svg>
        </button>
      </div>

      <div class="tool-group color-palette">
        <button class="color-btn active" data-color="#000000" style="background: #000000;" title="Black"></button>
        <button class="color-btn" data-color="#ef4444" style="background: #ef4444;" title="Red"></button>
        <button class="color-btn" data-color="#3b82f6" style="background: #3b82f6;" title="Blue"></button>
        <button class="color-btn" data-color="#10b981" style="background: #10b981;" title="Green"></button>
        <button class="color-btn" data-color="#f59e0b" style="background: #f59e0b;" title="Orange"></button>
        <button class="color-btn" data-color="#8b5cf6" style="background: #8b5cf6;" title="Purple"></button>
        <button class="color-btn" data-color="#ec4899" style="background: #ec4899;" title="Pink"></button>
      </div>

      <div class="tool-group">
        <label class="slider-label">
          <span>Size:</span>
          <input type="range" id="strokeWidth" min="1" max="25" value="4">
          <span id="strokeValue">4px</span>
        </label>
      </div>

      <div class="tool-group">
        <button id="undoBtn" class="tool-btn" title="Undo" disabled>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v6h6"/>
            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
          </svg>
        </button>
        <button id="redoBtn" class="tool-btn" title="Redo" disabled>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 7v6h-6"/>
            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
          </svg>
        </button>
      </div>

      <div class="tool-group">
        <button id="clearBtn" class="tool-btn danger" title="Clear Canvas">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </button>
      </div>

      <div class="user-info">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
        <span id="userCount">1</span> online
      </div>
    </div>

    <!-- Canvas Container -->
    <div class="canvas-container">
      <canvas id="drawingCanvas"></canvas>
      <div id="cursors"></div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <div class="status-indicator">
        <span class="status-dot" id="statusDot"></span>
        <span id="statusText">Ready - Multi-user simulation active</span>
      </div>
      <div class="instructions">
        Open multiple browser tabs to see real-time collaboration!
      </div>
    </div>
  </div>

  <script>
    // Mock WebSocket Server Simulation (for demo without backend)
    class MockWebSocketServer {
      constructor() {
        this.clients = [];
        this.operations = [];
        this.currentIndex = -1;
      }

      addClient(client) {
        this.clients.push(client);
        
        // Send initial state
        setTimeout(() => {
          client.onMessage({
            type: 'init',
            userId: client.id,
            color: client.color,
            operations: this.operations.slice(0, this.currentIndex + 1),
            users: this.clients.map(c => ({ id: c.id, color: c.color }))
          });
        }, 100);
      }

      broadcast(message, senderId) {
        if (message.type === 'draw') {
          this.operations = this.operations.slice(0, this.currentIndex + 1);
          this.operations.push(message);
          this.currentIndex++;
        } else if (message.type === 'undo' && this.currentIndex >= 0) {
          this.currentIndex--;
        } else if (message.type === 'redo' && this.currentIndex < this.operations.length - 1) {
          this.currentIndex++;
        } else if (message.type === 'clear') {
          this.operations = [];
          this.currentIndex = -1;
        }

        this.clients.forEach(client => {
          if (client.id !== senderId) {
            client.onMessage({ ...message, userId: senderId });
          }
        });
      }

      removeClient(clientId) {
        this.clients = this.clients.filter(c => c.id !== clientId);
      }

      getUserColor(userId) {
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
      }
    }

    // Global mock server
    const mockServer = new MockWebSocketServer();

    // Canvas Manager
    class CanvasManager {
      constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentStroke = null;
        this.tool = 'brush';
        this.color = '#000000';
        this.strokeWidth = 4;
        
        this.setupCanvas();
      }

      setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
      }

      getCanvasPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }

      startDrawing(e) {
        this.isDrawing = true;
        const point = this.getCanvasPoint(e);
        
        this.currentStroke = {
          points: [point],
          color: this.color,
          width: this.strokeWidth,
          tool: this.tool
        };
        
        this.ctx.save();
        this.applyDrawingStyle(this.color, this.strokeWidth, this.tool);
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.strokeWidth / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      draw(e) {
        if (!this.isDrawing) return;
        
        const point = this.getCanvasPoint(e);
        this.currentStroke.points.push(point);
        
        const points = this.currentStroke.points;
        if (points.length < 2) return;
        
        this.ctx.save();
        this.applyDrawingStyle(
          this.currentStroke.color, 
          this.currentStroke.width, 
          this.currentStroke.tool
        );
        this.ctx.beginPath();
        this.ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
        this.ctx.lineTo(point.x, point.y);
        this.ctx.stroke();
        this.ctx.restore();
      }

      stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        const stroke = this.currentStroke;
        this.currentStroke = null;
        
        return stroke;
      }

      applyDrawingStyle(color, width, tool) {
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        if (tool === 'eraser') {
          this.ctx.globalCompositeOperation = 'destination-out';
          this.ctx.strokeStyle = 'rgba(0,0,0,1)';
          this.ctx.fillStyle = 'rgba(0,0,0,1)';
        } else {
          this.ctx.globalCompositeOperation = 'source-over';
          this.ctx.strokeStyle = color;
          this.ctx.fillStyle = color;
        }
      }

      drawStroke(stroke) {
        if (!stroke || !stroke.points || stroke.points.length === 0) return;
        
        this.ctx.save();
        this.applyDrawingStyle(stroke.color, stroke.width, stroke.tool);
        
        this.ctx.beginPath();
        this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        
        for (let i = 1; i < stroke.points.length; i++) {
          this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
      }

      clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }

      redrawAll(operations) {
        this.clear();
        operations.forEach(op => this.drawStroke(op));
      }

      setTool(tool) {
        this.tool = tool;
      }

      setColor(color) {
        this.color = color;
      }

      setStrokeWidth(width) {
        this.strokeWidth = width;
      }
    }

    // Main Application
    class CollaborativeDrawingApp {
      constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.canvasManager = new CanvasManager(this.canvas);
        this.operations = [];
        this.currentIndex = -1;
        this.cursors = new Map();
        
        // Setup mock WebSocket client
        this.userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.userColor = mockServer.getUserColor(this.userId);
        
        const client = {
          id: this.userId,
          color: this.userColor,
          onMessage: this.handleMessage.bind(this)
        };
        
        mockServer.addClient(client);
        
        this.setupEventListeners();
      }

      setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        document.getElementById('brushTool').addEventListener('click', () => {
          this.setTool('brush');
        });
        
        document.getElementById('eraserTool').addEventListener('click', () => {
          this.setTool('eraser');
        });
        
        document.querySelectorAll('.color-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const color = e.target.dataset.color;
            this.setColor(color);
          });
        });
        
        const strokeWidth = document.getElementById('strokeWidth');
        const strokeValue = document.getElementById('strokeValue');
        strokeWidth.addEventListener('input', (e) => {
          const value = e.target.value;
          this.canvasManager.setStrokeWidth(parseInt(value));
          strokeValue.textContent = `${value}px`;
        });
        
        document.getElementById('undoBtn').addEventListener('click', () => {
          mockServer.broadcast({ type: 'undo' }, this.userId);
        });
        
        document.getElementById('redoBtn').addEventListener('click', () => {
          mockServer.broadcast({ type: 'redo' }, this.userId);
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
          if (confirm('Clear entire canvas? This will affect all users.')) {
            mockServer.broadcast({ type: 'clear' }, this.userId);
          }
        });
      }

      handleMouseDown(e) {
        this.canvasManager.startDrawing(e);
      }

      handleMouseMove(e) {
        const point = this.canvasManager.getCanvasPoint(e);
        mockServer.broadcast({
          type: 'cursor',
          x: point.x,
          y: point.y,
          color: this.userColor
        }, this.userId);
        
        this.canvasManager.draw(e);
      }

      handleMouseUp() {
        const stroke = this.canvasManager.stopDrawing();
        
        if (stroke && stroke.points.length > 0) {
          mockServer.broadcast({
            type: 'draw',
            ...stroke
          }, this.userId);
          
          this.operations = this.operations.slice(0, this.currentIndex + 1);
          this.operations.push(stroke);
          this.currentIndex++;
          this.updateUndoRedo();
        }
      }

      handleMessage(message) {
        switch (message.type) {
          case 'init':
            this.operations = message.operations || [];
            this.currentIndex = this.operations.length - 1;
            this.canvasManager.redrawAll(this.operations);
            this.updateUserCount(message.users.length);
            this.updateUndoRedo();
            break;
            
          case 'draw':
            this.operations.push(message);
            this.currentIndex++;
            this.canvasManager.drawStroke(message);
            this.updateUndoRedo();
            break;
            
          case 'cursor':
            this.updateCursor(message.userId, message.x, message.y, message.color);
            break;
            
          case 'undo':
            this.currentIndex = Math.max(-1, this.currentIndex - 1);
            this.canvasManager.redrawAll(this.operations.slice(0, this.currentIndex + 1));
            this.updateUndoRedo();
            break;
            
          case 'redo':
            this.currentIndex = Math.min(this.operations.length - 1, this.currentIndex + 1);
            this.canvasManager.redrawAll(this.operations.slice(0, this.currentIndex + 1));
            this.updateUndoRedo();
            break;
            
          case 'clear':
            this.operations = [];
            this.currentIndex = -1;
            this.canvasManager.clear();
            this.updateUndoRedo();
            break;
        }
      }

      setTool(tool) {
        this.canvasManager.setTool(tool);
        
        document.querySelectorAll('.tool-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        if (tool === 'brush') {
          document.getElementById('brushTool').classList.add('active');
        } else {
          document.getElementById('eraserTool').classList.add('active');
        }
      }

      setColor(color) {
        this.canvasManager.setColor(color);
        
        document.querySelectorAll('.color-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
      }

      updateCursor(userId, x, y, color) {
        let cursor = this.cursors.get(userId);
        
        if (!cursor) {
          cursor = document.createElement('div');
          cursor.className = 'cursor';
          cursor.style.backgroundColor = color;
          document.getElementById('cursors').appendChild(cursor);
          this.cursors.set(userId, cursor);
        }
        
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
        
        clearTimeout(cursor.hideTimeout);
        cursor.hideTimeout = setTimeout(() => {
          cursor.remove();
          this.cursors.delete(userId);
        }, 3000);
      }

      updateUserCount(count) {
        document.getElementById('userCount').textContent = count;
      }

      updateUndoRedo() {
        document.getElementById('undoBtn').disabled = this.currentIndex < 0;
        document.getElementById('redoBtn').disabled = this.currentIndex >= this.operations.length - 1;
      }
    }

    // Initialize app when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      new CollaborativeDrawingApp();
    });
  </script>
</body>
</html>