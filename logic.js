//here's our one source of truth for the canvas width and height
const sWidth = 1100;
const sHeight = 700;

let timeLimit = 1500; // the game time limit
let countDown; // = time limit - amount of time passed
let currentTimeSec = 0;
let currentTimeMil = 0;
let startTimeSec = 0;
let startTimeMil = 0;
let vaseImg;

function preload() {
    vaseImg = loadImage('images/vase.png');
}

function setup() {
    createCanvas(sWidth, sHeight);
}

//here, we wait until the document has loaded fully before setting the gamestate to start
window.addEventListener("load", () => {
    gameState = "start";
    // mainTitleElement = document.getElementById("mainTitle");
    // mainTitleElement.innerText = "Not loading anymore";
});

//sprite for our main cat :3
function catSprite(obj) {
    push();
    strokeWeight(0);
    fill(0, 0, 0);

    translate(obj.x, obj.y);

    if (cat.direction === "left") {
        scale(-1, 1);
    }

    if (cat.invincibility > 0) {
        fill(255, 50, 50);
    }

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
    } else if (obj.type === "obstacle") {
        push();
        fill(200, 50, 50);
        rect(obj.x, obj.y, obj.width, obj.height);
        pop();
    } else if (obj.type === "vase") {
        push();
        fill("green");
        image(vaseImg, obj.x, obj.y, obj.width, obj.height);
        pop();
    }
}

//here's all the variables we set before starting everything
let mainTitleElement;
let gameText;

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
    invincibility: 0,
    direction: "right",
    runSprite: 1,
};

