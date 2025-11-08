class DrawingState {
  constructor() {
    this.operations = [];
    this.currentIndex = -1;
  }

  addOperation(operation) {
    this.operations = this.operations.slice(0, this.currentIndex + 1);
    this.operations.push(operation);
    this.currentIndex++;
  }

  undo() {
    if (this.currentIndex >= 0) {
      this.currentIndex--;
      return true;
    }
    return false;
  }

  redo() {
    if (this.currentIndex < this.operations.length - 1) {
      this.currentIndex++;
      return true;
    }
    return false;
  }

  clear() {
    this.operations = [];
    this.currentIndex = -1;
  }

  getOperations() {
    return this.operations.slice(0, this.currentIndex + 1);
  }
}

module.exports = DrawingState;