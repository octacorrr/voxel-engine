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
        // 1. Calculamos el chunk donde está parado el jugador
        const pCX = Math.floor(playerX / CHUNK_SIZE);
        const pCZ = Math.floor(playerZ / CHUNK_SIZE);

        // 2. Bajamos el radio a 2 (Área de 5x5). Para pantallas de móvil es ideal y más ligero.
        const radio = 2; 

        // 3. SEGURO ANTI-LAG: Bandera para limitar la generación masiva
        let chunkCreadoEsteCuadro = false;

        for (let x = pCX - radio; x <= pCX + radio; x++) {
            for (let z = pCZ - radio; z <= pCZ + radio; z++) {
                const key = `${x},${z}`;
                
                // Si el chunk NO existe en memoria y aún no hemos creado uno en este frame...
                if (!this.chunks[key] && !chunkCreadoEsteCuadro) {
                    this.createChunk(x, z);
                    
                    // Activamos la bandera para bloquear los demás loops por este milisegundo
                    chunkCreadoEsteCuadro = true; 
                }
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
