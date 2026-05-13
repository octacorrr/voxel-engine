// main.js completo
import * as THREE from 'three';
import { Controls } from './src/Player/Controls.js';
import { World } from './src/World/World.js'; // Verifica que la ruta sea idéntica

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8, 25, 8); // Subimos la cámara para ver el terreno desde arriba

const canvas = document.querySelector('#game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- LUCES ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

// --- EL MUNDO (Esto es lo que falta activar) ---
const world = new World(scene);
world.generateArea(0, 0); 

const playerControls = new Controls(camera, canvas);
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    playerControls.update(delta);
    renderer.render(scene, camera);
}
animate();
