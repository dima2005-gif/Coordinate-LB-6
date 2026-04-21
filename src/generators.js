export function generatePolygon(
  numPoints,
  radius = 150.0,
  irregularity = 0.35,
) {
  // 1. Генеруємо випадкові кути
  const angles = [];

  for (let i = 0; i < numPoints; i++) {
    angles.push(Math.random() * 2 * Math.PI);
  }

  // 2. Сортуємо кути
  angles.sort((a, b) => a - b);

  const points = [];

  // 3. Генеруємо вершини полігону
  for (const angle of angles) {
    // випадковий радіус
    const r = radius * (1 - irregularity * Math.random());

    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);

    points.push({ x, y });
  }

  return points;
}
