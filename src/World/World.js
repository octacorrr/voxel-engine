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

    // CORREGIDO: Declaramos correctamente la función y abrimos la llave
    createChunk(cx, cz) {
        const key = `${cx},${cz}`; // Definimos la llave única de memoria para este chunk

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
            this.chunks[key] = mesh; // Memorizamos la malla para la próxima
        } else {
            this.chunks[key] = true; // Memorizamos que aquí está vacío para no re-calcular
            console.warn(`El chunk en ${cx}, ${cz} no generó malla visible.`);
        }
    } // Llave que cierra createChunk
} // Llave que cierra la clase World
