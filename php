<?php

class NavierStokesFourier {
    private $u;
    private $viscosity;
    private $density;

    public function __construct($gridSize, $viscosity, $density) {
        $this->u = array_fill(0, $gridSize, array_fill(0, $gridSize, 0));
        $this->viscosity = $viscosity;
        $this->density = $density;
    }

    public function updateVelocityField() {
        $gridSize = count($this->u);
        $laplacian = array_fill(0, $gridSize, array_fill(0, $gridSize, 0));

        for ($i = 1; $i < $gridSize - 1; $i++) {
            for ($j = 1; $j < $gridSize - 1; $j++) {
                $laplacian[$i][$j] =
                    $this->u[$i + 1][$j] +
                    $this->u[$i - 1][$j] +
                    $this->u[$i][$j + 1] +
                    $this->u[$i][$j - 1] -
                    ($this->u[$i][$j] * 4);
            }
        }

        for ($i = 0; $i < $gridSize; $i++) {
            for ($j = 0; $j < $gridSize; $j++) {
                $this->u[$i][$j] += ($this->viscosity * $laplacian[$i][$j]) / $this->density;
            }
        }
    }

    public function hashVelocityField() {
        return hash("sha256", json_encode($this->u));
    }
}

$nsf = new NavierStokesFourier(50, .1, .5);
$nsf->updateVelocityField();
echo "Hash: " .
