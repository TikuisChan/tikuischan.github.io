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
            const drawInput = i == 0;
            ctx.setLineDash([7, 3]);
            // arrows showing the input direction [up, left, right, down]
            const outputLabel = i == network.model.length - 1 ? [`\u25B2`, `\u25C0`, `\u25B6`, `\u25BC`] : [];
            Visualizer.drawLayer(ctx, network.model[i], left, layerTop, width, layerHeight, 18, drawInput, outputLabel);
        }
    }

    static drawLayer(ctx, layer, left, top, width, height, nodeRadius=18, drawInput=false, outputLabel=[]) {
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
                ctx.strokeStyle = getRGBA(layer.predict_prob[i]);
                ctx.stroke();
            }

        }
        if (drawInput) {
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
            ctx.fillStyle = getRGBA(layer.predict[i]);
            ctx.fill();

            ctx.beginPath()
            ctx.lineWidth = 2;
            ctx.strokeStyle = getRGBA(layer.bias[i]);
            ctx.arc(x, top, nodeRadius, 0, Math.PI *2);
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if (outputLabel[i]) {
                ctx.beginPath();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "black";
                ctx.strokeStyle = "white";
                ctx.font = nodeRadius * 0.9 + "px Arial";
                let textX = x;
                let textCenter = top;
                switch (i) {
                    case 0:
                        break;
                    case 3:
                        textCenter += nodeRadius * 0.1;
                        break;
                    case 1:
                        textX -= nodeRadius * 0.07;
                        textCenter += nodeRadius * 0.08;
                        break;
                    case 2:
                        textX += nodeRadius * 0.07;
                        textCenter += nodeRadius * 0.08;
                        break;
                }
                ctx.fillText(outputLabel[i], textX, textCenter);
                ctx.lineWidth = 0.5;
                ctx.strokeText(outputLabel[i], textX, textCenter);
            }
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