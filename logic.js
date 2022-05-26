// Here's our one source of truth for the canvas width and height
const sWidth = 1100;
const sHeight = 700;

// Setting up the canvas:
function setup() {
  createCanvas(sWidth, sHeight);
}

// Time variables:
let timeLimit = 25; // the game time limit
let countDown; // = time limit - amount of time passed
let currentTimeSec = 0;
let currentTimeDec = 0;
let startTimeSec = 0;
let startTimeMil = 0;
let timePenalty = 0;

// Image variables:
let vaseImg;
let brokenVaseImg;
let vacuumImg;
let cactusImg;
let plantImg;
let fireplaceImg;
let stoolImg;
let windowImg;
let bgImg;
let lampImg;

//here's all the variables we set before starting everything
let mainTitleElement;
let gameText;
let gameState = "start";
const gravity = 1;
let playerScore;
let playerPosition;

// Other variables:
let wallColor = "#9FBFD1";
let vaseX = 600;
let vaseY = 50;
let frameCounter = 0; //a counter that just counts the passing frames
let userNameElement; //the input field for the user name
let sessionScoreBoard;

// Loading images:
function preload() {
  vaseImg = loadImage("images/vase.png");
  brokenVaseImg = loadImage("images/broken-vase.png");
  vacuumImg = loadImage("images/vacuum.png");
  cactusImg = loadImage("images/cactus.png");
  plantImg = loadImage("images/big-plant.png");
  fireplaceImg = loadImage("images/fireplace.png");
  stoolImg = loadImage("images/stool.png");
  windowImg = loadImage("images/window.png");
  bgImg = loadImage("images/bg-room.png");
  lampImg = loadImage("images/lamp.png");
}

//here, we wait until the document has loaded fully before setting the gamestate to start
window.addEventListener("load", () => {
  userNameElement = document.getElementById("userName");
  gameState = "start";

  // fills the scoreboard with dummy scores if the scoreboard is undefined
  if (localStorage.scoreBoard === undefined) {
    localStorage.scoreBoard = JSON.stringify([
      {
        name: "Jane",
        score: 10,
      },
      {
        name: "Jenna",
        score: 8,
      },
      {
        name: "Jieber",
        score: 7,
      },
      {
        name: "Justin",
        score: 4,
      },
      {
        name: "Job",
        score: 3,
      },
    ]);
  }

  //loads the local storage to the session
  sessionScoreBoard = JSON.parse(localStorage.scoreBoard);
});

//sprite for our main cat :3
function catSprite(obj) {
  push();
  strokeWeight(0);
  fill(0, 0, 0);

  translate(obj.x, obj.y);
  scale(1.6);

  //flips the cat depending on direction
  if (cat.direction === "left") {
    scale(-1, 1);
  }

  //if you have invincibility after getting hit, you turn red
  if (cat.invincibility > 0) {
    fill(255, 50, 50);
  }

  // drawing the cat:
  rect(-20, -25, 40, 20); //body
  rect(7, -30, 20, 20); //head
  triangle(7, -29, 7, -35, 14, -29);
  triangle(27, -29, 27, -35, 20, -29);
  rect(-20, -35, 5, 11); //tail

  //if cat is falling, their legs are out
  if (obj.state === "fall") {
    rect(-25, -16, 5, 5); //leg 1
    rect(-25, -8, 5, 5); //leg 2
    rect(20, -8, 5, 5); //leg 3
  } else if ((keyIsDown(37) || keyIsDown(39)) && obj.runSprite === 1) {
    rect(-25, -16, 5, 5); //leg 1
    rect(-25, -8, 5, 5); //leg 2
    rect(20, -8, 5, 5); //leg 3
  } else {
    rect(-20, -6, 5, 5); //leg 1
    rect(-10, -6, 5, 5); //leg 2
    rect(5, -6, 5, 5); //leg 3
    rect(15, -6, 5, 5); //leg 4
  }

  pop();
}

