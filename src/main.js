import { generatePolygon } from "./generators.js";
import { shoelaceArea, monteCarloArea, errorPercent } from "./algorithms.js";
import { jstsArea } from "./jstsAdapter.js";

let polygon = [];
let chart = null;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// -------------------------
// TIME FORMAT (STABLE, NO μs FAKE)
// -------------------------
function formatTime(ms) {
  // честный вывод без иллюзий точности
  if (ms < 0.01) return "< 0.01 ms";
  return ms.toFixed(4) + " ms";
}

// -------------------------
// DRAW POLYGON
// -------------------------
function draw(poly) {
  if (!poly || poly.length < 3) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

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

  document.getElementById("gauss").innerText = "-";
  document.getElementById("mc").innerText = "-";
  document.getElementById("error").innerText = "-";
  document.getElementById("jstsResult").innerText = "-";
};

// -------------------------
// ANALYZE
// -------------------------
window.analyze = () => {
  const M = +document.getElementById("iterations").value;

  if (!Number.isFinite(M) || M < 1) {
    alert("Iterations must be > 0");
    return;
  }

  if (!polygon || polygon.length < 3) {
    alert("Generate polygon first!");
    return;
  }

  // GAUSS
  const t1 = performance.now();
  const gauss = shoelaceArea(polygon);
  const t2 = performance.now();

  // MONTE CARLO
  const t3 = performance.now();
  const mc = monteCarloArea(polygon, M);
  const t4 = performance.now();

  // JSTS (REFERENCE)
  const jsts = jstsArea(polygon);

  // ERROR
  const err = errorPercent(jsts, mc);

  // UI OUTPUT
  document.getElementById("gauss").innerText = gauss.toFixed(4);
  document.getElementById("mc").innerText = mc.toFixed(4);
  document.getElementById("error").innerText = err.toFixed(4);

  document.getElementById("jstsResult").innerText = jsts.toFixed(4);

  document.getElementById("timeG").innerText = formatTime(t2 - t1);

  document.getElementById("timeMC").innerText = formatTime(t4 - t3);

  runExperiment(jsts);
  runBenchmark();
};

// -------------------------
// ERROR CONVERGENCE GRAPH
// -------------------------
function runExperiment(jsts) {
  const steps = [100, 500, 1000, 5000, 10000, 20000];

  const errors = steps.map((s) =>
    errorPercent(jsts, monteCarloArea(polygon, s)),
  );

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: steps,
      datasets: [
        {
          label: "Monte Carlo error (%)",
          data: errors,
        },
      ],
    },
  });
}

// -------------------------
// BENCHMARK (SAFE VERSION)
// -------------------------
function runBenchmark() {
  const sizes = [10, 50, 100, 1000];
  const M = 20000; // снижено для стабильности

  const table = document.getElementById("benchmarkTable");
  table.innerHTML = "";

  sizes.forEach((n) => {
    const poly = generatePolygon(n, 120);

    // GAUSS
    const t1 = performance.now();
    shoelaceArea(poly);
    const t2 = performance.now();

    // MONTE CARLO
    const t3 = performance.now();
    monteCarloArea(poly, M);
    const t4 = performance.now();

    // JSTS
    const t5 = performance.now();
    jstsArea(poly);
    const t6 = performance.now();

    table.innerHTML += `
      <tr>
        <td>${n}</td>
        <td>${formatTime(t2 - t1)}</td>
        <td>${formatTime(t4 - t3)}</td>
        <td>${formatTime(t6 - t5)}</td>
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
