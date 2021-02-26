class Bird {
    constructor(brain) {
        this.r = 15;
        this.pos = createVector(64, height/2);
        this.vel = createVector(0, 0);
        this.gravity = 0.9;
        this.jumpForce = -9;

        this.score = 0;
        this.fitness = 0;
        if (brain instanceof NeuralNetwork) {
            this.brain = brain.copy();
            this.brain.mutate();
        } else{
            this.brain = new NeuralNetwork(5, 16, 2);
        }
    }

    copy() {
        return new Bird(this.brain);
    }

    show() {
        if (imageLoad) {
            image(spiritImage, this.pos.x, this.pos.y, this.r*2, this.r*2);
        } else {
            push();
            stroke(255);
            strokeWeight(2);
            fill(255, 50);
            circle(this.pos.x, this.pos.y, this.r*2);
            pop();
        }
    }

    think(pipes) {
        // First find the closest pipe
        var closest = null;
        var record = Infinity;
        for (let i = 0; i < pipes.length; i++) {
          let diff = (pipes[i].pos.x+pipes[i].w/2) - (this.pos.x-(this.r+5));
          if (diff > 0 && diff < record) {
            record = diff;
            closest = pipes[i];
          }
        }
    
        if (closest != null) {
          // Now create the inputs to the neural network
          let inputs = [];
          // x position of closest pipe
          inputs[0] = map(closest.pos.x, this.pos.x, width, -1, 1);
          // top of closest pipe opening
          inputs[1] = map(closest.top, 0, height, -1, 1);
          // bottom of closest pipe opening
          inputs[2] = map(closest.bottom, 0, height, -1, 1);
          // bird's y position
          inputs[3] = map(this.pos.y, 0, height, -1, 1);
            // bird's velocity
          inputs[4] = map(this.vel.y, 0, 10, -1, 1);
          // Get the outputs from the network
          var action = this.brain.query(inputs);
          // Decide to jump or not!
          if (action[1] > action[0]) {
            this.jump();
          }
        }
      }

    update() {
        this.score++;


        this.pos.y+=this.vel.y;
        this.vel.y+=this.gravity;
    }

    jump() {
        this.vel.y+=this.jumpForce;
    }

    mutate() {
        this.brain.mutate();
    }

    edges() {
        // This does nothing since we are handling all of this in the bottom function
        // if (this.pos.y + this.r >= height) {
        //     this.pos.y = height - this.r;
        // }
    }

    bottom() {
        return (this.pos.y + this.r >= height || this.pos.y-this.r <= 0);
    }

}