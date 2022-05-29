function createGame () {
    // define canvas
    const carCanvas = document.getElementById("carCanvas");
    carCanvas.width = 200;
    const carCtx = carCanvas.getContext("2d");

    const nnCanvas = document.getElementById("nnCanvas");
    nnCanvas.width = 300;
    const nnCtx = nnCanvas.getContext("2d");
    
    // create road
    const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

    // create car instance
    const car = new Car(road.getLaneCenter(1), 100, 30, 50, "KEY");

    // create traffic on the road
    const traffic = [new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY")];

    // start game
    animate();

    function animate () {
        for (let i = 0; i < traffic.length; i++) {
            traffic[i].update(road.border, []);
        }

        car.update(road.border, traffic);
        // draw will reset when re-define canvas height
        carCanvas.height = window.innerHeight;
        nnCanvas.height = window.innerHeight;

        carCtx.save();
        carCtx.translate(0, -car.y + carCanvas.height * 0.7);

        road.draw(carCtx);
        car.draw(carCtx, "blue");
        for (let i = 0; i < traffic.length; i++) {
            traffic[i].draw(carCtx, "red");
        }

        carCtx.restore();
        Visualizer.drawNetwork(nnCtx, car.ai);
        requestAnimationFrame(animate);
    }
}
