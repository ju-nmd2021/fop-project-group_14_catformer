let gameState = "loading"; //first we set the gamestate to loading
let mainTitleElement;

window.addEventListener("load", () => {
  gameState = "start"; //when the entire document is done loading, we draw the start screen
  mainTitleElement = document.getElementById("mainTitle");
  mainTitleElement.innerText = "Not loading anymore";
});

function draw() {
  if (gameState === "loading") {
    //here we could have a loading screen if we want it, but it might be unnecessary
  } else if (gameState === "start") {
    //Here's where we summon the start screen
  } else if (gameState === "play") {
    //here's where we have all the gameplay code
  }
}
