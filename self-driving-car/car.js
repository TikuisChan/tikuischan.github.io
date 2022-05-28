class Car{
    constructor(x, y, width, height, controlType) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;

        this.width = width;
        this.height = height;
        
        this.crashed = false;
        /* 
        instead of setting a constant friction and max speed in the tutorial, 
        a friction coefficient is used, now the frictional acceleration (force) 
        is equal to:
                               speed * friction coef
        and the max speed is control by the friction coef and acceleration ratio
        */
        this.frictionCoeff = 0.05;
        switch (controlType) {
            case "KEY":
                this.acceleration = 0.2;
                break;
            case "DUMMY":
                this.acceleration = (Math.random() + 0.1) * 0.18;
                break;
        }

        this.type = controlType;
        this.sensors = new Sensor(this);
        this.controls = new Controls(controlType);
    }

    draw (ctx) {
        if (this.crashed) {
            ctx.fillStyle = "grey";
        } else {
            ctx.fillStyle = "black";
        }

        ctx.beginPath();
        ctx.moveTo(this.shape[0].x, this.shape[0].y);
        for (let i = 1; i < this.shape.length; i++) {
            ctx.lineTo(this.shape[i].x, this.shape[i].y);
        }
        ctx.fill();
        if (this.type == "KEY") {
            this.sensors.draw(ctx);
        }
    }

    update (roadBorders, traffic) {
        if (!this.crashed) {
            this.#move();
            this.shape = this.#createShape();
            this.crashed = this.#checkCollision(roadBorders, traffic);
        }
        this.sensors.update(roadBorders, traffic);
    }

    #checkCollision (roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i ++) {
            if (polyIntersect(this.shape, roadBorders[i])) {
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i ++) {
            if (polyIntersect(this.shape, traffic[i].shape)) {
                return true;
            }
        }
        return false;
    } 

    #createShape () {
        // define the corners of the car object
        const corners = [];
        const alpha = Math.atan2(this.width, this.height);
        const diagonalLenth = Math.sqrt(this.width ** 2 + this.height ** 2);
        // top right
        corners.push({
            x: this.x - Math.sin(this.angle - alpha) * diagonalLenth / 2, 
            y: this.y - Math.cos(this.angle - alpha) * diagonalLenth / 2
        });
        // top left
        corners.push({
            x: this.x - Math.sin(this.angle + alpha) * diagonalLenth / 2, 
            y: this.y - Math.cos(this.angle + alpha) * diagonalLenth / 2
        });
        // bottom left
        corners.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * diagonalLenth / 2, 
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * diagonalLenth / 2
        });
        // bottom right
        corners.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * diagonalLenth / 2, 
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * diagonalLenth / 2
        });
        return corners
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
