// This file includes functions for creating a new generation
// of players.

// Start the game over
function resetGame() {
  timeSteps = DEFAULT_TIMESTEPS;
  counter = 0;
  pipes = [];
}

function nextGeneration() {
  gen++;
  resetGame();
  normalizeFitness(allPlayers);
  activePlayers = generate(allPlayers);
  for (let i = 0; i < allPlayers.length; i++) {
    if (allPlayers[i] != bestBird) {
      allPlayers[i].brain.dispose();
    }
  }
  allPlayers = activePlayers.slice();
}

// Generate a new population of players
function generate(oldBirds) {
  let newBirds = [];
  for (let i = 0; i < oldBirds.length; i++) {
    let player = poolSelection(oldBirds);
    newBirds[i] = player;
  }
  return newBirds;
}

function normalizeFitness(players) {
  const averageSum = players.reduce((acc, val) => acc + val.score, 0);

  // for (let i = 0; i < players.length; i++) {
  //   players[i].score = pow(players[i].score, 2);
  // }

  // let sum = 0;
  // for (let i = 0; i < players.length; i++) {
  //   sum += players[i].score;
  // }

  const sum = players.reduce((acc, val) => acc + pow(val.score, 2), 0);

  averageScore = floor(averageSum / players.length);

  for (let i = 0; i < players.length; i++) {
    players[i].fitness = pow(players[i].score, 2) / sum;
  }
  // const fitness = players.map((val) => val.score / sum);
  // for (let i = 0; i < players.length; i++) {
  //   players[i].fitness = fitness[i];
  // }
}

function poolSelection(players) {
  let index = 0;

  let r = random(1);

  while (r > 0) {
    r -= players[index].fitness;
    index += 1;
  }

  index -= 1;

  return players[index].copy();
}
