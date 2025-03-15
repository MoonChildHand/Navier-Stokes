const crypto = require('crypto');

class NavierStokesWithFourier {
  /**
   * Navier-Stokes equations implementation with Fourier transform and velocity field analysis
   * @param {number} gridSize - Size of the grid
   * @param {number} timeSteps - Number of time steps for simulation
   * @param {number} viscosity - Fluid viscosity
   * @param {number} density - Fluid density
   */
  constructor(gridSize, timeSteps, viscosity, density) {
    this.gridSize = gridSize;
    this.timeSteps = timeSteps;
    this.viscosity = viscosity;
    this.density = density;
    
    // Initialize velocity fields
    this.u = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    this.v = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    
    // Initialize blockchain
    this.blockchain = [];
    this.createGenesisBlock();
  }

  /**
   * Create the first block in the blockchain
   */
  createGenesisBlock() {
    const genesisBlock = {
      index: 0,
      timestamp: new Date().toISOString(),
      data: "Genesis Block",
      previousHash: "0",
      hash: this.hashBlock("Genesis Block" + "0")
    };
    this.blockchain.push(genesisBlock);
  }

  /**
   * Create a SHA-256 hash of the given data
   * @param {string} blockData - Data to hash
   * @returns {string} - Hexadecimal hash string
   */
  hashBlock(blockData) {
    if (typeof blockData === 'object') {
      blockData = JSON.stringify(blockData);
    }
    return crypto.createHash('sha256').update(blockData).digest('hex');
  }

  /**
   * Add a new block to the blockchain
   * @param {string|object} data - Data to store in the block
   */
  addBlock(data) {
    const previousBlock = this.blockchain[this.blockchain.length - 1];
    const newBlock = {
      index: previousBlock.index + 1,
      timestamp: new Date().toISOString(),
      data: data,
      previousHash: previousBlock.hash,
    };
    newBlock.hash = this.hashBlock(newBlock);
    this.blockchain.push(newBlock);
  }

