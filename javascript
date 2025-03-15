const crypto = require("crypto");

class NavierStokesFourier {
    constructor(gridSize, viscosity, density) {
        this.u = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
        this.viscosity = viscosity;
        this.density = density;
    }

    updateVelocityField() {
        const gridSize = this.u.length;
        const laplacian = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

        for (let i = 1; i < gridSize - 1; i++) {
            for (let j = 1; j < gridSize - 1; j++) {
                laplacian[i][j] =
                    this.u[i + 1][j] +
                    this.u[i - 1][j] +
                    this.u[i][j + 1] +
                    this.u[i][j - 1] -
                    4 * this.u[i][j];
            }
        }

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                this.u[i][j] += (this.viscosity * laplacian[i][j]) / this.density;
            }
        }
    }

    hashVelocityField() {
        const hash = crypto.createHash("sha256");
        hash.update(JSON.stringify(this.u));
        return hash.digest("hex");
    }
}

const nsf = new NavierStokesFourier(50, 0.1, 1.0);
nsf.updateVelocityField();
console.log("Velocity Field Hash:", nsf.hashVelocityField());
