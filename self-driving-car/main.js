function createGame () {
    // define canvas
    const carCanvas = document.getElementById("carCanvas");
    carCanvas.width = 200;
    const carCtx = carCanvas.getContext("2d");
    
    // create road
    const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

    // create car instance
    const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");

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

        carCtx.save();
        carCtx.translate(0, -car.y + carCanvas.height * 0.7);

        road.draw(carCtx);
        car.draw(carCtx);
        for (let i = 0; i < traffic.length; i++) {
            traffic[i].draw(carCtx);
        }

        carCtx.restore();
        requestAnimationFrame(animate);
    }
}
