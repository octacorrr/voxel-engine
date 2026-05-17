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

        // 2. Radio de visión (3 o 4 es ideal para móviles)
        const radio = 3; 

        // 3. NUEVO PRESUPUESTO: Permitimos construir hasta 3 chunks por cuadro para evitar zonas vacías
        let chunksCreadosEnEsteCuadro = 0;
        const maxChunksPorCuadro = 3; 

        for (let x = pCX - radio; x <= pCX + radio; x++) {
            for (let z = pCZ - radio; z <= pCZ + radio; z++) {
                const key = `${x},${z}`;
                
                // Si el chunk NO existe y aún tenemos presupuesto en este frame...
                if (!this.chunks[key] && chunksCreadosEnEsteCuadro < maxChunksPorCuadro) {
                    this.createChunk(x, z);
                    chunksCreadosEnEsteCuadro++; // Sumamos uno al contador
                }
            }
        }

        // 4. SISTEMA DE LIMPIEZA: Borra los chunks lejanos para liberar memoria
        for (const key in this.chunks) {
            const [cx, cz] = key.split(',').map(Number);

            if (Math.abs(cx - pCX) > radio || Math.abs(cz - pCZ) > radio) {
                const mesh = this.chunks[key];
                
                if (mesh && mesh !== true) {
                    this.scene.remove(mesh);          
                    mesh.geometry.dispose();         
                    if (mesh.material.dispose) mesh.material.dispose(); 
                }
                delete this.chunks[key];
            }
        }
    }

    createChunk(cx, cz) {
        const key = `${cx},${cz}`; 

        const chunk = new Chunk(cx, cz);
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                // Obtenemos la altura máxima de la superficie en esta coordenada
                const h = getTerrainHeight(cx * CHUNK_SIZE + x, cz * CHUNK_SIZE + z);
                
                // Rellenamos verticalmente desde el fondo (y = 0) hasta la altura máxima (h)
                for (let y = 0; y < h; y++) {
                    let blockId = 3; // Por defecto, asumimos que es Piedra (Gris)

                    if (y === h - 1) {
                        blockId = 1; // Si es el bloque más alto, es Césped (Verde)
                    } else if (y >= h - 4) {
                        blockId = 2; // Si está a menos de 4 bloques de la superficie, es Tierra (Café)
                    }

                    // Guardamos el bloque con su ID correspondiente
                    chunk.setBlock(x, y, z, blockId);
                }
            }
        }
        
        // Generamos la malla optimizada con InstancedMesh leyendo los IDs de color
        const mesh = this.meshBuilder.buildChunkMesh(chunk);
        
        if (mesh) {
            this.scene.add(mesh);
            this.chunks[key] = mesh; 
        } else {
            this.chunks[key] = true; 
            console.warn(`El chunk en ${cx}, ${cz} no generó malla visible.`);
        }
    } 
}
