// src/World/World.js
import { Chunk } from './Chunk.js';
import { getTerrainHeight } from '../Utils/Noise.js';
import { CHUNK_SIZE } from '../Constants.js';

export class World {
    constructor() {
        this.chunks = {}; // Diccionario para guardar los chunks por coordenadas
    }

    // Genera un nuevo sector del mundo
    generateChunk(chunkX, chunkZ) {
        const chunk = new Chunk(chunkX, chunkZ);
        const key = `${chunkX},${chunkZ}`;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                // Obtenemos la altura matemática del terreno para este punto
                const worldX = chunkX * CHUNK_SIZE + x;
                const worldZ = chunkZ * CHUNK_SIZE + z;
                const surfaceHeight = getTerrainHeight(worldX, worldZ);

                for (let y = 0; y < 32; y++) {
                    if (y < surfaceHeight) {
                        // ID 1 = Tierra/Pasto
                        chunk.setBlock(x, y, z, 1);
                    } else {
                        // ID 0 = Aire
                        chunk.setBlock(x, y, z, 0);
                    }
                }
            }
        }

        this.chunks[key] = chunk;
        return chunk;
    }
}
