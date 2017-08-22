'use strict';

class Sprite {
  constructor(param) {
    this._x = param.x || 0;
    this._y = param.y || 0;
    this._vx = param.vx || 0;
    this._vy = param.vy || 0;
    this._width = param.width;
    this._height = param.height;
    this._time = param.timestamp || performance.now();
  }
  updateTime(timestamp) {
    let timeDelta = timestamp - this._time;
    this._x += timeDelta * this._vx / 1000;
    this._y += timeDelta * this._vy / 1000;
    this._time = timestamp;
  }
  getRect() {
    return { x: this._x,
             y: this._y,
             width: this._width,
             height: this._height};
  }
  getHitBox() {
    return this.getRect();
  }
  collidedWith(sprite) {
    let othersBox = sprite.getHitBox();
    let myBox = this.getHitBox();
    let xOverlapped = !(othersBox.x + othersBox.width < myBox.x ||
                        othersBox.x > myBox.x + myBox.width);
    let yOverlapped = !(othersBox.y + othersBox.height < myBox.y ||
                        othersBox.y > myBox.y + myBox.height);
    return xOverlapped && yOverlapped;
  }
  isOutOfScreen() {
    let rect = this.getRect();
    return rect.x + rect.width < 0 ||
           rect.x > CANVAS_WIDTH ||
           rect.y + rect.height < 0 ||
           rect.y > CANVAS_HEIGHT;
  }
}