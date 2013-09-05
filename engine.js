var Game = new function() {
  this.initialize = function(canvasElementId, sprite_data, callback) {
    this.canvas = document.getElementById(canvasElementId);
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.ctx = this.canvas.getContext && this.canvas.getContext('2d');

    if (!this.ctx) alert("Your browser does not support canvas");

    this.setupInput();

    this.loop();

    SpriteSheet.load(sprite_data, callback);
  };

  //Handle input
  var KEY_CODES = { 37:'left', 39:'right', 32:'fire' };
  this.keys = { };
  this.setupInput = function () {
       document.addEventListener('keydown', function(e) {
          if (KEY_CODES[event.keyCode]) {
            Game.keys[KEY_CODES[event.keyCode]] = true;
            e.preventDefault();
          }
       }, false);

       document.addEventListener('keyup', function(e) {
          if (KEY_CODES[event.keyCode]) {
            Game.keys[KEY_CODES[event.keyCode]] = false;
            e.preventDefault();
          }
       }, false);
  };

  var boards = [];
  this.loop = function () {
    var dt = 30/1000;
    for (var i = 0, len = boards.length; i < len; i++) {
      if (boards[i]) {
        boards[i].step(dt);
        boards[i] && boards[i].draw(Game.ctx);
      }
    }
    setTimeout(Game.loop, 30);
  };

  //change an active game board
  this.setBoard = function(num, board) {
    boards[num] = board;
  };
};

var SpriteSheet = new function() {
    this.map = { };
    this.load = function(spriteData, callback) {
        this.map = spriteData;
        this.image = new Image();
        this.image.onload = callback;
        this.image.src = "images/sprites.png"
    };
    this.draw = function (ctx, sprite, x, y, frame) {
        var s = this.map[sprite];
        if (!frame) frame = 0;
        ctx.drawImage(this.image,
                      s.sx + frame * s.w,
                      s.sy,
                      s.w, s.h,
                      x, y,
                      s.w, s.h);
    };
};

var TitleScreen = function TitleScreen(title, subtitle, callback) {
  this.step = function (dt) {
    if (Game.keys['fire'] && callback) {
      callback();
    }
  };

  this.draw = function(ctx) {
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";

    ctx.font = "bold 40px Banger";
    ctx.fillText(title, Game.width/2, Game.height/2);

    ctx.font = "bold 20px Banger";
    ctx.fillText(subtitle, Game.width/2, Game.height/2 + 40);
  };
}

var GameBoard = function () {
  var board = this;

  this.objects = [];
  this.cnt = [];

  //Add a new object to the Game Board
  this.add = function(obj) {
    obj.board = this;
    this.objects.push(obj);
    this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;
    return obj;
  };

  //Add object to be removed to a seperate array
  this.remove = function(obj) {
    var wasStillAlive = (this.removed.indexOf(obj) === -1);
    if (wasStillAlive) this.removed.push(obj);
    return wasStillAlive;
  };

  this.resetRemoved = function() {
    this.removed = [];
  };

  this.finalizeRemoved = function() {
    for (var i = 0, len = this.removed.length; i < len; i++) {
      var idx = this.objects.indexOf(this.removed[i]);
      if (idx !== -1) {
        this.cnt[this.removed[i].type]--;
        this.objects.splice(idx, 1);
      }
    }
  };

  //Call the <funcName> function of every object
  this.iterate = function(funcName) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0, len = this.objects.length; i < len; i++) {
      var object = this.objects[i];
      object[funcName].apply(object, args);
    }
  };

  this.detect = function(func) {
    for (var i = 0, len = this.objects.length; i < len; i++) {
      if (func.call(this.objects[i])) return this.objects[i];
    }
    return false;
  };

  this.step = function(dt) {
    this.resetRemoved();
    this.iterate('step', dt);
    this.finalizeRemoved();
  };

  this.draw = function(ctx) {
    this.iterate('draw', ctx);
  };

  this.overlap = function(o1, o2) {
    return !((o1.y+o1.h-1 < o2.y) || (o1.y > o2.y+o2.h-1) ||
             (o1.x+o1.w-1 < o2.x) || (o1.x > o2.x+o2.w-1));
  }

  this.collide = function(obj, type) {
    return this.detect(function() {
      if (obj != this) {
        var col = (!type || this.type & type) && this.overlap(obj, this);
        return col ? this : false;
      }
    });
  };
}