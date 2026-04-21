export function visualizePolygon(canvas, polygon) {
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = 20;
  const offset = canvas.width / 2;

  ctx.beginPath();

  ctx.moveTo(polygon[0].x * scale + offset, polygon[0].y * scale + offset);

  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i].x * scale + offset, polygon[i].y * scale + offset);
  }

  ctx.closePath();

  // заливка
  ctx.fillStyle = "rgba(135, 206, 235, 0.4)";
  ctx.fill();

  // контур
  ctx.strokeStyle = "blue";
  ctx.stroke();

  // вершини
  for (const p of polygon) {
    ctx.beginPath();
    ctx.arc(p.x * scale + offset, p.y * scale + offset, 3, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  }
}
