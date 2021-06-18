const TOTAL = 500;
const imageLoad = false;
const DEFAULT_TIMESTEPS = 3;
const MAX_TIMESTEPS = 10;
const FIXED_TIMESTEPS = true;
const AUTO_SAVE = false;

let timeSteps = 1;
let slider;
let gen = 1;
let counter = 0;
let allPlayers = [];
let activePlayers = [];
let pipes = [];
// Interface elements
let speedSlider;
let speedSpan;
let highScoreSpan;
let allTimeHighScoreSpan;
let bestBird;

let topBirds = [];

// Button to highlight the bestbird during training;

let highlightButton;

// All time high score
let highScore = 0;
let lastGen = 1;
let averageScore = 0;
let averageScoreSpan;
// let lastScore;
let lastHighScore;

// Training or just showing the current best
let runBest = false;
let runBestButton;
let spiritImage;
let treeImage;

let saveButton;

function preload() {
  if (imageLoad) {
    spiritImage = loadImage("./spirit.png");
    treeImage = loadImage("./tree.png");
  }
}

function setup() {
  createCanvas(600, 400).parent("canvas-wrapper");
  tf.setBackend("cpu");

  angleMode(DEGREES);

  saveButton = createButton("Save Best Bird!");
  saveButton.mousePressed(() => {
    if (bestBird) {
      bestBird.brain.save();
    }
  });

  // Access the interface elements
  if (FIXED_TIMESTEPS) {
    speedSlider = createSlider(1, MAX_TIMESTEPS, 0.1);
  }
  highScoreSpan = createSpan();
  runBestButton = createButton("Run best");
  allTimeHighScoreSpan = createSpan();
  averageScoreSpan = createSpan();
  runBestButton.mousePressed(toggleState);
  highlightButton = createButton("Highlight best bird");
  highlightButton.mousePressed(() => {
    if (bestBird) {
      if ("highlight" in bestBird) {
        bestBird.highlight = !bestBird.hightlight;
      }
    }
  });
  for (let i = 0; i < TOTAL; i++) {
    let player = new Bird();
    activePlayers[i] = player;
    allPlayers[i] = player;
  }
}

function keyPressed() {
  if (key == "s" && bestBird) {
    bestBird.brain.save("bestBird");
  }
}

function toggleState() {
  runBest = !runBest;
  // Show the best bird
  if (runBest) {
    if (bestBird) {
      //      lastScore = bestBird.score;
      lastHighScore = highScore || bestBird.score;
    }
    lastGen = gen - 1;
    gen = 1;
    resetGame();
    bestBird.score = 0;
    runBestButton.html("continue training");
    // Go train some more
  } else {
    if (!FIXED_TIMESTEPS) {
      timeSteps = DEFAULT_TIMESTEPS;
    }
    gen = lastGen;
    bestBird.score = 0;
    highScore = lastHighScore;
    nextGeneration();
    // if (bestBird) {
    //   bestBird.score = lastScore;
    //   highScore = lastHighScore;
    // }
    runBestButton.html("run best");
  }
}

function draw() {
  background(0, 165, 255);
  push();
  fill(210);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Gen: " + gen, width / 2, 25);
  pop();

  if (FIXED_TIMESTEPS) {
    timeSteps = speedSlider.value();
  }

  if (AUTO_SAVE) {
    if (highScore > 120000) {
      noLoop();
      return;
    }
  }

  if (timeSteps > MAX_TIMESTEPS) {
    timeSteps = MAX_TIMESTEPS;
  }

  for (let n = 0; n < timeSteps; n++) {
    for (let i = pipes.length - 1; i >= 0; i--) {
      for (let j = activePlayers.length - 1; j >= 0; j--) {
        if (pipes[i].hits(activePlayers[j])) {
          activePlayers.splice(j, 1);
        }
      }
    }

    // for (let i = activePlayers.length-1; i >= 0; i--) {
    //   if (activePlayers.length > 0) {
    //     if (activePlayers[i].edges()) {
    //       activePlayers.splice(i, 1);
    //     }
    //  }

    // }
    if (runBest) {
      bestBird.think(pipes);
      bestBird.update();
      bestBird.edges();
      for (const pipe of pipes) {
        // Start over, bird hit pipe
        if (pipe.hits(bestBird) || bestBird.bottom()) {
          bestBird.score = 0;
          resetGame();
          gen++;
        }
      }
      // Or are we running all the active birds
    } else {
      for (let i = activePlayers.length - 1; i >= 0; i--) {
        let bird = activePlayers[i];
        // Bird uses its brain!
        bird.think(pipes);
        bird.update();
        bird.edges();
        // Check all the pipes
        for (let j = 0; j < pipes.length; j++) {
          // It's hit a pipe
          if (pipes[j].hits(activePlayers[i]) || activePlayers[i].bottom()) {
            // Remove this bird
            activePlayers.splice(i, 1);
            break;
          }
        }
      }
    }

    if (counter % 75 === 0) {
      pipes.push(new Pipe());
    }
    counter++;

    for (pipe of pipes) {
      pipe.update();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
      if (pipes[i].offScreen()) {
        pipes.splice(i, 1);
        // print(pipes.length);
      }
    }

    let tempHighScore = 0;
    //if (bestBird) print(bestBird.score + " right before all the if statements");
    // If we're training
    if (!runBest) {
      // Which is the best bird?
      let tempBestBird = null;
      for (let i = 0; i < activePlayers.length; i++) {
        let s = activePlayers[i].score;
        if (s > tempHighScore) {
          tempHighScore = s;
          tempBestBird = activePlayers[i];
        }
      }

      // Is it the all time high scorer?
      if (tempHighScore > highScore) {
        highScore = tempHighScore;
        bestBird = tempBestBird;
      }
    } else {
      // Just one bird, the best one so far
      tempHighScore = bestBird.score;
      if (tempHighScore > highScore) {
        highScore = tempHighScore;
      }
    }

    highScoreSpan.html(tempHighScore);
    allTimeHighScoreSpan.html(highScore);
    averageScoreSpan.html(averageScore);

    if (!runBest) {
      // If we're out of birds go to the next generation
      if (activePlayers.length == 0) {
        nextGeneration();
      }

      if (!FIXED_TIMESTEPS) {
        if (activePlayers.length < 75) {
          timeSteps = 30;
        }

        if (activePlayers.length < 150) {
          timeSteps = 15;
        }

        if (activePlayers.length < 10) {
          timeSteps = 75;
        }

        if (activePlayers.length === 1) {
          timeSteps = MAX_TIMESTEPS;
        }
      }
    }
    //if (bestBird) print(bestBird.score + " right after all the if statements");

    topBirds = activePlayers
      .slice()
      .sort((a, b) => a.score - b.score)
      .reverse();

    topBirds.splice(10, topBirds.length - 10);
  }

  for (const pipe of pipes) {
    pipe.show();
  }
  if (runBest) {
    if (!FIXED_TIMESTEPS) {
      timeSteps = 1;
    }
    bestBird.show(true);
  } else {
    for (const player of activePlayers) {
      player.show(false);
    }
  }

  topBirds.forEach((x, i) => {
    textSize(16);
    textAlign(RIGHT, TOP);
    fill(255, 0, 0);
    const names = [
      "Chris",
      "Lesley",
      "Nubia",
      "Will",
      "Teddy",
      "Macy",
      "Noah",
      "Patrick",
      "SpongeBob",
      "Leo Messi",
    ];
    text(`${i + 1}. ${random(names)}. Score: ${x.score}`, width, 0);
  });
}
