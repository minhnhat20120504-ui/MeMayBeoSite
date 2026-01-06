const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = 300;

const GRAVITY = 0.9;
const JUMP = -14;
const SPEED = 6;
const GROUND = 230;

let running=false, dead=false;
let mapData, objects=[];
let progress=0;

const img = {};
["cube","spike","block","orb_yellow","pad_yellow","bg"]
.forEach(n=>{
  img[n]=new Image();
  img[n].src = n + ".png"; // load cùng thư mục
});


const player={
  x:80,y:GROUND,size:28,dy:0,rot:0
};

fetch("map.json").then(r=>r.json()).then(d=>{
  mapData=d;
  reset();
  requestAnimationFrame(loop);
});

function reset(){
  player.y=GROUND;
  player.dy=0;
  player.rot=0;
  objects=mapData.objects.map(o=>({...o,y:GROUND}));
  progress=0;
  dead=false;
  document.getElementById("msg").style.visibility="hidden";
}

function jump(){
  if(!running){
    document.getElementById("music").play();
    running=true;
  }
  if(player.y>=GROUND){
    player.dy=JUMP;
    document.getElementById("jump").currentTime=0;
    document.getElementById("jump").play();
  }
}

function drawGlow(fn,color,blur){
  ctx.save();
  ctx.shadowColor=color;
  ctx.shadowBlur=blur;
  fn();
  ctx.restore();
}

function collide(a,b){
  return a.x<a.x+b.w &&
         a.x+a.size>b.x &&
         a.y<b.y+b.h &&
         a.y+a.size>b.y;
}

function loop(){
  if(dead)return;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img.bg,0,0,canvas.width,canvas.height);

  player.dy+=GRAVITY;
  player.y+=player.dy;
  player.rot+=0.1;
  if(player.y>GROUND){player.y=GROUND;player.dy=0;}

  objects.forEach(o=>{
    o.x-=SPEED;

    if(o.type==="spike"){
      drawGlow(()=>{
        ctx.drawImage(img.spike,o.x,o.y-40,30,40);
      },"#ff0055",18);

      if(collide(player,{x:o.x,y:o.y-40,w:30,h:40})) die();
    }

    if(o.type==="orb"){
      ctx.drawImage(img.orb_yellow,o.x,o.y-50,30,30);
      if(collide(player,{x:o.x,y:o.y-50,w:30,h:30})) jump();
    }

    if(o.type==="pad"){
      ctx.drawImage(img.pad_yellow,o.x,o.y-20,40,20);
      if(collide(player,{x:o.x,y:o.y-20,w:40,h:20})) jump();
    }
  });

  drawGlow(()=>{
    ctx.save();
    ctx.translate(player.x+14,player.y+14);
    ctx.rotate(player.rot);
    ctx.drawImage(img.cube,-14,-14,28,28);
    ctx.restore();
  },"#00ffff",20);

  progress=Math.min(100,
    Math.floor(((-objects[0].x+400)/mapData.length)*100)
  );
  document.getElementById("ui").innerText=progress+"%";

  if(progress>=100) win();

  requestAnimationFrame(loop);
}

function die(){
  dead=true;
  document.getElementById("death").play();
  document.getElementById("music").pause();
  document.getElementById("msg").style.visibility="visible";
}

function win(){
  dead=true;
  document.getElementById("music").pause();
  document.getElementById("msg").innerText="LEVEL COMPLETE!";
  document.getElementById("msg").style.visibility="visible";
}

addEventListener("keydown",e=>e.code==="Space"&&jump());
addEventListener("click",()=>dead?reset():jump());
addEventListener("touchstart",e=>{
  e.preventDefault();
  dead?reset():jump();
});
