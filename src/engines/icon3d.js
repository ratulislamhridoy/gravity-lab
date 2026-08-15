// Gravity AI Studio — Three.js 3D Icon Studio Engine
const Icon3DEngine = {
  scene: null,
  camera: null,
  renderer: null,
  currentMesh: null,
  animationId: null,

  init(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);
    this.camera.position.set(0, 0, 8);

    // Studio Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f2fe, 1.2);
    dirLight1.position.set(5, 5, 5);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7f00ff, 0.8);
    dirLight2.position.set(-5, -5, 3);
    this.scene.add(dirLight2);

    this.createShape('cube', '#00f2fe', 'glass');
    this.startAnimation();
  },

  createShape(shapeType = 'cube', colorHex = '#00f2fe', materialType = 'glass') {
    if (this.currentMesh) {
      this.scene.remove(this.currentMesh);
    }

    let geometry;
    switch (shapeType) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(2, 64, 64);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(1.8, 0.7, 32, 100);
        break;
      case 'knot':
        geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 128, 32);
        break;
      case 'pyramid':
        geometry = new THREE.ConeGeometry(2, 3, 4);
        break;
      case 'cube':
      default:
        geometry = new THREE.RoundedBoxGeometry ? new THREE.RoundedBoxGeometry(2.5, 2.5, 2.5, 5, 0.3) : new THREE.BoxGeometry(2.5, 2.5, 2.5);
        break;
    }

    let material;
    const color = new THREE.Color(colorHex);

    if (materialType === 'glass') {
      material = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 1.2,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });
    } else if (materialType === 'metallic') {
      material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.9,
        roughness: 0.2,
        envMapIntensity: 1.0
      });
    } else {
      material = new THREE.MeshToonMaterial({
        color: color
      });
    }

    this.currentMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.currentMesh);
  },

  updateMaterial(colorHex, materialType) {
    if (!this.currentMesh) return;
    const shape = this.currentShape || 'cube';
    this.createShape(shape, colorHex, materialType);
  },

  startAnimation() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      if (this.currentMesh) {
        this.currentMesh.rotation.x += 0.008;
        this.currentMesh.rotation.y += 0.012;
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    animate();
  },

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
};
