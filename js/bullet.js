'use strict';

class Bullet extends Sprite {
  constructor(param) {
    super(param);
    this._radius = this._width / 2;
  }
  render(ctx) {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this._x, this._y, this._radius, 0 , 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  getRect() {
    return { x: this._x - this._radius,
             y: this._y - this._radius,
             width: this._radius * 2,
             height: this._radius * 2};
  }
  moveTo(x, y) {
    this._x = x;
    this._y = y;
  }
}
