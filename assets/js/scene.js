/* FarmIQ — procedural 3D hero scene (Three.js).
   A stylized giant tree over crop rows, with drifting pollen, gold key
   light and emerald rim. Degrades gracefully: if WebGL is unavailable or
   the visitor prefers reduced motion, the canvas stays empty and the CSS
   gradient behind it carries the hero on its own. */

const FARMIQ_SCENE = (() => {
  let renderer, scene, camera, root, pollen, rafId;
  let mouseX = 0, mouseY = 0, targetRotY = 0, targetRotX = 0;
  let scrollProgress = 0;
  let running = false;
  let ambient = false;

  const COLORS = {
    gold: 0xd9b45a,
    emerald: 0x3ddc97,
    deepGreen: 0x1f6b4a,
    bark: 0x3a2f22,
    soil: 0x14231a,
  };

  /* --- Seasons ---------------------------------------------------------- */

  /* The tree dresses for the visitor's actual season. If they've saved a
     location we respect their hemisphere, so a grower in Chile doesn't get
     a northern-hemisphere autumn in their spring. */
  const SEASONS = {
    spring: {
      name: 'spring',
      foliageA: 0x7ee8a2, foliageB: 0x46c98a, accent: 0xf2b8d0,
      emissive: 0x7ee8a2, emissiveIntensity: 0.3,
      crop: 0x2f8f63, soil: 0x16261b,
      particleColor: 0xf2b8d0, particleFalls: false, foliageScale: 1,
    },
    summer: {
      name: 'summer',
      foliageA: 0x3ddc97, foliageB: 0x1f6b4a, accent: 0xd9b45a,
      emissive: 0x3ddc97, emissiveIntensity: 0.28,
      crop: 0x1f6b4a, soil: 0x14231a,
      particleColor: 0xd9b45a, particleFalls: false, foliageScale: 1.05,
    },
    autumn: {
      name: 'autumn',
      foliageA: 0xd9b45a, foliageB: 0xc2703a, accent: 0xe08a3c,
      emissive: 0xd9b45a, emissiveIntensity: 0.24,
      crop: 0x6b5a2a, soil: 0x1d1a12,
      particleColor: 0xe08a3c, particleFalls: true, foliageScale: 0.92,
    },
    winter: {
      name: 'winter',
      foliageA: 0x9fb8ad, foliageB: 0x6d8279, accent: 0xdfeaf0,
      emissive: 0x9fb8ad, emissiveIntensity: 0.12,
      crop: 0x33413a, soil: 0x141a18,
      particleColor: 0xdfeaf0, particleFalls: true, foliageScale: 0.55,
    },
  };

  function detectSeason() {
    const month = new Date().getMonth(); // 0-11
    let southern = false;
    try {
      const loc = JSON.parse(localStorage.getItem('farmiq_location') || 'null');
      if (loc && typeof loc.lat === 'number') southern = loc.lat < 0;
    } catch (e) { /* no saved location — assume northern */ }

    // Northern-hemisphere mapping; flipped by six months below the equator.
    const m = southern ? (month + 6) % 12 : month;
    if (m <= 1 || m === 11) return SEASONS.winter;
    if (m <= 4) return SEASONS.spring;
    if (m <= 7) return SEASONS.summer;
    return SEASONS.autumn;
  }

  let SEASON = SEASONS.summer;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function supportsWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  /* --- Procedural tree -------------------------------------------------- */

  function makeBranch(THREE, group, start, dir, length, radius, depth) {
    if (depth === 0 || length < 0.25) return;

    const end = start.clone().add(dir.clone().multiplyScalar(length));
    const geo = new THREE.CylinderGeometry(radius * 0.68, radius, length, 7, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS.bark, roughness: 0.95, metalness: 0.02, flatShading: true,
    });
    const mesh = new THREE.Mesh(geo, mat);

    // Position/orient the cylinder along start→end.
    mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    mesh.castShadow = true;
    group.add(mesh);

    // Foliage clusters at the outer tips. Winter keeps only a sparse few,
    // so the branch structure reads as bare.
    const keepFoliage = SEASON.name !== 'winter' || Math.random() < 0.35;
    if (depth <= 2 && keepFoliage) {
      const size = length * (0.75 + Math.random() * 0.5) * SEASON.foliageScale;
      const cluster = new THREE.Mesh(
        new THREE.IcosahedronGeometry(size, 1),
        new THREE.MeshStandardMaterial({
          color: Math.random() < 0.18 ? SEASON.accent
               : (depth === 1 ? SEASON.foliageA : SEASON.foliageB),
          roughness: 0.8,
          flatShading: true,
          emissive: SEASON.emissive,
          emissiveIntensity: SEASON.emissiveIntensity,
        })
      );
      cluster.position.copy(end);
      cluster.castShadow = true;
      group.add(cluster);
    }

    // Two to three children, splayed outward and upward.
    const children = depth > 3 ? 3 : 2;
    for (let i = 0; i < children; i++) {
      const angle = (i / children) * Math.PI * 2 + Math.random() * 0.9;
      const spread = 0.55 + Math.random() * 0.35;
      const next = new THREE.Vector3(
        Math.cos(angle) * spread,
        1 - spread * 0.35,
        Math.sin(angle) * spread
      ).normalize();
      // Blend toward the parent direction so the tree keeps its upward drive.
      next.lerp(dir, 0.45).normalize();
      makeBranch(THREE, group, end, next, length * (0.68 + Math.random() * 0.12), radius * 0.68, depth - 1);
    }
  }

  function buildTree(THREE) {
    const tree = new THREE.Group();
    makeBranch(THREE, tree, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 4.2, 0.55, 5);
    return tree;
  }

  /* --- Crop rows -------------------------------------------------------- */

  function buildField(THREE) {
    const field = new THREE.Group();

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(34, 64),
      new THREE.MeshStandardMaterial({ color: SEASON.soil, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    field.add(ground);

    // Instanced crop tufts laid out in rows, thinned toward the horizon.
    const cropGeo = new THREE.ConeGeometry(0.16, 0.75, 5);
    const cropMat = new THREE.MeshStandardMaterial({
      color: SEASON.crop, roughness: 0.9, flatShading: true,
    });
    const rows = 22, perRow = 34;
    const mesh = new THREE.InstancedMesh(cropGeo, cropMat, rows * perRow);
    const dummy = new THREE.Object3D();
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < perRow; c++) {
        const x = (c - perRow / 2) * 1.15 + (Math.random() - 0.5) * 0.3;
        const z = (r - rows / 2) * 1.5 + (Math.random() - 0.5) * 0.3;
        if (Math.hypot(x, z) < 5.5 || Math.hypot(x, z) > 30) {
          // Keep a clearing around the trunk, and fade out at the rim.
          dummy.position.set(0, -50, 0);
        } else {
          dummy.position.set(x, 0.34, z);
          dummy.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.12);
          const s = 0.75 + Math.random() * 0.6;
          dummy.scale.set(s, s, s);
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    field.add(mesh);
    return field;
  }

  /* --- Pollen ----------------------------------------------------------- */

  function buildPollen(THREE, count) {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = Math.random() * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28;
      speeds[i] = 0.004 + Math.random() * 0.012;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: SEASON.particleColor,
      size: SEASON.name === 'winter' ? 0.13 : 0.09,
      transparent: true, opacity: 0.75, depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    points.userData.speeds = speeds;
    return points;
  }

  /* --- Lifecycle -------------------------------------------------------- */

  /* mode: 'hero' — full scene with crop field and scroll-driven camera.
     mode: 'ambient' — distant, slower, no field, fewer particles. Meant to
     sit behind a page header without competing with the copy or the CPU. */
  function init(canvas, mode) {
    const THREE = window.THREE;
    if (!THREE || !canvas || !supportsWebGL() || prefersReducedMotion()) return false;

    ambient = mode === 'ambient';
    SEASON = detectSeason();

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060a08, ambient ? 0.03 : 0.019);

    camera = new THREE.PerspectiveCamera(46, canvas.clientWidth / canvas.clientHeight, 0.1, 220);
    camera.position.set(0, ambient ? 9 : 8, ambient ? 30 : 26);
    camera.lookAt(0, ambient ? 9 : 7.5, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: !ambient, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, ambient ? 1.3 : 1.8));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    root = new THREE.Group();
    root.position.x = ambient ? 12 : 5.5;
    scene.add(root);

    root.add(buildTree(THREE));
    if (!ambient) root.add(buildField(THREE));

    pollen = buildPollen(THREE, ambient ? 90 : 320);
    root.add(pollen);

    // Light rig: warm gold key, emerald rim, soft sky fill.
    const key = new THREE.DirectionalLight(COLORS.gold, 3.4);
    key.position.set(9, 14, 8);
    scene.add(key);

    const rim = new THREE.DirectionalLight(COLORS.emerald, 2.3);
    rim.position.set(-11, 7, -9);
    scene.add(rim);

    scene.add(new THREE.HemisphereLight(0x9fd8bd, 0x0a1410, 0.85));
    scene.add(new THREE.AmbientLight(0xffffff, 0.24));

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });

    onResize();
    start();
    return true;
  }

  function onResize() {
    if (!renderer) return;
    const canvas = renderer.domElement;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function onPointerMove(e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    targetRotY = mouseX * 0.24;
    targetRotX = mouseY * 0.08;
  }

  function onScroll() {
    const h = window.innerHeight;
    scrollProgress = Math.min(1, Math.max(0, window.scrollY / h));
  }

  function tick(t) {
    if (!running) return;
    rafId = requestAnimationFrame(tick);

    const time = t * 0.001;

    // Ease toward the pointer target, plus a slow idle drift.
    const drift = ambient ? 0.02 : 0.045;
    root.rotation.y += ((targetRotY * (ambient ? 0.4 : 1) + time * drift) - root.rotation.y) * 0.035;
    root.rotation.x += (targetRotX * (ambient ? 0.15 : 0.5) - root.rotation.x) * 0.05;

    if (!ambient) {
      // Scroll pulls the camera up and back, revealing the field.
      camera.position.y = 8 + scrollProgress * 5.5;
      camera.position.z = 26 + scrollProgress * 7;
      camera.lookAt(0, 7.5 - scrollProgress * 2.5, 0);
    }

    // Pollen rises and wraps around.
    if (pollen) {
      const pos = pollen.geometry.attributes.position;
      const speeds = pollen.userData.speeds;
      const dir = SEASON.particleFalls ? -1 : 1;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + speeds[i] * dir;
        if (dir > 0 && y > 16) y = 0;
        if (dir < 0 && y < 0) y = 16;
        pos.setY(i, y);
        pos.setX(i, pos.getX(i) + Math.sin(time * 0.5 + i) * 0.0035);
      }
      pos.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  function start() {
    if (running || !renderer) return;
    running = true;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  return { init, start, stop };
})();
