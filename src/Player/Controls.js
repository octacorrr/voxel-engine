import * as THREE from 'three';
import { getTerrainHeight } from '../Utils/Noise.js'; // Importamos el ruido para leer el mapa

export class Controls {
    constructor(camera, world) { // <-- Ahora recibimos también el world
        this.camera = camera;
        this.world = world;

        this.moveForward = false;
        
        // --- NUEVAS VARIABLES FÍSICAS ---
        this.velocity = new THREE.Vector3();
        this.gravity = -22.0;       // Fuerza de caída ajustable (más alta = caída más firme)
        this.playerHeight = 1.8;    // Altura de los ojos del jugador
        this.speed = 8.0;           // Velocidad al caminar por los bloques
        this.isGrounded = false;    // Indica si pisamos suelo firme

        // Identificador para el dedo del giro
        this.touchSteerId = null; 
        this.previousTouch = { x: 0, y: 0 };

        // Forzar orden correcto de rotación para evitar giros locos
        this.camera.rotation.order = 'YXZ';

        this.createMoveButton();
        this.initMobileControls();
    }

    createMoveButton() {
        this.button = document.createElement('div');
        this.button.style.position = 'absolute';
        this.button.style.bottom = '50px';
        this.button.style.left = '50px';
        this.button.style.width = '90px';
        this.button.style.height = '90px';
        this.button.style.borderRadius = '50%';
        this.button.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
        this.button.style.border = '3px solid rgba(255, 255, 255, 0.6)';
        this.button.style.zIndex = '9999';
        this.button.style.touchAction = 'none';
        
        this.button.style.display = 'flex';
        this.button.style.alignItems = 'center';
        this.button.style.justifyContent = 'center';
        this.button.style.color = 'white';
        this.button.style.fontSize = '24px';
        this.button.style.fontWeight = 'bold';
        this.button.innerHTML = '▲';

        document.body.appendChild(this.button);

        this.button.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            this.moveForward = true;
            this.button.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        }, { passive: false });

        this.button.addEventListener('touchend', (e) => {
            e.stopPropagation();
            this.moveForward = false;
            this.button.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
        }, { passive: false });
    }

    initMobileControls() {
        document.addEventListener('touchstart', (e) => {
            if (this.touchSteerId !== null) return;
            const touch = e.changedTouches[0];
            this.touchSteerId = touch.identifier;
            this.previousTouch.x = touch.pageX;
            this.previousTouch.y = touch.pageY;
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.touchSteerId) {
                    const deltaX = touch.pageX - this.previousTouch.x;
                    const deltaY = touch.pageY - this.previousTouch.y;

                    this.camera.rotation.y -= deltaX * 0.004;
                    this.camera.rotation.x -= deltaY * 0.004;

                    this.camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.camera.rotation.x));

                    this.previousTouch.x = touch.pageX;
                    this.previousTouch.y = touch.pageY;
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.touchSteerId) {
                    this.touchSteerId = null;
                }
            }
        }, { passive: false });
    }

    update(delta) {
        // 1. Aplicamos gravedad si no estamos tocando tierra firme
        if (!this.isGrounded) {
            this.velocity.y += this.gravity * delta;
        }

        // 2. Lógica de avance horizontal (No volamos si miramos arriba/abajo)
        if (this.moveForward) {
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction); // Obtenemos a dónde apunta la cámara
            direction.y = 0;                          // Anulamos el eje vertical para no enterrarnos o volar
            direction.normalize();                    // Reajustamos la fuerza del vector
            
            // Movemos la posición de la cámara en los ejes X y Z
            this.camera.position.addScaledVector(direction, this.speed * delta);
        }

        // 3. Modificamos la altura real aplicando la gravedad calculada
        this.camera.position.y += this.velocity.y * delta;

        // 4. --- DETECTOR DE COLISIÓN CON EL SUELO ---
        const playerX = this.camera.position.x;
        const playerZ = this.camera.position.z;
        
        // Le preguntamos al Noise la altura exacta del terreno debajo del jugador
        const sueloY = getTerrainHeight(Math.floor(playerX), Math.floor(playerZ));

        // Si la cámara baja del nivel del suelo + la altura de sus ojos...
        if (this.camera.position.y - this.playerHeight <= sueloY) {
            this.camera.position.y = sueloY + this.playerHeight; // Lo anclamos a la superficie
            this.velocity.y = 0;                                  // Detenemos la velocidad de caída
            this.isGrounded = true;                               // Activamos bandera de suelo
        } else {
            this.isGrounded = false;                              // Seguimos en caída libre
        }
    }
}