// sprite for all collision blocks. several if-statements check which type it is
function CollisionBlockSprite(obj) {
  strokeWeight(0);
  if (obj.type === "floor") {
    push();
    noFill();
    rect(obj.x, obj.y, obj.width, obj.height);
    pop();
  } else if (obj.type === "wall") {
    push();
    noFill();
    rect(obj.x, obj.y, obj.width, obj.height);
    pop();
  } else if (obj.type === "shelf") {
    push();
    fill("#534741");
    rect(obj.x, obj.y, obj.width, obj.height);
    pop();
  } else if (obj.type === "vacuum") {
    push();
    fill(200, 50, 50);
    image(vacuumImg, obj.x, obj.y, obj.width, obj.height);
    pop();
  } else if (obj.type === "cactus") {
    push();
    fill(200, 50, 50);
    image(cactusImg, obj.x, obj.y, obj.width, obj.height);
    pop();
  } else if (obj.type === "vase") {
    if (obj.broken) {
      push();
      translate(obj.x, obj.y);
      rotate(obj.rotation);
      //   image(brokenVaseImg, obj.x - 20, obj.y - 50, 870 * 0.2, 347 * 0.2);
      image(brokenVaseImg, -170, -50, 870 * 0.2, 347 * 0.2);
      pop();
    } else {
      push();
      translate(obj.x, obj.y);
      rotate(obj.rotation);
      //image(vaseImg, obj.x, obj.y, obj.width, obj.height);
      image(vaseImg, 0, 0, obj.width, obj.height);
      console.log("vase x: " + obj.x);
      console.log("vase y: " + obj.y);
      console.log("vase height: " + obj.height);

      pop();
    }
  } else if (obj.type === "fireplace") {
    image(fireplaceImg, obj.x, obj.y, obj.width, obj.height);
  } else if (obj.type === "stool") {
    image(stoolImg, obj.x, obj.y, obj.width, obj.height);
  } else if (obj.type === "window") {
    image(windowImg, obj.x, obj.y, obj.width, obj.height);
  } else if (obj.type === "hiddenSurface") {
    push();
    noFill();
    rect(obj.x, obj.y, obj.width, obj.height);
    pop();
  } else if (obj.type === "lamp") {
    image(lampImg, obj.x, obj.y, obj.width, obj.height);
  } else if (obj.type === "plant") {
    image(plantImg, obj.x, obj.y, obj.width, obj.height);
  }
}

