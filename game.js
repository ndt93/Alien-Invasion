var sprites =  { ship: {sx: 0, sy: 0, w: 18, h: 35, frame: 3} };

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

function playGame() {
    var board = new GameBoard();
    board.add(new PlayerShip());
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
    this.w = SpriteSheet.map['ship'].w;
    this.h = SpriteSheet.map['ship'].h;
    this.x = Game.width/2 - this.w / 2;
    this.y = Game.height - 10 - this.h;
    this.vx = 0;

    this.step = function(dt) {
        var maxVel = 200;
        if (Game.keys['left']) this.vx = -maxVel;
        else if (Game.keys['right']) this.vx = maxVel;
        else this.vx = 0;

        this.x += this.vx * dt;

        if (this.x < 0) this.x = 0;
        else if (this.x > Game.width - this.w) {
            this.x = Game.width - this.w;
        }
    }

    this.draw = function(ctx) {
        SpriteSheet.draw(ctx, 'ship', this.x, this.y, 1);
    }
}