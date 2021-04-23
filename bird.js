class Bird {
  constructor(brain) {
    this.r = 12;
    this.pos = createVector(64, height / 2);
    this.vel = createVector(0, 0);
    this.gravity = 0.8;
    this.jumpForce = -12;

    this.score = 0;
    this.fitness = 0;
    if (brain instanceof NeuroEvolution) {
      this.brain = brain.copy();
      this.brain.mutate(0.1);
    } else {
      this.brain = new NeuroEvolution([5, 16, 16, 2]);
    }
    this.highlight = false;
  }

  copy() {
    return new Bird(this.brain);
  }

  show() {
    if (imageLoad) {
      image(spiritImage, this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    } else {
      push();
      stroke(255);
      strokeWeight(2);
      if (this.highlight) {
        fill(0, 0, 255, 100);
      } else {
        fill(255, 100);
      }
      circle(this.pos.x, this.pos.y, this.r * 2);
      pop();
    }
  }

  think(pipes) {
    // First find the closest pipe
    let closest = null;
    let record = Infinity;
    for (let i = 0; i < pipes.length; i++) {
      const diff =
        pipes[i].pos.x + pipes[i].w / 2 - (this.pos.x - (this.r + 5));
      if (diff < record) {
        record = diff;
        closest = pipes[i];
      }
    }

    if (closest != null) {
      // Now create the inputs to the neural network
      let inputs = [];
      // x position of closest pipe
      inputs[0] = map(
        p5.Vector.dist(this.pos, closest.pos),
        this.pos.x,
        width,
        -1,
        1
      );
      // top of closest pipe opening
      inputs[1] = map(closest.top, 0, height, -1, 1);
      // bottom of closest pipe opening
      inputs[2] = map(height - closest.bottom, 0, height, -1, 1);
      // bird's y position
      inputs[3] = map(this.pos.y, 0, height, -1, 1);
      // bird's y velocity
      inputs[4] = map(this.vel.y, -5, 5, -1, 1);
      // Get the outputs from the network
      const results = this.brain.query(inputs);
      // Decide to jump or not!
      if (results[0] > results[1]) {
        this.jump();
      }
    }
  }

  update() {
    this.score++;

    this.pos.y += this.vel.y;
    this.vel.y += this.gravity;
  }

  jump() {
    this.vel.y += this.jumpForce;
  }

  mutate() {
    this.brain.mutate();
  }

  edges() {
    // This does nothing since we are handling all of this in the bottom function
    // if (this.pos.y + this.r >= height) {
    //   this.pos.y = height - this.r;
    // }
  }

  bottom() {
    return this.pos.y + this.r >= height || this.pos.y - this.r <= 0;
  }
}
