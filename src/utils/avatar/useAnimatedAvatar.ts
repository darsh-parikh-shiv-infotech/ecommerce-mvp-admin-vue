import { onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  Group,
  MathUtils,
  PerspectiveCamera,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  createAvatarRig,
  createCenteredAvatar,
  disposeAvatarModel,
  frameAvatarCamera,
  updateAvatarPose,
  type AvatarPointer,
  type AvatarRig,
  type AvatarVariant,
} from "./three-avatar";

interface UseAnimatedAvatarOptions {
  variant: Readonly<Ref<AvatarVariant>>;
  trackingTarget: Readonly<Ref<HTMLElement | null>>;
  modelUrl: string;
}

export function useAnimatedAvatar(
  container: Ref<HTMLDivElement | null>,
  options: UseAnimatedAvatarOptions,
): Readonly<Ref<boolean>> {
  const hasError = ref(false);

  let renderer: WebGLRenderer | null = null;
  let camera: PerspectiveCamera | null = null;
  let scene: Group | null = null;
  let avatar: Group | null = null;
  let rig: AvatarRig | null = null;

  let resizeObserver: ResizeObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;
  let activeTrackingTarget: HTMLElement | Window | null = null;
  let animationFrame = 0;
  let isVisible = true;
  let isReducedMotion = false;
  let isDisposed = false;

  const pointer: AvatarPointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  };

  const clock = {
    start: 0,
    previousFrame: 0,
  };

  function updateCameraFraming(): void {
    if (!avatar || !camera) return;

    frameAvatarCamera(avatar, camera, options.variant.value);
  }

  function renderFrame(timestamp: number): void {
    if (isDisposed || !renderer || !scene || !camera || !rig || !isVisible) return;

    if (!clock.start) clock.start = timestamp;

    const elapsed = (timestamp - clock.start) / 1000;
    const delta = clock.previousFrame
      ? Math.min((timestamp - clock.previousFrame) / 1000, 0.05)
      : 1 / 60;
    clock.previousFrame = timestamp;

    updateAvatarPose(rig, pointer, options.variant.value, elapsed, delta, isReducedMotion);
    renderer.render(scene, camera);

    if (!isReducedMotion) {
      animationFrame = requestAnimationFrame(renderFrame);
    }
  }

  function startRendering(): void {
    if (isDisposed || !isVisible || !renderer || !scene || !camera || !rig) return;

    cancelAnimationFrame(animationFrame);

    if (isReducedMotion) {
      updateAvatarPose(rig, pointer, options.variant.value, 0, 0, true);
      renderer.render(scene, camera);
      return;
    }

    animationFrame = requestAnimationFrame(renderFrame);
  }

  function resizeRenderer(): void {
    if (!container.value || !renderer || !camera || !avatar) return;

    const { width, height } = container.value.getBoundingClientRect();
    if (!width || !height) return;

    camera.aspect = width / height;
    updateCameraFraming();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    startRendering();
  }

  function handlePointerMove(event: Event): void {
    if (!(event instanceof PointerEvent) || options.variant.value !== "login") return;

    const rect = options.trackingTarget.value?.getBoundingClientRect();
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

  function bindTrackingTarget(): void {
    if (isDisposed || typeof window === "undefined") return;

    const nextTarget = options.trackingTarget.value ?? window;
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

  function cleanup(): void {
    isDisposed = true;
    cancelAnimationFrame(animationFrame);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    window.removeEventListener("resize", resizeRenderer);
    unbindTrackingTarget();

    if (avatar) {
      disposeAvatarModel(avatar);
      avatar = null;
    }

    renderer?.dispose();
    renderer?.domElement.remove();
    renderer = null;
    scene = null;
    camera = null;
    rig = null;
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

      scene.add(new AmbientLight(0xffffff, 2.0));

      const keyLight = new DirectionalLight(0xffffff, 2.5);
      keyLight.position.set(3, 5, 5);
      scene.add(keyLight);

      const fillLight = new DirectionalLight(0xd9e4ff, 1.1);
      fillLight.position.set(-4, 2, 3);
      scene.add(fillLight);

      const gltf = await new GLTFLoader().loadAsync(options.modelUrl);

      if (isDisposed) {
        disposeAvatarModel(gltf.scene);
        return;
      }

      avatar = createCenteredAvatar(gltf.scene);
      scene.add(avatar);
      rig = createAvatarRig(gltf.scene);
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
      cleanup();
    }
  }

  onMounted(() => {
    isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    void initializeAvatar();
  });

  watch([options.variant, options.trackingTarget], () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    bindTrackingTarget();
    updateCameraFraming();
    resizeRenderer();
  });

  onBeforeUnmount(cleanup);

  return hasError;
}
