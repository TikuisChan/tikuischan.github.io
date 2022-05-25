class Controls {
    constructor () {
        this.forward = false;
        this.right = false;
        this.left = false;
        this.backward = false;

        this.#addKeyboardListeners();
    }

    #addKeyboardListeners () {
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                case "a":
                    this.left = true;
                    break;
                case "ArrowRight":
                case "d":
                    this.right = true;
                    break;
                case "ArrowUp":
                case "w":
                    this.forward = true;
                    break;
                case "s":
                case "ArrowDown":
                    this.backward = true;
                    break;
            }
        }
        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                case "a":
                    this.left = false;
                    break;
                case "ArrowRight":
                case "d":
                    this.right = false;
                    break;
                case "w":
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "s":
                case "ArrowDown":
                    this.backward = false;
                    break;
            }
        }
    }
}