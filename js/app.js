const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT= 480;

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
}

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
  isOutOfScreen() {
    return this._x + this._radius < 0 ||
           this._x - this._radius > CANVAS_WIDTH ||
           this._y + this._radius < 0 ||
           this._y - this._radius > CANVAS_HEIGHT;
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

class Player extends Sprite {
  constructor(param) {
    param.width = 30;
    param.height = 50;
    super(param);
    this._MOVESPEED = 140;
    this._coreX = 15;
    this._coreY = 35;
    this._coreRadius = 5;
    this._death = 0;
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
      this._vx = -this._MOVESPEED;
    } else if (direction === "ArrowRight") {
      this._vx = this._MOVESPEED;
    } else if (direction === "ArrowUp") {
      this._vy = -this._MOVESPEED;
    } else if (direction === "ArrowDown") {
      this._vy = this._MOVESPEED;
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
  collidedWith(bullet) {
    let bulletBox = bullet.getRect();
    let hitBox = {x: this._x + this._coreX - this._coreRadius,
                  y: this._y + this._coreY - this._coreRadius,
                  width: this._coreRadius * 2,
                  height: this._coreRadius * 2};
    let xOverlapped = !(bulletBox.x + bulletBox.width < hitBox.x ||
                        bulletBox.x > hitBox.x + hitBox.width);
    let yOverlapped = !(bulletBox.y + bulletBox.height < hitBox.y ||
                        bulletBox.y > hitBox.y + hitBox.height);
    return xOverlapped && yOverlapped;
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
  get invincible() {
    return this._invincible;
  }
  get death() {
    return this._death;
  }
  set death(newDeath) {
    this._death = newDeath;
  }

}

class BulletSource {
  constructor(param) {
    this._patterns = param.patterns;
    this._bullets = new Set();
    this._enabled = false;
    this._anchor = param.anchor;
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
  render(ctx) {
    this._bullets.forEach(bullet => {
      if (bullet.isOutOfScreen()) {
        this._bullets.delete(bullet);
        return;
      }
      bullet.render(ctx);
    });
  }
}

let gamePlayManager = {
  _bullets: new Set(),
  init() {
    this._canvas = document.getElementById("main-canvas");
    this._infoBox = document.getElementById("info");
    this._controllerBox = document.getElementById("controller-box");
    this._info = {
      frameRunned: 0,
      frameTimestamp: performance.now()
    };

    this.setInitialObject();
    document.addEventListener("keydown", this);
    document.addEventListener("keyup", this);
    this._controllerBox.addEventListener("mousedown", this);
    this._controllerBox.addEventListener("mouseup", this);
    this._controllerBox.addEventListener("touchstart", this);
    this._controllerBox.addEventListener("touchend", this);
    this.render = this.render.bind(this);
    this.refreshInfo = this.refreshInfo.bind(this);

    window.requestAnimationFrame(this.render);
    this.refreshInfo();
  },
  handleEvent(evt) {
    switch(evt.type) {
    case "keydown":
      if(evt.key === "z" || evt.key === "Z") {
        this._player.startFire();
      } else {
        this._player.startMove(evt.key);
      }
      break;
    case "keyup":
      if(evt.key === "z" || evt.key === "Z") {
        this._player.stopFire();
      } else {
        this._player.stopMove(evt.key);
      }
      break;
    case "mousedown":
    case "touchstart":
      if(evt.target.value === 'z') {
        this._player.startFire();
      } else {
        this._player.startMove(evt.target.value);
      }
      break;
    case "mouseup":
    case "touchend":
      if(evt.target.value === 'z') {
        this._player.stopFire();
      } else {
        this._player.stopMove(evt.target.value);
      }
      break;
    }
  },
  setInitialObject() {
    let timestamp = performance.now();
    this.addBullet();
    this._player = new Player({
      x: 345,
      y: 320
    });
    setInterval(this.addBullet.bind(this), 6000);
  },
  addBullet() {
    for(let i = 0; i < 15; i++) {
      this._bullets.add(new Bullet({
        x: i * 40,
        y: 60,
        vx: (Math.random() * 30 + 30) * (Math.random() >= 0.5 ? 1 : -1),
        vy: (Math.random() * 30 + 30) * (Math.random() >= 0.2 ? 1 : -1),
        width: 20,
        height: 20,
      }));
    }
  },
  render(timestamp) {
    let ctx = this._canvas.getContext("2d");
    ctx.fillStyle = '#888';
    ctx.strokeStyle = 'rgba(0,153,255)';
    ctx.clearRect(0, 0, 640, 480);
    this._player.updateTime(timestamp);
    this._bullets.forEach(bullet => {
      bullet.updateTime(timestamp);
      if (bullet.isOutOfScreen()) {
        this._bullets.delete(bullet);
        return;
      }
      if(this._player.collidedWith(bullet) && !this._player.invincible) {
        this._player.setInvincible();
        this._player.death++;
      }
      bullet.render(ctx);
    });
    this._player.render(ctx);

    this._info.frameRunned++;

    window.requestAnimationFrame(this.render);
  },
  refreshInfo() {
    let timestamp = performance.now();
    let fps = this._info.frameRunned / (timestamp - this._info.frameTimestamp) * 1000;
    fps = Math.round(fps);

    this._info.frameRunned = 0;
    this._info.frameTimestamp = timestamp;

    this._infoBox.textContent =
      `FPS: ${fps}\n
       Death: ${this._player.death}
       Bullets: ${this._bullets.size}`
    setTimeout(this.refreshInfo, 500);
  }
};

gamePlayManager.init();