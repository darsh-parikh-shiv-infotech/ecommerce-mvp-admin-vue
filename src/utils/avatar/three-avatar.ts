import {
  type AnimationAction,
  AnimationClip,
  AnimationMixer,
  Bone,
  Box3,
  Euler,
  Group,
  type KeyframeTrack,
  LoopOnce,
  MathUtils,
  type Material,
  Mesh,
  PerspectiveCamera,
  Quaternion,
  SkinnedMesh,
  Vector3,
} from "three";

/**
 * login     -> full body, centered in the (right) login panel
 * sidebar   -> waist-up crop
 * dashboard -> waist-up crop, used inside the square greeting card
 */
export type AvatarVariant = "login" | "sidebar" | "dashboard";

export interface AvatarPointer {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export interface AvatarRig {
  head: Bone | null;
  neck: Bone | null;
  spine: Bone | null;
}

/** Size of the avatar (idle pose + every frame of the greeting), in world units. */
export interface AvatarFraming {
  halfWidth: number;
  height: number;
  depth: number;
}

export interface PreparedAvatar {
  avatar: Group;
  rig: AvatarRig;
  animator: AvatarAnimator | null;
  framing: AvatarFraming;
}

const CAMERA_PADDING = 1.12;
const SIDE_PADDING = 1.12;
/** Waist-up crop: how much room above the head, and where the crop ends (0 = feet, 1 = head). */
const CROP_HEADROOM = 0.05;
const CROP_WAIST_LINE = 0.5;

const GREETING_CLIP_NAME = /greet|hello|wave/i;
/** Hips/root translation tracks cause the character to drift off-center during the clip. */
const ROOT_POSITION_TRACK = /(hips|pelvis|root)\.position$/i;
const BOUNDS_SAMPLES = 12;
const FADE_IN_SECONDS = 0.25;
const FADE_OUT_SECONDS = 0.4;

type TrackConstructor = new (
  name: string,
  times: ArrayLike<number>,
  values: ArrayLike<number>,
) => KeyframeTrack;

/* -------------------------------------------------------------------------- */
/* Animation                                                                  */
/* -------------------------------------------------------------------------- */

function pickGreetingClip(clips: AnimationClip[]): AnimationClip | null {
  return clips.find((clip) => GREETING_CLIP_NAME.test(clip.name)) ?? clips[0] ?? null;
}

/**
 * Keeps the root bone's motion (sway/bob) but removes its offset from the rest position,
 * so the exported clip can't shove the character left/right/forward.
 */
function anchorRootMotion(clip: AnimationClip, model: Group): AnimationClip {
  const tracks = clip.tracks.map((track) => {
    if (!ROOT_POSITION_TRACK.test(track.name)) return track;

    const node = model.getObjectByName(track.name.split(".")[0]);
    if (!node) return track;

    const size = track.getValueSize();
    const values = Array.from(track.values);
    const first = values.slice(0, size);
    const rest = [node.position.x, node.position.y, node.position.z];

    for (let i = 0; i < values.length; i += size) {
      for (let k = 0; k < size; k++) {
        values[i + k] = values[i + k] - first[k] + rest[k];
      }
    }

    const Track = track.constructor as unknown as TrackConstructor;
    return new Track(track.name, track.times, values);
  });

  return new AnimationClip(clip.name, clip.duration, tracks);
}

/** A one-keyframe clip holding the greeting's first pose: the "standing still" state. */
function createStillClip(clip: AnimationClip): AnimationClip {
  const tracks = clip.tracks.map((track) => {
    const Track = track.constructor as unknown as TrackConstructor;
    return new Track(track.name, [0], Array.from(track.values).slice(0, track.getValueSize()));
  });

  return new AnimationClip(`${clip.name}-still`, 1, tracks);
}

export class AvatarAnimator {
  /** Called when the greeting has finished and the avatar is going back to the still pose. */
  onGreetingEnd: (() => void) | null = null;

