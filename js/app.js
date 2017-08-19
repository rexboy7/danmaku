class Sprite {

}

class Bullet extends Sprite {
  constructor(param) {
    super(param);
    this._x = param.x;
    this._y = param.y;
    this._vx = param.vx;
    this._vy = param.vy;
    this._width = param.width;
    this._height = param.height;
    this._time = param.timestamp;
    this._radius = this._width / 2;
  }
  render(ctx) {
    ctx.beginPath();
    ctx.arc(this._x, this._y, this._radius, 0 , 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  move(timestamp) {
    let timeDelta = timestamp - this._time;
    this. _x += timeDelta * this._vx / 1000;
    this. _y += timeDelta * this._vy / 1000;
    this._time = timestamp;
  }
}

let gamePlayManager = {
  _bullets: [],
  init() {
    let timestamp = performance.now();
    this._canvas = document.getElementById("main-canvas");
    for(let i = 0; i < 10; i++) {
      this._bullets.push(new Bullet({
        x: i * 40,
        y: 20,
        vx: Math.random() * 30 + 20,
        vy: Math.random() * 30 + 20,
        width: 20,
        height: 20,
        timestamp: timestamp
      }));
    }
    this.render = this.render.bind(this);
    window.requestAnimationFrame(this.render);
  },
  render(timestamp) {
    let ctx = this._canvas.getContext("2d");
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.strokeStyle = 'rgba(0,153,255,0.4)';
    ctx.clearRect(0, 0, 640, 480);
    this._bullets.forEach(bullet => {
      bullet.move(timestamp);
      bullet.render(ctx);
    });
    window.requestAnimationFrame(this.render);
  }
};

gamePlayManager.init();