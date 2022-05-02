//here's our one source of truth for the canvas width and height
const sWidth = 800;
const sHeight = 600;
function setup() {
  createCanvas(sWidth, sHeight);
}

//here, we wait until the document has loaded fully before setting the gamestate to start
window.addEventListener("load", () => {
  gameState = "start";
  mainTitleElement = document.getElementById("mainTitle");
  mainTitleElement.innerText = "Not loading anymore";
});

//sprite for our main cat :3
function catSprite(obj) {
  push();
  strokeWeight(0);
  fill(0, 0, 0);
  rect(obj.x - 20, obj.y - 25, 40, 20); //body
  rect(obj.x - 20, obj.y - 6, 5, 5); //leg 1
  rect(obj.x - 10, obj.y - 6, 5, 5); //leg 2
  rect(obj.x + 5, obj.y - 6, 5, 5); //leg 3
  rect(obj.x + 15, obj.y - 6, 5, 5); //leg 4
  rect(obj.x + 7, obj.y - 30, 20, 20); //head
  rect(obj.x - 20, obj.y - 35, 5, 11); //tail
  pop();
}

//sprite for the floor
function CollisionBlockSprite(obj) {
  strokeWeight(0);
  if (obj.type === "floor") {
    push();
    fill(150, 80, 50);
    rect(obj.x, sHeight - obj.height, obj.width, obj.height);
    pop();
  } else if (obj.type === "shelf") {
    push();
    fill(200, 120, 50);
    rect(obj.x, sHeight - obj.height, obj.width, obj.height - floor.height);
    pop();
  }
}

//here's all the variables we set before starting everything
let mainTitleElement;

let gameState = "loading";
const gravity = 0.5;

const cat = {
  x: sWidth / 2,
  y: sHeight - 300,
  acceleration: 5,
  jumpHeight: 10,
  downSpeed: 0,
  sideSpeed: 0,
  state: "stand",
};

const floor = {
  x: 0,
  width: sWidth,
  height: 50,
  type: "floor",
  dangerous: false,
};

const shelf1 = {
  x: 500,
  width: 100,
  height: 100,
  type: "shelf",
  dangerous: false,
};

const collisionBlocks = [floor, shelf1];

//The main draw function that is called many times per second
function draw() {
  if (gameState === "loading") {
    //here we could have a loading screen if we want it, but it might be unnecessary
  } else if (gameState === "start") {
    //Here's where we summon the start screen
    background(250, 230, 150);
    text("press R to start playing", 300, 300);
  } else if (gameState === "play") {
    //here's where we have all the gameplay code
    background(250, 230, 150);

    for (let block of collisionBlocks) {
      CollisionBlockSprite(block);
    }

    catSprite(cat);

    //controls the gravity and falling
    let collisionDetection = 0;
    for (let block of collisionBlocks) {
      if (
        cat.y >= sHeight - block.height &&
        cat.x < block.x + block.width &&
        cat.x > block.x
      ) {
        collisionDetection++;
      }
    }
    if (collisionDetection > 0 && cat.downSpeed >= 0) {
      cat.downSpeed = 0;
    } else {
      cat.downSpeed += gravity;
    }

    cat.y += cat.downSpeed;
  }
}

function keyPressed() {
  console.log(keyCode);
  if (gameState === "start" && keyCode === 82) {
    gameState = "play";
  }
  if (keyCode === 32 && cat.state === "stand") {
    cat.downSpeed = cat.jumpHeight * -1;
  }
}
