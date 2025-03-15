import java.util.Arrays;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class NavierStokesFourier {
    private double[][] u; // 속도장 u
    private double viscosity;
    private double density;

    public NavierStokesFourier(int gridSize, double viscosity, double density) {
        this.u = new double[gridSize][gridSize];
        this.viscosity = viscosity;
        this.density = density;
    }

    public void updateVelocityField() {
        int n = u.length;
        double[][] laplacian = new double[n][n];

        for (int i = 1; i < n - 1; i++) {
            for (int j = 1; j < n - 1; j++) {
                laplacian[i][j] = u[i + 1][j] + u[i - 1][j] + u[i][j + 1] + u[i][j - 1] - 4 * u[i][j];
            }
        }

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                u[i][j] += viscosity * laplacian[i][j] / density;
            }
        }
    }

    public String hashVelocityField() throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(Arrays.deepToString(u).getBytes());
        StringBuilder hexString = new StringBuilder();

        for (byte b : hash) {
            hexString.append(Integer.toHexString(0xFF & b));
        }

        return hexString.toString();
    }

    public static void main(String[] args) throws NoSuchAlgorithmException {
        NavierStokesFourier nsf = new NavierStokesFourier(50, 0.1, 1.0);
        nsf.updateVelocityField();
        System.out.println("Velocity Field Hash: " + nsf.hashVelocityField());
    }
}
