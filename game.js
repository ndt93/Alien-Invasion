var sprites =  { ship: {sx: 0, sy: 0, w: 18, h: 35, frame: 3} };

var StarField = function(speed, opacity, numStars, clear) {
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
    }
}

function startGame() {
    SpriteSheet.draw(Game.ctx, "ship", 100, 100, 1);
}

window.addEventListener("load", function() {
    Game.initialize("game", sprites, startGame);
});