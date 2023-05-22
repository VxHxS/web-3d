import * as THREE from '../../node_modules/three/build/three.module.js';

// vertexShader
export const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// fragmentShader с добавленными эффектами свечения и перелива цвета
export const fragmentShader = `
    uniform float time;
    varying vec2 vUv;
    void main() {
        vec2 p = -1.0 + 2.0 * vUv;
        float a = atan(p.y, p.x);
        float r = length(p);
        vec3 color = vec3(0.0);
        
        // Эффект свечения
        float glow = abs(sin(time * 2.0 + r * 5.0));
        color += vec3(glow);
        
        // Эффект перелива цвета
        vec3 colorShift = vec3(0.3, 0.5, 0.8);
        color += colorShift * (1.0 - smoothstep(0.3, 0.4, r));
        
        gl_FragColor = vec4(color, 1.0);
    }
`;