// Object variables
const cat = {
  x: 180,
  y: sHeight - 30,
  acceleration: 0.5,
  jumpHeight: 17,
  downSpeed: 0,
  sideSpeed: 0,
  state: "stand",
  invincibility: 0,
  direction: "right",
  runSprite: 1,
  maxSpeed: 5,
};
const vase = {
  x: vaseX,
  y: vaseY,
  width: 96,
  height: 120,
  type: "vase",
  dangerous: false,
  startPoint: 0,
  endPoint: 0,
  speed: 0,
  rotation: 0,
  broken: false,
};
const floor = {
  x: 0,
  y: sHeight - 50,
  width: sWidth,
  height: 50,
  type: "floor",
  dangerous: false,
};
const wallLeft = {
  x: 0,
  y: 0,
  width: 50,
  height: sHeight - floor.height,
  type: "wall",
  dangerous: false,
};
const wallRight = {
  x: sWidth - 50,
  y: 0,
  width: 50,
  height: sHeight - floor.height,
  type: "wall",
  dangerous: false,
};
// shelf 1 by the window:
const shelf1 = {
  x: wallLeft.width - 8,
  y: 275,
  width: 60,
  height: 30,
  type: "shelf",
  dangerous: false,
};
// Shelf 4 holds the cactus:
const shelf4 = {
  x: sWidth / 2 - 40,
  y: floor.y - 300,
  width: 300,
  height: 30,
  type: "shelf",
  dangerous: false,
};
// Shelf 5 holds the vase
const shelf5 = {
  x: vase.x - 60,
  y: vase.y + vase.height,
  width: 140,
  height: 30,
  type: "shelf",
  dangerous: false,
};
const vacuum1 = {
  x: 300,
  y: sHeight - 80,
  width: 80,
  height: 30,
  type: "vacuum",
  dangerous: true,
  startPoint: 250,
  endPoint: 500,
  speed: 2,
};
const cactus1 = {
  x: 680,
  y: shelf4.y - 180 * 0.5,
  width: 112 * 0.5,
  height: 190 * 0.5,
  type: "cactus",
  dangerous: true,
  startPoint: 0,
  endPoint: 0,
  speed: 0,
};
const stool = {
  x: 600,
  y: sHeight - floor.height - 70,
  width: 116,
  height: 80,
  type: "stool",
  dangerous: false,
};
const stoolSurface = {
  x: stool.x,
  y: stool.y,
  width: stool.width,
  height: 20,
  type: "hiddenSurface",
  dangerous: false,
};
const window1 = {
  x: wallLeft.width + 80,
  y: 150,
  width: 333 * 0.85,
  height: 382 * 0.85,
  type: "window",
  dangerous: false,
};
const windowSurfaceBottom = {
  x: window1.x,
  y: window1.y + window1.height - 78,
  width: window1.width,
  height: 50,
  type: "hiddenSurface",
  dangerous: false,
};
const windowSurfaceTop = {
  x: window1.x,
  y: window1.y + 4,
  width: window1.width,
  height: 20,
  type: "hiddenSurface",
  dangerous: false,
};
const fireplace1 = {
  x: 750,
  y: sHeight - 300 * 0.8 - floor.height,
  width: 338 * 0.8,
  height: 301 * 0.8,
  type: "fireplace",
  dangerous: false,
};
const fireplaceSurface = {
  x: fireplace1.x,
  y: fireplace1.y + 52,
  width: fireplace1.width,
  height: 30,
  type: "hiddenSurface",
  dangerous: false,
};
const lamp = {
  x: sWidth - 250,
  y: 0,
  width: 146,
  height: 209,
  type: "lamp",
  dangerous: false,
};
const plant1 = {
  x: wallLeft.width + 10,
  y: sHeight - 285,
  width: 115,
  height: 235,
  type: "plant",
  dangerous: false,
};
///////////////////////// End of object variables

// list of all collision blocks:
const collisionBlocks = [
  floor,
  shelf1,
  shelf4, // the shelf that holds the cactus
  shelf5, // the shelf that holds the vase
  wallLeft,
  wallRight,
  fireplaceSurface,
  windowSurfaceBottom,
  windowSurfaceTop,
  stoolSurface,
  vase,
];
//list of all NON collision blocks
const nonCollisionBlocks = [fireplace1, window1, stool, lamp, plant1];

//list of all obstacles
const obstacles = [vacuum1, cactus1];

