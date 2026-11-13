import {
  Bone,
  Box3,
  Euler,
  Group,
  MathUtils,
  Material,
  Mesh,
  PerspectiveCamera,
  Quaternion,
  Vector3,
} from "three";

export type AvatarVariant = "login" | "sidebar";

export interface AvatarPointer {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

interface BoneRotation {
  bone: Bone | null;
  baseRotation: Quaternion | null;
}

export interface AvatarRig {
  head: BoneRotation;
  neck: BoneRotation;
  spine: BoneRotation;
}

const HORIZONTAL_SCALE = 0.94;
const CAMERA_PADDING = 1.18;

function findBone(bones: Bone[], pattern: RegExp): Bone | null {
  return bones.find((bone) => pattern.test(bone.name.toLowerCase())) ?? null;
}

function createBoneRotation(bone: Bone | null): BoneRotation {
  return {
    bone,
    baseRotation: bone?.quaternion.clone() ?? null,
  };
}

function applyBoneRotation(target: BoneRotation, pitch: number, yaw: number, roll = 0): void {
  if (!target.bone || !target.baseRotation) return;

  const offset = new Quaternion().setFromEuler(new Euler(pitch, yaw, roll, "YXZ"));

  target.bone.quaternion.copy(target.baseRotation).multiply(offset);
}

export function createCenteredAvatar(model: Group): Group {
  const bounds = new Box3().setFromObject(model);
  const center = bounds.getCenter(new Vector3());
  const avatar = new Group();

  avatar.add(model);
  avatar.scale.x = HORIZONTAL_SCALE;
  avatar.position.set(-center.x * HORIZONTAL_SCALE, -center.y, -center.z);

  return avatar;
}

export function createAvatarRig(model: Group): AvatarRig {
  const bones: Bone[] = [];

  model.traverse((object) => {
    if (object instanceof Bone) {
      bones.push(object);
    }
  });

  let head = findBone(bones, /^(head|head1|mixamorighead|bip001 head)$/i);
  if (!head) head = findBone(bones, /head/i);

  const neck = findBone(bones, /neck/i);
  const spine = findBone(bones, /spine|chest/i);

  console.info("[AnimatedAvatar] Rig detected:", {
    head: head?.name ?? "Not found",
    neck: neck?.name ?? "Not found",
    spine: spine?.name ?? "Not found",
  });

  return {
    head: createBoneRotation(head),
    neck: createBoneRotation(neck),
    spine: createBoneRotation(spine),
  };
}

export function updateAvatarPose(
  rig: AvatarRig,
  pointer: AvatarPointer,
  variant: AvatarVariant,
  elapsed: number,
  delta: number,
  isReducedMotion: boolean,
): void {
  if (!rig.head.bone) return;

  const loginMode = variant === "login";

  pointer.x = MathUtils.damp(pointer.x, pointer.targetX, 6, delta);
  pointer.y = MathUtils.damp(pointer.y, pointer.targetY, 6, delta);

  const nod = isReducedMotion ? 0 : Math.sin(elapsed * 0.65) * (loginMode ? 0.025 : 0.008);
  const breathing = isReducedMotion ? 0 : Math.sin(elapsed * 0.8) * 0.008;
  const cursorYaw = loginMode && !isReducedMotion ? pointer.x * 0.18 : 0;
  const cursorPitch = loginMode && !isReducedMotion ? pointer.y * 0.12 : 0;

  applyBoneRotation(rig.head, nod + cursorPitch, cursorYaw);
  applyBoneRotation(rig.neck, nod * 0.35 + cursorPitch * 0.25, cursorYaw * 0.3);
  applyBoneRotation(rig.spine, breathing, 0);
}

export function frameAvatarCamera(
  avatar: Group,
  camera: PerspectiveCamera,
  variant: AvatarVariant,
): void {
  const bounds = new Box3().setFromObject(avatar);
  if (bounds.isEmpty()) return;

  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const target = center.clone();
  let visibleHeight: number;

  if (variant === "sidebar") {
    target.y = bounds.min.y + size.y * 0.72;
    visibleHeight = Math.max(size.y * 0.62, size.x / Math.max(camera.aspect, 0.01));
  } else {
    visibleHeight = Math.max(size.y, size.x / Math.max(camera.aspect, 0.5)) * CAMERA_PADDING;
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

export function disposeAvatarModel(model: Group): void {
  const materials = new Set<Material>();

  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;

    object.geometry.dispose();
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
