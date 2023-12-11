import type { Cuttleform } from '$lib/worker/config'
import type { Vector } from '$lib/worker/modeling/transformation'
import type Trsf from '$lib/worker/modeling/transformation'
import { wallBezier } from '@pro/rounded'
import * as THREE from 'three'

export function rectangle(x: number, y: number, size = 1) {
  const shape = new THREE.Shape()
  shape.moveTo(x - size, y - size)
  shape.lineTo(x - size, y + size)
  shape.lineTo(x + size, y + size)
  shape.lineTo(x + size, y - size)
  return new THREE.ShapeGeometry(shape)
}

export function drawWall(wallPts: [number, number][]) {
  const shape = new THREE.Shape()
  shape.moveTo(wallPts[0][0], wallPts[0][1])
  for (const p of wallPts) {
    shape.lineTo(p[0], p[1])
  }
  shape.lineTo(wallPts[0][0], wallPts[0][1])
  return new THREE.ShapeGeometry(shape)
}

export function drawPath(wallPts: [number, number][], width = 0.2) {
  const shapes: THREE.Shape[] = []
  for (let i = 0; i < wallPts.length - 1; i++) {
    const p0 = wallPts[i]
    const p1 = wallPts[i + 1]
    const shape = new THREE.Shape()

    let normal = [p0[1] - p1[1], p1[0] - p0[0]]
    const len = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1])
    normal = [normal[0] / len * width, normal[1] / len * width]
    shape.moveTo(p0[0] + normal[0], p0[1] + normal[1])
    shape.lineTo(p1[0] + normal[0], p1[1] + normal[1])
    shape.lineTo(p1[0] - normal[0], p1[1] - normal[1])
    shape.lineTo(p0[0] - normal[0], p0[1] - normal[1])
    shapes.push(shape)
  }

  return new THREE.ShapeGeometry(shapes)
}

export function drawLinedWall(wallPts: [number, number][], width = 0.2) {
  const shapes = wallPts.map((p0, i) => {
    const p1 = wallPts[(i + 1) % wallPts.length]
    const shape = new THREE.Shape()

    let normal = [p0[1] - p1[1], p1[0] - p0[0]]
    const len = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1])
    normal = [normal[0] / len * width, normal[1] / len * width]
    shape.moveTo(p0[0] + normal[0], p0[1] + normal[1])
    shape.lineTo(p1[0] + normal[0], p1[1] + normal[1])
    shape.lineTo(p1[0] - normal[0], p1[1] - normal[1])
    shape.lineTo(p0[0] - normal[0], p0[1] - normal[1])
    return shape
  })

  return new THREE.ShapeGeometry(shapes)
}

function drawBezier(p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number], width = 0.2) {
  const shape = new THREE.Shape()
  let normal = [p0[1] - p3[1], p3[0] - p0[0]]
  const len = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1])
  normal = [normal[0] / len * width, normal[1] / len * width]
  shape.moveTo(p0[0] + normal[0], p0[1] + normal[1])
  // shape.lineTo(p3[0] + normal[0], p3[1] + normal[1])
  shape.bezierCurveTo(p1[0] + normal[0], p1[1] + normal[1], p2[0] + normal[0], p2[1] + normal[1], p3[0] + normal[0], p3[1] + normal[1])
  shape.lineTo(p3[0] - normal[0], p3[1] - normal[1])
  shape.bezierCurveTo(p2[0] - normal[0], p2[1] - normal[1], p1[0] - normal[0], p1[1] - normal[1], p0[0] - normal[0], p0[1] - normal[1])
  // shape.lineTo(p0[0] - normal[0], p0[1] - normal[1])
  return shape
}

export function drawBezierWall(conf: Cuttleform, walls: Trsf[], worldZ: Vector, bottomZ: number, width = 0.2) {
  const shapes = walls.map((a, i) => {
    const b = walls[(i + 1) % walls.length]
    const c = walls[(i + 2) % walls.length]
    const d = walls[(i + 3) % walls.length]
    const [p0, p1, p2, p3] = wallBezier(conf, a, b, c, d, worldZ, bottomZ).map(p => p.xy())
    return drawBezier(p0, p1, p2, p3, width)
  })
  return new THREE.ShapeGeometry(shapes)
}

export function drawRectangle(x: number, y: number, w: number, h: number) {
  const shape = new THREE.Shape()
  shape.moveTo(x, y)
  shape.lineTo(x + w, y)
  shape.lineTo(x + w, y + h)
  shape.lineTo(x, y + h)
  return new THREE.ShapeGeometry(shape)
}

export function drawLinedRectangle(x: number, y: number, w: number, h: number, width = 0.2) {
  const shape = new THREE.Shape()
  shape.moveTo(x - width, y - width)
  shape.lineTo(x + w + width, y - width)
  shape.lineTo(x + w + width, y + h + width)
  shape.lineTo(x - width, y + h + width)

  const hole = new THREE.Path()
  hole.moveTo(x + width, y + width)
  hole.lineTo(x + w - width, y + width)
  hole.lineTo(x + w - width, y + h - width)
  hole.lineTo(x + width, y + h - width)
  shape.holes = [hole]
  return new THREE.ShapeGeometry(shape)
}

export function drawLinedRectangleOutside(x: number, y: number, w: number, h: number, width = 0.2) {
  const shape = new THREE.Shape()
  shape.moveTo(x - width, y - width)
  shape.lineTo(x + w + width, y - width)
  shape.lineTo(x + w + width, y + h + width)
  shape.lineTo(x - width, y + h + width)

  const hole = new THREE.Path()
  hole.moveTo(x, y)
  hole.lineTo(x + w, y)
  hole.lineTo(x + w, y + h)
  hole.lineTo(x, y + h)
  shape.holes = [hole]
  return new THREE.ShapeGeometry(shape)
}

export function makeBox(cx: number, cy: number, cz: number, w: number, h: number, d: number) {
  return new THREE.BoxGeometry(w, h, d).translate(cx, cy, cz)
}
