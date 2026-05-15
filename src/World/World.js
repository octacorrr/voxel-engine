import { Chunk } from './Chunk.js';
import { MeshBuilder } from './MeshBuilder.js';
import { getTerrainHeight } from '../Utils/Noise.js';
import { CHUNK_SIZE } from '../Constants.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.meshBuilder = new MeshBuilder();
        this.chunks = {}; // Diccionario para memorizar chunks creados
    }

    generateArea(playerX, playerZ) {
        const pCX = Math.floor(playerX / CHUNK_SIZE);
        const pCZ = Math.floor(playerZ / CHUNK_SIZE);
        const radio = 3; 

        for (let x = pCX - radio; x <= pCX + radio; x++) {
            for (let z = pCZ - radio; z <= pCZ + radio; z++) {
                this.createChunk(x, z);
            }
        }
    }

    createChunk(cx, cz) {
        // EL SEGURO: Creamos una llave única para el chunk (ej: "2,3")
        const key = `${cx},${cz}`;
        
        // Si ya existe en memoria, salimos inmediatamente y no gastamos recursos
        if (this.chunks[key]) return;

        const chunk = new Chunk(cx, cz);
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const h = getTerrainHeight(cx * CHUNK_SIZE + x, cz * CHUNK_SIZE + z);
                for (let y = 0; y < h; y++) {
                    chunk.setBlock(x, y, z, 1);
                }
            }
        }
        
        const mesh = this.meshBuilder.buildChunkMesh(chunk);
        
        if (mesh) {
            this.scene.add(mesh);
            this.chunks[key] = mesh; // Memorizamos la malla para la próxima
        } else {
            this.chunks[key] = true; // Memorizamos que aquí está vacío para no re-calcular
            console.warn(`El chunk en ${cx}, ${cz} no generó malla visible.`);
        }
    }
}
