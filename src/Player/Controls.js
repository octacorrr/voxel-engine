import * as THREE from 'three';

export class Controls {
    constructor(camera, canvas) {
        this.camera = camera;
        this.moveForward = false;
        this.moveBackward = false;
        
        // Estado de control
        this.touchStart = { x: 0, y: 0 };
        this.isTouching = false;

        this.initMobileControls();
    }

    initMobileControls() {
        document.addEventListener('touchstart', (e) => {
            this.isTouching = true;
            this.touchStart.x = e.touches[0].pageX;
            this.touchStart.y = e.touches[0].pageY;
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!this.isTouching) return;

            let touchX = e.touches[0].pageX;
            let touchY = e.touches[0].pageY;
            
            let deltaX = touchX - this.touchStart.x;
            let deltaY = touchY - this.touchStart.y;

            if (this.touchStart.x > window.innerWidth / 2) {
                this.camera.rotation.y -= deltaX * 0.01;
                this.camera.rotation.x -= deltaY * 0.01;
            } else {
                if (deltaY < -20) this.moveForward = true;
                else if (deltaY > 20) this.moveBackward = true;
                else { this.moveForward = false; this.moveBackward = false; }
            }

            this.touchStart.x = touchX;
            this.touchStart.y = touchY;
        }, { passive: false });

        document.addEventListener('touchend', () => {
            this.isTouching = false;
            this.moveForward = false;
            this.moveBackward = false;
        });
    }

    update(delta) {
        // Movimiento simple basado en la dirección de la cámara
        if (this.moveForward) {
            this.camera.translateZ(-10 * delta);
        } else if (this.moveBackward) {
            this.camera.translateZ(10 * delta);
        }
    }
}
