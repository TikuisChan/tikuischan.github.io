class FC {
    constructor (structure) {
        this.model = [];
        for (let i = 0; i < structure.length - 1; i++) {
            this.model.push(new Layer(structure[i], structure[i+1]));
        }
    }

    forward (X) {
        let xOut = [...X];
        this.model.forEach(layer => {
            xOut = layer.forward(xOut);
        })
        return xOut;
    }
}

class Layer {
    constructor (inputSize, outputSize, activate="step") {
        this.inputSize = inputSize;
        this.outputSize = outputSize;
        this.weight = Array.from(Array(outputSize), x => Array.from(Array(inputSize), x => Math.random() * 2 - 1));
        this.bias = Array.from(Array(outputSize), x => Math.random() * 2 - 1);
        switch (activate) {
            case "step":
                this.activate = x => (x > 0) * 1;
                break
        }
    }

    forward (X) {
        this.X = X;
        let output = [];
        for (let i = 0; i < this.outputSize; i++) {
            const w = this.weight[i];
            const b = this.bias[i];
            let wx = 0;
            for (let j = 0; j< w.length; j++){
                wx += w[j] * X[j];
            }
            output.push(wx + b);
        }
        this.output = output.map(x=>this.activate(x));
        return output.map(x=>this.activate(x));
    }
}
