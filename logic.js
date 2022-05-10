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
    rect(obj.x, obj.y, obj.width, obj.height);
    pop();
  } else if (obj.type === "shelf") {
    push();
    fill(200, 120, 50);
    rect(obj.x, obj.y, obj.width, obj.height);
    pop();
  } else if (obj.type === "vacuum") {
    push();
    fill(200, 50, 50);
    rect(obj.x, obj.y, obj.width, obj.height);
    pop();
  }
}

//here's all the variables we set before starting everything
let mainTitleElement;

let gameState = "loading";
const gravity = 1;

const cat = {
  x: sWidth / 2,
  y: sHeight - 30,
  acceleration: 0.02,
  jumpHeight: 17,
  downSpeed: 0,
  sideSpeed: 0,
  state: "stand",
};

const floor = {
  x: 0,
  y: sHeight - 50,
  width: sWidth,
  height: 50,
  type: "floor",
  dangerous: false,
};

const shelf1 = {
  x: 500,
  y: floor.y - 100,
  width: 100,
  height: 50,
  type: "shelf",
  dangerous: false,
};

const shelf2 = {
  x: 380,
  y: floor.y - 200,
  width: 100,
  height: 50,
  type: "shelf",
  dangerous: false,
};

const shelf3 = {
  x: 340,
  y: floor.y - 300,
  width: 50,
  height: 150,
  type: "shelf",
  dangerous: false,
};

const vacuum1 = {
  x: 100,
  y: sHeight - 80,
  width: 80,
  height: 30,
  type: "vacuum",
  dangerous: true,
};

const collisionBlocks = [floor, shelf1, shelf2, shelf3, vacuum1];

//The main draw function that is called many times per second
function draw() {
  if (gameState === "loading") {
    //here we could have a loading screen if we want it, but it might be unnecessary
  } else if (gameState === "start") {
    //Here's where we summon the start screen
    background(250, 230, 150);
    text("press R to start playing", 340, 300);
  } else if (gameState === "play") {
    //here's where we have all the gameplay code
    background(250, 230, 150);

    for (let block of collisionBlocks) {
      CollisionBlockSprite(block);
    }

    catSprite(cat);

    // left arrow:
    if (keyIsDown(37)) {
      // with acceleration
      // cat.sideSpeed -= cat.acceleration;

      //without acceleration
      cat.sideSpeed = -5;
    }
    // right arrow:
    else if (keyIsDown(39)) {
      // with acceleration
      // cat.sideSpeed += cat.acceleration;

      //without acceleration
      cat.sideSpeed = 5;
    } else {
      cat.sideSpeed = 0;
    }

    //controls collision
    cat.downSpeed += gravity;
    let hasCollided = false;
    for (let block of collisionBlocks) {
      //checks if the cat is within the bounds of a box. has the cat collided with anything?
      if (
        cat.x - 10 < block.x + block.width &&
        cat.x + 10 > block.x &&
        cat.y - 5 < block.y + block.height &&
        cat.y + 5 > block.y
      ) {
        hasCollided = true;
        //if yes, let's check from what direction the cat must have come from
        let distanceToTop = cat.y - block.y;
        let distanceToBottom =
          sHeight - cat.y - (sHeight - (block.y + block.height));
        let distanceToLeft = cat.x - block.x;
        let distanceToRight =
          sWidth - cat.x - (sWidth - (block.x + block.width));

        //the smallest direction to outside the block must be from what direction the cat collided. let's find the shortest distance
        let distanceCompareArray = [
          distanceToTop,
          distanceToBottom,
          distanceToLeft,
          distanceToRight,
        ];

        //syntax below sourced from https://stackoverflow.com/questions/8934877/obtain-smallest-value-from-array-in-javascript
        let smallestDistance = Math.min(...distanceCompareArray);
        let indexOfSmallestDistance =
          distanceCompareArray.indexOf(smallestDistance);

        if (indexOfSmallestDistance === 0) {
          //smallest distance is to the top of the block. the cat has landed
          if (cat.downSpeed > 0) {
            cat.downSpeed = 0;
            cat.y -= smallestDistance - 1;
          }
          cat.state = "stand";
        } else if (indexOfSmallestDistance === 1) {
          //smallest distance is to the bottom of the block. the cat has bumped a ceiling
          if (cat.downSpeed < 0) {
            cat.downSpeed = 0;
          }
          cat.state = "fall";
        } else if (indexOfSmallestDistance === 2) {
          //smallest distance is to the left side of a wall. the cat has bumped into a wall on the right
          if (cat.sideSpeed > 0) {
            cat.sideSpeed = 0;
          }
        } else if (indexOfSmallestDistance === 3) {
          //smallest distance is to the right side of a wall. the cat has bumped into a wall on the left
          if (cat.sideSpeed < 0) {
            cat.sideSpeed = 0;
          }
        }
      } else {
        //if the cat hasn't collided with anything, it will be affected by gravity
      }
    }

    //if the cat didn't collide with anything, it should be in the state "fall"
    if (hasCollided === false) {
      cat.state = "fall";
    }

    cat.y += cat.downSpeed;

    // controls of moving left and right (looked at garrits lecture "12: Example - Move a cat with the keyboard" and took inspiration for this section)
    cat.x = cat.x + cat.sideSpeed;
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
