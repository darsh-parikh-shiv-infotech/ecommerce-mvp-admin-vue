<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Bone,
  Box3,
  DirectionalLight,
  Euler,
  Group,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  Quaternion,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import remyModelUrl from "../../assets/avatar/character-head-nod.glb?url";

type AvatarVariant = "login" | "sidebar";

const props = withDefaults(
  defineProps<{
    variant?: AvatarVariant;
    trackingTarget?: HTMLElement | null;
  }>(),
  {
    variant: "login",
    trackingTarget: null,
  },
);

const container = ref<HTMLDivElement | null>(null);
const hasError = ref(false);

const MODEL_URL = remyModelUrl;
const HORIZONTAL_SCALE = 0.94;
const CAMERA_PADDING = 1.18;

let renderer: WebGLRenderer | null = null;
let camera: PerspectiveCamera | null = null;
let scene: Group | null = null;
let avatar: Group | null = null;

let headBone: Bone | null = null;
let neckBone: Bone | null = null;
let spineBone: Bone | null = null;

let headBaseRotation: Quaternion | null = null;
let neckBaseRotation: Quaternion | null = null;
let spineBaseRotation: Quaternion | null = null;

let resizeObserver: ResizeObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;
let activeTrackingTarget: HTMLElement | Window | null = null;

let animationFrame = 0;

let isVisible = true;
let isReducedMotion = false;
let isDisposed = false;

const pointer = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
};

const clock = {
  start: 0,
  previousFrame: 0,
};

const disposableMaterials = new Set<import("three").Material>();

function findBone(bones: Bone[], pattern: RegExp): Bone | null {
  return bones.find((bone) => pattern.test(bone.name.toLowerCase())) ?? null;
}

function setupBones(model: Group): void {
  const bones: Bone[] = [];

  model.traverse((object) => {
    if (object instanceof Bone) {
      bones.push(object);
    }
  });

  headBone = findBone(bones, /^(head|head1|mixamorighead|bip001 head)$/i);

  if (!headBone) {
    headBone = findBone(bones, /head/i);
  }

  neckBone = findBone(bones, /neck/i);
  spineBone = findBone(bones, /spine|chest/i);

  headBaseRotation = headBone?.quaternion.clone() ?? null;
  neckBaseRotation = neckBone?.quaternion.clone() ?? null;
  spineBaseRotation = spineBone?.quaternion.clone() ?? null;

  console.info("[AnimatedAvatar] Rig detected:", {
    head: headBone?.name ?? "Not found",
    neck: neckBone?.name ?? "Not found",
    spine: spineBone?.name ?? "Not found",
  });
}

function bindTrackingTarget(): void {
  const nextTarget = props.trackingTarget ?? window;

  if (activeTrackingTarget === nextTarget) return;

  unbindTrackingTarget();

  activeTrackingTarget = nextTarget;

  if (nextTarget === window) {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("blur", handlePointerLeave);
  } else {
    nextTarget.addEventListener("pointerleave", handlePointerLeave);
    nextTarget.addEventListener("pointermove", handlePointerMove);
  }
}

function unbindTrackingTarget(): void {
  if (!activeTrackingTarget) return;

  if (activeTrackingTarget === window) {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("blur", handlePointerLeave);
  } else {
    activeTrackingTarget.removeEventListener("pointermove", handlePointerMove);
    activeTrackingTarget.removeEventListener("pointerleave", handlePointerLeave);
  }

  activeTrackingTarget = null;
}

function applyBoneRotation(
  bone: Bone | null,
  baseRotation: Quaternion | null,
  pitch: number,
  yaw: number,
  roll = 0,
): void {
  if (!bone || !baseRotation) return;

  const offset = new Quaternion().setFromEuler(new Euler(pitch, yaw, roll, "YXZ"));

  bone.quaternion.copy(baseRotation).multiply(offset);
}

function updateAvatar(elapsed: number, delta: number): void {
  if (!headBone) return;

  const loginMode = props.variant === "login";

  // Smooth cursor movement instead of snapping to the pointer.
  pointer.x = MathUtils.damp(pointer.x, pointer.targetX, 6, delta);

  pointer.y = MathUtils.damp(pointer.y, pointer.targetY, 6, delta);

  const nod = isReducedMotion ? 0 : Math.sin(elapsed * 0.65) * (loginMode ? 0.025 : 0.008);

  const breathing = isReducedMotion ? 0 : Math.sin(elapsed * 0.8) * 0.008;

  const cursorYaw = loginMode && !isReducedMotion ? pointer.x * 0.18 : 0;

  const cursorPitch = loginMode && !isReducedMotion ? pointer.y * 0.12 : 0;

  applyBoneRotation(headBone, headBaseRotation, nod + cursorPitch, cursorYaw);

  applyBoneRotation(neckBone, neckBaseRotation, nod * 0.35 + cursorPitch * 0.25, cursorYaw * 0.3);

  applyBoneRotation(spineBone, spineBaseRotation, breathing, 0);
}

function renderFrame(timestamp: number): void {
  if (isDisposed || !renderer || !scene || !camera || !isVisible) {
    return;
  }

  if (!clock.start) clock.start = timestamp;

  const elapsed = (timestamp - clock.start) / 1000;
  const delta = clock.previousFrame
    ? Math.min((timestamp - clock.previousFrame) / 1000, 0.05)
    : 1 / 60;
  clock.previousFrame = timestamp;

  updateAvatar(elapsed, delta);
  renderer.render(scene, camera);

  if (!isReducedMotion) {
    animationFrame = requestAnimationFrame(renderFrame);
  }
}

