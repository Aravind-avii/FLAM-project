class CollaborativeDrawingApp {
  constructor() {
    this.canvas = document.getElementById('drawingCanvas');
    this.canvasManager = new CanvasManager(this.canvas);
    this.wsManager = new WebSocketManager();
    this.operations = [];
    this.currentIndex = -1;
    this.cursors = new Map();
    
    this.setupEventListeners();
    this.wsManager.connect(this.handleMessage.bind(this));
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', e => this.canvasManager.startDrawing(e));
    this.canvas.addEventListener('mousemove', e => {
      const pt = this.canvasManager.getCanvasPoint(e);
      this.wsManager.send({ type: 'cursor', x: pt.x, y: pt.y });
      this.canvasManager.draw(e);
    });
    this.canvas.addEventListener('mouseup', () => {
      const stroke = this.canvasManager.stopDrawing();
      if (stroke?.points.length) {
        this.wsManager.send({ type: 'draw', ...stroke });
        this.operations = this.operations.slice(0, this.currentIndex + 1);
        this.operations.push(stroke);
        this.currentIndex++;
        this.updateUndoRedo();
      }
    });
    
    document.getElementById('brushTool').onclick = () => this.setTool('brush');
    document.getElementById('eraserTool').onclick = () => this.setTool('eraser');
    
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.onclick = () => this.setColor(btn.dataset.color);
    });
    
    const sw = document.getElementById('strokeWidth');
    sw.oninput = () => {
      this.canvasManager.setStrokeWidth(+sw.value);
      document.getElementById('strokeValue').textContent = sw.value + 'px';
    };
    
    document.getElementById('undoBtn').onclick = () => this.wsManager.send({ type: 'undo' });
    document.getElementById('redoBtn').onclick = () => this.wsManager.send({ type: 'redo' });
    document.getElementById('clearBtn').onclick = () => {
      if (confirm('Clear canvas?')) this.wsManager.send({ type: 'clear' });
    };
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'init':
        this.operations = msg.operations || [];
        this.currentIndex = this.operations.length - 1;
        this.canvasManager.redrawAll(this.operations);
        document.getElementById('userCount').textContent = msg.users.length;
        this.updateUndoRedo();
        break;
      case 'draw':
        this.operations.push(msg);
        this.currentIndex++;
        this.canvasManager.drawStroke(msg);
        this.updateUndoRedo();
        break;
      case 'cursor':
        this.updateCursor(msg.userId, msg.x, msg.y, msg.color);
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
      case 'user-joined':
      case 'user-left':
        document.getElementById('userCount').textContent = msg.totalUsers;
        break;
    }
  }

  setTool(tool) {
    this.canvasManager.setTool(tool);
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tool + 'Tool').classList.add('active');
  }

  setColor(color) {
    this.canvasManager.setColor(color);
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
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
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';
  }

  updateUndoRedo() {
    document.getElementById('undoBtn').disabled = this.currentIndex < 0;
    document.getElementById('redoBtn').disabled = this.currentIndex >= this.operations.length - 1;
  }
}

document.addEventListener('DOMContentLoaded', () => new CollaborativeDrawingApp());