//The main draw function that is called many times per second
function draw() {
  // Different game states:
  if (gameState === "start") {
    //Here's where we summon the start screen
    background("#181a18");
    fill("#fff");
    textAlign(CENTER);
    textFont("Josefin Sans");

    // Game title
    push();
    fill(wallColor);
    textSize(110);
    textFont("Exo");
    text("CATFORMER", sWidth / 2, sHeight / 3);
    pop();

    // Intro text
    push();
    textSize(20);
    text(
      "Cats love mischief, this is known. In Catformer, your mission is to get to the ",
      sWidth / 2,
      280
    );
    text(
      "oh so fragile vase and knock it down before your human comes back.",
      sWidth / 2,
      300
    );

    // "Enter name" headline
    push();
    textSize(30);
    fill(wallColor);
    textFont("Exo");
    text("Wait! Want a chance on the scoreboard?", sWidth / 2, 500);
    pop();

    // "Enter name" text
    push();
    text(
      "Make sure to enter your name in the field below before you start to save your score!",
      sWidth / 2,
      530
    );
    pop();

    // Instruction headline
    push();
    textSize(30);
    fill(wallColor);
    textFont("Exo");
    text("How to play", sWidth / 2, 370);
    pop();

    // Intruction text
    text("Use the arrow keys to move and Z to jump", sWidth / 2, 410);

    // Play text
    gameText = "press ENTER to start playing";
    text(gameText, sWidth / 2, 440);
    pop();
    ///////////////////// End of start state
  } else if (gameState === "play") {
    // The gamestate where the actual game takes place

    // Setting the background image
    background(bgImg);
    // Resetting the vase img
    vase.broken = false;

    // Runs our time logic to help creating a timer:
    timeLogic();

    //renders all platforms and obstacles:
    renderAllSprites();

    //draws the cat character:
    catSprite(cat);

    // Moving the cat:
    catSideMovement();

    //controls collision:
    catDetectCollision();

    //collision with things that hurt you:
    catDetectDamage();

    // If-statement that makes sure the cat's down speed is never faster than 20
    if (cat.downSpeed > 20) {
      cat.downSpeed = 20;
    }

    cat.y += cat.downSpeed;
    // controls of moving left and right (looked at garrits lecture "12: Example - Move a car with the keyboard" and took inspiration for this section)
    cat.x = cat.x + cat.sideSpeed;

    // Function that moves the obstacles that should be moving:
    obstacleMovement();

    ///////////////// End of play state
  } else if (gameState === "win") {
    // Here's the screen if you win the game
    background(bgImg);
    renderAllSprites();

    // resetting cat's starting position
    cat.x = 180;
    cat.y = sHeight - 30;

    //throws the vase off of the shelf:
    vaseMovement();

    // Semi transparent bg:
    push();
    rectMode(CENTER);
    fill("rgba(0, 92, 0, 0.55)");
    rect(sWidth / 2, sHeight / 2, sWidth, sHeight);
    pop();

    fill("#fff");
    textAlign(CENTER);

    //headline
    push();
    textSize(50);
    textFont("Exo");
    text("VICTORY", sWidth / 2, 140);
    pop();

    //game text
    textSize(20);
    gameText = '"I AM THE SUPERIOR CAT!"';
    text(gameText, sWidth / 2, 180);

    //score text
    text(
      "Impressive, you broke the vase in " +
        (timeLimit - playerScore) +
        " seconds!",
      sWidth / 2,
      240
    );

    //Tells the player what results they got and if they got on the scoreboard:
    displayPlayerResult();

    //scoreboard headline
    push();
    textSize(30);
    textFont("Exo");
    text("Scoreboard", sWidth / 2, 340);
    pop();

    //Loops through all results from the scoreboard and displays them:
    displayScoreboard();

    // Replay text
    push();
    textSize(14);
    text("Press ENTER to play again", sWidth / 2, sHeight / 1.4);
    pop();
    ///////////////////////////// End of Win state
  } else if (gameState === "lose") {
    // Here's the screen if you lose the game
    background(bgImg);
    renderAllSprites();

    // resetting cat position
    cat.x = 180;
    cat.y = sHeight - 30;

    // Semi transparent bg:
    push();
    rectMode(CENTER);
    fill("rgba(153, 0, 0, 0.64)");
    rect(sWidth / 2, sHeight / 2, sWidth, sHeight);
    pop();

    fill("#fff");
    textAlign(CENTER);

    //headline
    push();
    textSize(50);
    textFont("Exo");
    text("GAME OVER", sWidth / 2, sHeight / 2 - 40);
    pop();

    //game text
    textSize(20);
    gameText =
      '"Gosh darn, the human is back... I have to be faster next time"';
    text(gameText, sWidth / 2, sHeight / 2);

    // Replay text
    push();
    textSize(14);
    text("Press ENTER to play again", sWidth / 2, sHeight / 1.8);
    pop();
    ///////////////////////// End of lose state
  }
}

