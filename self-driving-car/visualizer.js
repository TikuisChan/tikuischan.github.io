class Visualizer {
    static drawNetwork(ctx, network) {
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        const layerHeight = height / network.model.length;
        for (let i = 0; i < network.model.length; i++) {
            let layerTop = network.model.length == 1? 0.5 : (network.model.length - i - 1) / (network.model.length - 1);
            layerTop = top + (height - layerHeight) * layerTop;
            Visualizer.drawLayer(ctx, network.model[i], left, layerTop, width, layerHeight);
        }
    }

    static drawLayer(ctx, layer, left, top, width, height, nodeRadius=18) {
        const bottom = top + height;
        for (let i = 0; i < layer.inputSize; i++) {
            for (let j = 0; j < layer.outputSize; j++) {
                ctx.beginPath();
                ctx.moveTo(
                    layer.inputSize == 1? 0.5: i / (layer.inputSize - 1) * width + left,
                    bottom
                )
                ctx.lineTo(
                    layer.outputSize == 1? 0.5: j / (layer.outputSize - 1) * width + left,
                    top
                )
                ctx.lineWidth = 2;
                ctx.strokeStyle = getRGBA(layer.weight[j][i]);
                ctx.stroke();
            }
        }
        for (let i = 0; i < layer.inputSize; i++) {
            let x = layer.inputSize == 1? 0.5: i / (layer.inputSize - 1);
            x = x * width + left;
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius, 0, Math.PI *2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI *2);
            ctx.fillStyle = getRGBA(layer.X[i]);
            ctx.fill();
        }
        for (let i = 0; i < layer.outputSize; i++) {
            let x = layer.outputSize == 1? 0.5: i / (layer.outputSize - 1);
            x = x * width + left;
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius, 0, Math.PI *2);
            ctx.fillStyle = "black";
            ctx.fill();            
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI *2);
            ctx.fillStyle = getRGBA(layer.output[i]);
            ctx.fill();

            ctx.beginPath()
            ctx.lineWidth = 2;
            ctx.strokeStyle = getRGBA(layer.bias[i]);
            ctx.arc(x, top, nodeRadius, 0, Math.PI *2);
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
        }        
    }
}

function getRGBA (value) {
    const aplha = Math.abs(value);
    const R = value < 0 ? 0:255;
    const G = R;
    const B = value < 0 ? 255:0;
    return "rgba(" + [R, G, B, aplha].join(",") + ")"
}