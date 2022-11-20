import * as dat from 'dat.gui';
import { Position, Velocity, Acceleration, Radius } from "./types/Ball"
import { Controls } from "./types/DatGUI"

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')

let ww = canvas.width = window.innerWidth
let wh = canvas.height = window.innerHeight

window.addEventListener("resize", () => {
  ww = canvas.width = window.innerWidth
  wh = canvas.height = window.innerHeight
})

class Ball {
  p: Position // 定位
  v: Velocity // 速度
  a: Acceleration // 加速度
  r: Radius // 半徑
  dragging: boolean // 是否拖移

  constructor(ww:number, wh: number) {
    this.p = {
      x: ww/2,
      y: wh/2
    }
    this.v = {
      x: -15,
      y: 35
    },
    this.a = {
      x: 0,
      y: 1
    },
    this.r = 50
    this.dragging = false
  }

  draw() {
    if (!ctx) throw new Error("Where's my 2d context?!");
    ctx.beginPath()
    ctx.save()
      ctx.translate(this.p.x, this.p.y)
      ctx.arc(0,0,this.r,0,Math.PI*2)
      ctx.fillStyle = controls.color
      ctx.fill()
    ctx.restore()
    this.drawV()
  }

  drawV() {
    if (!ctx) throw new Error("Where's my 2d context?!");
    ctx.beginPath()
    ctx.save()
      ctx.translate(this.p.x, this.p.y)
      ctx.scale(3,3)
      ctx.moveTo(0,0)
      ctx.lineTo(this.v.x, this.v.y)
      ctx.strokeStyle = "blue"
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.lineTo(this.v.x,0)
      ctx.strokeStyle = "red"
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0,0)
      ctx.lineTo(0, this.v.y)
      ctx.strokeStyle = "green"
      ctx.stroke()
    ctx.restore()
  }

  update() {
    if (this.dragging) return;

    this.p.x += this.v.x
    this.p.y += this.v.y

    this.v.x += this.a.x
    this.v.y += this.a.y

    // 摩擦力
    this.v.x *= controls.fade
    this.v.y *= controls.fade

    // new dat
    controls.vx = this.v.x
    controls.vy = this.v.y
    controls.ay = this.a.y

    this.checkBoundary()
  }

  // 邊界碰撞檢查
  checkBoundary() {
    switch (true) {
      // right
      case this.p.x + this.r > ww:
        this.v.x = -Math.abs(this.v.x)
        break;
      // bottom
      case this.p.y + this.r > wh:
        this.v.y = -Math.abs(this.v.y)
        break;
      // left
      case this.p.x - this.r < 0:
        this.v.x = Math.abs(this.v.x)
        break;
      // top
      case this.p.y - this.r < 0:
        this.v.y = Math.abs(this.v.y)
        break;
    }
  }
}

// --------------------------------------------------------------

const controls: Controls = {
  vx: 0,
  vy: 0,
  ay: 0.6,
  fade: 0.99,
  update: true,
  color: "#fff",
  step: () => ball.update(),
  FPS: 30
}
const gui = new dat.GUI()
// listen() -> 監聽綁定資料，同步更新資料狀態。
gui.add(controls, "vx", -50, 50)
  .listen()
  .onChange((value) => {
    ball.v.x = value
  })
gui.add(controls, "vy", -50, 50)
  .listen()
  .onChange((value) => {
    ball.v.y = value
  })
gui.add(controls, "ay", -1, 1)
  .step(0.001)
  .listen()
  .onChange((value) => {
    ball.a.y = value
  })
gui.add(controls, "fade", 0, 1)
  .step(0.01)
  .listen()
gui.add(controls, "update")
gui.addColor(controls, "color")
gui.add(controls, "step")
gui.add(controls, "FPS", 1, 120)


let ball: Ball;
function init() {
  ball = new Ball(ww, wh)
}
init()


function update() {
  if (controls.update) ball.update()
}
setInterval(update, 1000/30) // 每隔一秒執行30次


function draw() {
  if (!ctx) throw new Error("Where's my 2d context?!");
  ctx.fillStyle = "rgba(0,0,0,0.5)"
  ctx.fillRect(0,0,ww,wh)
  ball.draw()

  setTimeout(draw, 1000 / controls.FPS)
}
draw()

// --------------------------------------------------------------

const getDistance = (p1, p2) => {
  let temp1 = p1.x - p2.x
  let temp2 = p1.y - p2.y
  let dist = Math.pow(temp1, 2) + Math.pow(temp2, 2)
  return Math.sqrt(dist)
}

let mousePos = { x: 0, y: 0 }
canvas.addEventListener("mousedown", (e) => {
  mousePos = { x: e.x, y: e.y }
  let dist = getDistance(mousePos, ball.p)
  if (ball.r > dist) {
    console.log('ball clicked')
    ball.dragging = true
  }
})

canvas.addEventListener("mousemove", (e) => {
  let nowPos = { x: e.x, y: e.y }
  if (ball.dragging) {
    let dx = nowPos.x - mousePos.x
    let dy = nowPos.y - mousePos.y

    ball.p.x += dx
    ball.p.y += dy

    ball.v.x = dx
    ball.v.y = dy
  }

  let dist = getDistance(nowPos, ball.p)
  canvas.style.cursor = ball.r > dist ? "move" : "initial"

  mousePos = nowPos
})

canvas.addEventListener("mouseup", (e) => {
  ball.dragging = false
})
