import * as THREE from '../../node_modules/three/build/three.module.js';

// Настройки сцены
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 0);
document.body.appendChild(renderer.domElement);

// Настройка камеры
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Глобальное освещение
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

// Создание текстуры фона
const spaceTexture = new THREE.TextureLoader().load('images/abstraction.jpg');
const spaceMaterial = new THREE.MeshBasicMaterial({ map: spaceTexture, side: THREE.BackSide });
const spaceGeometry = new THREE.SphereGeometry(100, 32, 32);
const spaceMesh = new THREE.Mesh(spaceGeometry, spaceMaterial);

// Шейдерный материал для звезд
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float time;
    varying vec2 vUv;
    void main() {
        vec2 p = -1.0 + 2.0 * vUv;
        float a = atan(p.y, p.x);
        float r = length(p);
        vec3 color = vec3(0.0);
        float d = abs(sin(time + r / 5.0 - a * 3.0));
        color += vec3(d / r, d / r, d / r);
        gl_FragColor = vec4(color, 1.0);
    }
`;

scene.add(spaceMesh);

// Настройки сферы
const sphereTexture = new THREE.TextureLoader().load('images/sphere.jpg');
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ map: sphereTexture })
);
sphere.position.z = -2;
scene.add(sphere);

// Добавление звезд на фоне
function addStar() {
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);
    

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(90));

    star.position.set(x, y, z);
    scene.add(star);

    // Анимация движения звезды
    function animateStar() {
        // Движение звезды вдоль экрана
        star.position.z += 0.1;

        // Проверка, достигла ли звезда края экрана
        if (star.position.z > 0) {
            // Звезда достигла края экрана, переместите ее обратно за край и задайте новые координаты x и y
            star.position.z = -90;  // Поменяйте значение на ваше усмотрение, чтобы звезда появлялась за краем экрана
            star.position.x = THREE.MathUtils.randFloatSpread(90);
            star.position.y = THREE.MathUtils.randFloatSpread(90);
        }

        requestAnimationFrame(animateStar);
    }

    animateStar();
}

Array(200).fill().forEach(addStar);

// Обработка движения мыши для параллакса
function handleMouseMove(event) {
    const { clientX, clientY } = event;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    const mouseX = (clientX - windowHalfX) / windowHalfX;
    const mouseY = (clientY - windowHalfY) / windowHalfY;

    spaceMesh.position.x = mouseX * 0.5;
    spaceMesh.position.y = -mouseY * 0.5;
}

document.addEventListener('mousemove', handleMouseMove);

// Анимация | каждый кадр
function animate() {
    requestAnimationFrame(animate);

    // Анимация сферы
    sphere.rotation.y += 0.01;
    sphere.rotation.x += 0.01;
    sphere.rotation.z += 0.01;

      // Обновление времени для шейдерных материалов звезд
      const time = performance.now() * 0.001;
      scene.traverse((object) => {
          if (object.isMesh && object.material.uniforms !== undefined) {
              object.material.uniforms.time.value = time;
          }
      });
  

    renderer.render(scene, camera);
}

// Запуск анимации
animate();
