'use strict';

class BulletSource {
  constructor(param) {
    this._patterns = param.patterns;
    this._bullets = param.bulletSet;
    this._anchor = param.anchor;
    param.enabled ? this.turnOn() : this.turnOff();
  }
  turnOn() {
    if(this._enabled) {
      return;
    }
    this._enabled = true;
    this._turnedOnTime = this._time = performance.now();
  }
  turnOff() {
    this._enabled = false;
  }
  updateTime(timestamp) {
    this._bullets.forEach(bullet => bullet.updateTime(timestamp));
    if (!this._enabled) {
      return;
    }
    let passedTime = this._turnedOnTime - timestamp;
    let oldPassedTime = this._turnedOnTime - this._time;
    for (let pattern of this._patterns) {
      let shouldShoot = Math.floor((passedTime - pattern.delay) / pattern.duration) !==
                        Math.floor((oldPassedTime - pattern.delay) / pattern.duration);
      if (shouldShoot) {
        let anchorRect = this._anchor.getRect();
        let [sourceX , sourceY] = [anchorRect.x + anchorRect.width / 2, anchorRect.y + anchorRect.height / 2];
        let bullet = new Bullet({
          x: sourceX + pattern.offsetX,
          y: sourceY + pattern.offsetY,
          vx: pattern.vx,
          vy: pattern.vy,
          width: 10,
          height: 20
        });
        this._bullets.add(bullet);
      }
    }
    this._time = timestamp;
  }
  render() {}
}
