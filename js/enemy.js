'use strict';
class Enemy extends Sprite {
  constructor(param) {
    super(param);
    this._bulletSource = new BulletSource({
      patterns: param.bulletPatterns,
      enabled: true,
      bulletSet: param.bulletSet,
      anchor: this
    });
    this._killed = false;
    this._vanished = false;
  }
  updateTime(timestamp) {
    super.updateTime(timestamp);
    this._bulletSource.updateTime(timestamp);
  }
  render(ctx) {
    ctx.fillStyle = `rgba(80, 80, 255, ${this._killed ? 0.4 : 1})`;
    ctx.strokeStyle = 'rgba(255,0,0)';
    ctx.fillRect(this._x, this._y, this._width, this._height);
    ctx.fill();
    ctx.stroke();
    this._bulletSource.render(ctx);
  }
  kill(ms = 1000) {
    if (this._killed) {
      return false;
    }
    this._killed = true;
    this._bulletSource.turnOff();
    setTimeout(() => this._vanished = true, ms);
    return true;
  }
  get vanished() {
    return this._vanished;
  }
  get killed() {
    return this._killed;
  }
}
