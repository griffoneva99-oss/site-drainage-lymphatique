/* animations.js — SOMA
   Scène Three.js : sphère organique animée en arrière-plan
   =========================================================
   Dépendance : Three.js r128 (chargé via CDN dans index.html)
*/

(function () {
  'use strict';

  const canvas = document.getElementById('bgCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ─── Scène, caméra, renderer ───────────────────────────────
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // ─── Géométrie principale (sphère subdivise) ───────────────
  const geo = new THREE.SphereGeometry(1.8, 128, 128);

  // Sauvegarder les positions d'origine
  const posArr = geo.attributes.position.array;
  const originalPos = new Float32Array(posArr.length);
  for (let i = 0; i < posArr.length; i++) originalPos[i] = posArr[i];

  const mat = new THREE.MeshStandardMaterial({
    color: 0x6b4c35,
    metalness: 0.3,
    roughness: 0.7,
    wireframe: false,
    transparent: true,
    opacity: 0.18,
  });

  const sphere = new THREE.Mesh(geo, mat);
  sphere.position.set(2.5, 0, 0);
  scene.add(sphere);

  // ─── Sphère wireframe extérieure ───────────────────────────
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xc9a96e,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  });
  const wireGeo = new THREE.SphereGeometry(2.0, 32, 32);
  const wireSphere = new THREE.Mesh(wireGeo, wireMat);
  wireSphere.position.set(2.5, 0, 0);
  scene.add(wireSphere);

  // ─── Particules flottantes ──────────────────────────────────
  const particleCount = 120;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(particleCount * 3);
  const pSpeeds = [];

  for (let i = 0; i < particleCount; i++) {
    pPos[i * 3]     = (Math.random() - 0.5) * 14;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    pSpeeds.push({
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.003,
    });
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

  const pMat = new THREE.PointsMaterial({
    color: 0xc9a96e,
    size: 0.025,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ─── Anneau décoratif ───────────────────────────────────────
  const ringGeo = new THREE.TorusGeometry(2.6, 0.008, 8, 80);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xc9a96e,
    transparent: true,
    opacity: 0.12,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(2.5, 0, 0);
  ring.rotation.x = Math.PI / 4;
  scene.add(ring);

  const ring2Geo = new THREE.TorusGeometry(2.2, 0.005, 8, 80);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0xf5ead8,
    transparent: true,
    opacity: 0.05,
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.position.set(2.5, 0, 0);
  ring2.rotation.x = -Math.PI / 6;
  ring2.rotation.y = Math.PI / 5;
  scene.add(ring2);

  // ─── Lumières ───────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xf5ead8, 0.3);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xc9a96e, 1.5, 10);
  pointLight1.position.set(3, 3, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x6b4c35, 1, 8);
  pointLight2.position.set(-3, -2, 2);
  scene.add(pointLight2);

  // ─── Souris ─────────────────────────────────────────────────
  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ─── Scroll ─────────────────────────────────────────────────
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  // ─── Déformation organique de la sphère ────────────────────
  const clock = new THREE.Clock();

  function deformSphere(time) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3;
      const ox = originalPos[ix];
      const oy = originalPos[ix + 1];
      const oz = originalPos[ix + 2];

      // Distance au centre (normalisée)
      const len = Math.sqrt(ox * ox + oy * oy + oz * oz);

      // Déplacement sinusoïdal multi-fréquence
      const noise =
        Math.sin(ox * 2.5 + time * 0.6) * 0.08 +
        Math.sin(oy * 3.0 + time * 0.4) * 0.06 +
        Math.sin(oz * 2.0 + time * 0.5) * 0.07 +
        Math.sin((ox + oy) * 1.5 + time * 0.8) * 0.04;

      const factor = 1 + noise;
      pos.setXYZ(i, ox * factor, oy * factor, oz * factor);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }

  // ─── Boucle d'animation ─────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Lerp souris
    mouse.x += (targetMouse.x - mouse.x) * 0.04;
    mouse.y += (targetMouse.y - mouse.y) * 0.04;

    // Déformer la sphère
    deformSphere(time);

    // Rotation principale
    sphere.rotation.x = time * 0.08 + mouse.y * 0.15;
    sphere.rotation.y = time * 0.12 + mouse.x * 0.2;

    // Bobbing doux
    sphere.position.y = Math.sin(time * 0.3) * 0.15;
    wireSphere.position.y = sphere.position.y;

    // Wireframe contra-rotation
    wireSphere.rotation.x = -time * 0.05;
    wireSphere.rotation.y = time * 0.07;

    // Anneaux
    ring.rotation.z = time * 0.1;
    ring2.rotation.z = -time * 0.08;
    ring.position.y = sphere.position.y;
    ring2.position.y = sphere.position.y;

    // Particules drift
    const pPosArr = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pPosArr[i * 3]     += pSpeeds[i].x;
      pPosArr[i * 3 + 1] += pSpeeds[i].y;

      // Wrap autour de la scène
      if (pPosArr[i * 3]     >  7) pPosArr[i * 3]     = -7;
      if (pPosArr[i * 3]     < -7) pPosArr[i * 3]     =  7;
      if (pPosArr[i * 3 + 1] >  5) pPosArr[i * 3 + 1] = -5;
      if (pPosArr[i * 3 + 1] < -5) pPosArr[i * 3 + 1] =  5;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Scroll parallax : déplacer légèrement la caméra
    camera.position.y = -scrollY * 0.001;

    renderer.render(scene, camera);
  }

  animate();

  // ─── Resize ─────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

})();
