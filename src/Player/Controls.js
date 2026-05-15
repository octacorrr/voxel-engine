import * as THREE from 'three';

export class Controls {
    constructor(camera) {
        this.camera = camera;
        this.moveForward = false;
        
        // Identificador para el dedo del giro
        this.touchSteerId = null; 
        this.previousTouch = { x: 0, y: 0 };

        // Forzar orden correcto de rotación para evitar giros locos
        this.camera.rotation.order = 'YXZ';

        this.createMoveButton();
        this.initMobileControls();
    }

    createMoveButton() {
        // Creamos el elemento del botón visual
        this.button = document.createElement('div');
        
        // Estilos para que parezca un joystick virtual clásico
        this.button.style.position = 'absolute';
        this.button.style.bottom = '50px';
        this.button.style.left = '50px';
        this.button.style.width = '90px';
        this.button.style.height = '90px';
        this.button.style.borderRadius = '50%';
        this.button.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
        this.button.style.border = '3px solid rgba(255, 255, 255, 0.6)';
        this.button.style.zIndex = '9999';
        this.button.style.touchAction = 'none'; // Evita zooms raros del navegador
        
        // Añadir una flecha o indicador visual al centro
        this.button.style.display = 'flex';
        this.button.style.alignItems = 'center';
        this.button.style.justifyContent = 'center';
        this.button.style.color = 'white';
        this.button.style.fontSize = '24px';
        this.button.style.fontWeight = 'bold';
        this.button.innerHTML = '▲';

        // Insertar el botón directamente en la pantalla
        document.body.appendChild(this.button);

        // --- EVENTOS EXCLUSIVOS DEL BOTÓN ---
        this.button.addEventListener('touchstart', (e) => {
            e.stopPropagation(); // Detiene el toque aquí para que no mueva la cámara
            this.moveForward = true;
            this.button.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; // Efecto presionado
        }, { passive: false });

        this.button.addEventListener('touchend', (e) => {
            e.stopPropagation();
            this.moveForward = false;
            this.button.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'; // Estado normal
        }, { passive: false });
    }

    initMobileControls() {
        // --- EVENTOS DEL RESTO DE LA PANTALLA (GIRO) ---
        document.addEventListener('touchstart', (e) => {
            // Si ya estamos registrando un dedo de giro, ignoramos otros
            if (this.touchSteerId !== null) return;

            const touch = e.changedTouches[0];
            this.touchSteerId = touch.identifier;
            this.previousTouch.x = touch.pageX;
            this.previousTouch.y = touch.pageY;
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                
                // Solo rota si es el dedo asignado a la dirección
                if (touch.identifier === this.touchSteerId) {
                    const deltaX = touch.pageX - this.previousTouch.x;
                    const deltaY = touch.pageY - this.previousTouch.y;

                    // Control de rotación horizontal (Y) y vertical (X)
                    this.camera.rotation.y -= deltaX * 0.004;
                    this.camera.rotation.x -= deltaY * 0.004;

                    // Límite físico para que no puedas mirar "boca abajo" (clamping)
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
        if (this.moveForward) {
            // Mantiene la velocidad de exploración constante
            this.camera.translateZ(-15 * delta); 
        }
    }
}
