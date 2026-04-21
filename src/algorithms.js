export function shoelaceArea(polygon) {
  let area = 0;

  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }

  return Math.abs(area) / 2;
}

function isInside(p, poly) {
  let inside = false;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y;
    const xj = poly[j].x,
      yj = poly[j].y;

    const intersect =
      yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

export function monteCarloArea(poly, iterations) {
  const xs = poly.map((p) => p.x);
  const ys = poly.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const boxArea = (maxX - minX) * (maxY - minY);

  let inside = 0;

  for (let i = 0; i < iterations; i++) {
    const p = {
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY,
    };

    if (isInside(p, poly)) inside++;
  }

  return (inside / iterations) * boxArea;
}

export function errorPercent(real, approx) {
  return (Math.abs(real - approx) / real) * 100;
}
