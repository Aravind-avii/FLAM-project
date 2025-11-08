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
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
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
    this.applyStyle(this.color, this.strokeWidth, this.tool);
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.strokeWidth / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  draw(e) {
    if (!this.isDrawing) return;
    const point = this.getCanvasPoint(e);
    this.currentStroke.points.push(point);
    
    const pts = this.currentStroke.points;
    if (pts.length < 2) return;
    
    this.ctx.save();
    this.applyStyle(this.currentStroke.color, this.currentStroke.width, this.currentStroke.tool);
    this.ctx.beginPath();
    this.ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
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

  applyStyle(color, width, tool) {
    this.ctx.lineWidth = width;
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
    if (!stroke?.points?.length) return;
    this.ctx.save();
    this.applyStyle(stroke.color, stroke.width, stroke.tool);
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

  redrawAll(ops) {
    this.clear();
    ops.forEach(op => this.drawStroke(op));
  }

  setTool(tool) { this.tool = tool; }
  setColor(color) { this.color = color; }
  setStrokeWidth(w) { this.strokeWidth = w; }
}