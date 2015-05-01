var canvas = document.getElementById('game');
var context = canvas.getContext('2d');
var bars = [];
var upgrades = [];
var player;
var fps = 30;
var gravity = 9;
var pageX,pageY;
var score = 0;
var mult = 1;
var frame = 0;

var Bar = function(){
    this.x = canvas.width+10;
    this.y = Math.random()*(canvas.height/2) + canvas.height/2;
    this.height = 10;
    this.width = Math.random()*100 + 25;
    this.speed = Math.random()*20 +70;
};

Bar.prototype.draw = function(){
    context.fillStyle = "#000000"
    context.fillRect(this.x,this.y,this.width,this.height);
};

Bar.prototype.collided = function(x,y,v){
    var collided = 0;
        if (x >= this.x && x <= this.x + this.width){
            if (y <= this.y && y+v >= this.y){
                collided = 1;
                //collidedY = this.y-5;
            }else if (y >= this.y + this.height && y+ v <=this.y+this.height){
                collided = 2;
                //collidedY = bars[i].y+this.height+1;
            }
        }
    return collided;
}

var Player = function(x){
    this.x = x;
    this.y = 10;
    this.max_jumps = 1;
    this.jumps = 1;
    this.jump_power = 5;
    this.velocity = 0;
    this.falling = true;
    this.auto_jump = 3039;
};

Player.prototype.jump = function(){
    if (this.jumps > 0){
        this.jumps--;
        this.velocity = -this.jump_power;
        this.falling=true;
    }
};

Player.prototype.takeAutoJump = function(frame){
    if (this.auto_jump < 5000 && frame%(this.auto_jump) == 0){
        this.jumps++;
        this.jump();
  }
}

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
};

Player.prototype.draw = function(){
    context.fillStyle = "red";
    context.beginPath();
    context.arc(this.x,this.y,5,0,2*Math.PI);
    context.fill();
};


var Upgrade = function(upgrade){
    this.cost = upgrade.cost;
    this.name = upgrade.name;
    this.desc = upgrade.desc;
    this.execute = upgrade.execute;
    this.finished = false;
    this.el = document.createElement("BUTTON");
    document.getElementById("upgrades").appendChild(this.el);
    this.el.innerHTML = this.name + " Cost: "+this.cost.toFixed(0);
    this.el.style.display = "none";
    this.el.disabled = true;

    var self = this;
    this.el.onclick = function(){
        if (score > self.cost){
            score -= self.cost;
            self.execute();
            self.finished = true;
        }
    };
};

Upgrade.prototype.draw = function(){

    if (score + 1000>= this.cost){
        this.el.style.display = "block";
    }

    if (score >= this.cost){
        this.el.disabled = false;
    }else{
        this.el.disabled = true;
    }

    if (this.finished){
        this.el.style.display = "none";
    }
}

init();
run();

function init(){
    window.addEventListener('resize', resizeCanvas, false);
    document.onmousemove = handleMouseMove;
    document.onclick = handleMouseClick;
    resizeCanvas();
    player = new Player(canvas.width/2);
    var base_cost = 1000;
    for (i=0;i<100;i++){
        var up1 = new Upgrade({
            cost: base_cost,
            name:"+1 Jump",
            desc:"Add a jump",
            execute:function(){
                player.max_jumps++;
            },
            player:player
        });
        var up2 = new Upgrade({
            cost: base_cost*2,
            name:"+ Jump Power",
            desc:"Add more power to your jump",
            execute:function(){
                player.jump_power++;
            },
            player:player
        });

        upgrades.push(up1);
        upgrades.push(up2);
        base_cost+= (i+1)*1000;
    }

    base_cost = 1000;
    for( i=0;i<100;i++){
        var up3= new Upgrade({
            cost: Math.pow(base_cost,1.5),
            name:"+ Auto Jump",
            desc:"Jump automatically",
            execute:function(){
                player.auto_jump-=(fps);
                if (player.auto_jump < fps){
                    player.auto_jump = fps;
                }
            }
        });
        var up4= new Upgrade({
            cost: Math.pow(base_cost,2.5),
            name:"+ Gravity",
            desc:"Increase Gravity",
            execute:function(){
                gravity+=2;
            }
        });
        upgrades.push(up3);
        upgrades.push(up4);
        base_cost+= (i+1)*1000;
    }

    draw();
}

function run(){
    setInterval(function() {
      moveBars(pageX,pageY);
      player.move();
      draw();
      score += (gravity)*mult;
      document.getElementById("score").innerHTML = score.toFixed(0);
      document.getElementById("multiplier").innerHTML = mult+"x";
      frame += fps;
      player.takeAutoJump(frame);
    }, 1000/fps);
    setInterval(function(){
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

        var temp_col = bars[i].collided(player.x,player.y+5,player.velocity);

        if (temp_col == 1){
            collidedY = bars[i].y-5;
            collided = temp_col;
        }else if (temp_col == 2){
            collidedY = bars[i].y + bars[i].height;
            collided = temp_col;
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
        player.velocity = -player.velocity/2;
        player.y = collidedY;
        player.falling = false;
    }else{
        player.falling = true;
    }
}

function distance(x1,y1,x2,y2){
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

function draw(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    for (i=0;i<bars.length;i++){
        var cur = bars[i];

        cur.draw();
    }
    for (id in upgrades){
        upgrades[id].draw();
    }
}