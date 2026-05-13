import * as THREE from 'three';
import { CHUNK_SIZE } from '../Constants.js';

export class MeshBuilder {
    constructor() {
        // Definimos un material básico (puedes cambiar el color a 0x55aa55 para verde pasto)
        this.material = new THREE.MeshStandardMaterial({ color: 0x55aa55 });
    }

    /**
     * Toma un objeto Chunk y devuelve una malla 3D optimizada
     */
    buildChunkMesh(chunk) {
        // 1. Contamos cuántos bloques sólidos existen (que no sean aire ID: 0)
        let solidBlocksCount = 0;
        for (let i = 0; i < chunk.data.length; i++) {
            if (chunk.data[i] !== 0) solidBlocksCount++;
        }

        // Si el chunk está vacío, no generamos nada
        if (solidBlocksCount === 0) return null;

        // 2. Creamos la geometría base (un cubo de 1x1x1)
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        
        // 3. Usamos InstancedMesh para alto rendimiento
        const mesh = new THREE.InstancedMesh(geometry, this.material, solidBlocksCount);
        
        const matrix = new THREE.Matrix4();
        let instanceIndex = 0;

        // 4. Recorremos el arreglo 3D del chunk
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < 32; y++) { // Altura máxima definida
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.getBlock(x, y, z);
                    
                    if (blockId !== 0) {
                        // Calculamos la posición absoluta en el mundo
                        const worldX = chunk.x * CHUNK_SIZE + x;
                        const worldY = y;
                        const worldZ = chunk.z * CHUNK_SIZE + z;

                        // Aplicamos la posición a la matriz del bloque
                        matrix.setPosition(worldX, worldY, worldZ);
                        
                        // Añadimos la instancia a la malla
                        mesh.setMatrixAt(instanceIndex, matrix);
                        instanceIndex++;
                    }
                }
            }
        }

        return mesh;
    }
}
