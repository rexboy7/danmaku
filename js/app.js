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
    this._time = performance.now();
  }
  updateTime(timestamp) {
    let timeDelta = timestamp - this._time;
    this._x += timeDelta * this._vx / 1000;
    this._y += timeDelta * this._vy / 1000;
    this._time = timestamp;
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
  }
  render(ctx) {
    ctx.fillStyle = this._invincible ? "RGBA(255, 80, 80, 0.4)" : "#F55";
    ctx.fillRect(this._x, this._y, this._width, this._height);
    ctx.beginPath();
    ctx.arc(this._x + this._coreX, this._y + this._coreY, this._coreRadius, 0 , 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

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
      this._player.startMove(evt.key);
      break;
    case "keyup":
      this._player.stopMove(evt.key);
      break;
    case "mousedown":
    case "touchstart":
      this._player.startMove(evt.target.value);
      break;
    case "mouseup":
    case "touchend":
      this._player.stopMove(evt.target.value);
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