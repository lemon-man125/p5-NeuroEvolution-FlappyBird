// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// This flappy player implementation is adapted from:
// https://youtu.be/cXgA1d_E-jY&


// This file includes functions for creating a new generation
// of players.

// Start the game over
function resetGame() {
    timeSteps = DEFAULT_TIMESTEPS;
    counter = 0;
    pipes = [];
  }
  
  // Create the next generation
  function nextGeneration() {
    gen++;
    resetGame();
    // Normalize the fitness values 0-1
    normalizeFitness(allPlayers);
    // Generate a new set of players
    //print(allPlayers);
    activePlayers = generate(allPlayers);
    // Copy those players to another array
    allPlayers = activePlayers.slice();
  }
  
  // Generate a new population of players
  function generate(oldBirds) {
    //print(oldBirds);
    let newBirds = [];
    for (let i = 0; i < oldBirds.length; i++) {
      // Select a player based on fitness
      let player = poolSelection(oldBirds);
      newBirds[i] = player;
    }
    return newBirds;
  }
  
  // Normalize the fitness of all players
  function normalizeFitness(players) {
    // Make score exponentially better?
    let averageSum = 0;

    for (let i = 0; i < players.length; i++) {
      averageSum += players[i].score;
    }

    for (let i = 0; i < players.length; i++) {
      players[i].score = pow(players[i].score, 2);
    }

  
    // Add up all the scores
    let sum = 0;
    for (let i = 0; i < players.length; i++) {
      sum += players[i].score;
    }

    averageScore = floor(averageSum / players.length)

    // Divide by the sum
    for (let i = 0; i < players.length; i++) {
      players[i].fitness = players[i].score / sum;
      //print(players[i].fitness);
    }
  }
  
  
  // An algorithm for picking one player from an array
  // based on fitness
  function poolSelection(players) {
    // Start at 0
    let index = 0;
  
    // Pick a random number between 0 and 1
    let r = random(1);
  
    // Keep subtracting probabilities until you get less than zero
    // Higher probabilities will be more likely to be fixed since they will
    // subtract a larger number towards zero
    while (r > 0) {
    //print(players[index]);
    //print(players[index].fitness);
      r -= players[index].fitness;
      // And move on to the next
      index += 1;
    }
    
  
    // Go back one
    index -= 1;
  
    // Make sure it's a copy!
    // (this includes mutation)
    return players[index].copy();
}  