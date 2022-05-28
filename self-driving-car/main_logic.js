function createGame () {
    // define canvas
    const myCanvas = document.getElementById("myCanvas");
    myCanvas.width = 200;
    const ctx = myCanvas.getContext("2d");
    
    // create road
    const road = new Road(myCanvas.width / 2, myCanvas.width * 0.9);

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
        myCanvas.height = window.innerHeight;

        ctx.save();
        ctx.translate(0, -car.y + myCanvas.height * 0.7);

        road.draw(ctx);
        car.draw(ctx);
        for (let i = 0; i < traffic.length; i++) {
            traffic[i].draw(ctx);
        }

        ctx.restore();
        requestAnimationFrame(animate);
    }
}
