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

  const COLORS = {
    gold: 0xd9b45a,
    emerald: 0x3ddc97,
    deepGreen: 0x1f6b4a,
    bark: 0x3a2f22,
    soil: 0x14231a,
  };

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

    // Foliage clusters at the outer tips.
    if (depth <= 2) {
      const cluster = new THREE.Mesh(
        new THREE.IcosahedronGeometry(length * (0.75 + Math.random() * 0.5), 1),
        new THREE.MeshStandardMaterial({
          color: depth === 1 ? COLORS.emerald : COLORS.deepGreen,
          roughness: 0.8,
          flatShading: true,
          emissive: COLORS.emerald,
          emissiveIntensity: 0.28,
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
      new THREE.MeshStandardMaterial({ color: COLORS.soil, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    field.add(ground);

    // Instanced crop tufts laid out in rows, thinned toward the horizon.
    const cropGeo = new THREE.ConeGeometry(0.16, 0.75, 5);
    const cropMat = new THREE.MeshStandardMaterial({
      color: COLORS.deepGreen, roughness: 0.9, flatShading: true,
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

  function buildPollen(THREE) {
    const count = 320;
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
      color: COLORS.gold, size: 0.09, transparent: true, opacity: 0.75, depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    points.userData.speeds = speeds;
    return points;
  }

  /* --- Lifecycle -------------------------------------------------------- */

  function init(canvas) {
    const THREE = window.THREE;
    if (!THREE || !canvas || !supportsWebGL() || prefersReducedMotion()) return false;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060a08, 0.019);

    camera = new THREE.PerspectiveCamera(46, canvas.clientWidth / canvas.clientHeight, 0.1, 220);
    camera.position.set(0, 8, 26);
    camera.lookAt(0, 7.5, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    root = new THREE.Group();
    root.position.x = 5.5;
    scene.add(root);

    const tree = buildTree(THREE);
    root.add(tree);
    root.add(buildField(THREE));

    pollen = buildPollen(THREE);
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
    root.rotation.y += ((targetRotY + time * 0.045) - root.rotation.y) * 0.035;
    root.rotation.x += (targetRotX * 0.5 - root.rotation.x) * 0.05;

    // Scroll pulls the camera up and back, revealing the field.
    camera.position.y = 8 + scrollProgress * 5.5;
    camera.position.z = 26 + scrollProgress * 7;
    camera.lookAt(0, 7.5 - scrollProgress * 2.5, 0);

    // Pollen rises and wraps around.
    if (pollen) {
      const pos = pollen.geometry.attributes.position;
      const speeds = pollen.userData.speeds;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + speeds[i];
        if (y > 16) y = 0;
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