const vase = {
    x: 800,
    y: 100,
    width: 96,
    height: 120,
    type: "vase",
    dangerous: false,
    startPoint: 0,
    endPoint: 0,
    speed: 0,
    img: vaseImg,
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

const shelf4 = {
    x: sWidth / 2 - 100,
    y: floor.y - 350,
    width: 200,
    height: 50,
    type: "shelf",
    dangerous: false,
};
// she shelf that holds the vase
const shelf5 = {
    x: vase.x - 200,
    y: vase.y + vase.height,
    width: 300,
    height: 50,
    type: "shelf",
    dangerous: false,
};

const wallLeft = {
    x: 0,
    y: 0,
    width: 50,
    height: sHeight - floor.height,
    type: "floor",
    dangerous: false,
};

const wallRight = {
    x: sWidth - 50,
    y: 0,
    width: 50,
    height: sHeight - floor.height,
    type: "floor",
    dangerous: false,
};

const vacuum1 = {
    x: 100,
    y: sHeight - 80,
    width: 80,
    height: 30,
    type: "obstacle",
    dangerous: true,
    startPoint: 50,
    endPoint: 250,
    speed: 2,
};

const cactus1 = {
    x: 800,
    y: floor.y - 80,
    width: 50,
    height: 80,
    type: "obstacle",
    dangerous: true,
    startPoint: 0,
    endPoint: 0,
    speed: 0,
};

const collisionBlocks = [
    floor,
    shelf1,
    shelf2,
    shelf3,
    shelf4,
    shelf5,
    wallLeft,
    wallRight,
    vase,
];

const obstacles = [vacuum1, cactus1];

//The main draw function that is called many times per second
function draw() {
    console.log(gameState);
    console.log(countDown + "cd");
    console.log(currentTimeSec);
    // Different game states
    if (gameState === "loading") {
        //here we could have a loading screen if we want it, but it might be unnecessary
    } else if (gameState === "start") {
        //Here's where we summon the start screen
        //let currentTime = 0;
        background(250, 230, 150);
        textAlign(CENTER);

        //headline
        push();
        textSize(50);
        textFont("Exo");
        text("CATFORMER", sWidth / 2, sHeight / 2);
        pop();

        //game text
        push();
        gameText = "press R to start playing";
        text(gameText, sWidth / 2, sHeight / 2 + 40);
        pop();
    } else if (gameState === "play") {
        //here's where we have all the gameplay code
        background(250, 230, 150);


        // Testing countdown timer based on this tutorial: https://www.youtube.com/watch?v=rKhwDhp9dcs&ab_channel=flanniganable

        currentTimeSec = int(millis() / 1000); // this runs in the background and counts how many seconds has passed
        currentTimeMil = int(millis() / 10); // this runs in the background and counts how many milliseconds has passed

        countDown = timeLimit - (currentTimeSec - startTimeSec);
        let countDownMil = timeLimit - (currentTimeMil - startTimeMil);

        if (countDown < 0) {
            countDown = 0;
            gameState = "loose";
        }

        //every 5 milliseconds, the cat goes into the second run sprite
        if ((currentTimeMil / 5) % 2 === 0) {
            cat.runSprite *= -1;
        }

        // creating a timer
        push();
        //let timer = "10:00:00";
        fill(0, 0, 0);
        textAlign("center");
        textSize(36);
        text(countDown + ":" + (countDownMil % 100), sWidth - 150, 50);
        pop();

        for (let block of collisionBlocks) {
            CollisionBlockSprite(block);
        }

        for (let obstacle of obstacles) {
            CollisionBlockSprite(obstacle);
        }

        catSprite(cat);

        // Moving the cat
        // left arrow:
        if (keyIsDown(37) || keyIsDown(65)) {
            if (cat.direction === "right") {
                cat.direction = "left";
            }
            // with acceleration
            // cat.sideSpeed -= cat.acceleration;

            //without acceleration
            cat.sideSpeed = -5;
        } // right arrow:
        else if (keyIsDown(39) || keyIsDown(68)) {
            // right arrow:
            if (cat.direction === "left") {
                cat.direction = "right";
            }
            // with acceleration
            // cat.sideSpeed += cat.acceleration;

            //without acceleration
            cat.sideSpeed = 5;
        } // cat's not moving:
        else {
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

                // if statement for if the cat has collided with the vase
                if (block.type === "vase") {
                    gameState = "win";
                }
            } else {
                //if the cat hasn't collided with anything, it will be affected by gravity
            }
        }

        //if the cat didn't collide with anything, it should be in the state "fall"
        if (hasCollided === false) {
            cat.state = "fall";
        }

        //collision with things that hurt you
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
            }
        }

        //this counts down the invincibility
        if (cat.invincibility > 0) {
            cat.invincibility--;
        }

        cat.y += cat.downSpeed;

        // controls of moving left and right (looked at garrits lecture "12: Example - Move a car with the keyboard" and took inspiration for this section)
        cat.x = cat.x + cat.sideSpeed;

        // What does this one to?
        for (obstacle of obstacles) {
            obstacle.x += obstacle.speed;
            if (obstacle.x > obstacle.endPoint || obstacle.x < obstacle.startPoint) {
                obstacle.speed *= -1;
            }
        }
        ///// End of play state
    } else if (gameState === "win") {
        // Here's the screen if you win the game
        background("lightgreen");

        // resetting cat position
        cat.x = sWidth / 2;
        cat.y = sHeight - 30;

        textAlign(CENTER);

        //headline
        push();
        textSize(50);
        textFont("Exo");
        text("VICTORY", sWidth / 2, 100);
        pop();

        //game text
        push();
        gameText = "I AM THE SUPERIOR CAT! SUCK IT, GRAVITY!";
        text(gameText, sWidth / 2, sHeight / 5);
        text("press R to play again", sWidth / 2, sHeight / 4);
        pop();
        // Show your time
        // Option to Write your name and save it to local storage
        // Display highscore
        // Replay button
    } else if (gameState === "loose") {
        // Here's the screen if you loose the game
        background("red");
        textAlign(CENTER);

        // resetting cat position
        cat.x = sWidth / 2;
        cat.y = sHeight - 30;

        //headline
        push();
        textSize(50);
        textFont("Exo");
        text("GAME OVER", sWidth / 2, 100);
        pop();

        //game text
        push();
        gameText = "Gosh darn, the human is back... I have to be faster next time";
        text(gameText, sWidth / 2, sHeight / 5);
        text("press R to play again", sWidth / 2, sHeight / 4);
        pop();

        // Display highscore
        // Replay button
    }
}

function keyPressed() {
    console.log(keyCode);
    if (
        gameState === "start" ||
        gameState === "win" ||
        (gameState === "loose" && keyCode === 82)
    ) {
        gameState = "play";
        // startTime checks at what time we pressed the play button. the varieble is used in our countdown timer in our "play" gamestate
        startTimeSec = int(millis() / 1000);
        startTimeMil = int(millis() / 100);
    }
    if (keyCode === 90 && cat.state === "stand") {
        cat.downSpeed = cat.jumpHeight * -1;
    }
    // testing our win and loose states
    // Press W for win state
    if (gameState === "play" && keyCode === 87) {
        gameState = "win";
    }
    // Press Q for loose state
    if (gameState === "play" && keyCode === 81) {
        gameState = "loose";
    }
}