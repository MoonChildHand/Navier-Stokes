import Foundation

class NavierStokesFourier {
    private var u: [[Double]]
    private var viscosity: Double
    private var density: Double

    init(gridSize: Int, viscosity: Double, density: Double) {
        self.u = Array(repeating: Array(repeating: 0.0, count: gridSize), count: gridSize)
        self.viscosity = viscosity
        self.density = density
    }

    func updateVelocityField() {
        let gridSize = u.count
        var laplacian = Array(repeating: Array(repeating: 0.0, count: gridSize), count: gridSize)

        for i in 1..<gridSize - 1 {
            for j in 1..<gridSize - 1 {
                laplacian[i][j] =
                    u[i + 1][j] + u[i - 1][j] + u[i][j + 1] + u[i][j - 1] - 4 * u[i][j]
            }
        }

        for i in 0..<gridSize {
            for j in 0..<gridSize {
                u[i][j] += viscosity * laplacian[i][j] / density
            }
        }
    }

    func hashVelocityField() -> String {
        let data = u.flatMap { $0 }.map { String($0) }.joined(separator: ",")
        let hash = data.sha256()
        return hash
    }
}

extension String {
    func sha256() -> String {
        if let stringData = self.data(using: String.Encoding.utf8) {
            return hexStringFromData(input: digest(input: stringData as NSData))
        }
        return ""
    }

    private func digest(input : NSData) -> NSData {
        let digestLength = Int(CC_SHA256_DIGEST_LENGTH)
        var hash = [UInt8](repeating: 0, count: digestLength)
        CC_SHA256(input.bytes, UInt32(input.length), &hash)
        return NSData(bytes: hash, length: digestLength)
    }

    private  func hexStringFromData(input: NSData) -> String {
        var bytes = [UInt8](repeating: 0, count: input.length)
        input.getBytes(&bytes, length: input.length)

        var hexString = ""
        for byte in bytes {
            hexString += String(format:"%02x", UInt8(byte))
        }

        return hexString
    }
}

let nsf = NavierStokesFourier(gridSize: 50, viscosity: 0.1, density: 1.0)
nsf.updateVelocityField()
print("Velocity Field Hash: \(nsf.hashVelocityField())")