  private readonly mixer: AnimationMixer;
  private readonly idle: AnimationAction;
  private readonly greeting: AnimationAction;
  private readonly model: Group;
  private greetingActive = false;

  private readonly handleFinished = (event: { action: AnimationAction }): void => {
    if (event.action !== this.greeting) return;

    this.greetingActive = false;
    this.idle.reset().play();
    this.greeting.crossFadeTo(this.idle, FADE_OUT_SECONDS, false);
    this.onGreetingEnd?.();
  };

  constructor(model: Group, clip: AnimationClip) {
    this.model = model;
    this.mixer = new AnimationMixer(model);

    this.idle = this.mixer.clipAction(createStillClip(clip));
    this.greeting = this.mixer.clipAction(clip);
    this.greeting.setLoop(LoopOnce, 1);
    this.greeting.clampWhenFinished = true;

    this.idle.play();
    this.mixer.update(0);
    this.mixer.addEventListener("finished", this.handleFinished);
  }

  get isGreeting(): boolean {
    return this.greetingActive;
  }

  /** Returns false (and does nothing) if a greeting is already playing. */
  playGreeting(): boolean {
    if (this.greetingActive) return false;

    this.greetingActive = true;
    this.greeting.reset().play();
    this.idle.crossFadeTo(this.greeting, FADE_IN_SECONDS, false);
    return true;
  }

  update(delta: number): void {
    this.mixer.update(delta);
  }

  dispose(): void {
    this.mixer.removeEventListener("finished", this.handleFinished);
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.model);
    this.onGreetingEnd = null;
  }
}

/* -------------------------------------------------------------------------- */
/* Rig + centering                                                            */
/* -------------------------------------------------------------------------- */

function findBone(bones: Bone[], pattern: RegExp): Bone | null {
  return bones.find((bone) => pattern.test(bone.name.toLowerCase())) ?? null;
}

export function createAvatarRig(model: Group): AvatarRig {
  const bones: Bone[] = [];

  model.traverse((object) => {
    if (object instanceof Bone) bones.push(object);
  });

  let head = findBone(bones, /^(head|head1|mixamorighead|bip001 head)$/i);
  if (!head) head = findBone(bones, /head/i);

  return {
    head,
    neck: findBone(bones, /neck/i),
    spine: findBone(bones, /spine|chest/i),
  };
}

/** Union of the skinned bounds across the whole clip, so the raised hand is never cropped. */
function measureClipBounds(model: Group, clip: AnimationClip): Box3 {
  const probe = new AnimationMixer(model);
  probe.clipAction(clip).play();

  const union = new Box3();
  const box = new Box3();

  for (let i = 0; i < BOUNDS_SAMPLES; i++) {
    probe.setTime((clip.duration * i) / BOUNDS_SAMPLES);
    model.updateMatrixWorld(true);
    union.union(box.setFromObject(model, true));
  }

  probe.stopAllAction();
  probe.uncacheRoot(model);
  return union;
}

/**
 * Builds the animator, then wraps the model so the character's body (head bone, not the
 * bounding box) sits on x = 0 and its feet on y = 0. The camera always looks at x = 0.
 */
export function prepareAvatar(model: Group, clips: AnimationClip[]): PreparedAvatar {
  const rig = createAvatarRig(model);
  model.updateMatrixWorld(true);

  const source = pickGreetingClip(clips);
  const clip = source ? anchorRootMotion(source, model) : null;

  const bounds = clip ? measureClipBounds(model, clip) : new Box3().setFromObject(model, true);
  const animator = clip ? new AvatarAnimator(model, clip) : null;
  model.updateMatrixWorld(true);

  const anchor = new Vector3();
  if (rig.head) {
    rig.head.getWorldPosition(anchor);
  } else {
    bounds.getCenter(anchor);
  }

  const avatar = new Group();
  const framing: AvatarFraming = bounds.isEmpty()
    ? { halfWidth: 0.5, height: 1.8, depth: 0.5 }
    : {
        halfWidth: Math.max(bounds.max.x - anchor.x, anchor.x - bounds.min.x),
        height: bounds.max.y - bounds.min.y,
        depth: bounds.max.z - bounds.min.z,
      };

  avatar.add(model);
  if (!bounds.isEmpty()) {
    avatar.position.set(-anchor.x, -bounds.min.y, -(bounds.min.z + bounds.max.z) / 2);
  }

  return { avatar, rig, animator, framing };
}

