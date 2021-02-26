
class Pipe {
    

    constructor() {
        this.spacing = random(85, width/2);
        this.centery = random(this.spacing, height-this.spacing);
        this.pos = createVector(width, height);
        this.vel = createVector(-2, 0);
        this.top = this.centery - this.spacing/2;
        this.bottom = height - (this.centery + this.spacing/2);
        this.w = 75;
    }

    show(bestBird) {
        if (imageLoad) {
            push();
            translate(this.pos.x+this.w/2, this.top/2);
            imageMode(CENTER);
            rotate(180);
            image(treeImage, 0, 0, this.w, this.top);
            pop();
            image(treeImage, this.pos.x, this.pos.y-this.bottom, this.w, this.bottom);
        } else {
            fill(255);
            rect(this.pos.x, 0, this.w, this.top);
            rect(this.pos.x, this.pos.y-this.bottom, this.w, this.bottom);
        }
        if (bestBird) {
            print("SHOWN!");
        }
    }

    update() {
        this.pos.x+=this.vel.x;
    }

    offScreen() {
        return (this.pos.x+this.w < 0) ;
    }

    hits(bird) {
        if ((bird.pos.y - bird.r) < this.top || (bird.pos.y + bird.r) > (height - this.bottom)) {
          if (bird.pos.x > this.pos.x && bird.pos.x < this.pos.x + this.w) {
            return true;
          }
        }
        return false;
      }

}