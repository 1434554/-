(function (global, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  global.AnalysisDashboard = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const warehouses = [
    { id: "A01", risk: 32, temp: 23.8, humidity: 57.8, coverage: 81, rework: 5.8, utilization: 91, color: "#62ff69" },
    { id: "A02", risk: 58, temp: 27.2, humidity: 65.4, coverage: 73, rework: 11.2, utilization: 82, color: "#ffd43b" },
    { id: "A03", risk: 26, temp: 22.1, humidity: 55.9, coverage: 84, rework: 4.2, utilization: 88, color: "#77ff72" },
    { id: "B01", risk: 71, temp: 28.5, humidity: 69.1, coverage: 68, rework: 14.1, utilization: 76, color: "#ff9e2a" },
    { id: "B02", risk: 45, temp: 25.6, humidity: 62.3, coverage: 79, rework: 8.3, utilization: 86, color: "#a7ff56" },
    { id: "B03", risk: 33, temp: 24.3, humidity: 60.8, coverage: 80, rework: 6.1, utilization: 84, color: "#54e7ff" }
  ];
  const trends = {
    A01: [44, 43, 37, 42, 45, 39, 32],
    A02: [62, 57, 54, 59, 61, 55, 58],
    A03: [31, 29, 27, 32, 30, 24, 26],
    B01: [70, 65, 59, 64, 66, 61, 71],
    B02: [48, 45, 42, 47, 50, 44, 45],
    B03: [38, 34, 31, 35, 37, 30, 33]
  };
  const state = { warehouseId: "B02", range: "7", metric: "caking", tab: "dashboard", done: new Set() };
  const charts = new Map();
  const days = ["05-14", "05-15", "05-16", "05-17", "05-18", "05-19", "05-20"];

  function getWarehouse(id) {
    return warehouses.find((item) => item.id === id) || warehouses[0];
  }

  function arrow(value, reverse) {
    const good = reverse ? value < 0 : value > 0;
    return `<em class="${good ? "up" : "down"}">${value > 0 ? "↑" : "↓"} ${Math.abs(value).toFixed(1)}%</em>`;
  }

  function statCards(w) {
    return [
      ["累计作业时长", "128.6", "h", 12.6, "⏱"],
      ["作业覆盖率", w.coverage.toFixed(1), "%", 6.3, "⚙"],
      ["板结改善率", "62.4", "%", 8.7, "◎"],
      ["风险下降率", "32.1", "%", -9.4, "盾"],
      ["累计处理量", "12,860", "吨", 18.5, "▣"],
      ["机器人利用率", w.utilization.toFixed(1), "%", 10.2, "▤"],
      ["重复作业率", w.rework.toFixed(1), "%", -2.1, "↻"],
      ["任务达成率", "94.7", "%", 5.8, "✓"]
    ].map(([label, value, unit, delta, icon]) => `
      <div class="analysis-stat"><i>${icon}</i><span>${label}</span><strong>${value}<small>${unit}</small></strong>${arrow(delta, label.includes("风险") || label.includes("重复"))}</div>
    `).join("");
  }

  function adviceRows(w) {
    const rows = [
      [`${w.id}仓板结风险偏中，建议安排深钻作业`, "紧急"],
      [`${w.id}仓粮温 ${w.temp.toFixed(1)}℃，需重点关注`, "优化"],
      ["R02 机器人利用率偏低，建议调整任务分配", "优化"],
      ["检测到 B03 仓存在局部高温区域，建议送风干燥", "关注"],
      ["本周作业覆盖率未达目标，建议增加作业时长", "优化"]
    ];
    return rows.map(([text, label], index) => {
      const key = `${w.id}-${index}`;
      const done = state.done.has(key);
      return `<li class="${done ? "done" : ""}"><b></b><span>${done ? "已执行：" : ""}${text}</span><button class="analysis-control" data-analysis-advice="${key}">${done ? "已处理" : label}</button></li>`;
    }).join("");
  }

  function assetText() {
    const map = {
      dashboard: ["数据总量", "2.68 TB", "数据记录数", "1,258 万条"],
      multidim: ["活跃维度", "18 个", "关联指标", "46 项"],
      forecast: ["预测窗口", "未来 7 天", "预警命中率", "91.9%"],
      report: ["已生成报告", "32 份", "本周新增", "5 份"],
      custom: ["自定义模板", "9 套", "启用报表", "6 张"],
      export: ["导出格式", "CSV", "当前仓号", state.warehouseId]
    }[state.tab];
    return `<div class="asset-box"><div><span>${map[0]}</span><strong>${map[1]}</strong></div><div><span>${map[2]}</span><strong>${map[3]}</strong></div></div>`;
  }

  function buildAnalysisMarkup() {
    const w = getWarehouse(state.warehouseId);
    const high = warehouses.filter((item) => item.risk >= 55).length;
    const mid = warehouses.filter((item) => item.risk >= 38 && item.risk < 55).length;
    const low = warehouses.filter((item) => item.risk < 38).length;
    const priority = warehouses.slice().sort((a, b) => b.risk - a.risk).slice(0, 3).map((item) => item.id).join(" > ");
    return `
      <div class="analysis-dashboard" data-analysis-root>
        <section class="analysis-panel kpi"><h2>关键指标总览 <small>近${state.range}天</small></h2><div class="analysis-toolbar">${["7", "30"].map((r) => `<button class="analysis-control ${state.range === r ? "active" : ""}" data-analysis-range="${r}">近${r}天</button>`).join("")}</div><div class="analysis-stats">${statCards(w)}</div></section>
        <section class="analysis-panel map"><h2>粮仓风险热力分布与作业效果概览</h2><div class="silo-stage"><img src="./3d模型.png" alt="六个粮仓三维视图">${warehouses.map((item) => `<button class="hotspot ${item.id === w.id ? "active" : ""} p-${item.id.toLowerCase()}" style="--c:${item.color}" data-analysis-warehouse="${item.id}">${item.id}</button>`).join("")}<div class="legend"><strong>风险等级</strong><span><i class="d"></i>极高</span><span><i class="w"></i>高</span><span><i class="m"></i>中</span><span><i class="l"></i>低</span></div></div><div class="summary"><div><span>高风险仓数</span><strong>${high}个</strong>${arrow(-1, true)}</div><div><span>中风险仓数</span><strong>${mid}个</strong></div><div><span>低风险仓数</span><strong>${low}个</strong>${arrow(1, false)}</div><div><span>待处理区域</span><strong>2处</strong>${arrow(-2, true)}</div><div><span>建议优先级</span><strong>${priority}</strong></div></div></section>
        <section class="analysis-panel compare"><h2>作业效果对比分析 <small>近${state.range}天</small></h2><label>选择指标<select class="analysis-control" data-analysis-metric><option value="caking" ${state.metric === "caking" ? "selected" : ""}>板结指数</option><option value="density" ${state.metric === "density" ? "selected" : ""}>密实度</option><option value="ventilation" ${state.metric === "ventilation" ? "selected" : ""}>通气性</option></select></label><div class="compare-grid"><div><span>作业前平均</span><strong>${state.metric === "density" ? "0.78" : state.metric === "ventilation" ? "1.23" : "68.7"}</strong></div><div><span>作业后平均</span><strong>${state.metric === "density" ? "0.62" : state.metric === "ventilation" ? "2.36" : "26.1"}</strong></div><div><span>${state.metric === "ventilation" ? "提升率" : "改善率"}</span><strong class="green">${state.metric === "density" ? "20.5%" : state.metric === "ventilation" ? "91.9%" : "62.0%"}</strong></div></div></section>
        <section class="analysis-panel risk"><h2>多仓风险评分趋势 <small>近${state.range}天</small></h2><div class="chart" data-analysis-chart="risk-trend"></div></section>
        <section class="analysis-panel advice"><h2>智能决策建议</h2><ul>${adviceRows(w)}</ul></section>
        <section class="analysis-panel env"><h2>环境趋势分析 <small>近${state.range}天</small></h2><div class="two"><div><span>温度趋势（℃）</span><div class="chart" data-analysis-chart="temperature"></div></div><div><span>湿度趋势（%RH）</span><div class="chart" data-analysis-chart="humidity"></div></div></div></section>
        <section class="analysis-panel efficiency"><h2>作业效率分析 <small>近${state.range}天</small></h2><div class="gauges">${[["单位面积处理时间", "eff-time"], ["作业覆盖率", "eff-coverage"], ["重复作业率", "eff-rework"], ["设备利用率", "eff-util"]].map(([t, c]) => `<div><span>${t}</span><div class="chart" data-analysis-chart="${c}"></div></div>`).join("")}</div></section>
        <section class="analysis-panel path"><h2>作业路径合理性分析 <small>近${state.range}天</small></h2><div class="score"><strong>87.5</strong><span>良好</span></div><div class="chart" data-analysis-chart="path-radar"></div></section>
        <section class="analysis-panel predict"><h2>时序预测分析</h2><div class="tabs">${["温度预测", "湿度预测", "风险预测", "板结指数预测"].map((t, i) => `<button class="analysis-control ${i === 2 ? "active" : ""}">${t}</button>`).join("")}</div><div class="chart" data-analysis-chart="prediction"></div></section>
        <section class="analysis-panel asset"><h2>数据资产概览</h2>${assetText()}<div class="chart" data-analysis-chart="asset-trend"></div></section>
        <nav class="analysis-bottom">${[["dashboard", "▰", "数据看板"], ["multidim", "⌘", "多维分析"], ["forecast", "◎", "模型预测"], ["report", "▤", "智能报告"], ["custom", "▣", "自定义报表"], ["export", "⇩", "数据导出"]].map(([tab, icon, text]) => `<button class="${state.tab === tab ? "active" : ""}" data-analysis-tab="${tab}"><span>${icon}</span>${text}</button>`).join("")}</nav>
      </div>`;
  }

  function buildAnalysisCsv(id = state.warehouseId) {
    const w = getWarehouse(id);
    return `\uFEFF仓号,风险评分,温度,湿度,板结改善率,覆盖率,设备利用率\n${w.id},${w.risk},${w.temp},${w.humidity},62.0%,${w.coverage},${w.utilization}`;
  }

  function clearCharts() {
    charts.forEach((chart) => chart.dispose());
    charts.clear();
  }

  function line(names, values, colors) {
    return { tooltip: { trigger: "axis", confine: true }, legend: { top: 0, textStyle: { color: "#dfffe0", fontSize: 10 } }, grid: { left: 34, right: 14, top: 30, bottom: 24 }, xAxis: { type: "category", data: days, axisLabel: { color: "#c9fbd0", fontSize: 10 }, axisLine: { lineStyle: { color: "#3f8b55" } } }, yAxis: { type: "value", axisLabel: { color: "#c9fbd0", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(91,255,124,.13)" } } }, series: names.map((name, i) => ({ name, type: "line", smooth: true, symbolSize: 5, data: values[i], lineStyle: { color: colors[i], width: 2 }, itemStyle: { color: colors[i] }, areaStyle: i === 0 ? { color: "rgba(118,255,98,.13)" } : undefined })) };
  }

  function gauge(value, max, color) {
    return { series: [{ type: "gauge", min: 0, max, radius: "92%", startAngle: 210, endAngle: -30, pointer: { show: false }, progress: { show: true, width: 8, itemStyle: { color } }, axisLine: { lineStyle: { width: 8, color: [[1, "rgba(126,255,114,.18)"]] } }, splitLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, detail: { formatter: "{value}", color: "#f1fff0", fontSize: 18, offsetCenter: [0, "10%"] }, data: [{ value }] }] };
  }

  function initCharts(root) {
    if (!globalThis.echarts) return;
    clearCharts();
    const w = getWarehouse(state.warehouseId);
    const opts = {
      "risk-trend": line(warehouses.map((x) => x.id), warehouses.map((x) => trends[x.id]), warehouses.map((x) => x.color)),
      temperature: line(["温度"], [[21, 24, 28, 29, 27, 30, w.temp]], ["#70ff6f"]),
      humidity: line(["湿度"], [[58, 61, 63, 62, 64, 60, w.humidity]], ["#42d9ff"]),
      "eff-time": gauge(12.6, 20, "#70ff6f"),
      "eff-coverage": gauge(w.coverage, 100, "#70ff6f"),
      "eff-rework": gauge(w.rework, 30, w.rework > 10 ? "#ffd43b" : "#70ff6f"),
      "eff-util": gauge(w.utilization, 100, "#70ff6f"),
      "path-radar": { tooltip: { confine: true }, radar: { radius: "68%", indicator: ["覆盖完整性", "路径最优性", "重复率控制", "作业连续性", "转弯效率"].map((name) => ({ name, max: 100 })), axisName: { color: "#c9fbd0", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(91,255,124,.22)" } } }, series: [{ type: "radar", data: [{ value: [88, 84, 79, 91, 82], areaStyle: { color: "rgba(66,217,255,.26)" }, lineStyle: { color: "#42d9ff" }, itemStyle: { color: "#76ff62" } }] }] },
      prediction: line(["预测风险值", "阈值线"], [[32, 46, 51, 59, 73, 75, 76], [75, 75, 75, 75, 75, 75, 75]], ["#ff9e2a", "#ff4b3e"]),
      "asset-trend": line(["历史积累趋势（TB）"], [[0.6, 1.1, 1.3, 1.8, 2.4, 2.8, 3.0]], ["#86ff62"])
    };
    root.querySelectorAll("[data-analysis-chart]").forEach((el) => {
      const chart = globalThis.echarts.init(el);
      chart.setOption(opts[el.dataset.analysisChart]);
      charts.set(el.dataset.analysisChart, chart);
    });
    setTimeout(() => charts.forEach((chart) => chart.resize()), 30);
  }

  function mount(root) {
    clearCharts();
    root.innerHTML = buildAnalysisMarkup();
    root.onclick = (event) => {
      const warehouse = event.target.closest("[data-analysis-warehouse]");
      const range = event.target.closest("[data-analysis-range]");
      const advice = event.target.closest("[data-analysis-advice]");
      const tab = event.target.closest("[data-analysis-tab]");
      if (warehouse) state.warehouseId = warehouse.dataset.analysisWarehouse;
      else if (range) state.range = range.dataset.analysisRange;
      else if (advice) state.done.add(advice.dataset.analysisAdvice);
      else if (tab) {
        state.tab = tab.dataset.analysisTab;
        if (state.tab === "export") {
          const blob = new Blob([buildAnalysisCsv()], { type: "text/csv;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `analysis-${state.warehouseId}.csv`;
          link.click();
          URL.revokeObjectURL(url);
        }
      } else return;
      mount(root);
    };
    root.onchange = (event) => {
      if (event.target.matches("[data-analysis-metric]")) {
        state.metric = event.target.value;
        mount(root);
      }
    };
    initCharts(root);
  }

  function render(root) {
    if (!root) return;
    if (root.dataset.analysisMounted !== "true") {
      root.dataset.analysisMounted = "true";
      mount(root);
    } else {
      setTimeout(() => charts.forEach((chart) => chart.resize()), 30);
    }
  }

  if (typeof window !== "undefined") window.addEventListener("resize", () => charts.forEach((chart) => chart.resize()));
  return { buildAnalysisCsv, buildAnalysisMarkup, getWarehouse, render, state };
});