  /**
   * Apply Fourier transform to velocity fields
   * @returns {object} - Object containing FFT results for u and v
   */
  applyFourierTransform() {
    // In practice, you would use a library like fft.js
    // This is a simplified implementation
    
    const uFft = Array(this.gridSize).fill().map(() => 
      Array(this.gridSize).fill().map(() => ({ real: 0, imag: 0 }))
    );
    
    const vFft = Array(this.gridSize).fill().map(() => 
      Array(this.gridSize).fill().map(() => ({ real: 0, imag: 0 }))
    );
    
    // Initialize with original values (real part only)
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        uFft[i][j].real = this.u[i][j];
        vFft[i][j].real = this.v[i][j];
      }
    }
    
    // Note: In a real implementation, perform actual FFT here
    // This is a placeholder
    
    return { uFft, vFft };
  }

  /**
   * Update velocity field using Navier-Stokes equations
   */
  updateVelocityField() {
    for (let t = 0; t < this.timeSteps; t++) {
      const laplacianU = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
      const laplacianV = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
      
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          const ip1 = (i + 1) % this.gridSize;
          const im1 = (i - 1 + this.gridSize) % this.gridSize;
          const jp1 = (j + 1) % this.gridSize;
          const jm1 = (j - 1 + this.gridSize) % this.gridSize;
          
          laplacianU[i][j] = this.u[ip1][j] + this.u[im1][j] + 
                            this.u[i][jp1] + this.u[i][jm1] - 
                            4 * this.u[i][j];
                            
          laplacianV[i][j] = this.v[ip1][j] + this.v[im1][j] + 
                            this.v[i][jp1] + this.v[i][jm1] - 
                            4 * this.v[i][j];
        }
      }
      
      // Navier-Stokes time update
      for (let i = 0; i < this.gridSize; i++) {
        for (let j = 0; j < this.gridSize; j++) {
          this.u[i][j] += this.viscosity * laplacianU[i][j] / this.density;
          this.v[i][j] += this.viscosity * laplacianV[i][j] / this.density;
        }
      }
    }
  }

  /**
   * Calculate magnitude of a complex number
   * @param {object} complex - Complex number with real and imaginary parts
   * @returns {number} - Magnitude
   */
  complexAbs(complex) {
    return Math.sqrt(complex.real * complex.real + complex.imag * complex.imag);
  }

  /**
   * Analyze velocity field characteristics
   * @returns {object} - Analysis results
   */
  analyzeVelocityField() {
    const { uFft, vFft } = this.applyFourierTransform();
    
    // Calculate means
    let uMean = 0, vMean = 0;
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        uMean += this.u[i][j];
        vMean += this.v[i][j];
      }
    }
    uMean /= (this.gridSize * this.gridSize);
    vMean /= (this.gridSize * this.gridSize);
    
    // Calculate covariance matrix
    let covUU = 0, covUV = 0, covVV = 0;
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        covUU += (this.u[i][j] - uMean) * (this.u[i][j] - uMean);
        covUV += (this.u[i][j] - uMean) * (this.v[i][j] - vMean);
        covVV += (this.v[i][j] - vMean) * (this.v[i][j] - vMean);
      }
    }
    covUU /= (this.gridSize * this.gridSize - 1);
    covUV /= (this.gridSize * this.gridSize - 1);
    covVV /= (this.gridSize * this.gridSize - 1);
    
    // Calculate Mahalanobis distance
    const det = covUU * covVV - covUV * covUV;
    const invUU = covVV / det;
    const invUV = -covUV / det;
    const invVV = covUU / det;
    
    const mahalanobisDistance = uMean * uMean * invUU + 
                               2 * uMean * vMean * invUV + 
                               vMean * vMean * invVV;
    
    // Calculate hyperbolic velocity (simplified)
    const hyperbolicVelocityU = [];
    for (let i = 0; i < this.gridSize; i++) {
      hyperbolicVelocityU[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        const value = uFft[i][j];
        const magnitude = this.complexAbs(value);
        const coshValue = Math.cosh(Math.PI * magnitude);
        hyperbolicVelocityU[i][j] = {
          real: -value.imag / (coshValue * coshValue),
          imag: value.real / (coshValue * coshValue)
        };
      }
    }
    
    return {
      mahalanobis_distance: mahalanobisDistance,
      hyperbolic_velocity_u: hyperbolicVelocityU,
      fourier_transform_u: uFft,
      fourier_transform_v: vFft
    };
  }

  /**
   * Run simulation and record results in blockchain
   */
  simulateAndRecord() {
    for (let i = 0; i < 10; i++) {
      this.updateVelocityField();
      const analysisResults = this.analyzeVelocityField();
      
      // Calculate average FFT magnitude for time
      let fftSum = 0;
      const { uFft } = this.applyFourierTransform();
      for (let x = 0; x < this.gridSize; x++) {
        for (let y = 0; y < this.gridSize; y++) {
          fftSum += this.complexAbs(uFft[x][y]);
        }
      }
      const navierStokesTime = 1.0 / (fftSum / (this.gridSize * this.gridSize));
      
      // Create block data
      const blockData = {
        velocity_field_u: this.u,
        velocity_field_v: this.v,
        analysis_results: analysisResults,
        navier_stokes_time: navierStokesTime
      };
      
      this.addBlock(blockData);
    }
  }

  /**
   * Print blockchain data
   */
  printBlockchain() {
    console.log("Blockchain data:");
    this.blockchain.forEach(block => {
      console.log(`Block #${block.index}`);
      console.log(`  Timestamp: ${block.timestamp}`);
      console.log(`  Hash: ${block.hash}`);
      console.log(`  Previous Hash: ${block.previousHash}`);
      
      let displayData;
      if (typeof block.data === 'object') {
        displayData = "Object data (truncated)";
      } else {
        displayData = block.data.length > 50 ? 
          block.data.substring(0, 50) + "..." : block.data;
      }
      console.log(`  Data: ${displayData}`);
      console.log();
    });
  }
}

// Example usage
const nsSimulator = new NavierStokesWithFourier(50, 100, 0.1, 1.0);
nsSimulator.simulateAndRecord();
nsSimulator.printBlockchain();
