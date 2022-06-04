class FC {
    constructor (structure, mutate=false) {
        this.model = [];
        if (structure instanceof Array) {
            // define a new model by array
            for (let i = 0; i < structure.length - 2; i++) {
                const newLayer = new Layer(structure[i], structure[i+1], "relu")
                newLayer.initLayer();
                this.model.push(newLayer);
            }
            const lastLayer = new Layer(structure[structure.length - 2], structure[structure.length - 1], "step");
            lastLayer.initLayer();
            this.model.push(lastLayer);
        } else if (structure instanceof FC) {
            // copy a existing model
            structure.model.forEach(layer=>{
                const newLayer = new Layer(layer.inputSize, layer.outputSize, layer.activate);
                for (let i = 0; i < layer.weight.length; i++) {
                    newLayer.bias[i] = layer.bias[i];
                    for (let j = 0; j < newLayer.weight[i].length; j++) {
                        newLayer.weight[i][j] = layer.weight[i][j];
                    }
                }
                this.model.push(newLayer);
            });
            if (mutate) {
                this.mutate();
            }
        }
    }

    forward (X) {
        let xOut = [...X];
        this.model.forEach(layer => {
            xOut = layer.forward(xOut);
        })
        return xOut;
    }

    mutate (rate=0.1) {
        this.model.forEach(layer => {
            for (let i = 0; i < layer.weight.length; i++) {
                for (let j = 0; j < layer.weight[i].length; j++) {
                    if (Math.random() <= rate) {
                        layer.weight[i][j] = Math.random() * 2 - 1;
                    }
                }
            }
        });
    }
}

class Layer {
    constructor (inputSize, outputSize, activate="step") {
        this.inputSize = inputSize;
        this.outputSize = outputSize;
        this.activate = activate;
        this.weight = Array.from(Array(this.outputSize), x => Array.from(Array(this.inputSize), x => 0));
        this.bias = Array.from(Array(this.outputSize), x => 0);
        switch (activate) {
            case "step":
                this.activate = X => X.map(x=>(x > 0) * 1);
                break;
            case "softmax":
                this.activate = softMax;
                break;
            case "tanh":
                this.activate = tanh;
                break;
            case "sigmoid":
                this.activate = sigmoid;
                break;
            case "relu":
                this.activate = relu;
                break;
        }
    }

    initLayer () {
        this.weight = Array.from(Array(this.outputSize), x => Array.from(Array(this.inputSize), x => Math.random() * 2 - 1));
        this.bias = Array.from(Array(this.outputSize), x => Math.random() * 2 - 1);
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
        this.predict = this.activate(output);
        this.predict_prob = softMax(output);
        return this.predict;
    }

    mutate (rate) {
        for (let i = 0; i < this.outputSize; i++) {
            for (let j = 0; j < this.inputSize; j++) {

            }
        }
    }
}
/*
Reference for neuroevolution:
1. Evolving Neural Networks
   A tutorial on evolutionary algorithms
   https://towardsdatascience.com/evolving-neural-networks-b24517bb3701

2. 

*/
