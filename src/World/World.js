import { Chunk } from './Chunk.js';
import { MeshBuilder } from './MeshBuilder.js';
import { getTerrainHeight } from '../Utils/Noise.js';
import { CHUNK_SIZE } from '../Constants.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.meshBuilder = new MeshBuilder();
        this.chunks = {};
    }

    generateArea(playerX, playerZ) {
        // Generamos un área de 3x3 chunks alrededor del jugador
        for (let x = -1; x <= 1; x++) {
            for (let z = -1; z <= 1; z++) {
                this.createChunk(x, z);
            }
        }
    }

    createChunk(cx, cz) {
        const chunk = new Chunk(cx, cz);
        // Llenar datos con el ruido procedural
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const h = getTerrainHeight(cx * CHUNK_SIZE + x, cz * CHUNK_SIZE + z);
                for (let y = 0; y < h; y++) {
                    chunk.setBlock(x, y, z, 1);
                }
            }
        }
        // Crear la malla visible y añadirla a la escena
        const mesh = this.meshBuilder.buildChunkMesh(chunk);
        this.scene.add(mesh);
    }
}
