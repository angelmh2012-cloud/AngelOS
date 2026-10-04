// Versión SIN módulos: funciona con <script src="main.js"></script> normal.
// Requiere que three.min.js se cargue antes (ver index.html).

function plano (img, plane) {
  // ====== CONFIG ======
  var IMAGE_URL = img;      // Ruta de tu imagen (ej: 'fcb.png'). Vacío = textura de ejemplo.
  var PLANE_HEIGHT = 2;    // Alto del plano
  var SMOOTHING = 0.08;     // 0.01 = lento, 1 = instantáneo
  var FOLLOW_DEPTH = 3;    // Profundidad a la que "mira" el plano
  // ====================



  var container = document.getElementById(plane);

  function size() {
    return {
      w: container.clientWidth || 500,
      h: container.clientHeight || 400
    };
  }
  var s = size();

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, s.w / s.h, 0.1, 100);
  camera.position.z = 5;

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(s.w, s.h);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  var material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  scene.add(plane);

  function applyTexture(tex) {
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    material.map = tex;
    material.needsUpdate = true;
    var aspect = tex.image.width / tex.image.height;
    plane.scale.set(PLANE_HEIGHT * aspect, PLANE_HEIGHT, 1);
  }

  if (IMAGE_URL) {
    new THREE.TextureLoader().load(
      IMAGE_URL,
      applyTexture,
      undefined,
      function () { console.error('[plano] No se pudo cargar la imagen: ' + IMAGE_URL); }
    );
  } else {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    var g = c.getContext('2d');
    var grad = g.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#ff6b6b');
    grad.addColorStop(1, '#4d96ff');
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = '#fff';
    g.font = 'bold 64px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('Tu imagen', 256, 256);
    g.lineWidth = 12;
    g.strokeStyle = '#fff';
    g.strokeRect(6, 6, 500, 500);
    applyTexture(new THREE.CanvasTexture(c));
  }

  // Mouse relativo al div, escuchando en toda la ventana
  var mouse = new THREE.Vector2(0, 0);
  window.addEventListener('pointermove', function (e) {
    var r = container.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  });

  var target = new THREE.Vector3();
  var dir = new THREE.Vector3();   // vector aparte: antes 'dir' y 'target' eran el mismo objeto
  var dummy = new THREE.Object3D();

  function animate() {
    requestAnimationFrame(animate);

    // Rayo de la cámara que pasa por el mouse
    dir.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(camera.position).normalize();
    // Punto de ese rayo a la profundidad FOLLOW_DEPTH
    var distance = (FOLLOW_DEPTH - camera.position.z) / dir.z;
    target.copy(camera.position).add(dir.multiplyScalar(distance));

    dummy.position.copy(plane.position);
    dummy.lookAt(target);
    plane.quaternion.slerp(dummy.quaternion, SMOOTHING);

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    var n = size();
    camera.aspect = n.w / n.h;
    camera.updateProjectionMatrix();
    renderer.setSize(n.w, n.h);
  }
  if (window.ResizeObserver) {
    new ResizeObserver(onResize).observe(container);
  } else {
    window.addEventListener('resize', onResize);
  }

  console.log('[plano] iniciado correctamente');
}

plano('Screenshot_20261003_171804.png', 'plane-container');