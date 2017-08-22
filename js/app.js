'use strict';

let gamePlayManager = {
  _enemyBullets: new Set(),
  _allyBullets: new Set(),
  _enemies: new Set(),
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
    this.paintNextFrame = this.paintNextFrame.bind(this);
    this.refreshInfo = this.refreshInfo.bind(this);

    window.requestAnimationFrame(this.paintNextFrame);
    this.refreshInfo();
  },
  handleEvent(evt) {
    switch(evt.type) {
    case "keydown":
      if(evt.key === "z" || evt.key === "Z") {
        this._player.startFire();
      } else if (evt.key === "Shift") {
        this._player.switchSlowMode();
      } else {
        this._player.startMove(evt.key);
      }
      break;
    case "keyup":
      if(evt.key === "z" || evt.key === "Z") {
        this._player.stopFire();
      } else if (evt.key === "Shift") {
        this._player.switchFastMode();
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
      y: 320,
      bulletSet: this._allyBullets
    });
    setInterval(this.addBullet.bind(this), 6000);
  },
  addBullet() {
    let enemyCount = Math.random() * 8;
    for(let i = 0; i < enemyCount; i++) {
      this._enemies.add(new Enemy({
        x: CANVAS_WIDTH / (enemyCount + 2) * (i + 1),
        y: 1,
        vx: 0,
        vy: 30,
        width: 60,
        height: 60,
        bulletPatterns: [{
            vx: -100,
            vy: 100,
            offsetX: 0,
            offsetY: 0,
            duration: 1000,
            delay: 0
          },
          {
            vx: 100,
            vy: 100,
            offsetX: 0,
            offsetY: 0,
            duration: 1000,
            delay: 0
        }],
        bulletSet: this._enemyBullets
      }));
    }
  },
  paintNextFrame(timestamp) {
    let ctx = this._canvas.getContext("2d");
    ctx.fillStyle = '#888';
    ctx.strokeStyle = 'rgba(0,153,255)';
    ctx.clearRect(0, 0, 640, 480);
    this._player.updateTime(timestamp);
    this._enemies.forEach(enemy => {
      enemy.updateTime(timestamp);
      if(enemy.isOutOfScreen() || enemy.vanished) {
        this._enemies.delete(enemy);
      }
    });
    this._enemyBullets.forEach(bullet => {
      bullet.updateTime(timestamp);
      if (bullet.isOutOfScreen()) {
        this._enemyBullets.delete(bullet);
        return;
      }
      if(this._player.collidedWith(bullet) && !this._player.invincible) {
        this._player.setInvincible();
        this._player.death++;
      }
      bullet.render(ctx);
    });
    this._allyBullets.forEach(bullet => {
      bullet.updateTime(timestamp);
      if (bullet.isOutOfScreen()) {
        this._allyBullets.delete(bullet);
        return;
      }
      this._enemies.forEach(enemy => {
        if (enemy.collidedWith(bullet)) {
          this._player.kills += enemy.kill() ? 1 : 0;
        }
      });
      bullet.render(ctx);
    });
    this._player.render(ctx);
    this._enemies.forEach(enemy => enemy.render(ctx));

    this._info.frameRunned++;

    window.requestAnimationFrame(this.paintNextFrame);
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
       Kills: ${this._player.kills}
       Enemies: ${this._enemies.size}
       AllyBullets: ${this._allyBullets.size}
       EnemyBullets: ${this._enemyBullets.size}`
    setTimeout(this.refreshInfo, 500);
  }
};

gamePlayManager.init();