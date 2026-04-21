export function jstsArea(points) {
  const gf = new jsts.geom.GeometryFactory();

  const coords = points.map((p) => new jsts.geom.Coordinate(p.x, p.y));

  coords.push(coords[0]);

  const polygon = gf.createPolygon(gf.createLinearRing(coords));

  return polygon.getArea();
}
