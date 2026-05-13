
import { World } from './src/World/World.js';

// main.js - Versión Integrada
import * as THREE from 'three';
// Importamos los controles que acabas de crear
import { Controls } from './src/Player/Controls.js';

// 1. ESCENA Y NIEBLA (Para que se vea como Minecraft)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); 
scene.fog = new THREE.Fog(0x87CEEB, 10, 100);

// 2. CÁMARA
const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
);
// Posición inicial del jugador (un poco elevados del suelo)
camera.position.set(0, 10, 0); 

// 3. RENDERIZADOR
const canvas = document.querySelector('#game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// 4. LUCES
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);


const world = new World(scene);
world.generateArea(0, 0); // Crea los bloques iniciales


const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(5, 50, 5);
scene.add(sunLight);

// 5. INICIALIZAR CONTROLES
const playerControls = new Controls(camera, canvas);

// El reloj es vital para que el movimiento no dependa de la velocidad de los FPS
const clock = new THREE.Clock();

// 6. AJUSTE DE VENTANA
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 7. BUCLE DE ANIMACIÓN (Game Loop)
function animate() {
    requestAnimationFrame(animate);
    
    // Delta es el tiempo que pasó desde el último cuadro
    const delta = clock.getDelta();
    
    // Actualizamos la posición del jugador según las teclas presionadas
    playerControls.update(delta);

    renderer.render(scene, camera);
}

console.log("Motor y Controles listos.");
animate();
