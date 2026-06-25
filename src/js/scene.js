import * as THREE from "three";
import { SCENE_SETTINGS, TONE_MAP } from "./config.js";

export function createMangoScene(canvas) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(SCENE_SETTINGS.fogColor, 0.055);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.5, 8);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_SETTINGS.maxPixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const clock = new THREE.Clock();
  const pointer = new THREE.Vector2(0, 0);
  const targetPointer = new THREE.Vector2(0, 0);
  let scrollProgress = 0;
  let varietyTone = "honey";

  const group = new THREE.Group();
  scene.add(group);

  const mango = new THREE.Group();
  group.add(mango);

  const mangoGeometry = new THREE.SphereGeometry(1.42, 72, 72);
  const mangoMaterial = new THREE.MeshStandardMaterial({
    color: 0xffb12a,
    roughness: 0.47,
    metalness: 0.03,
    emissive: 0xff7a16,
    emissiveIntensity: 0.1
  });
  const mangoMesh = new THREE.Mesh(mangoGeometry, mangoMaterial);
  mangoMesh.scale.set(0.92, 1.28, 0.72);
  mangoMesh.rotation.z = -0.33;
  mango.add(mangoMesh);

  const blushGeometry = new THREE.SphereGeometry(1.43, 48, 48, 0, Math.PI * 1.2, 0.15, Math.PI * 0.65);
  const blushMaterial = new THREE.MeshStandardMaterial({
    color: 0xff5c44,
    transparent: true,
    opacity: 0.42,
    roughness: 0.5
  });
  const blush = new THREE.Mesh(blushGeometry, blushMaterial);
  blush.scale.copy(mangoMesh.scale);
  blush.rotation.set(0.1, -0.45, -0.55);
  mango.add(blush);

  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(0.45, 0.1, 1.0, 0.48, 1.18, 1.1);
  leafShape.bezierCurveTo(0.54, 0.98, 0.08, 0.52, 0, 0);

  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d8f57,
    side: THREE.DoubleSide,
    roughness: 0.6,
    metalness: 0.02
  });
  const leaf = new THREE.Mesh(new THREE.ShapeGeometry(leafShape), leafMaterial);
  leaf.position.set(0.05, 1.62, 0.03);
  leaf.rotation.set(-0.52, -0.1, 0.72);
  leaf.scale.set(0.76, 0.76, 0.76);
  mango.add(leaf);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.11, 0.55, 14),
    new THREE.MeshStandardMaterial({ color: 0x6b3f17, roughness: 0.7 })
  );
  stem.position.set(-0.08, 1.45, 0.02);
  stem.rotation.z = -0.38;
  mango.add(stem);

  const nectar = createNectarRing(THREE);
  group.add(nectar);

  const petalGroup = createPetalField(THREE);
  scene.add(petalGroup);

  const coreLight = new THREE.PointLight(0xffd84d, 4, 14);
  coreLight.position.set(-2.2, 2.2, 3.5);
  scene.add(coreLight);
  scene.add(new THREE.HemisphereLight(0xfff3c5, 0x2d8f57, 2.4));

  const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
  rimLight.position.set(3, 4, 5);
  scene.add(rimLight);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function updateScrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
  }

  function setPointer(clientX, clientY) {
    targetPointer.x = (clientX / window.innerWidth - 0.5) * 2;
    targetPointer.y = -(clientY / window.innerHeight - 0.5) * 2;
  }

  function setVarietyTone(tone) {
    if (TONE_MAP[tone]) {
      varietyTone = tone;
    }
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    pointer.lerp(targetPointer, 0.08);

    const tone = TONE_MAP[varietyTone];
    mixColor(THREE, mangoMaterial, tone, 0.28 + Math.sin(elapsed * 0.8) * 0.12);
    blushMaterial.color.set(tone.b);
    leafMaterial.color.lerp(new THREE.Color(tone.leaf), 0.04);
    coreLight.color.set(tone.a);

    mango.rotation.y = elapsed * 0.28 + pointer.x * 0.42 + scrollProgress * Math.PI * 1.25;
    mango.rotation.x = Math.sin(elapsed * 0.5) * 0.12 + pointer.y * 0.22;
    mango.position.y = Math.sin(elapsed * 0.9) * 0.13 + scrollProgress * -0.55;
    mango.scale.setScalar(1 + Math.sin(elapsed * 1.1) * 0.018);

    group.position.x = window.innerWidth < SCENE_SETTINGS.mobileBreakpoint ? 0.95 : 2.2;
    group.position.y = -0.2 + scrollProgress * -1.6;
    group.rotation.z = pointer.x * -0.06;

    animateNectar(nectar, elapsed);
    animatePetals(petalGroup, elapsed);

    camera.position.x = pointer.x * 0.35;
    camera.position.y = 0.5 + pointer.y * 0.22;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  updateScrollProgress();
  animate();

  return {
    resize,
    setPointer,
    setVarietyTone,
    updateScrollProgress
  };
}

function createNectarRing(THREE) {
  const nectar = new THREE.Group();
  const dropGeometry = new THREE.SphereGeometry(0.08, 18, 18);
  const dropMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff0a1,
    roughness: 0.2,
    emissive: 0xffaa18,
    emissiveIntensity: 0.25
  });

  for (let i = 0; i < 34; i += 1) {
    const drop = new THREE.Mesh(dropGeometry, dropMaterial);
    const angle = (i / 34) * Math.PI * 2;
    const radius = 2.4 + Math.sin(i * 2.1) * 0.3;
    drop.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.7) * 0.48, Math.sin(angle) * radius);
    drop.scale.setScalar(0.65 + Math.random() * 1.1);
    drop.userData = { angle, radius, speed: 0.25 + Math.random() * 0.45 };
    nectar.add(drop);
  }

  return nectar;
}

function createPetalField(THREE) {
  const petalGroup = new THREE.Group();
  const petalGeometry = new THREE.PlaneGeometry(0.16, 0.48, 1, 1);

  for (let i = 0; i < 90; i += 1) {
    const petal = new THREE.Mesh(
      petalGeometry,
      new THREE.MeshStandardMaterial({
        color: 0xfff7de,
        roughness: 0.55,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide
      })
    );
    const angle = Math.random() * Math.PI * 2;
    const radius = 4 + Math.random() * 7;
    petal.position.set(Math.cos(angle) * radius, -4 + Math.random() * 8, Math.sin(angle) * radius - 1);
    petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    petal.userData = { drift: 0.15 + Math.random() * 0.35, phase: Math.random() * 10 };
    petalGroup.add(petal);
  }

  return petalGroup;
}

function animateNectar(nectar, elapsed) {
  nectar.children.forEach((drop) => {
    const data = drop.userData;
    const angle = data.angle + elapsed * data.speed;
    drop.position.x = Math.cos(angle) * data.radius;
    drop.position.z = Math.sin(angle) * data.radius;
    drop.position.y = Math.sin(angle * 1.7 + elapsed) * 0.52;
    drop.rotation.y += 0.01;
  });
}

function animatePetals(petalGroup, elapsed) {
  petalGroup.children.forEach((petal) => {
    petal.position.y -= petal.userData.drift * 0.018;
    petal.position.x += Math.sin(elapsed + petal.userData.phase) * 0.004;
    petal.rotation.x += 0.004;
    petal.rotation.z += 0.006;
    if (petal.position.y < -4.5) {
      petal.position.y = 4.5;
    }
  });
}

function mixColor(THREE, material, tone, amount) {
  const colorA = new THREE.Color(tone.a);
  const colorB = new THREE.Color(tone.b);
  material.color.lerpColors(colorA, colorB, amount);
}
