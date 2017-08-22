'use strict';

class Player extends Sprite {
  constructor(param) {
    param.width = 30;
    param.height = 50;
    super(param);
    this._movespeed = FASTMOVESPEED;
    this._coreX = 15;
    this._coreY = 35;
    this._coreRadius = 5;
    this._death = 0;
    this._kills = 0;
    this._bulletSource = new BulletSource({
      patterns: [{
        vx: 0,
        vy: -800,
        offsetX: -15,
        offsetY: 0,
        duration: 41.66,
        delay: 0
      },
      {
        vx: 0,
        vy: -800,
        offsetX: 0,
        offsetY: 0,
        duration: 41.66,
        delay: 0
      },
      {
        vx: 0,
        vy: -800,
        offsetX: 15,
        offsetY: 0,
        duration: 41.66,
        delay: 0
      }
    ],
    bulletSet: param.bulletSet,
    anchor: this
    });
  }
  render(ctx) {
    ctx.fillStyle = this._invincible ? "RGBA(255, 80, 80, 0.4)" : "#F55";
    ctx.fillRect(this._x, this._y, this._width, this._height);
    ctx.beginPath();
    ctx.arc(this._x + this._coreX, this._y + this._coreY, this._coreRadius, 0 , 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    this._bulletSource.render(ctx);
  }
  startMove(direction) {
    if (direction === "ArrowLeft") {
      this._vx = -this._movespeed;
    } else if (direction === "ArrowRight") {
      this._vx = this._movespeed;
    } else if (direction === "ArrowUp") {
      this._vy = -this._movespeed;
    } else if (direction === "ArrowDown") {
      this._vy = this._movespeed;
    }
  }
  stopMove(direction) {
    if (direction === "ArrowLeft" && this._vx < 0) {
      this._vx = 0;
    } else if (direction === "ArrowRight" && this._vx > 0) {
      this._vx = 0;
    } else if (direction === "ArrowUp" && this._vy < 0) {
      this._vy = 0;
    } else if (direction === "ArrowDown"  && this._vy > 0) {
      this._vy = 0;
    }
  }
  limitPosition() {
    if (this._x < 0) {
      this._x = 0;
    } else if (this._x + this._width > CANVAS_WIDTH) {
      this._x = CANVAS_WIDTH - this._width;
    }
    if (this._y < 0) {
      this._y = 0;
    } else if (this._y + this._height > CANVAS_HEIGHT) {
      this._y = CANVAS_HEIGHT - this._height;
    }
  }
  updateTime(timestamp) {
    super.updateTime(timestamp);
    this._bulletSource.updateTime(timestamp);
    this.limitPosition();
  }
  getHitBox() {
    return {x: this._x + this._coreX - this._coreRadius,
            y: this._y + this._coreY - this._coreRadius,
            width: this._coreRadius * 2,
            height: this._coreRadius * 2};
  }
  setInvincible(ms = 1500) {
    this._invincible = true;
    setTimeout(() => this._invincible = false, ms);
  }
  startFire() {
    this._bulletSource.turnOn();
  }
  stopFire() {
    this._bulletSource.turnOff();
  }
  switchSlowMode() {
    this._movespeed = SLOWMOVESPEED;
    this._refreshMoveSpeed();
  }
  switchFastMode() {
    this._movespeed = FASTMOVESPEED;
    this._refreshMoveSpeed();
  }
  _refreshMoveSpeed() {
    if (this._vx < 0) {
      this._vx = -this._movespeed;
    } else if (this._vx > 0) {
      this._vx = this._movespeed;
    } else {
      this._vx = 0;
    }
    if (this._vy < 0) {
      this._vy = -this._movespeed;
    } else if (this._vy > 0) {
      this._vy = this._movespeed;
    } else {
      this._vy = 0;
    }
  }
  get invincible() {
    return this._invincible;
  }
  get death() {
    return this._death;
  }
  set death(newDeath) {
    this._death = newDeath;
  }
  get kills() {
    return this._kills;
  }
  set kills(value) {
    this._kills = value;
  }
}