//keeps track of the timer and draws it on the canvas
function timeLogic() {
  // Testing countdown timer based on this tutorial: https://www.youtube.com/watch?v=rKhwDhp9dcs&ab_channel=flanniganable
  currentTimeSec = int(millis() / 1000); // this runs in the background and counts how many seconds has passed
  currentTimeDec = int(millis() / 100); // this runs in the background and counts how many milliseconds has passed

  countDown = timeLimit - (currentTimeSec - startTimeSec) - timePenalty;
  let countDownMil = timeLimit - (currentTimeDec - startTimeMil);

  //if counter reaches 0, you've run out of time
  if (countDown < 0) {
    countDown = 0;
    gameState = "lose";
  }

  if (frameCounter === 60) {
    frameCounter = 0;
  }
  frameCounter++;

  //every 10th frame, the run sprite is activated
  if (frameCounter % 10 === 0) {
    cat.runSprite *= -1;
  }

  // creating the timer:
  push();
  fill(255, 255, 255);
  // if statement that shows the time penalty if cat runs into an obstacle:
  if (cat.invincibility > 0) {
    fill(255, 100, 100);
    textAlign(LEFT);
    textSize(30);
    text("-2s", sWidth - 150, 90);
  }
  strokeWeight(0);
  rect(sWidth - 163, 13, 100, 50);
  fill(0, 0, 0);
  textAlign(LEFT);
  textSize(36);
  text(countDown + ":" + (9 + (countDownMil % 10)), sWidth - 150, 50);
  pop();
}

//renders all blocks that the cat can impact, both visible and invisible, dangerous and not
function renderAllSprites() {
  //draws all NON collision blocks
  for (let block of nonCollisionBlocks) {
    CollisionBlockSprite(block);
  }

  //draws all collision blocks
  for (let block of collisionBlocks) {
    CollisionBlockSprite(block);
  }

  //draws all the obstacles
  for (let obstacle of obstacles) {
    CollisionBlockSprite(obstacle);
  }
}

//the logic for the cat's sideways movement
function catSideMovement() {
  // If you move to the left:
  if (keyIsDown(37) || keyIsDown(65)) {
    if (cat.direction === "right") {
      cat.direction = "left";
    }

    cat.sideSpeed -= cat.acceleration;

    if (cat.sideSpeed < -cat.maxSpeed) {
      cat.sideSpeed = -cat.maxSpeed;
    }
  }

  // If you move to the right:
  else if (keyIsDown(39) || keyIsDown(68)) {
    if (cat.direction === "left") {
      cat.direction = "right";
    }

    cat.sideSpeed += cat.acceleration;

    if (cat.sideSpeed > cat.maxSpeed) {
      cat.sideSpeed = cat.maxSpeed;
    }
  }

  // If the cat's not moving:
  else {
    cat.sideSpeed *= 0.8;
    if (cat.sideSpeed < 0.01 && cat.sideSpeed > -0.01) {
      cat.sideSpeed = 0;
    }
  }
}

//some obstacles such as the vacuum cleaner move around. here's that logic
function obstacleMovement() {
  for (obstacle of obstacles) {
    obstacle.x += obstacle.speed;
    if (obstacle.x > obstacle.endPoint || obstacle.x < obstacle.startPoint) {
      obstacle.speed *= -1;
    }
  }
}

//upon winning, throws the vase off the shelf
function vaseMovement() {
  if (vase.y < sHeight - floor.height) {
    vase.speed += gravity;
    vase.x += 5;
    vase.y += vase.speed;
    vase.rotation += 0.1;
  } else {
    vase.rotation = 0;
    vase.broken = true;
  }
}

//checks if the cat has impacted a surface
function catDetectCollision() {
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
      let distanceToRight = sWidth - cat.x - (sWidth - (block.x + block.width));

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

      // if statement for if the cat has collided with the vase
      if (block.type === "vase") {
        playerScore = countDown;
        playerPosition = checkScore(playerScore);
        vase.speed = -10;
        gameState = "win";
      }
    }
  }

  //if the cat didn't collide with anything, it should be in the state "fall"
  if (hasCollided === false) {
    cat.state = "fall";
  }
}

