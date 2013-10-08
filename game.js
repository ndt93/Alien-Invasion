var level1 = [
 // Start,    End, Gap,  Type,   Override
  [ 0,       4000, 500, 'step' ],
  [ 6000,   13000, 800, 'ltr' ],
  [ 12000,  16000, 400, 'circle' ],
  [ 18200,  20000, 500, 'straight', { x: 150 } ],
  [ 18200,  20000, 500, 'straight', { x: 100 } ],
  [ 18400,  20000, 500, 'straight', { x: 200 } ],
  [ 22000,  25000, 400, 'wiggle', { x: 300 }],
  [ 22000,  25000, 400, 'wiggle', { x: 200 }]
];

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16;

var sprites =  {
    ship: {sx: 0, sy: 0, w: 18, h: 35, frame: 3},
    missile: {sx: 0, sy: 30, w: 2, h: 10, frames: 1},
    enemy_purple: { sx: 37, sy: 0, w: 42, h: 43, frames: 1 },
    enemy_bee: { sx: 79, sy: 0, w: 37, h: 43, frames: 1 },
    enemy_ship: { sx: 116, sy: 0, w: 42, h: 43, frames: 1 },
    enemy_circle: { sx: 158, sy: 0, w: 32, h: 33, frames: 1 },
    explosion: { sx: 0, sy: 64, w: 64, h: 64, frames: 12},
};

//vx = A + B * sin(C*t + D); vy = E + F * sin(G*t + H)
var enemies = {
    straight: { x: 0,   y: -50, sprite: 'enemy_ship', health: 10,  E: 100 },
    ltr:      { x: 0,   y: -100, sprite: 'enemy_purple', health: 10, B: 200, C: 1, E: 200  },
    circle:   { x: 400, y: -50, sprite: 'enemy_circle', health: 10, A: 0,  B: -200, C: 1, E: 20, F: 200, G: 1, H: Math.PI/2 },
    wiggle:   { x: 100, y: -50, sprite: 'enemy_bee', health: 20, B: 100, C: 4, E: 100 },
    step:     { x: 0,   y: -50, sprite: 'enemy_circle', health: 10, B: 300, C: 1.5, E: 60 }
};

window.addEventListener("load", function() {
    Game.initialize("game", sprites, startGame);
});

function startGame() {
    Game.setBoard(0, new Starfield(20,0.4,100,true));
    Game.setBoard(1, new Starfield(50,0.6,100));
    Game.setBoard(2, new Starfield(100,1.0,50));    
    Game.setBoard(3, new TitleScreen("Alien Invasion",
                                     "Press space to start playing", playGame));
}

function winGame() {
    Game.setBoard(3, new TitleScreen("You win!", "Press fire to play again", playGame));
}

function loseGame() {
    Game.setBoard(3, new TitleScreen("You lose!", "Press fire to play gain", playGame));
}

function playGame() {
    var board = new GameBoard();
    board.add(new PlayerShip());
    board.add(new Level(level1, winGame));
    Game.setBoard(3, board);
}

var Starfield = function(speed, opacity, numStars, clear) {
    var stars = document.createElement("canvas");
    stars.width = Game.width;
    stars.height = Game.height;

    var starCtx = stars.getContext("2d");
    var offset = 0;

    if (clear) {
        starCtx.fillStyle = "#000";
        starCtx.fillRect(0, 0, stars.width, stars.height);
    }

    starCtx.fillStyle = "#FFF";
    starCtx.globalAlpha = opacity;
    for (var i = 0; i < numStars; i++) {
        starCtx.fillRect(Math.floor(Math.random() * stars.width),
                         Math.floor(Math.random() * stars.height),
                         2, 2);
    }

    this.draw = function (ctx) {
        var intOffset = Math.floor(offset);
        var remaining = stars.height - intOffset;

        if (intOffset > 0) {
            ctx.drawImage(stars,
                          0, remaining, stars.width, intOffset,
                          0, 0, stars.width, intOffset);
        }
        if (remaining > 0) {
            ctx.drawImage(stars,
                          0, 0, stars.width, remaining,
                          0, intOffset, stars.width, remaining);
        }
    }

    this.step = function (dt) {
        offset += dt * speed;
        offset %= stars.height;
    }
}

var PlayerShip = function () {
    this.setup('ship', { vx: 0, reloadTime: 0.25, frame: 1, maxVel: 200, });
    
    this.x = Game.width/2 - this.w / 2;
    this.y = Game.height - Game.playerOffset - this.h;
    this.reload = this.reloadTime;

    this.step = function(dt) {
        if (Game.keys['left']) this.vx = -this.maxVel;
        else if (Game.keys['right']) this.vx = this.maxVel;
        else this.vx = 0;

        this.x += this.vx * dt;

        if (this.x < 0) this.x = 0;
        else if (this.x > Game.width - this.w) {
            this.x = Game.width - this.w;
        }

        this.reload -= dt;
        if (Game.keys['fire'] && this.reload < 0) {
            Game.keys['fire'] = false;
            this.reload = this.reloadTime;
            this.board.add(new PlayerMissile(this.x, this.y+this.h/2));
            this.board.add(new PlayerMissile(this.x+this.w, this.y+this.h/2));
        }
    }
}
PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_PLAYER;

var PlayerMissile = function(x, y) {
    this.setup('missile', { vy: -700, damage: 10,});
    this.x = x - this.w/2;
    this.y = y;
}
PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

PlayerMissile.prototype.step = function(dt) {
    this.y += this.vy * dt;
    var collision = this.board.collide(this, OBJECT_ENEMY);
    if (collision) {
        collision.hit(this.damage);
        this.board.remove(this);
    } else if (this.y < -this.h) {
        this.board.remove(this);
    }
};

PlayerShip.prototype.hit = function (damage) {
    if (this.board.remove(this)) {
        loseGame();
    }
}


function Enemy(blueprint, override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite, blueprint);
  this.merge(override);
}
Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0,
                                   E: 0, F: 0, G: 0, H: 0,
                                   t: 0};

Enemy.prototype.step = function (dt) {
  this.t += dt;
  this.vx = this.A + this.B * Math.sin(this.C*this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G*this.t + this.H);
  this.x += this.vx * dt;
  this.y += this.vy * dt;
  
  var collision = this.board.collide(this, OBJECT_PLAYER);
  if (collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }
  
  if (this.x < -this.w ||
      this.y > Game.height ||
      this.x > Game.width) {
    this.board.remove(this);
  }
};

Enemy.prototype.hit = function (damage) {
    this.health -= damage;
    if (this.health <= 0) {
        if (this.board.remove(this)) {
            this.board.add(new Explosion(this.x + this.w/2,
                                         this.y + this.h/2));
        }
    }
}

var Explosion = function (centerX, centerY) {
    this.setup('explosion', { frame: 0});
    this.x = centerX - this.w/2;
    this.y = centerY - this.h/2;
    this.subFrame = 0;
}
Explosion.prototype = new Sprite();

Explosion.prototype.step = function (dt) {
    this.frame = Math.floor(this.subFrame++ / 3);
    if (this.frame >= 36) {
        this.board.remove(this);
    }
}