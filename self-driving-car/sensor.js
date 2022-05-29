class Sensor {
    constructor (car, rayCount=5, rayLength=150) {
        this.car = car;
        this.rayCount = rayCount;
        this.rayLength = rayLength;
        this.viewAngle = Math.PI * 2 / 3;
        
        this.rays = [];
        this.readings = [];
    }

    update (roadBorders, traffic) {
        this.#castRays();
        this.readings = [];
        this.rays.forEach(ray=>{
            this.readings.push(this.#getReading(ray, roadBorders, traffic));
        });
    }

    #getReading (ray, roadBorders, traffic) {
        let output = null;
        let tMin = 100000;
        for (let i = 0; i < roadBorders.length; i++) {
            const intercept = getInterceptPt(ray[0], ray[1], roadBorders[i][0], roadBorders[i][1]);
            if (intercept && intercept.offset < tMin) {
                tMin = intercept.offset;
                output = intercept;
            }
        }
        traffic.forEach(car => {
            for (let i = 0; i < car.shape.length; i++) {
                const intercept = getInterceptPt(ray[0], ray[1], car.shape[i], car.shape[(i+1)%car.shape.length]);
                if (intercept && intercept.offset < tMin) {
                    tMin = intercept.offset;
                    output = intercept;
                }
            }
        });
        return output
    }

    #castRays () {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            let rayAngle = this.rayCount == 1? 0: -this.viewAngle / 2 + i * this.viewAngle / (this.rayCount - 1);
            // follow car direction
            rayAngle += this.car.angle;

            const start = {x: this.car.x, y: this.car.y};
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength
            }
            this.rays.push([start, end]);
        }
    }

    draw (ctx) {
        for (let i = 0; i < this.rays.length; i++) {
            let end = this.rays[i][1];
            if (this.readings[i]) {
                end = this.readings[i];
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "black";
                ctx.moveTo(end.x, end.y);
                ctx.lineTo(this.rays[i][1].x, this.rays[i][1].y);
                ctx.stroke();
            }
            
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

        }
    }
}