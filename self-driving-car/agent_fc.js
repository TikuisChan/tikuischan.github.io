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
            const lastLayer = new Layer(structure[structure.length - 2], structure[structure.length - 1], "sigmoid");
            lastLayer.initLayer();
            this.model.push(lastLayer);
        } else if (structure instanceof FC) {
            // copy existing model
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
                if (Math.random() <= rate) {
                    layer.bias[i] = Math.random() * 2 - 1;
                }
                for (let j = 0; j < layer.weight[i].length; j++) {
                    if (Math.random() <= rate) {
                        layer.weight[i][j] = Math.random() * 2 - 1;
                    }
                }
            }
        });
    }

    fit (X, Y) {
        let dH = this.forward(X);
        for (let i = 0; i < dH.length; i++) {
            dH[i] = Y[i] - dH[i];
        }
        for (let i = 0; i < this.model.length; i++) {
            dH = this.model[this.model.length - 1 - i].backward(dH);
        }
    }
}

class Layer {
    /*
    X: input (single data)
    Y: output (single data)
    W / weight: weight of the layer (matrix) W[i = dimension of output][j = dimension of input] 
    b: bias of the layer, same dimension of output
    Z: W*X + b
    activate: activation function
    A: activate(W*X + b)
    */
    constructor (inputSize, outputSize, activate="step") {
        this.inputSize = inputSize;
        this.outputSize = outputSize;
        this.activate_type = activate;
        this.weight = Array.from(Array(this.outputSize), x => Array.from(Array(this.inputSize), x => 0));
        this.bias = Array.from(Array(this.outputSize), x => 0);
        switch (activate) {
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
        // store input batch, for display and backward
        this.X = X;
        const Z = this.getZ(X);
        this.predict = this.activate(Z);
        this.predict_prob = softMax(Z);
        return this.predict;
    }

    mutate (rate) {
        // randomly change(mutate) weight component base on mutation rate
        for (let i = 0; i < this.weight.length; i++) {
            if (Math.random() <= rate) {
                this.bias[i] = Math.random() * 2 - 1;
            }
            for (let j = 0; j < this.weight[i].length; j++) {
                if (Math.random() <= rate) {
                    this.weight[i][j] = Math.random() * 2 - 1;
                }
            }
        }
    }

    getZ (X) {
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
        return output;
    }

    backward (dH, learningRate=0.05) {
        // SGD
        const Z = this.getZ(this.X);
        let dX = Array.from(Array(this.inputSize), x=>0);
        let dA;
        switch (this.activate_type) {
            case "sigmoid":
                dA = this.dSigmoid;
                break;
                case "relu":
                    dA = this.dRelu;
                    break;
                }
                
        let delta = [];
        for (let i = 0; i < dH.length; i++) {
            delta.push(dH[i] * dA(Z[i]));
        }
        for (let i = 0; i < this.weight.length; i++) {
            for (let j = 0; j < this.weight[i].length; j ++) {
                this.weight[i][j] -= learningRate * delta[i] * this.X[j];
                dX[j] += delta[i] * this.weight[i][j];
            }
        }
        return dX;
    }

    dSigmoid (z) {
        return sigmoid([z]) * (1 - sigmoid([z]));
    }

    dRelu(Z) {
        return (Z > 0? 1 : 0);
    }
}
/*
Reference for neuroevolution:
1. Evolving Neural Networks
   A tutorial on evolutionary algorithms
   https://towardsdatascience.com/evolving-neural-networks-b24517bb3701
*/
