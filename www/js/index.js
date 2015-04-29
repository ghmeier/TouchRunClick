var canvas = document.getElementById('game');
var context = canvas.getContext('2d');
var bars = [];
var player;
var fps = 30;
var gravity = 9;
var pageX,pageY;
var score = 0;
var mult = 1;

var Bar = function(){
    this.x = canvas.width+10;
    this.y = Math.random()*(canvas.height/2) + canvas.height/2;
    this.height = 10;
    this.width = Math.random()*100 + 25;
    this.speed = Math.random()*20 +70;
};

var Player = function(){
    this.x = canvas.height/2;
    this.y = 10;
    this.max_jumps = 1;
    this.jumps = 1;
    this.jump_power = 5;
    this.velocity = 0;
    this.falling = true;
};

Player.prototype.jump = function(){
    if (this.jumps > 0){
        this.jumps--;
        this.velocity = -this.jump_power;
        this.falling=true;
    }
};

Player.prototype.move = function(){
    if (this.falling){
        this.y += this.velocity;
        this.velocity += gravity/fps;
    }

    if (this.y <= 0){
        this.y = 1;
        this.velocity = 0
    }

    if (this.y >= canvas.height){
        this.y = 10;
        this.velocity = 0;
        this.jumps = this.max_jumps;
        mult = 0;
    }
}

Player.prototype.draw = function(){
    context.fillStyle = "red";
    context.beginPath();
    context.arc(this.x,this.y,5,0,2*Math.PI);
    context.fill();
}

init();
run();

function init(){
    window.addEventListener('resize', resizeCanvas, false);
    document.onmousemove = handleMouseMove;
    document.onclick = handleMouseClick;
    player = new Player();
    resizeCanvas();
    draw();
}

function run(){
    setInterval(function() {
      moveBars(pageX,pageY);
      player.move();
      draw();
      score += 1*mult;
      document.getElementById("score").innerHTML = score;
      document.getElementById("multiplier").innerHTML = mult+"x";
    }, 1000/fps);
    setInterval(function(){
       // / addBar();
        mult++;
    },1000);
}


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


function handleMouseMove(event) {
    var dot, eventDoc, doc, body;
    event = event || window.event; // IE-ism

    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;
        event.pageX = event.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
          (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
          (doc && doc.clientTop  || body && body.clientTop  || 0 );
    }
    pageX = event.pageX;
    pageY = event.pageY;

}

function handleMouseClick(event){
    player.jump();
}

function addBar(){
    if (Math.random() > .9){
        bars.push(new Bar());
    }
}

function moveBars(x,y){
    var collided = 0;
    var clear_end = true;
    var collidedY = 0;
    for (i=0;i<bars.length;i++){
        bars[i].x -= bars[i].speed/fps;

        if (player.x >= bars[i].x && player.x <= bars[i].x + bars[i].width){
            if (player.y+5 <= bars[i].y && player.y+5+player.velocity >= bars[i].y){
                collided = 1;
                collidedY = bars[i].y-5;
            }else if (player.y-5 >= bars[i].y + bars[i].height && player.y-5+ player.velocity <=bars[i].y+bars[i].height){
                collided = 2;
                collidedY = bars[i].y+bars[i].height+1;
            }
        }

        if (bars[i].x + bars[i].width > canvas.width){
            clear_end = false;
        }

        if (bars[i].x < -bars[i].width){
            bars.splice(i,1);
            i--;
        }
    }

    if (clear_end){
        addBar();
    }

    if (collided > 0){
        if (collided == 1){
            player.jumps = player.max_jumps;
        }
        player.velocity = 0;
        player.y = collidedY;
        player.falling = false;
    }else{
        player.falling = true;
    }
}

function collided(c1,x,y){
    if (circles.length == 0){
        return false;
    }

    for (j=0;j<circles.length;j++){

        if (circles[j]!=c1 && distance(c1.x+x,c1.y+y,circles[j].x,circles[j].y) <= c1.r + circles[j].r){
            return true;
        }
    }
    return false;
}

function distance(x1,y1,x2,y2){
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

function draw(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    for (i=0;i<bars.length;i++){
        var cur = bars[i];

        context.fillStyle = "#000000"
        context.fillRect(cur.x,cur.y,cur.width,cur.height);
    }
}