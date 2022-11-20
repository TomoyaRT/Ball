export type Controls = {
  vx: number,
  vy: number,
  ay: number,
  fade: number,
  update: boolean,
  color: string,
  step: () => void,
  FPS: number
}