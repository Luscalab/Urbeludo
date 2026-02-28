/**
 * @fileOverview Shim para o @mediapipe/pose.
 * O pacote @tensorflow-models/pose-detection importa 'Pose' do @mediapipe/pose
 * mesmo quando estamos usando apenas o MoveNet. Como o @mediapipe/pose
 * não exporta corretamente no formato ESM reconhecido pelo Turbopack, 
 * este shim fornece uma interface vazia compatível para evitar erros de build.
 */

export const Pose = class {
  constructor() {}
  setOptions() {}
  onResults() {}
  send() { return Promise.resolve(); }
  initialize() { return Promise.resolve(); }
  close() {}
  reset() {}
};

const mediapipeShim = { Pose };
export default mediapipeShim;
