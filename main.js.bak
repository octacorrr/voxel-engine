import * as THREE from 'three';
import { Controls } from './src/Player/Controls.js';
import { World } from './src/World/World.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Inicializamos al personaje cerca del suelo para que no flote en el vacío
camera.position.set(16, 10, 16); 

const canvas = document.querySelector('#game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- LUCES ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(10, 50, 10);
scene.add(sunLight);

// --- EL MUNDO ---
const world = new World(scene);
// Generación inicial basada en donde arranca la cámara
world.generateArea(camera.position.x, camera.position.z); 

// --- CONTROLES Y SISTEMA DE TIEMPO ---
// ACTUALIZADO: Pasamos 'world' como segundo parámetro para que funcione la gravedad y colisión de suelo
const playerControls = new Controls(camera, world); 
const clock = new THREE.Clock(); 

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta(); 
    
    // Los controles usan el delta y la información del mundo para calcular la física de caída
    playerControls.update(delta);

    // Mapeo dinámico e infinito en tiempo real con optimización anti-lag de 1 chunk por frame
    world.generateArea(camera.position.x, camera.position.z);

    renderer.render(scene, camera);
}

// ARRANQUE: Encendemos el bucle del juego
animate();
