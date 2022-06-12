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

        this.ai = true;
        this.generation = 1;
        this.numTestRound = 5;

        this.playMode = "record";
        this.start;
    }

    initGame (numTraffic=7) {
        // create road
        this.road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

        // create traffic on the road
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

    initCars () {
        this.cars= [];
        for (let i=0; i<500; i++){
            this.cars.push(new Car(this.road.getLaneCenter(1), 0, 30, 50, "AI"));
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
            car.update(this.road.border, this.traffic, true);
            // if (this.record == true && Math.random() > 0.8) {
            //     car.update(this.road.border, this.traffic, true);
            // } else {
            //     car.update(this.road.border, this.traffic);
            // }
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

        // add record sign
        if (this.record) {
            const recordSign = '\u2B24 REC';
            this.mainCtx.textAlign = "center";
            this.mainCtx.textBaseline = "middle";
            this.mainCtx.fillStyle = "red";
            this.mainCtx.font = 14 + "px Arial";
            this.mainCtx.beginPath();
            this.mainCtx.fillText(recordSign, this.mainCanvas.width * 0.83, this.mainCanvas.height * 0.95);
        }

        this.nnCtx.lineDashOffset = - time / 50;
        Visualizer.drawNetwork(this.nnCtx, mainCar.ai);
        this.requestID = requestAnimationFrame(this.start.bind(this));
    }

    // train nn by genetic algrothm
    evolution (testComplete=false) {
        /*    create car instance
        1. 1st gen no survivors => create all ai cars
        2. steps between gens => no change, reset car pos only
        3. not 1st gen with surviors => create ai cars base on surviors
        */
        if (this.survivors) {
            // TODO: separate to a evolve method
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
        } else if (testComplete == false) {
            this.cars.forEach(car=>{
                car.resetPos(this.road.getLaneCenter(1), false);
            });
        } else {
            this.initCars();
        }

        let startTime;
        this.start = (time) => {
            if (!startTime) {
                startTime = time;
            }

            // get top 5 score cars every 5000 ms and restart game
            if (time - startTime >= 5000 + Math.floor(this.generation/10) * 1000 ) {
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

    // manual play
    play (record=false) {
        if (this.requestID) {
            cancelAnimationFrame(this.requestID);
            this.mainCtx.clearRect(0, 0, this.mainCanvas.width, window.innerHeight);
        }
        this.record = record;

        let numTraffic = 7;
        if (record) {
            // increase traffic to tragger more different data;
            numTraffic = 12;
        }
        this.initGame(numTraffic);
        this.ai = false;
        this.start = this.animate;
        this.cars = [new Car(this.road.getLaneCenter(1), 0, 30, 50, "KEY", 5)];

        // add ai cars
        const trainedAi = window.localStorage.getItem('myStyle');
        if (!record && trainedAi) {
            let mySytle = new Car(this.road.getLaneCenter(1), 0, 30, 50, "AI");
            mySytle.ai = new FC(JSON.parse(trainedAi));
            this.cars.push(mySytle);

            // for (let i=0; i<100; i++){
            //     this.cars.push(new Car(this.road.getLaneCenter(1), 0, 30, 50, "AI"));
            // }
        }
        this.start();
    }

    getScore (car, time) {
        // return (car.y / 100) + Math.log(time);
        return (-car.y / 100);
    }
}
