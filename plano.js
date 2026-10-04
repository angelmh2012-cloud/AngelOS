function plano(img, containerId, expandable = true) {
  // ====== CONFIG ======
  let IMAGE_URL = img;      // Ruta de tu imagen (ej: 'fcb.png'). Vacío = textura de ejemplo.
  let PLANE_HEIGHT = 2;     // Alto del plano
  let SMOOTHING = 0.08;     // 0.01 = lento, 1 = instantáneo
  let FOLLOW_DEPTH = 3;     // Profundidad a la que "mira" el plano
  let DURATION = 450;       // ms de la animación al agrandar / achicar
  // expandable (3er parámetro): true = al hacer clic se agranda a pantalla completa
  //                             false = el plano no se agranda
  // ====================
 
  let container = document.getElementById(containerId);
  if (!container) {
    console.error('[plano] No existe el elemento #' + containerId);
    return;
  }
 
  function size() {
    return {
      w: container.clientWidth || 500,
      h: container.clientHeight || 400
    };
  }
  let s = size();
 
  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(50, s.w / s.h, 0.1, 100);
  camera.position.z = 5;
 
  let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(s.w, s.h);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);
 
  let material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });
  let mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  scene.add(mesh);
 
  function applyTexture(tex) {
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    material.map = tex;
    material.needsUpdate = true;
    let aspect = tex.image.width / tex.image.height;
    mesh.scale.set(PLANE_HEIGHT * aspect, PLANE_HEIGHT, 1);
  }
 
  if (IMAGE_URL) {
    new THREE.TextureLoader().load(
      IMAGE_URL,
      applyTexture,
      undefined,
      function () { console.error('[plano] No se pudo cargar la imagen: ' + IMAGE_URL); }
    );
  } else {
    let c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    let g = c.getContext('2d');
    let grad = g.createLinearGradient(0, 0, 512, 512);
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
  let mouse = new THREE.Vector2(0, 0);
  window.addEventListener('pointermove', function (e) {
    let r = container.getBoundingClientRect();
    // Si el contenedor está oculto (display:none) mide 0x0 y dividir daría NaN,
    // lo que dejaría el plano invisible para siempre.
    if (r.width === 0 || r.height === 0) return;
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  });
 
  let target = new THREE.Vector3();
  let dir = new THREE.Vector3();
  let dummy = new THREE.Object3D();
 
  function animate() {
    requestAnimationFrame(animate);
 
    dir.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(camera.position).normalize();
    let distance = (FOLLOW_DEPTH - camera.position.z) / dir.z;
    target.copy(camera.position).add(dir.multiplyScalar(distance));
 
    dummy.position.copy(mesh.position);
    dummy.lookAt(target);
    mesh.quaternion.slerp(dummy.quaternion, SMOOTHING);
 
    renderer.render(scene, camera);
  }
  animate();
 
  function onResize() {
    let n = size();
    camera.aspect = n.w / n.h;
    camera.updateProjectionMatrix();
    renderer.setSize(n.w, n.h);
  }
  if (window.ResizeObserver) {
    new ResizeObserver(onResize).observe(container);
  } else {
    window.addEventListener('resize', onResize);
  }
 
  // ====== CLICK: agrandar a pantalla completa y volver ======
  if (expandable) {
    let expanded = false;
    let busy = false;
    let placeholder = null;
    let savedStyle = '';
 
    // --- Estilos visuales (se inyectan una sola vez para todos los planos) ---
    if (!document.getElementById('plano-estilos')) {
      let style = document.createElement('style');
      style.id = 'plano-estilos';
      style.textContent = `
        .plano-exp { cursor: pointer; transition: box-shadow .25s ease, transform .25s ease; }
        .plano-exp:not(.plano-open):hover {
          transform: scale(1.02);
          box-shadow: 0 0 0 2px rgba(255,255,255,.85), 0 12px 32px rgba(0,0,0,.45);
        }
        .plano-exp.plano-open { cursor: pointer; }   `;
      document.head.appendChild(style);
    }
 
    // --- Indicador (icono + texto) dentro del div ---
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    container.classList.add('plano-exp');
    let badge = document.createElement('div');
    badge.className = 'plano-badge';
    badge.innerHTML = '<span class="plano-badge-icon"></span><span class="plano-badge-text"></span>';
    container.appendChild(badge);
    let badgeIcon = badge.querySelector('.plano-badge-icon');
    let badgeText = badge.querySelector('.plano-badge-text');
 
    function setBox(r) {
      container.style.left = r.left + 'px';
      container.style.top = r.top + 'px';
      container.style.width = r.width + 'px';
      container.style.height = r.height + 'px';
    }
 
    function expand() {
      if (expanded || busy) return;
      busy = true;
      let r = container.getBoundingClientRect();
      savedStyle = container.getAttribute('style') || '';
 
      // Marcador que conserva el hueco en el layout original
      placeholder = document.createElement('div');
      placeholder.style.width = r.width + 'px';
      placeholder.style.height = r.height + 'px';
      placeholder.style.flex = 'none';
      container.parentNode.insertBefore(placeholder, container);
 
      // Se mueve al <body>: así no lo recortan ni lo desplazan ancestros con
      // overflow:hidden o transform (como tus .window)
      document.body.appendChild(container);
      container.classList.add('plano-open');

      container.style.position = 'fixed';
      container.style.margin = '0';
      container.style.maxWidth = 'none';
      container.style.zIndex = '2147483000';
      container.style.transition = 'all ' + DURATION + 'ms ease';
      container.style.pointerEvents = 'auto';
      setBox(r);
      container.getBoundingClientRect(); // fuerza el reflow antes de animar
 
      container.style.left = '0px';
      container.style.top = '0px';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.borderRadius = '0';
      container.style.background = '#0a0a0a42';
 
      setTimeout(function () { expanded = true; busy = false; onResize(); }, DURATION);
    }
 
    function collapse() {
      if (!expanded || busy) return;
      busy = true;
      setBox(placeholder.getBoundingClientRect());
      container.style.borderRadius = '';
      container.style.background = '';
 
      setTimeout(function () {
        container.setAttribute('style', savedStyle);
        container.classList.remove('plano-open');
        placeholder.parentNode.insertBefore(container, placeholder);
        placeholder.parentNode.removeChild(placeholder);
        placeholder = null;
        expanded = false;
        busy = false;
        onResize();
      }, DURATION);
    }
 
    container.addEventListener('click', function () {
      if (expanded) collapse(); else expand();
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') collapse();
    });
  }
 
  console.log('[plano] iniciado: #' + containerId + (expandable ? ' (expandible)' : ''));
}


plano('Screenshot_20261003_171804.png', 'plane-container');
plano('python.png', 'plane-container1');
plano('cern.png', 'plane-container2');