function startRendering(): void {
  if (isDisposed || !isVisible || !renderer || !scene || !camera) {
    return;
  }

  cancelAnimationFrame(animationFrame);

  if (isReducedMotion) {
    updateAvatar(0, 0);
    renderer.render(scene, camera);
    return;
  }

  animationFrame = requestAnimationFrame(renderFrame);
}

function resizeRenderer(): void {
  if (!container.value || !renderer || !camera || !avatar) {
    return;
  }

  const { width, height } = container.value.getBoundingClientRect();

  if (!width || !height) return;

  const aspect = width / height;

  camera.aspect = aspect;
  updateCameraFraming();
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  renderer.setSize(width, height, false);

  startRendering();
}

function handlePointerMove(event: Event): void {
  if (!(event instanceof PointerEvent)) return;
  if (props.variant !== "login") return;

  const rect = props.trackingTarget?.getBoundingClientRect();
  const width = rect?.width ?? window.innerWidth;
  const height = rect?.height ?? window.innerHeight;

  if (!width || !height) return;

  const left = rect?.left ?? 0;
  const top = rect?.top ?? 0;

  pointer.targetX = MathUtils.clamp(((event.clientX - left) / width - 0.5) * 2, -1, 1);
  pointer.targetY = MathUtils.clamp(((event.clientY - top) / height - 0.5) * 2, -1, 1);
}

function handlePointerLeave(): void {
  pointer.targetX = 0;
  pointer.targetY = 0;
}

function updateCameraFraming(): void {
  if (!avatar || !camera) return;

  const bounds = new Box3().setFromObject(avatar);
  if (bounds.isEmpty()) return;

  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());

  const sidebarMode = props.variant === "sidebar";
  const target = center.clone();

  let visibleHeight: number;

  if (sidebarMode) {
    // Focus on the upper body: head, shoulders and torso down to the waist.
    target.y = bounds.min.y + size.y * 0.72;

    // Crop the lower body while keeping the character's width visible.
    visibleHeight = Math.max(size.y * 0.62, size.x / Math.max(camera.aspect, 0.01));
  } else {
    visibleHeight = Math.max(size.y, size.x / Math.max(camera.aspect, 0.01)) * CAMERA_PADDING;
  }

  const fieldOfView = MathUtils.degToRad(camera.fov);

  const margin = Math.max(size.length() * 0.02, 0.01);
  const distance = visibleHeight / (2 * Math.tan(fieldOfView / 2)) + size.z / 2 + margin;

  camera.position.set(target.x, target.y, target.z + distance);
  camera.lookAt(target);
  camera.near = Math.max(0.01, distance - size.z / 2 - margin);
  camera.far = distance + size.z / 2 + margin;

  camera.updateProjectionMatrix();
}

function disposeModel(model: Group): void {
  model.traverse((object) => {
    if (object instanceof Mesh) {
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];

      materials.forEach((material) => {
        disposableMaterials.add(material);
      });
    }
  });

  disposableMaterials.forEach((material) => {
    for (const value of Object.values(material)) {
      if (value && typeof value === "object" && "isTexture" in value) {
        (value as { dispose: () => void }).dispose();
      }
    }

    material.dispose();
  });

  disposableMaterials.clear();
}

function cleanup(): void {
  isDisposed = true;

  cancelAnimationFrame(animationFrame);

  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();

  window.removeEventListener("resize", resizeRenderer);

  unbindTrackingTarget();
  if (avatar) {
    disposeModel(avatar);
    avatar = null;
  }

  renderer?.dispose();
  renderer?.domElement.remove();

  renderer = null;
  scene = null;
  camera = null;
}

async function initializeAvatar(): Promise<void> {
  if (!container.value) return;

  try {
    scene = new Group();

    camera = new PerspectiveCamera(30, 1, 0.01, 25);

    renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x000000, 0);

    container.value.appendChild(renderer.domElement);

    const ambientLight = new AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const keyLight = new DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 5, 5);
    scene.add(keyLight);

    const fillLight = new DirectionalLight(0xd9e4ff, 1.1);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(MODEL_URL);

    if (isDisposed) {
      disposeModel(gltf.scene);
      return;
    }

    avatar = new Group();

    const model = gltf.scene;

    const bounds = new Box3().setFromObject(model);
    const center = bounds.getCenter(new Vector3());

    avatar.add(model);

    avatar.scale.x = HORIZONTAL_SCALE;

    // Center the entire character using its parent group.
    avatar.position.set(-center.x, -center.y, -center.z);

    scene.add(avatar);

    setupBones(model);

    updateCameraFraming();

    resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(container.value);

    intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;

      if (isVisible) {
        startRendering();
      } else {
        cancelAnimationFrame(animationFrame);
      }
    });

    intersectionObserver.observe(container.value);

    window.addEventListener("resize", resizeRenderer);

    bindTrackingTarget();

    resizeRenderer();
  } catch (error) {
    console.error("[AnimatedAvatar] Failed to load model:", error);
    hasError.value = true;
  }
}

onMounted(() => {
  isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initializeAvatar();
});

watch(
  () => props.variant,
  () => {
    updateCameraFraming();

    pointer.targetX = 0;
    pointer.targetY = 0;

    resizeRenderer();
  },
);
watch(() => props.trackingTarget, bindTrackingTarget);

onBeforeUnmount(cleanup);
</script>

<template>
  <div
    ref="container"
    class="animated-avatar"
    :class="`animated-avatar--${variant}`"
    aria-label="Animated character"
    role="img"
  >
    <div v-if="hasError" class="animated-avatar__fallback">Avatar unavailable</div>
  </div>
</template>

<style scoped>
.animated-avatar {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  pointer-events: auto;
  background: #252535;
}

.animated-avatar canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.animated-avatar__fallback {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: inherit;
  place-items: center;
  color: #888;
  font-size: 12px;
}
</style>
