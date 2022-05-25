class Road {
    constructor (x, width, laneCount=3, roadLength=2000000) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = x - width / 2;
        this.right = x + width / 2;

        this.top = -roadLength / 2;
        this.bottom = roadLength / 2;

        const topLeft = {x: this.left, y: this.top};
        const bottomLeft = {x: this.left, y: this.bottom};
        const topRight = {x: this.right, y: this.top};
        const bottomRight = {x: this.right, y: this.bottom};
        this.border = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ]
    }

    getLaneCenter (laneNum) {
        let i = laneNum;
        const laneWidth = this.width / this.laneCount;
        if (laneNum < 0) {
            i = 0;
        } else if (laneNum >= this.laneCount) {
            i = this.laneCount - 1;
        }
        return this.left + i * laneWidth + laneWidth / 2;
    }

    draw (ctx) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        // dash lines inside the road
        for (let i = 1; i < this.laneCount; i++) {
            const x = this.left + (this.right - this.left) * i / this.laneCount;
            ctx.setLineDash([20, 20]);
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }
        // solid line at the border
        ctx.setLineDash([]);
        this.border.forEach(border=>{
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        });
    }
}
