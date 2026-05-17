import * as THREE from 'three';
import { CHUNK_SIZE } from '../Constants.js';

export class MeshBuilder {
    constructor() {
        // 1. Mantenemos el material en blanco puro por defecto, 
        // ya que los colores individuales se multiplicarán por este color.
        this.material = new THREE.MeshStandardMaterial({ color: 0xffffff });

        // 2. Definimos nuestra paleta de colores usando la clase Color de Three.js
        this.colors = {
            1: new THREE.Color(0x557a2b), // Verde Césped
            2: new THREE.Color(0x866043), // Café Tierra
            3: new THREE.Color(0x747474)  // Gris Piedra
        };
    }

    /**
     * Toma un objeto Chunk y devuelve una malla 3D optimizada con soporte de color
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
            for (let y = 0; y < 64; y++) { // Altura máxima definida de 64 bloques
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

                        // Leemos el color correspondiente al ID del bloque.
                        const colorTarget = this.colors[blockId] || this.colors[1];
                        mesh.setColorAt(instanceIndex, colorTarget);
                        
                        instanceIndex++;
                    }
                }
            }
        }

        // Le avisamos a Three.js que actualice los colores en la tarjeta de video
        mesh.instanceColor.needsUpdate = true;
        
        // Evitamos que Three.js oculte el chunk por error en las orillas de la pantalla
        mesh.frustumCulled = false; 

        return mesh;
    }
}
