class Car{
    constructor(x, y, width, height, controlType, sensorRayCount=5) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;

        this.width = width;
        this.height = height;
        
        this.carCam = [];

        this.crashed = false;
        this.ai = new FC([7, 8, 8, 4]);
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
            case "AI":
                this.acceleration = 0.2;
                break;
            case "DUMMY":
                this.acceleration = (Math.random() + 0.1) * 0.16;
                break;
        }

        this.type = controlType;
        this.sensors = new Sensor(this, sensorRayCount);
        this.controls = new Controls(controlType, sensorRayCount);

        this.score = 0;
        this.maxSpeed = this.acceleration / this.frictionCoeff;
        
    }

    resetPos (x, resetScore=false) {
        this.x = x;
        this.y = 0;
        this.angle = 0;
        this.speed = 0;
        this.crashed = false;
        this.score = resetScore?0:this.score;
        this.carCam = [];
    }

    draw (ctx, carColor, drawSensor=false) {
        // rect as a car
        ctx.fillStyle = carColor;
        if (this.crashed) {
            ctx.fillStyle = "grey";
        }

        ctx.beginPath();
        ctx.moveTo(this.shape[0].x, this.shape[0].y);
        for (let i = 1; i < this.shape.length; i++) {
            ctx.lineTo(this.shape[i].x, this.shape[i].y);
        }
        ctx.fill();

        // img as a car
        // ctx.save();
        // ctx.translate(this.x, this.y);
        // ctx.rotate(-this.angle);
        // ctx.drawImage(
        //     this.img,
        //     - this.width / 2,
        //     - this.height / 2,
        //     this.width,
        //     this.height
        // )
        // ctx.restore();

        if (this.type != "DUMMY" && drawSensor == true) {
            this.sensors.draw(ctx);
        }
    }

    update (roadBorders, traffic, record=false) {
        if (!this.crashed) {
            this.#move(record);
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

    #move (record) {
        this.speed -= this.frictionCoeff * this.speed;

        // calculate new pos according to the input
        let X = this.sensors.readings.map(x => x == null? 0: 1 - x.offset);
        X.push(this.speed / this.maxSpeed);
        X.push((this.angle % (2 * Math.PI)) / Math.PI);

        // record the input data into "carCam"
        if (record == true && !this.crashed) {
            if (this.controls.left | this.controls.right | !this.controls.forward) {
                this.carCam.push([
                    X, 
                    [this.controls.forward, this.controls.left, this.controls.right, this.controls.backward]
                ]);
            } else if (Math.random() > 0.9) {
                this.carCam.push([
                    X, 
                    [this.controls.forward, this.controls.left, this.controls.right, this.controls.backward]
                ]);
            }
        }

        const control = this.ai.predict(X);
        if (this.type == "AI") {
            this.controls.forward = control[0];
            this.controls.left = control[1];
            this.controls.right = control[2];
            this.controls.backward = control[3];
        }

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
