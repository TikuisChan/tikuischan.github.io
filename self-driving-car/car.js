class Car{
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;

        this.width = width;
        this.height = height;
        /* 
        instead of setting a constant friction and max speed in the tutorial, 
        a friction coefficient is used, now the frictional acceleration (force) 
        is equal to:
                               speed * friction coef
        and the max speed is control by the friction coef and acceleration ratio
        */
        this.frictionCoeff = 0.05;
        this.acceleration = 0.2;

        this.sensors = new Sensor(this);
        this.controls = new Controls();
    }

    draw (ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        
        ctx.fillRect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        // alternative: using rect -> fill
        // ctx.beginPath();
        // ctx.rect(
        //     -this.width / 2,
        //     -this.height / 2,
        //     this.width,
        //     this.height
        // );
        // ctx.fill();
        ctx.restore();
        
        this.sensors.draw(ctx);
    }

    update (roadBorders) {
        this.#move();
        this.sensors.update(roadBorders);
    }

    #move () {
        this.speed -= this.frictionCoeff * this.speed;

        // calculate new pos according to the input
        if (this.controls.forward) {
            this.speed -= this.acceleration;
        }
        if (this.controls.backward) {
            this.speed += this.acceleration / 2;
        }
        
        if (Math.abs(this.speed) >= 0.05) {
            if (this.controls.right) {
                this.angle -= 0.03;
            }
            if (this.controls.left) {
                this.angle += 0.03;
            }
        }
        this.x += this.speed * Math.sin(this.angle);
        this.y += this.speed * Math.cos(this.angle);
    }
}
