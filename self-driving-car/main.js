class Game {
    constructor (mainCanvasWidth=200, nnCanvasWidth=300) {
        // define canvas
        this.mainCanvas = document.getElementById("carCanvas");
        this.mainCanvas.width = mainCanvasWidth;
        this.mainCtx = this.mainCanvas.getContext("2d");
    
        this.nnCanvas = document.getElementById("nnCanvas");
        this.nnCanvas.width = nnCanvasWidth;
        this.nnCtx = this.nnCanvas.getContext("2d");

        this.ai = true;
    }

    initGame () {
        // create road
        this.road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

        // create car instance
        this.cars = []
        const carInitY = 100;
        for (let i=0; i<100; i++){
            this.cars.push(new Car(this.road.getLaneCenter(1), carInitY, 30, 50, "AI"));
        }
        if (this.ai == false) {
            this.cars[0] = new Car(this.road.getLaneCenter(1), carInitY, 30, 50, "KEY");
        } 

        // create traffic on the road
        let numTraffic = 8;
        this.traffic = [];
        for (let i = 0; i < numTraffic; i++) {
            let dummyY;
            if (Math.random() > 0.3) {
                dummyY = carInitY - (i+1) * 100;
            } else {
                dummyY = carInitY - (i+1) * 120;
            }
            const lane = getRandomInt(3);
            this.traffic.push(
                new Car(this.road.getLaneCenter(lane), dummyY, 30, 50, "DUMMY")
            );
        }
    }

    animate (time) {
        const n = this.traffic.length;

        // define mainCar to place at the center of the screen 
        let mainCar;
        if (this.ai == true) {
            mainCar = this.cars.find(car => car.y == Math.min(...this.cars.map(car=>car.y)));
        } else {
            mainCar = this.cars[0];
        }

        for (let i = 0; i < n; i++) {
            // discard traffic far behind mainCar
            if (this.traffic[i].y - mainCar.y > 300) {
                const lane = getRandomInt(3);
                const dummyY = mainCar.y - (i+1) * 300;
                this.traffic[i] = new Car(this.road.getLaneCenter(lane), dummyY, 30, 50, "DUMMY");
            }

            this.traffic[i].update(this.road.border, []);
        }

        this.cars.forEach(car => car.update(this.road.border, this.traffic));
        // draw will reset when re-define canvas height
        this.mainCanvas.height = window.innerHeight;
        nnCanvas.height = window.innerHeight;


        this.mainCtx.save();
        this.mainCtx.translate(0, -mainCar.y + this.mainCanvas.height * 0.7);

        this.road.draw(this.mainCtx);
        this.cars.forEach(car => car.draw(this.mainCtx, "lightblue", false));
        mainCar.draw(this.mainCtx, "blue", true)
        for (let i = 0; i < this.traffic.length; i++) {
            this.traffic[i].draw(this.mainCtx, "red");
        }

        this.mainCtx.restore();
        this.nnCtx.lineDashOffset = -time / 50;
        Visualizer.drawNetwork(this.nnCtx, mainCar.ai);
        this.requestID = requestAnimationFrame(time=>this.animate());
    }

    restartGame (play=false) {
        cancelAnimationFrame(this.requestID);
        this.mainCtx.clearRect(0, 0, this.mainCanvas.width, window.innerHeight);
        this.ai = !play;
        this.initGame();
        this.animate();
    }
}
