class Game {
    constructor (mainCanvasWidth=200, nnCanvasWidth=300) {
        // define canvas
        this.mainCanvas = document.getElementById("carCanvas");
        this.mainCanvas.width = mainCanvasWidth;
        this.mainCtx = this.mainCanvas.getContext("2d");
    
        this.nnCanvas = document.getElementById("nnCanvas");
        this.nnCanvas.width = nnCanvasWidth;
        this.nnCtx = this.nnCanvas.getContext("2d");

        // chart.js setting
        this.chartCanvas = document.getElementById('evolution');

        this.data = {
            labels: [],
            datasets: [{
              label: 'Avg Fitness Score',
              data: [],
              backgroundColor: 'rgb(255, 255, 255)',
              borderColor: 'rgb(75, 192, 192)',
            },{
                label: 'Best Fitness Score',
                data: [],
                backgroundColor: 'rgb(255, 255, 255)',
                borderColor: 'rgb(255, 0, 0)',
              }]
          };

        this.config = {
            type: 'line',
            data: this.data,
            options: {
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Score'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Generation'
                        }
                    }
                }
            }
        };

        this.evoChart = new Chart(
            this.chartCanvas,
            this.config,
        );

        this.ai = true;
        this.generation = 0;
        this.numTestRound = 5;

        this.start;
    }

    initGame () {
        // create road
        this.road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

        // create traffic on the road
        let numTraffic = 7;
        this.traffic = [new Car(this.road.getLaneCenter(1), -350, 30, 50, "DUMMY")];
        for (let i = 0; i < numTraffic; i++) {
            let dummyY;
            if (Math.random() > 0.3) {
                dummyY = - (i+1) * 200;
            } else {
                dummyY = - (i+1) * 240;
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
            if (this.traffic[i].y - mainCar.y > 200) {
                const lane = getRandomInt(3);
                const dummyY = mainCar.y - (i+1) * 300;
                this.traffic[i] = new Car(this.road.getLaneCenter(lane), dummyY, 30, 50, "DUMMY");
            }
            this.traffic[i].update(this.road.border, []);
        }

        this.cars.forEach(car => {
            car.update(this.road.border, this.traffic);
        });

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
        this.nnCtx.lineDashOffset = -time/ 50;
        Visualizer.drawNetwork(this.nnCtx, mainCar.ai);
        this.requestID = requestAnimationFrame(this.start.bind(this));
    }

    evolution (testComplete=false) {
        // create car instance
        if (this.survivors) {
            this.cars = []
            this.survivors.forEach(survivor => {
                survivor.resetPos(this.road.getLaneCenter(1), true);
            });
            this.survivors.forEach(parent => {
                for (let i=0; i<100; i++){
                    const child = new Car(this.road.getLaneCenter(1), 0, 30, 50, "AI");
                    child.ai = new FC(parent.ai, i > 0);
                    this.cars.push(child);
                }
            })
        } else if (testComplete) {
            this.cars.forEach( car => {
                car.resetPos(this.road.getLaneCenter(1), false);
            })
        } else {
            this.cars= [];
            for (let i=0; i<500; i++){
                this.cars.push(new Car(this.road.getLaneCenter(1), 0, 30, 50, "AI"));
            }
        }
        let startTime;
        this.start = (time) => {
            if (!startTime) {
                startTime = time;
            }

            // get top 5 score cars every ~10s and restart game
            if (time - startTime >= 5000) {
                this.cars.forEach(car => {
                    car.score += this.getScore(car, time - startTime);
                    if (!car.crashed) {
                        car.score += 5;
                    }
                });

                cancelAnimationFrame(this.requestID);
                this.mainCtx.clearRect(0, 0, this.mainCanvas.width, window.innerHeight);
                this.initGame();
                if (this.numTestRound == 0) {
                    this.survivors = this.cars.sort(function (a, b) {
                        return a.score - b.score;
                    }).slice(-5);
                    const bestScore = this.survivors[4].score;
                    const avgScore = this.cars.reduce((sum, val) => sum + val.score, 0) / this.cars.length;
                    this.generation++;
                    console.log("Generation: ", this.generation);
                    this.data.labels.push(this.generation)
                    console.log("Best Score: ", bestScore);
                    this.data.datasets[1].data.push(bestScore);
                    console.log("Avg Score: ", avgScore);
                    this.data.datasets[0].data.push(avgScore);
    
                    this.evoChart.update();
                    testComplete = true;
                    this.numTestRound = 5;
                } else {
                    this.numTestRound--;
                }

                startTime = time;
                this.evolution(testComplete);
            } else {
                this.animate(time);
            }
        }
        this.start();
    }

    play () {
        this.start = this.animate;
        // create car instance
        this.cars = []
        for (let i=0; i<100; i++){
            this.cars.push(new Car(this.road.getLaneCenter(1), 0, 30, 50, "AI"));
        }
        if (this.ai == false) {
            this.cars[0] = new Car(this.road.getLaneCenter(1), 0, 30, 50, "KEY");
        } 
        this.start();
    }

    restartGame (play=false) {
        cancelAnimationFrame(this.requestID);
        this.mainCtx.clearRect(0, 0, this.mainCanvas.width, window.innerHeight);
        this.ai = !play;
        this.initGame();
        this.play();
    }

    getScore (car, time) {
        // return (car.y / 100) + Math.log(time);
        return (-car.y / 100);
    }
}