/* -------------------------------------------------------------------------- */
/* Per-frame pose + camera                                                    */
/* -------------------------------------------------------------------------- */

function addBoneOffset(bone: Bone | null, pitch: number, yaw: number): void {
  if (!bone) return;

  // The mixer rewrites the bone every frame, so the offset is layered on top of it.
  bone.quaternion.multiply(new Quaternion().setFromEuler(new Euler(pitch, yaw, 0, "YXZ")));
}

/** Call after `animator.update()`: adds breathing and cursor-follow on top of the clip. */
export function updateAvatarPose(
  rig: AvatarRig,
  pointer: AvatarPointer,
  variant: AvatarVariant,
  elapsed: number,
  delta: number,
): void {
  pointer.x = MathUtils.damp(pointer.x, pointer.targetX, 6, delta);
  pointer.y = MathUtils.damp(pointer.y, pointer.targetY, 6, delta);

  const loginMode = variant === "login";
  const nod = Math.sin(elapsed * 0.65) * (loginMode ? 0.02 : 0.008);
  const breathing = Math.sin(elapsed * 0.8) * 0.008;
  const cursorYaw = loginMode ? pointer.x * 0.18 : 0;
  const cursorPitch = loginMode ? pointer.y * 0.12 : 0;

  addBoneOffset(rig.head, nod + cursorPitch, cursorYaw);
  addBoneOffset(rig.neck, nod * 0.35 + cursorPitch * 0.25, cursorYaw * 0.3);
  addBoneOffset(rig.spine, breathing, 0);
}

export function frameAvatarCamera(
  framing: AvatarFraming,
  camera: PerspectiveCamera,
  variant: AvatarVariant,
): void {
  const aspect = Math.max(camera.aspect, 0.01);
  const fitWidth = (framing.halfWidth * 2 * SIDE_PADDING) / aspect;
  let visibleHeight: number;
  let targetY: number;

  if (variant === "login") {
    visibleHeight = Math.max(framing.height * CAMERA_PADDING, fitWidth);
    targetY = framing.height / 2;
  } else {
    const top = framing.height * (1 + CROP_HEADROOM);
    const bottom = framing.height * CROP_WAIST_LINE;

    visibleHeight = Math.max(top - bottom, fitWidth);
    targetY = top - visibleHeight / 2; // anchored to the head; extra room goes below
  }

  const margin = Math.max(framing.depth * 0.5, 0.2);
  const distance =
    visibleHeight / (2 * Math.tan(MathUtils.degToRad(camera.fov) / 2)) + framing.depth / 2 + margin;

  camera.position.set(0, targetY, distance);
  camera.lookAt(0, targetY, 0);
  camera.near = Math.max(0.01, distance - framing.depth - margin);
  camera.far = distance + framing.depth + margin;
  camera.updateProjectionMatrix();
}

export function disposeAvatarModel(model: Group): void {
  const materials = new Set<Material>();

  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;

    object.geometry.dispose();
    if (object instanceof SkinnedMesh) object.skeleton.dispose();

    const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
    meshMaterials.forEach((material) => materials.add(material));
  });

  materials.forEach((material) => {
    for (const value of Object.values(material)) {
      if (value && typeof value === "object" && "isTexture" in value) {
        (value as { dispose: () => void }).dispose();
      }
    }

    material.dispose();
  });
}
