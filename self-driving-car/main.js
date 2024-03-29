class Game {
    constructor (mainCanvasWidth=200, nnCanvasWidth=400, config={}) {
        // define canvas
        this.mainCanvas = document.getElementById("carCanvas");
        this.mainCanvas.width = mainCanvasWidth;
        this.mainCtx = this.mainCanvas.getContext("2d");
    
        this.nnCanvas = document.getElementById("nnCanvas");
        this.nnCanvas.width = nnCanvasWidth;
        this.nnCtx = this.nnCanvas.getContext("2d");

        this.initChart();

        this.ai = true;
        this.generation = 0;
        this.NUM_TEST_ROUND = 0;
        this.numTestRound = this.NUM_TEST_ROUND;
        this.traffic = [];
        this.playMode = "record";

        this.aiConfig = {
            numRay: 5,
            hiddenLayer: [8, 8],
        };

        this.evoConfig = {
            mutation: true,
            mutationRate: 0.05,
            crossover: false
        }

        this.start;
    }

    initChart () {
        // init chart.js
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
    }

    initGame (traffic=true) {
        // create road
        this.road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

        // create traffic on the road
        if (traffic) {
            // 1. by random[very hard, very generalize, final goal]
            // this.traffic = [new Car(this.road.getLaneCenter(1), -350, 30, 50, "DUMMY")];
            // for (let i = 0; i < numTraffic; i++) {
            //     let dummyY;
            //     if (Math.random() > 0.3) {
            //         dummyY = - (i+1) * 200;
            //     } else {
            //         dummyY = - (i+1) * 240;
            //     }
            //     const lane = getRandomInt(3);
            //     this.traffic.push(
            //         new Car(this.road.getLaneCenter(lane), dummyY, 30, 50, "DUMMY")
            //     );
            // }

            // 2. Three layers of cars, fixed pattern [easiest, easily overfit and remember the pattern]
            // 1st layer: 1 car at the middle
            this.traffic = [new Car(this.road.getLaneCenter(1), -200, 30, 50, "DUMMY")];
            // 2nd layer: hole at the middle
            this.traffic.push(new Car(this.road.getLaneCenter(0), -400, 30, 50, "DUMMY"));
            this.traffic.push(new Car(this.road.getLaneCenter(2), -400, 30, 50, "DUMMY"));
            // 3rd layer: hole at the right
            this.traffic.push(new Car(this.road.getLaneCenter(0), -600, 30, 50, "DUMMY"));
            this.traffic.push(new Car(this.road.getLaneCenter(1), -600, 30, 50, "DUMMY"));
            // 4rd layer: hole at the left
            this.traffic.push(new Car(this.road.getLaneCenter(2), -800, 30, 50, "DUMMY"));
            this.traffic.push(new Car(this.road.getLaneCenter(1), -800, 30, 50, "DUMMY"));
        }
    }

    initAiCars () {
        this.cars= [];
        for (let i=0; i<500; i++){
            this.cars.push(new Car(this.road.getLaneCenter(1), 0, 30, 50, "AI", this.aiConfig.numRay, this.aiConfig.hiddenLayer));
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
            // if (this.traffic[i].y - mainCar.y > 200) {
            //     const lane = getRandomInt(3);
            //     const dummyY = mainCar.y - (i+1) * 300;
            //     this.traffic[i] = new Car(this.road.getLaneCenter(lane), dummyY, 30, 50, "DUMMY");
            // }
            this.traffic[i].update(this.road.border, []);
        }

        this.cars.forEach(car => {
            car.update(this.road.border, this.traffic, true);
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
        this.ai = true;
        if (this.survivors) {
            // TODO: separate to a evolve method
            this.cars = []
            this.survivors.forEach(survivor => {
                survivor.resetPos(this.road.getLaneCenter(1), true);
            });
            this.survivors.forEach(parent => {
                for (let i=0; i<100; i++){
                    const child = new Car(this.road.getLaneCenter(1), 0, 30, 50, "AI", this.aiConfig.numRay, this.aiConfig.hiddenLayer);
                    child.ai = new FC(parent.ai, i > 0);
                    if (this.evoConfig.mutation) {
                        child.ai.mutate(this.evoConfig.mutationRate);
                    }
                    this.cars.push(child);
                }
            })
        } else if (testComplete == false) {
            this.cars.forEach(car=>{
                car.resetPos(this.road.getLaneCenter(1), false);
            });
        } else {
            this.initAiCars();
        }

        let startTime;
        this.start = (time) => {
            if (!startTime) {
                startTime = time;
            }

            // get top 5 score cars every 5000 ms and restart game
            if (time - startTime >= 5000 + Math.floor(this.generation/3) * 1000 ) {
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
                    this.numTestRound = this.NUM_TEST_ROUND;
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
    play (record=false, traffic=true) {
        if (this.requestID) {
            cancelAnimationFrame(this.requestID);
            this.mainCtx.clearRect(0, 0, this.mainCanvas.width, window.innerHeight);
        }
        this.record = record;

        this.initGame(traffic);
        this.ai = false;
        this.start = this.animate;
        this.cars = [new Car(this.road.getLaneCenter(1), 0, 30, 50, "KEY", this.aiConfig.numRay, this.aiConfig.hiddenLayer)];

        // add ai cars
        const trainedAi = window.localStorage.getItem('myStyle');
        if (!record && trainedAi) {
            let mySytle = new Car(this.road.getLaneCenter(1), 0, 30, 50, "AI");
            mySytle.ai = new FC(JSON.parse(trainedAi));
            this.cars.push(mySytle);
        }
        this.start();
    }

    configAI (numRay, numLayer, numNeuron) {
        let hiddenLayer = [];
        for (let i=0; i < numLayer; i++) {
            hiddenLayer.push(numNeuron);
        }
        this.aiConfig = {
            numRay: numRay,
            hiddenLayer: hiddenLayer
        };
    }

    configEvo (mutation, crossover) {
        this.evoConfig.mutation = mutation;
        this.evoConfig.crossover = crossover;
        
    }

    getScore (car, time) {
        // return (car.y / 100) + Math.log(time);
        return (-car.y / 100);
    }
 }