//checks if the cat has taken damage and does the damaging
function catDetectDamage() {
  for (let obstacle of obstacles) {
    if (
      cat.x - 10 < obstacle.x + obstacle.width &&
      cat.x + 10 > obstacle.x &&
      cat.y - 5 < obstacle.y + obstacle.height &&
      cat.y + 5 > obstacle.y &&
      cat.invincibility === 0
    ) {
      //makes the cat jump upwards when taking damage
      cat.downSpeed = -10;

      //this makes it so that the cat doesn't get hurt many times in a row
      cat.invincibility = 60;

      //this reduces the timer by 2 as your penalty
      timePenalty += 2;
    }
  }

  //this counts down the invincibility
  if (cat.invincibility > 0) {
    cat.invincibility--;
  }
}

//checks whether the new score is good enough to be placed on the scoreboard
function checkScore(newScore) {
  let scoreCheck = 5;
  for (let i = sessionScoreBoard.length - 1; i >= 0; i--) {
    let currentPlayer = sessionScoreBoard[i];
    if (newScore > currentPlayer.score) {
      scoreCheck = i;
    }
  }
  // You can't join the scoreboard if you never chose a name:
  if (userNameElement.value !== "") {
    let newPlacement = {
      name: userNameElement.value,
      score: newScore,
    };
    sessionScoreBoard.splice(scoreCheck, 0, newPlacement);
    sessionScoreBoard.splice(5, 1);
    updateLocalStorage();
  } else {
    scoreCheck = -1;
  }
  //returns the position that the new score will take
  return scoreCheck;
}

//diplays the player's results
function displayPlayerResult() {
  if (playerPosition === 5) {
    //if you got 6th position, you don't get to join the scoreboard
    text("You didn't get on the leaderboard", sWidth / 2, 270);
  } else if (playerPosition === -1) {
    //if you didn't write your name, you don't get to join
    text(
      "... Oh no, you forgot to enter your name in the field...",
      sWidth / 2,
      270
    );
  } else {
    //otherwise, you've joined the scoreboard
    let positionOnLeaderboard = playerPosition + 1;
    text(
      "You got position " + positionOnLeaderboard + " on the leaderboard",
      sWidth / 2,
      270
    );
  }
}

function displayScoreboard() {
  push();
  textAlign(LEFT);
  textSize(20);
  let userPosition = 0;
  for (let index in sessionScoreBoard) {
    let player = sessionScoreBoard[index];
    userPosition++;
    text(
      userPosition +
        ". " +
        player.name +
        ": " +
        (timeLimit - player.score) +
        "s",
      sWidth / 2 - 60,
      sHeight / 2 + index * 20 + 20
    );
  }
  pop();
}

function updateLocalStorage() {
  localStorage.scoreBoard = JSON.stringify(sessionScoreBoard);
}

function keyPressed() {
  console.log(keyCode);
  //if you press enter, you move between game states
  if (
    (gameState === "start" && keyCode === 13) ||
    (gameState === "win" && keyCode === 13) ||
    (gameState === "lose" && keyCode === 13)
  ) {
    gameState = "play";
    // startTime checks at what time we pressed the play button. the variable is used in our countdown timer
    startTimeSec = int(millis() / 1000);
    startTimeMil = int(millis() / 100);
    timePenalty = 0;
    frameCounter = 0;

    //reset vase position
    vase.x = vaseX;
    vase.y = vaseY;
    vase.speed = 0;
    vase.rotation = 0;
  }
  //if the cat is on the ground, it can jump
  if (keyCode === 90 && cat.state === "stand") {
    cat.downSpeed = cat.jumpHeight * -1;
  }
  // testing our win and lose states
  /*   // Press W for win state
  if (gameState === "play" && keyCode === 87) {
    gameState = "win";
  }
  // Press Q for lose state
  if (gameState === "play" && keyCode === 81) {
    gameState = "lose";
  } */
}
