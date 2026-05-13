// src/Utils/Noise.js

// Función matemática para generar un valor pseudo-aleatorio suave
// Esto simula la elevación del terreno basándose en coordenadas X y Z
export function getTerrainHeight(x, z) {
    // Escala de las colinas (mientras más pequeño, más anchas las montañas)
    const scale = 0.05;
    const amplitude = 12; // Altura máxima de las montañas
    
    // Usamos una combinación de senos y cosenos para simular "ruido" natural
    // En una fase avanzada, aquí importarías una librería de Perlin/Simplex Noise
    const height = (Math.sin(x * scale) + Math.cos(z * scale)) * amplitude;
    
    // Retornamos la altura desplazada hacia arriba (piso base)
    return Math.floor(height + 15); 
}
