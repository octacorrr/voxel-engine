// src/World/Chunk.js
import { CHUNK_SIZE } from '../Constants.js';

export class Chunk {
    constructor(x, z) {
        this.x = x;
        this.z = z;
        // Contenedor de datos optimizado para 16x64x16 bloques
        this.data = new Uint8Array(CHUNK_SIZE * 64 * CHUNK_SIZE);
    }

    // CORREGIDO: Fórmula matemática matemática exacta para indexación 3D a 1D
    getIndex(x, y, z) {
        // x va directo (ancho)
        // z se multiplica por el ancho de una fila (CHUNK_SIZE)
        // y se multiplica por la capa completa de la base (CHUNK_SIZE * CHUNK_SIZE)
        return x + (z * CHUNK_SIZE) + (y * CHUNK_SIZE * CHUNK_SIZE);
    }

    setBlock(x, y, z, id) {
        // Validación de seguridad para que nunca intente escribir fuera del arreglo de 64
        if (y >= 0 && y < 64 && x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            this.data[this.getIndex(x, y, z)] = id;
        }
    }

    getBlock(x, y, z) {
        if (y >= 0 && y < 64 && x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
            return this.data[this.getIndex(x, y, z)];
        }
        return 0; // Si busca fuera del mapa, asumimos que es aire
    }
}
