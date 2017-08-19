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
}

class Player extends Sprite {
  constructor(param) {
    super(param);
    this._MOVESPEED = 140;
  }
  render(ctx) {
    ctx.fillStyle = "#F55";
    ctx.fillRect(this._x, this._y, this._width, this._height);

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
}

const arrowKeys = ["left", "up", "down", "right"]
let gamePlayManager = {
  _bullets: [],
  init() {

    this._canvas = document.getElementById("main-canvas");
    this.setInitialObject();
    document.addEventListener("keydown", this);
    document.addEventListener("keyup", this);
    this.render = this.render.bind(this);
    window.requestAnimationFrame(this.render);

  },
  handleEvent(evt) {
    switch(evt.type) {
    case "keydown":
      this._player.startMove(evt.key);
      break;
    case "keyup":
      this._player.stopMove(evt.key);
      break;
    }
  },
  setInitialObject() {
    let timestamp = performance.now();
    for(let i = 0; i < 10; i++) {
      this._bullets.push(new Bullet({
        x: i * 40,
        y: 20,
        vx: Math.random() * 100 - 50,
        vy: Math.random() * 30 + 60,
        width: 20,
        height: 20,
      }));
    }
    this._player = new Player({
      x: 345,
      y: 320,
      width: 30,
      height: 50,
    });
  },
  render(timestamp) {
    let ctx = this._canvas.getContext("2d");
    ctx.fillStyle = '#888';
    ctx.strokeStyle = 'rgba(0,153,255)';
    ctx.clearRect(0, 0, 640, 480);
    this._bullets.forEach(bullet => {
      bullet.updateTime(timestamp);
      bullet.render(ctx);
    });
    this._player.updateTime(timestamp);
    this._player.render(ctx);
    window.requestAnimationFrame(this.render);
  }
};

gamePlayManager.init();