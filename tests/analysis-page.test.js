const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const analysis = require(path.join(root, "analysis.js"));

test("analysis markup renders all six warehouse hotspots", () => {
  const markup = analysis.buildAnalysisMarkup();
  assert.equal((markup.match(/data-analysis-warehouse=/g) || []).length, 6);
  for (const id of ["A01", "A02", "A03", "B01", "B02", "B03"]) {
    assert.match(markup, new RegExp(`data-analysis-warehouse="${id}"`));
  }
});

test("analysis markup uses components instead of the full-page mock image", () => {
  const markup = analysis.buildAnalysisMarkup();
  assert.doesNotMatch(markup, /mock-analysis\.png/);
  assert.match(markup, /data-analysis-chart="risk-trend"/);
  assert.match(markup, /data-analysis-chart="prediction"/);
  assert.match(markup, /data-analysis-tab="export"/);
});

test("CSV export keeps Chinese headers and selected warehouse data", () => {
  const csv = analysis.buildAnalysisCsv("B02");
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /仓号,风险评分,温度/);
  assert.match(csv, /B02,/);
});

test("index loads local ECharts and analysis assets before app.js", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const echartsIndex = html.indexOf("./vendor/echarts.min.js");
  const analysisIndex = html.indexOf("./analysis.js");
  const appIndex = html.indexOf("./app.js");
  assert.ok(html.includes("./analysis.css"));
  assert.ok(echartsIndex > -1);
  assert.ok(analysisIndex > echartsIndex);
  assert.ok(appIndex > analysisIndex);
});

test("app delegates analysis rendering and removes the full-page image", () => {
  const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(appJs, /AnalysisDashboard\.render\(pageEls\.analysis\)/);
  assert.doesNotMatch(appJs, /analysis-page-image[\s\S]*mock-analysis\.png/);
});

test("analysis controls stay on one line", () => {
  const css = fs.readFileSync(path.join(root, "analysis.css"), "utf8");
  assert.match(css, /\.analysis-dashboard[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.analysis-control[\s\S]*white-space:\s*nowrap/);
});
