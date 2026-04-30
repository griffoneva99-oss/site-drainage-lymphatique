/* animations.js — SOMA
   Scène Three.js : lotus / fleur géométrique en wireframe doré
   ============================================================= */

(function () {
  'use strict';

  const canvas = document.getElementById('bgCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ─── Scène ─────────────────────────────────────────────────
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // ─── Matériaux ──────────────────────────────────────────────
  const petalMat = new THREE.MeshBasicMaterial({ color: 0xc9a96e, wireframe: true, transparent: true, opacity: 0.22 });
  const lineMat  = new THREE.LineBasicMaterial({ color: 0xc9a96e, transparent: true, opacity: 0.6 });
  const dotMat   = new THREE.MeshBasicMaterial({ color: 0xe2c99a, transparent: true, opacity: 0.8 });
  const glowMat  = new THREE.MeshBasicMaterial({ color: 0x6b4c35, wireframe: true, transparent: true, opacity: 0.08 });

  // ─── Fonction : créer un pétale ────────────────────────────
  function createPetal(length, width, segments) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(-width/2, length*0.3, -width/2, length*0.7, 0, length);
    shape.bezierCurveTo( width/2, length*0.7,  width/2, length*0.3, 0, 0);
    const geo = new THREE.ShapeGeometry(shape, segments);
    return geo;
  }

  // ─── Groupe principal ───────────────────────────────────────
  const flowerGroup = new THREE.Group();
  flowerGroup.position.set(2.2, 0, 0);

  // ─── Couches de pétales ─────────────────────────────────────
  const layers = [
    { count: 6,  length: 1.8, width: 0.7, tiltX: 0.5,  yOffset: 0,    opacity: 0.25, color: 0xc9a96e },
    { count: 6,  length: 1.5, width: 0.6, tiltX: 0.3,  yOffset: 0,    opacity: 0.2,  color: 0xc9a96e },
    { count: 8,  length: 1.1, width: 0.5, tiltX: 0.15, yOffset: 0,    opacity: 0.18, color: 0xd4b47a },
    { count: 8,  length: 0.7, width: 0.35,tiltX: 0.05, yOffset: 0,    opacity: 0.22, color: 0xe2c99a },
    { count: 12, length: 0.4, width: 0.2, tiltX: 0.0,  yOffset: 0,    opacity: 0.28, color: 0xf0dca8 },
  ];

  const petalMeshes = [];

  layers.forEach((layer, li) => {
    const mat = new THREE.MeshBasicMaterial({
      color: layer.color,
      wireframe: true,
      transparent: true,
      opacity: layer.opacity,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < layer.count; i++) {
      const angle = (i / layer.count) * Math.PI * 2;
      const geo   = createPetal(layer.length, layer.width, 8);
      const mesh  = new THREE.Mesh(geo, mat);

      mesh.rotation.z = angle;
      mesh.rotation.x = layer.tiltX;
      mesh.position.y = layer.yOffset;

      flowerGroup.add(mesh);
      petalMeshes.push({ mesh, baseAngleZ: angle, layer: li });
    }
  });

  // ─── Centre (pistil) ────────────────────────────────────────
  const pistilGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const pistil    = new THREE.Mesh(pistilGeo, new THREE.MeshBasicMaterial({ color: 0xe2c99a, transparent: true, opacity: 0.6 }));
  flowerGroup.add(pistil);

  // Anneau central
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.015, 8, 40),
    new THREE.MeshBasicMaterial({ color: 0xc9a96e, transparent: true, opacity: 0.5 })
  );
  flowerGroup.add(ring1);

  // ─── Anneaux orbitaux ───────────────────────────────────────
  const orbRings = [];
  [2.2, 2.8, 3.5].forEach((r, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.008 - i*0.001, 6, 80),
      new THREE.MeshBasicMaterial({ color: 0xc9a96e, transparent: true, opacity: 0.12 - i*0.03 })
    );
    ring.rotation.x = Math.PI * (0.2 + i * 0.15);
    ring.rotation.y = Math.PI * i * 0.1;
    flowerGroup.add(ring);
    orbRings.push(ring);
  });

  // ─── Sphère de fond (lueur) ─────────────────────────────────
  const glowSphere = new THREE.Mesh(new THREE.SphereGeometry(2.0, 24, 16), glowMat);
  flowerGroup.add(glowSphere);

  scene.add(flowerGroup);

  // ─── Particules dorées ──────────────────────────────────────
  const pCount = 100;
  const pGeo   = new THREE.BufferGeometry();
  const pPos   = new Float32Array(pCount * 3);
  const pSpeed = [];

  for (let i = 0; i < pCount; i++) {
    pPos[i*3]   = (Math.random()-0.5)*14 + 2;
    pPos[i*3+1] = (Math.random()-0.5)*10;
    pPos[i*3+2] = (Math.random()-0.5)*6 - 1;
    pSpeed.push({ x:(Math.random()-0.5)*0.003, y:(Math.random()-0.5)*0.004 });
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xc9a96e, size: 0.025, transparent: true, opacity: 0.45, sizeAttenuation: true
  }));
  scene.add(particles);

  // ─── Lumières ───────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xf5ead8, 0.5));
  const pl = new THREE.PointLight(0xc9a96e, 1.5, 10);
  pl.position.set(3, 3, 3);
  scene.add(pl);

  // ─── Souris & scroll ────────────────────────────────────────
  const mouse  = { x:0, y:0 };
  const target = { x:0, y:0 };
  let scrollY  = 0;

  window.addEventListener('mousemove', e => {
    target.x = (e.clientX/window.innerWidth  - 0.5) * 2;
    target.y = -(e.clientY/window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  // ─── Animation ──────────────────────────────────────────────
  const clock = new THREE.Clock();
  let openProgress = 0; // 0 = fermé, 1 = ouvert

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const dt = clock.getDelta ? 0.016 : 0.016;

    // Lerp souris
    mouse.x += (target.x - mouse.x) * 0.03;
    mouse.y += (target.y - mouse.y) * 0.03;

    // Ouverture progressive de la fleur (3 premières secondes)
    openProgress = Math.min(1, t / 3.5);
    const eased = openProgress < 0.5
      ? 4 * openProgress * openProgress * openProgress
      : 1 - Math.pow(-2 * openProgress + 2, 3) / 2;

    // Animation des pétales : s'ouvrent depuis le centre
    petalMeshes.forEach(({ mesh, baseAngleZ, layer }) => {
      const layerDelay = layer * 0.15;
      const lProgress  = Math.max(0, Math.min(1, (eased - layerDelay) / (1 - layerDelay)));
      // Pétales s'inclinent vers l'extérieur à l'ouverture
      const tiltLayers = [0.5, 0.3, 0.15, 0.05, 0.0];
      mesh.rotation.x = tiltLayers[layer] * lProgress;
      // Légère pulsation après ouverture
      const pulse = 1 + Math.sin(t * 1.2 + layer * 0.5) * 0.015;
      mesh.scale.set(pulse, pulse * lProgress * 0.95 + 0.05, pulse);
    });

    // Rotation globale lente
    flowerGroup.rotation.y = t * 0.08 + mouse.x * 0.2;
    flowerGroup.rotation.x = Math.sin(t * 0.15) * 0.08 + mouse.y * 0.1;
    flowerGroup.position.y = Math.sin(t * 0.3) * 0.1;

    // Anneaux orbitaux
    orbRings[0].rotation.z = t * 0.12;
    orbRings[1].rotation.z = -t * 0.09;
    orbRings[1].rotation.x = Math.PI * 0.35 + Math.sin(t*0.2) * 0.05;
    orbRings[2].rotation.z = t * 0.06;

    // Pistil pulse
    const ps = 1 + Math.sin(t * 2) * 0.06;
    pistil.scale.set(ps, ps, ps);
    ring1.rotation.z = t * 0.3;

    // Particules
    const pa = particles.geometry.attributes.position.array;
    for (let i=0; i<pCount; i++) {
      pa[i*3]   += pSpeed[i].x;
      pa[i*3+1] += pSpeed[i].y;
      if(pa[i*3]>9)    pa[i*3]=-5;
      if(pa[i*3]<-5)   pa[i*3]=9;
      if(pa[i*3+1]>5)  pa[i*3+1]=-5;
      if(pa[i*3+1]<-5) pa[i*3+1]=5;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    camera.position.y = -scrollY * 0.001;
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
})();
