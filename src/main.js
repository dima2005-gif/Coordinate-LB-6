import { generatePolygon } from "./generators.js";
import { shoelaceArea, monteCarloArea, errorPercent } from "./algorithms.js";
import { jstsArea } from "./jstsAdapter.js";

let polygon = [];
let chart = null;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// -------------------------
// FORMAT TIME
// -------------------------
function formatTime(ms) {
  if (ms < 1) return (ms * 1000).toFixed(2) + " μs";
  return ms.toFixed(2) + " ms";
}

// -------------------------
// MEASURE (ВАЖНО)
// -------------------------
function measure(fn, repeats = 10000) {
  const start = performance.now();

  for (let i = 0; i < repeats; i++) {
    fn();
  }

  const end = performance.now();
  return (end - start) / repeats;
}

// -------------------------
// DRAW
// -------------------------
function draw(poly) {
  if (!poly || poly.length < 3) return;

  ctx.clearRect(0, 0, 500, 500);

  ctx.beginPath();
  ctx.moveTo(poly[0].x + 250, poly[0].y + 250);

  poly.forEach((p) => {
    ctx.lineTo(p.x + 250, p.y + 250);
  });

  ctx.closePath();
  ctx.strokeStyle = "white";
  ctx.stroke();
}

// -------------------------
// GENERATE
// -------------------------
window.generate = () => {
  const n = +document.getElementById("vertices").value;

  if (!Number.isFinite(n) || n < 3) {
    alert("Vertices must be ≥ 3");
    return;
  }

  polygon = generatePolygon(n, 120);

  draw(polygon);

  // reset UI
  document.getElementById("gauss").innerText = "-";
  document.getElementById("mc").innerText = "-";
  document.getElementById("error").innerText = "-";
  document.getElementById("jstsResult").innerText = "-";
};

// -------------------------
// ANALYZE
// -------------------------
window.analyze = () => {
  const iterations = +document.getElementById("iterations").value;

  if (!Number.isFinite(iterations) || iterations < 1) {
    alert("Iterations must be > 0");
    return;
  }

  if (!polygon || polygon.length < 3) {
    alert("Generate polygon first!");
    return;
  }

  // --- GAUSS ---
  const gaussTime = measure(() => shoelaceArea(polygon));
  const gauss = shoelaceArea(polygon);

  // --- MONTE CARLO ---
  const mcTime = measure(() => monteCarloArea(polygon, iterations), 100);
  const mc = monteCarloArea(polygon, iterations);

  // --- JSTS ---
  const jsts = jstsArea(polygon);

  const err = errorPercent(gauss, mc);

  // OUTPUT
  document.getElementById("gauss").innerText = gauss.toFixed(2);
  document.getElementById("mc").innerText = mc.toFixed(2);
  document.getElementById("error").innerText = err.toFixed(2);

  document.getElementById("jstsResult").innerText = jsts.toFixed(4);

  document.getElementById("timeG").innerText = formatTime(gaussTime);

  document.getElementById("timeMC").innerText = formatTime(mcTime);

  runExperiment();
  runBenchmark();
};

// -------------------------
// ERROR GRAPH
// -------------------------
function runExperiment() {
  const steps = [100, 500, 1000, 5000, 10000, 20000];

  const gauss = shoelaceArea(polygon);

  const errors = steps.map((s) =>
    errorPercent(gauss, monteCarloArea(polygon, s)),
  );

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: steps,
      datasets: [
        {
          label: "Monte Carlo Error %",
          data: errors,
        },
      ],
    },
  });
}

// -------------------------
// BENCHMARK
// -------------------------
function runBenchmark() {
  const sizes = [10, 50, 100, 1000];
  const iterations = 10000;

  const table = document.getElementById("benchmarkTable");
  table.innerHTML = "";

  sizes.forEach((n) => {
    const poly = generatePolygon(n, 120);

    const gaussTime = measure(() => shoelaceArea(poly));
    const mcTime = measure(() => monteCarloArea(poly, iterations), 50);

    table.innerHTML += `
      <tr>
        <td>${n}</td>
        <td>${formatTime(gaussTime)}</td>
        <td>${formatTime(mcTime)}</td>
      </tr>
    `;
  });
}

// -------------------------
// SAVE
// -------------------------
window.saveCanvas = () => {
  const link = document.createElement("a");
  link.download = "polygon.png";
  link.href = canvas.toDataURL();
  link.click();
};

window.saveChart = () => {
  const link = document.createElement("a");
  link.download = "error_plot.png";
  link.href = chart.toBase64Image();
  link.click();
};
