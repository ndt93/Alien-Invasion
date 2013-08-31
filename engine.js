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
