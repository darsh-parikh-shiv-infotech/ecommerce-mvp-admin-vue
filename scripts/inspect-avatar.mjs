
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import console from "node:console";
const directory = "src/assets/avatar";

const files = [
  "Remy-pose-bow.glb",
  "Remy-pose-head-nod.glb",
  "Remy-pose-sitting-enter.glb",
  "Remy-pose-sitting-exit.glb",
  "Remy-pose-sitting-idle.glb",
];

function hash(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function readGLB(filename) {
  const path = join(directory, filename);
  const buffer = readFileSync(path);

  if (buffer.toString("ascii", 0, 4) !== "glTF") {
    throw new Error(`${filename} is not a valid GLB.`);
  }

  const version = buffer.readUInt32LE(4);
  const jsonLength = buffer.readUInt32LE(12);
  const json = JSON.parse(
    buffer.toString("utf8", 20, 20 + jsonLength).replace(/\0+$/g, "").trim(),
  );

  const binHeader = 20 + jsonLength;
  const binLength = buffer.readUInt32LE(binHeader);
  const bin = buffer.subarray(binHeader + 8, binHeader + 8 + binLength);

  const bufferViewHashes = (json.bufferViews ?? []).map((view, index) => {
    const start = view.byteOffset ?? 0;
    const data = bin.subarray(start, start + view.byteLength);

    return {
      index,
      hash: hash(data),
      byteLength: view.byteLength,
      target: view.target ?? null,
    };
  });

  const nodeTransforms = (json.nodes ?? []).map((node, index) => ({
    index,
    name: node.name ?? `Node ${index}`,
    translation: node.translation ?? null,
    rotation: node.rotation ?? null,
    scale: node.scale ?? null,
    matrix: node.matrix ?? null,
  }));

  const skinDetails = (json.skins ?? []).map((skin) => ({
    name: skin.name,
    joints: (skin.joints ?? []).map((index) => ({
      index,
      name: json.nodes?.[index]?.name ?? `Node ${index}`,
    })),
  }));

  const meshHashes = (json.meshes ?? []).map((mesh, index) => ({
    index,
    name: mesh.name ?? `Mesh ${index}`,
    primitives: (mesh.primitives ?? []).map((primitive) => ({
      attributes: primitive.attributes,
      indices: primitive.indices,
      material: primitive.material,
    })),
  }));

  return {
    filename,
    sizeMB: (statSync(path).size / 1024 / 1024).toFixed(2),
    version,
    binaryHash: hash(bin),
    imageHashes: (json.images ?? []).map((image) => {
      if (image.bufferView === undefined) {
        return { uri: image.uri ?? null };
      }

      return {
        bufferView: image.bufferView,
        hash: bufferViewHashes[image.bufferView]?.hash,
      };
    }),
    bufferViewHashes,
    nodeTransforms,
    skinDetails,
    meshHashes,
    animationNames: (json.animations ?? []).map((animation) => animation.name),
  };
}

const results = files.map(readGLB);
const reference = results[0];

for (const result of results) {
  const changedNodes = result.nodeTransforms.filter((node, index) => {
    return JSON.stringify(node) !== JSON.stringify(reference.nodeTransforms[index]);
  });

  const changedBufferViews = result.bufferViewHashes.filter((view, index) => {
    return view.hash !== reference.bufferViewHashes[index]?.hash;
  });

  console.log("\n========================================");
  console.log(`FILE: ${result.filename}`);
  console.log(`SIZE: ${result.sizeMB} MB`);
  console.log(`BINARY HASH: ${result.binaryHash}`);
  console.log(`CHANGED NODES: ${changedNodes.length}`);

  if (changedNodes.length) {
    console.log(JSON.stringify(changedNodes, null, 2));
  }

  console.log(`CHANGED BUFFER VIEWS: ${changedBufferViews.length}`);

  if (changedBufferViews.length) {
    console.log(JSON.stringify(changedBufferViews, null, 2));
  }

  console.log("SKELETON:");
  console.log(JSON.stringify(result.skinDetails, null, 2));

  console.log("ANIMATIONS:", result.animationNames);
}

console.log("\n========================================");
console.log("COMPARISON AGAINST:", reference.filename);

for (const result of results.slice(1)) {
  console.log(`\n${result.filename}`);
  console.log("Same binary:", result.binaryHash === reference.binaryHash);
  console.log(
    "Same meshes:",
    JSON.stringify(result.meshHashes) === JSON.stringify(reference.meshHashes),
  );
  console.log(
    "Same skeleton:",
    JSON.stringify(result.skinDetails) === JSON.stringify(reference.skinDetails),
  );
}
