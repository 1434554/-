const warehouses = [
  { id: "A01", type: "立筒仓", grain: "玉米", capacity: 8000, current: 6120, temp: 22.8, humidity: 58.4, oxygen: 20.9, co2: 520, dust: 0.18, caking: "轻度", risk: 36, taskStatus: "计划中" },
  { id: "A02", type: "立筒仓", grain: "小麦", capacity: 7600, current: 6840, temp: 24.1, humidity: 64.5, oxygen: 20.7, co2: 650, dust: 0.28, caking: "中度", risk: 55, taskStatus: "待执行" },
  { id: "A03", type: "立筒仓", grain: "稻谷", capacity: 7200, current: 4960, temp: 25.8, humidity: 68.2, oxygen: 20.5, co2: 730, dust: 0.42, caking: "中度", risk: 62, taskStatus: "巡检中" },
  { id: "B01", type: "立筒仓", grain: "玉米", capacity: 8200, current: 7010, temp: 21.9, humidity: 56.8, oxygen: 21.0, co2: 480, dust: 0.15, caking: "低", risk: 28, taskStatus: "空闲" },
  { id: "B02", type: "立筒仓", grain: "玉米", capacity: 8000, current: 6230, temp: 23.6, humidity: 62.3, oxygen: 20.8, co2: 612, dust: 0.35, caking: "中度", risk: 68, taskStatus: "执行中" },
  { id: "B03", type: "立筒仓", grain: "小麦", capacity: 7800, current: 6540, temp: 22.6, humidity: 60.2, oxygen: 20.9, co2: 570, dust: 0.22, caking: "轻度", risk: 42, taskStatus: "待执行" }
];

const robots = [
  { id: "R01", warehouseId: "B02", status: "作业中", battery: 86, depth: 13.25, targetDepth: 20, progress: 75, coverage: 62, speed: 1.25, torque: 185, current: 42.3, force: 32.5 },
  { id: "R02", warehouseId: "A02", status: "待命", battery: 91, depth: 0, targetDepth: 18, progress: 0, coverage: 0, speed: 0, torque: 0, current: 8.2, force: 0 },
  { id: "R03", warehouseId: "A03", status: "巡检中", battery: 78, depth: 4.8, targetDepth: 16, progress: 31, coverage: 22, speed: 0.85, torque: 92, current: 24.1, force: 14.8 },
  { id: "R04", warehouseId: "B01", status: "充电中", battery: 52, depth: 0, targetDepth: 20, progress: 0, coverage: 0, speed: 0, torque: 0, current: 6.5, force: 0 }
];

const tasks = [
  { id: "T240520001", warehouseId: "B02", type: "深钻除板结", priority: "高", status: "执行中", time: "09:00-11:00", robotId: "R01" },
  { id: "T240520002", warehouseId: "A02", type: "边角处巡检", priority: "中", status: "待执行", time: "10:30-11:30", robotId: "R02" },
  { id: "T240520003", warehouseId: "B03", type: "重点区重作业", priority: "高", status: "待执行", time: "11:00-13:00", robotId: "R05" },
  { id: "T240520004", warehouseId: "A01", type: "深钻除板结", priority: "低", status: "计划中", time: "13:30-14:30", robotId: "R06" },
  { id: "T240520005", warehouseId: "B01", type: "深钻除板结", priority: "中", status: "计划中", time: "14:00-16:00", robotId: "R04" },
  { id: "T240520006", warehouseId: "A03", type: "粮面巡检", priority: "中", status: "执行中", time: "09:20-10:20", robotId: "R03" }
];

let alarms = [
  { id: "ALM001", level: "IV", type: "板结加剧风险", warehouseId: "B02", time: "09:31:22", status: "处理中", suggestion: "降低作业速度并启动局部通风" },
  { id: "ALM002", level: "III", type: "粮温偏高", warehouseId: "A03", time: "09:18:45", status: "处理中", suggestion: "开启通风并复测粮温" },
  { id: "ALM003", level: "II", type: "粉尘浓度升高", warehouseId: "A02", time: "08:56:33", status: "已处理", suggestion: "降低钻进速度并启用除尘" },
  { id: "ALM004", level: "II", type: "湿度波动", warehouseId: "B03", time: "08:32:17", status: "已处理", suggestion: "增加巡检频次" }
];

const mockPages = {
  "mock-archive": { title: "仓储档案管理", image: "./mock-archive.png" },
  "mock-task": { title: "深钻作业任务下发", image: "./mock-task.png" },
  "mock-strategy": { title: "机器人智能调度策略", image: "./mock-strategy.png" },
  "mock-device": { title: "设备台账管理", image: "./mock-device.png" }
};

const pageKeys = ["dashboard", "operations", "control", "monitor", "analysis", ...Object.keys(mockPages)];
const initialPage = pageKeys.includes(location.hash.replace("#", "")) ? location.hash.replace("#", "") : "dashboard";

const state = {
  page: initialPage,
  selectedWarehouseId: "B02",
  viewMode: "三维视图",
  taskFilter: "全部",
  running: true,
  params: {
    targetDepth: 20,
    power: 70,
    speed: 1.5
  }
};

const pageEls = {
  dashboard: document.querySelector('[data-view="dashboard"]'),
  operations: document.querySelector('[data-view="operations"]'),
  control: document.querySelector('[data-view="control"]'),
  monitor: document.querySelector('[data-view="monitor"]'),
  analysis: document.querySelector('[data-view="analysis"]'),
  mock: ensureMockPage()
};

function ensureMockPage() {
  let el = document.querySelector('[data-view="mock"]');
  if (!el) {
    el = document.createElement("section");
    el.className = "page page-mock";
    el.dataset.view = "mock";
    document.querySelector("main").appendChild(el);
  }
  return el;
}

function getWarehouse() {
  return warehouses.find((item) => item.id === state.selectedWarehouseId) || warehouses[0];
}

function getRobot() {
  return robots.find((item) => item.warehouseId === state.selectedWarehouseId);
}

function getTasks() {
  return tasks.filter((item) => item.warehouseId === state.selectedWarehouseId);
}

function getAlarms() {
  return alarms.filter((item) => item.warehouseId === state.selectedWarehouseId);
}

function healthSummary() {
  const total = warehouses.length;
  const summary = warehouses.reduce((acc, item) => {
    if (item.taskStatus === "离线") acc.offline += 1;
    else if (item.risk >= 75) acc.fault += 1;
    else if (["执行中", "巡检中"].includes(item.taskStatus)) acc.running += 1;
    else acc.standby += 1;
    return acc;
  }, { running: 0, standby: 0, fault: 0, offline: 0 });

  return [
    ["运行中", summary.running, Math.round((summary.running / total) * 100), "#76ff62"],
    ["待机中", summary.standby, Math.round((summary.standby / total) * 100), "#ffd43b"],
    ["故障", summary.fault, Math.round((summary.fault / total) * 100), "#ff4b3e"],
    ["离线", summary.offline, Math.round((summary.offline / total) * 100), "#a7d7a8"]
  ];
}

function badgeClass(value) {
  if (["高", "IV", "高风险", "执行中", "中度"].includes(value)) return "danger";
  if (["中", "III", "待执行", "计划中", "轻度"].includes(value)) return "warn";
  return "info";
}

function warehouseSwitcher() {
  return `<div class="warehouse-switcher">${warehouses.map((item) => `
    <button class="warehouse-button ${item.id === state.selectedWarehouseId ? "is-active" : ""}" data-warehouse="${item.id}">${item.id}</button>
  `).join("")}</div>`;
}

function verticalWarehouseSwitcher() {
  return `<div class="warehouse-switcher vertical">${warehouses.map((item) => `
    <button class="warehouse-button ${item.id === state.selectedWarehouseId ? "is-active" : ""}" data-warehouse="${item.id}">${item.id}</button>
  `).join("")}</div>`;
}

function metrics(items) {
  return `<div class="metric-grid">${items.map((item) => `
    <div class="metric ${item.tone ? `is-${item.tone}` : ""} ${item.icon ? "kpi-icon" : ""}">
      ${item.icon ? `<div class="kpi-symbol">${item.icon}</div>` : ""}
      <div>
      <div class="metric-label">${item.label}</div>
      <div class="metric-value">${item.value}<small>${item.unit || ""}</small></div>
      </div>
    </div>
  `).join("")}</div>`;
}

function metricRow(items) {
  return `<div class="metric-row">${items.map((item) => `
    <div class="metric ${item.tone ? `is-${item.tone}` : ""} ${item.icon ? "kpi-icon" : ""}">
      ${item.icon ? `<div class="kpi-symbol">${item.icon}</div>` : ""}
      <div>
      <div class="metric-label">${item.label}</div>
      <div class="metric-value">${item.value}<small>${item.unit || ""}</small></div>
      </div>
    </div>
  `).join("")}</div>`;
}

function gaugeGrid(items) {
  return `<div class="gauge-grid">${items.map((item) => `
    <div class="gauge">
      <div class="gauge-ring" style="--value:${item.percent}; --tone:${item.color}" data-value="${item.value}"></div>
      <div class="gauge-label">${item.label}</div>
    </div>
  `).join("")}</div>`;
}

function taskOverview() {
  return `<div class="overview-card">
    <div class="gauge big-gauge"><div class="gauge-ring" style="--value:75; --tone:#76ff62" data-value="75"></div></div>
    <div>
      ${[
        ["今日任务", tasks.length],
        ["已完成", 2],
        ["进行中", tasks.filter((item) => item.status === "执行中").length],
        ["未开始", tasks.filter((item) => item.status !== "执行中").length]
      ].map(([label, value]) => `<div class="stat-line"><span>${label}</span><strong>${value}</strong></div>`).join("")}
    </div>
  </div>`;
}

function bottomStats() {
  return `<div class="bottom-stats">
    ${[
      ["机器人总数", "6 台", "☷"],
      ["今日作业时长", "6.2 h", "◷"],
      ["今日处理量", "785 吨", "◆"],
      ["累计处理量", "12,456 吨", "▣"]
    ].map(([label, value, icon]) => `<div class="bottom-stat"><div class="bottom-stat-icon">${icon}</div><div><div class="metric-label">${label}</div><div class="bottom-stat-value">${value}</div></div></div>`).join("")}
  </div>`;
}

function siloPositions() {
  return [
    { id: "A01", left: "18%", top: "15%" },
    { id: "A02", left: "49%", top: "14%" },
    { id: "A03", left: "80%", top: "15%" },
    { id: "B01", left: "18%", top: "72%" },
    { id: "B02", left: "49%", top: "72%" },
    { id: "B03", left: "80%", top: "72%" }
  ];
}

function warehouseTwin(extraClass = "") {
  return `<div class="warehouse-twin warehouse-map-twin ${extraClass}">
    <img class="warehouse-map-image" src="./3d模型.png" alt="六个粮仓三维视图" />
    ${siloPositions().map((pos) => {
      const warehouse = warehouses.find((item) => item.id === pos.id);
      const selected = warehouse.id === state.selectedWarehouseId ? "is-selected" : "";
      const danger = warehouse.risk >= 60 ? "is-danger" : "";
      const robot = robots.some((item) => item.warehouseId === warehouse.id && item.status !== "充电中");
      return `<button class="warehouse-map-hotspot ${selected} ${danger}" style="--x:${pos.left}; --y:${pos.top}" data-warehouse="${warehouse.id}" aria-label="选择${warehouse.id}粮仓">
        <span class="hotspot-a11y">${warehouse.id}</span>
        ${robot ? '<span class="robot-dot"></span>' : ""}
      </button>`;
    }).join("")}
  </div>`;
}

function lineChart(values, color = "#76ff62") {
  const width = 300;
  const height = 110;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / Math.max(max - min, 1)) * (height - 18) - 8;
    return `${x},${y}`;
  }).join(" ");
  return `<div class="chart line-chart"><svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
    <line x1="0" y1="${height - 22}" x2="${width}" y2="${height - 22}" stroke="rgba(118,255,98,.22)" stroke-width="1"></line>
    <line x1="0" y1="${Math.round(height * .35)}" x2="${width}" y2="${Math.round(height * .35)}" stroke="rgba(255,212,59,.3)" stroke-dasharray="6 5" stroke-width="1"></line>
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <polyline points="${points}" fill="none" stroke="rgba(255,255,255,.36)" stroke-width="1"></polyline>
    ${values.map((_, index) => {
      const [x, y] = points.split(" ")[index].split(",");
      return `<circle cx="${x}" cy="${y}" r="3" fill="${color}"></circle>`;
    }).join("")}
  </svg></div>`;
}

function barChart() {
  const max = Math.max(...warehouses.map((item) => item.current));
  return `<div class="bar-chart">${warehouses.map((item) => `
    <div style="display:flex; flex-direction:column; flex:1; height:100%; justify-content:flex-end">
      <div class="bar" style="height:${Math.round((item.current / max) * 100)}%"></div>
      <div class="bar-label">${item.id}</div>
    </div>
  `).join("")}</div>`;
}

function compactBarChart() {
  const max = Math.max(...warehouses.map((item) => item.current));
  return `<div class="bar-chart compact">${warehouses.map((item) => `
    <div style="display:flex; flex-direction:column; flex:1; height:100%; justify-content:flex-end">
      <div class="bar" style="height:${Math.round((item.current / max) * 92)}%"></div>
      <div class="bar-label">${item.id}</div>
    </div>
  `).join("")}</div>`;
}

function warehouseCoreInfo(warehouse) {
  return `<div class="list">
    ${[
      ["仓型", warehouse.type],
      ["粮种", warehouse.grain],
      ["总容量", `${warehouse.capacity} 吨`],
      ["当前仓储量", `${warehouse.current} 吨`],
      ["平均温度", `${warehouse.temp.toFixed(1)} °C`],
      ["平均湿度", `${warehouse.humidity.toFixed(1)} %RH`],
      ["板结等级", warehouse.caking]
    ].map(([label, value]) => `<div class="list-item"><div class="item-title">${label}</div><span class="badge ${badgeClass(value)}">${value}</span></div>`).join("")}
  </div>`;
}

function scheduleTimeline() {
  const rows = [
    ["R01", "B02 深钻除板结", "09:00-11:00", 8, 30],
    ["R02", "A02 边角巡检", "10:30-11:30", 26, 18],
    ["R03", "B03 重点区重作业", "11:00-13:00", 35, 28],
    ["R04", "A01 深钻除板结", "13:30-14:30", 52, 22]
  ];
  return `<div class="timeline-title"><span>今日作业计划（时间轴）</span><span>08:00　10:00　12:00　14:00　16:00</span></div><div class="timeline">${rows.map(([id, label, time, left, width]) => `
    <div class="timeline-row">
      <strong>${id}</strong>
      <div class="timeline-track"><span class="timeline-block" title="${time}" style="left:${left}%; width:${width}%">${label}</span></div>
    </div>
  `).join("")}</div>`;
}

function scheduleBoard() {
  return `<div class="schedule-board">
    <table class="robot-assign">
      <thead><tr><th>机器人</th><th>仓号</th><th>状态</th></tr></thead>
      <tbody>
        ${robots.slice(0, 4).map((item) => `<tr><td>${item.id}</td><td>${item.warehouseId}</td><td><span class="badge ${badgeClass(item.status)}">${item.status}</span></td></tr>`).join("")}
      </tbody>
    </table>
    <div>${scheduleTimeline()}</div>
  </div>`;
}

function deviceManager() {
  const groups = [
    ["通信设备", [["5G基站", "6/6 正常"], ["路由器", "6/6 正常"], ["交换机", "6/6 正常"]]],
    ["能源系统", [["储能电池", "2/2 正常"], ["充电桩", "3/3 正常"], ["配电柜", "3/3 正常"]]],
    ["感知设备", [["温湿度传感器", "15/15 正常"], ["压力传感器", "6/6 正常"], ["气体传感器", "3/3 正常"]]]
  ];
  return `<div class="device-grid">
    ${groups.map(([title, rows]) => `<div class="device-group"><div class="device-group-title">${title}</div>${rows.map(([name, value]) => `<div class="device-row"><span>▣</span><span>${name}<br><b>${value}</b></span></div>`).join("")}</div>`).join("")}
    <div class="robot-donut"><div class="gauge-ring"></div><div class="gauge-label">正常42 / 待命3 / 维修2 / 异常1</div></div>
  </div>`;
}

function alarmList(limit = 5) {
  const current = getAlarms().slice(0, limit);
  if (!current.length) {
    return '<div class="list-item"><div><div class="item-title">当前仓无告警</div><div class="item-sub">设备与粮情状态稳定</div></div><span class="badge info">正常</span></div>';
  }
  return `<div class="list">${current.map((item) => `
    <div class="list-item" data-alarm="${item.id}">
      <div>
        <div class="item-title">${item.type}</div>
        <div class="item-sub">${item.warehouseId}仓 ${item.time} ${item.suggestion}</div>
      </div>
      <span class="badge ${badgeClass(item.level)}">${item.level}级</span>
    </div>
  `).join("")}</div>`;
}

function taskTable(rows) {
  const list = rows || getTasks();
  const filtered = state.taskFilter === "全部" ? list : list.filter((item) => item.status === state.taskFilter);
  return `<table class="data-table">
    <thead><tr><th>任务编号</th><th>仓号</th><th>任务类型</th><th>优先级</th><th>状态</th><th>计划时间</th></tr></thead>
    <tbody>${filtered.map((item) => `
      <tr><td>${item.id}</td><td>${item.warehouseId}</td><td>${item.type}</td><td><span class="badge ${badgeClass(item.priority)}">${item.priority}</span></td><td>${item.status}</td><td>${item.time}</td></tr>
    `).join("") || '<tr><td colspan="6">当前筛选下暂无任务</td></tr>'}</tbody>
  </table>`;
}

function videoGrid() {
  return `<div class="video-grid">
    ${["粮仓实时状况", "机器人侧视画面", "作业过程回放"].map((name) => `
      <div class="video-card" data-video="${name}">
        <div class="play">▶</div>
        <div class="item-title">${name}</div>
        <div class="item-sub">${state.selectedWarehouseId}仓 ${name.includes("回放") ? "02:15 / 10:00" : "实时监控"}</div>
        <div class="progress"><span style="width:${name.includes("回放") ? 64 : 42}%"></span></div>
      </div>
    `).join("")}
  </div>`;
}

function renderDashboard() {
  const warehouse = getWarehouse();
  const robot = getRobot();
  const sceneImage = state.viewMode === "三维视图" ? "./3d模型.png" : "./热力图.png";
  pageEls.dashboard.innerHTML = `
    <div class="dashboard-shell">
      <div class="dashboard-main">
        <div class="column">
          <section class="panel">
            <h2 class="panel-title">设备健康状态</h2>
            <div class="health-ring-grid">
              ${healthSummary().map(([label, value, percent, color]) => `<div class="health-ring"><div class="gauge-ring" style="--value:${percent}; --tone:${color}" data-value="${value}"></div><div class="gauge-label">${label}</div></div>`).join("")}
            </div>
          </section>
          <section class="panel">
            <h2 class="panel-title">粮情环境监测</h2>
            <div class="env-grid">
              ${[
                ["♨", "平均温度", `${warehouse.temp.toFixed(1)}°C`],
                ["💧", "平均湿度", `${warehouse.humidity.toFixed(1)}%RH`],
                ["O₂", "氧气含量", `${warehouse.oxygen.toFixed(1)}%`],
                ["✤", "粉尘浓度", `${warehouse.dust.toFixed(2)}mg/m³`]
              ].map(([icon, label, value]) => `<div class="env-item"><div class="env-icon">${icon}</div><div><div class="env-value">${value}</div><div class="metric-label">${label}</div></div></div>`).join("")}
              <div class="env-score"><div class="env-icon">⬟</div><div><div class="metric-value warn">32<small>/100</small></div><div class="metric-label">综合风险</div></div></div>
            </div>
          </section>
          <section class="panel dashboard-alarm">
            <h2 class="panel-title">实时告警</h2>
            <div class="list">
              ${[
                ["A03仓", "温度异常", "09:31", "danger"],
                ["B02仓", "湿度异常", "09:18", "warn"],
                ["A02仓", "设备振动异常", "08:56", "danger"]
              ].map(([id, text, time, tone]) => `<div class="list-item"><div><div class="item-title">${id} ${text}</div></div><span class="badge ${tone}">${time}</span></div>`).join("")}
            </div>
          </section>
        </div>

        <div class="dashboard-center">
          <div class="hero-scene">
            <img src="${sceneImage}" alt="${state.viewMode}场景" />
          </div>
          <div class="scene-mode-row">
            ${["三维视图", "热力图", "风险分布"].map((item) => `<button class="chip ${state.viewMode === item ? "is-active" : ""}" data-mode="${item}">${item}</button>`).join("")}
          </div>
        </div>

        <div class="column">
          <section class="panel">
            <h2 class="panel-title">作业任务概览</h2>
            <div class="task-summary">
              <div class="gauge big-gauge"><div class="gauge-ring" style="--value:75; --tone:#76ff62" data-value="75"></div><div class="gauge-label">任务完成率</div></div>
              <div>
                ${[
                  ["今日任务", 8],
                  ["已完成", 6],
                  ["进行中", 2],
                  ["未开始", 0]
                ].map(([label, value]) => `<div class="stat-line"><span>${label}</span><strong>${value}</strong></div>`).join("")}
              </div>
            </div>
          </section>
          <section class="panel">
            <h2 class="panel-title">当前作业</h2>
            ${[
              ["目标仓号", `${warehouse.id}仓`],
              ["当前机器人", "3台"],
              ["作业深度", "12.5m / 28m"],
              ["覆盖率", "45%"],
              ["预计完成时间", "10:30"]
            ].map(([label, value]) => `<div class="current-work-row"><span>▧</span><span>${label}</span><strong>${value}</strong></div>`).join("")}
            <div class="progress" style="margin-top:8px"><span style="width:45%"></span></div>
          </section>
          <section class="panel">
            <h2 class="panel-title">趋势与决策支持</h2>
            <div class="decision-grid">
              <div>${lineChart([22, 36, 31, 68, 42, 35, 72], "#76ff62")}</div>
              <div class="decision-list">
                ${["加强通风 降低湿度", "关注A03仓 温度异常", "安排除板结作业"].map((item) => `<div class="decision-item">${item}</div>`).join("")}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div class="dashboard-bottom">
        <div class="dashboard-bottom-info">
          <div class="dashboard-statbar">
            ${[
              ["机器人总数", "6 台", "♙"],
              ["今日作业时长", "6.2 h", "◷"],
              ["今日处理量", "785 吨", "♟"],
              ["累计处理量", "12,456 吨", "▧"]
            ].map(([label, value, icon]) => `<div class="dashboard-stat"><div class="dashboard-stat-icon">${icon}</div><div><div class="metric-label">${label}</div><div class="dashboard-stat-value">${value}</div></div></div>`).join("")}
          </div>
          <div class="bottom-fill-grid">
            <div class="bottom-fill-card">
              <div class="item-title">当前作业摘要</div>
              <div class="bottom-fill-row"><span>目标仓号</span><strong>${warehouse.id}仓</strong></div>
              <div class="bottom-fill-row"><span>执行机器人</span><strong>${robot ? robot.id : "R01"} / 3台协同</strong></div>
              <div class="bottom-fill-row"><span>作业进度</span><strong>${robot ? robot.progress : 45}%</strong></div>
            </div>
            <div class="bottom-fill-card">
              <div class="item-title">设备与告警状态</div>
              <div class="bottom-fill-row"><span>设备完好率</span><strong>96%</strong></div>
              <div class="bottom-fill-row"><span>实时告警</span><strong>3 条</strong></div>
              <div class="bottom-fill-row"><span>联动策略</span><strong>通风 / 降速 / 复测</strong></div>
            </div>
          </div>
        </div>
        <section class="panel">
          <h2 class="panel-title">视频预览</h2>
          ${videoGrid()}
        </section>
      </div>
    </div>
  `;
}
function renderOperations() {
  const warehouse = getWarehouse();
  const robot = getRobot();
  const operationTasks = [
    ...tasks,
    { id: "T240520007", warehouseId: "A03", type: "粮面复测", priority: "低", status: "待执行", time: "16:00-17:00", robotId: "R03" },
    { id: "T240520008", warehouseId: "B02", type: "深钻复核", priority: "高", status: "计划中", time: "17:00-18:00", robotId: "R01" },
    { id: "T240520009", warehouseId: "A01", type: "设备巡检", priority: "中", status: "待执行", time: "18:00-19:00", robotId: "R06" }
  ];
  pageEls.operations.innerHTML = `
    ${metricRow([
      { label: "在管粮仓", value: warehouses.length, unit: "个", icon: "仓" },
      { label: "当前任务", value: tasks.length, unit: "项", icon: "任" },
      { label: "在线机器人", value: robots.length, unit: "台", icon: "机" },
      { label: "今日调度", value: 18, unit: "次", icon: "调" },
      { label: "设备完好率", value: 96, unit: "%", icon: "盾" }
    ])}
    <div class="ops-grid">
      <div class="column">
        <section class="panel">
          <h2 class="panel-title">仓储信息管理</h2>
          ${warehouseSwitcher()}
          <div class="list">
            ${[
              ["仓型", warehouse.type],
              ["粮种", warehouse.grain],
              ["总容量", `${warehouse.capacity} 吨`],
              ["当前仓储量", `${warehouse.current} 吨`],
              ["平均温度", `${warehouse.temp.toFixed(1)} °C`],
              ["平均湿度", `${warehouse.humidity.toFixed(1)} %RH`],
              ["板结等级", warehouse.caking]
            ].map(([label, value]) => `<div class="list-item"><div class="item-title">${label}</div><span class="badge ${badgeClass(value)}">${value}</span></div>`).join("")}
          </div>
        </section>
        <section class="panel">
          <h2 class="panel-title">仓容利用率</h2>
          <div class="metric">
            <div class="metric-label">${warehouse.id} 当前利用率</div>
            <div class="metric-value">${Math.round((warehouse.current / warehouse.capacity) * 100)}<small>%</small></div>
            <div class="progress"><span style="width:${Math.round((warehouse.current / warehouse.capacity) * 100)}%"></span></div>
          </div>
          ${barChart()}
        </section>
      </div>
      <div class="stack">
        <section class="panel">
          <h2 class="panel-title">${warehouse.id} 粮仓数字孪生与深钻作业监控</h2>
          ${warehouseTwin()}
        </section>
        <section class="panel">
          <h2 class="panel-title">作业调度</h2>
          <div class="timeline">
            ${["R01", "R02", "R03", "R04"].map((id, index) => `<div class="timeline-row"><strong>${id}</strong><div class="timeline-track"><span class="timeline-block" style="left:${8 + index * 9}%; width:${28 + index * 6}%"></span></div></div>`).join("")}
          </div>
          <div class="list-item" style="margin-top:10px"><div><div class="item-title">优先处理 ${warehouse.id} ${warehouse.caking}结区</div><div class="item-sub">建议安排 ${robot ? robot.id : "空闲机器人"} 执行深钻作业</div></div><span class="badge warn">策略</span></div>
        </section>
      </div>
      <div class="column">
        <section class="panel ops-task-panel">
          <h2 class="panel-title">任务管理</h2>
          <div class="filter-tabs">${["全部", "执行中", "待执行", "计划中"].map((item) => `<button class="chip ${state.taskFilter === item ? "is-active" : ""}" data-filter="${item}">${item}</button>`).join("")}</div>
          ${taskTable(operationTasks)}
        </section>
        <section class="panel">
          <h2 class="panel-title">设备管理</h2>
          ${metrics([
            { label: "通信设备", value: "5/6", unit: "正常" },
            { label: "能源系统", value: "2/2", unit: "正常" },
            { label: "感知设备", value: "15/15", unit: "正常" },
            { label: "当前机器人", value: robot ? robot.id : "无", unit: robot ? robot.status : "待机" }
          ])}
        </section>
      </div>
    </div>
    <div class="ops-bottom-row">
      <section class="panel">
        <div class="ops-quick-grid">
          ${[
            ["仓储档案", "▰", "mock-archive"],
            ["任务下发", "➤", "mock-task"],
            ["调度策略", "↕", "mock-strategy"],
            ["设备台账", "▤", "mock-device"]
          ].map(([title, icon, page]) => `<button class="ops-quick-button" data-mock-page="${page}"><span class="ops-quick-icon">${icon}</span><span class="ops-quick-title">${title}</span></button>`).join("")}
        </div>
      </section>
      <section class="panel ops-log-panel">
        <h2 class="panel-title">近期日志</h2>
        <div class="list">
          ${[
            `09:12 机器人 ${robot ? robot.id : "R01"} 开始执行 ${warehouse.id} 深钻作业任务`,
            `09:18 任务 ${getTasks()[0] ? getTasks()[0].id : "T240520001"} 已创建并分配至 ${warehouse.id}`,
            `09:35 设备能源系统 电量充足，运行正常`
          ].map((text) => `<div class="list-item"><div class="item-title">${text}</div></div>`).join("")}
        </div>
      </section>
      <section class="panel">
        <h2 class="panel-title">作业画面预览</h2>
        ${videoGrid()}
      </section>
    </div>
  `;
}

function renderControl() {
  const warehouse = getWarehouse();
  const robot = getRobot();
  const active = robot && state.running && robot.status !== "待命" && robot.status !== "充电中";
  pageEls.control.innerHTML = `
    <div class="control-dashboard">
      <div class="control-main-grid">
        <div class="column">
          <section class="panel">
            <h2 class="panel-title">实时监控</h2>
            ${warehouseSwitcher()}
            <div class="telemetry-grid">
              <div class="telemetry-list">
                ${[
                  ["⌖", "X", active ? "12.45" : "0.00", "m"],
                  ["⌖", "Y", active ? "-8.36" : "0.00", "m"],
                  ["⌖", "Z", active ? "-13.25" : "0.00", "m"],
                  ["♨", "当前深度", robot ? robot.depth.toFixed(2) : "0.00", "m"],
                  ["↗", "姿态角", "-2.3 / 1.8 / 12.6", "°"],
                  ["⇢", "作业速度", robot ? robot.speed.toFixed(2) : "0.00", "m/min"]
                ].map(([icon, label, value, unit]) => `<div class="telemetry-row"><span>${icon}</span><span>${label}</span><strong>${value}<small>${unit}</small></strong></div>`).join("")}
                <div class="ring-metrics">
                  <div class="mini-ring"><div class="gauge-ring" style="--value:${robot ? robot.progress : 0}; --tone:#76ff62" data-value="${robot ? robot.progress : 0}"></div><span>作业进度</span></div>
                  <div class="mini-ring"><div class="gauge-ring" style="--value:${robot ? robot.coverage : 0}; --tone:#ffd43b" data-value="${robot ? robot.coverage : 0}"></div><span>覆盖率</span></div>
                </div>
              </div>
              <div class="trajectory-box"></div>
            </div>
          </section>

          <section class="panel">
            <h2 class="panel-title">作业环境感知与作业控制</h2>
            <div class="heat-card-grid">
              ${["粮面扰动热力图", "不稳定区域识别", "板结识别分布图"].map((title) => `<div class="heat-card"><div class="heat-title">${title}</div><div class="heat-thumb"></div></div>`).join("")}
            </div>
            <div class="link-control-grid">
              ${["自动减速", "绕行", "路径重规划", "区域更新", "策略调整"].map((item) => `<button class="control-button">${item}</button>`).join("")}
            </div>
          </section>
        </div>

        <div class="control-center">
          <section class="panel control-twin-panel">
            <h2 class="panel-title">深钻作业数字孪生监控</h2>
            <img class="control-twin-image" src="./深钻作业数字孪生监控.png" alt="深钻作业数字孪生监控" />
          </section>
          <section class="panel">
            <h2 class="panel-title">动态策略执行与决策支持</h2>
            <div class="strategy-panel">
              <div class="list">
                ${[
                  "前方不稳定区，建议减速",
                  `${warehouse.id}疑似板结增强，建议保持深钻作业`,
                  "当前负载偏高，建议适当降低破碎力度",
                  "覆盖率达到62%，建议优化路径"
                ].map((text) => `<div class="list-item"><div class="item-title">${text}</div><span class="badge info">建议</span></div>`).join("")}
              </div>
              <div>
                <div class="strategy-flow">⌁ → ⛨ → ◎ → ⇩ → ↻</div>
                <div class="strategy-slogan">边识别・边作业・边调整</div>
              </div>
            </div>
          </section>
        </div>

        <div class="column">
          <section class="panel">
            <h2 class="panel-title">多源作业状态与负载监控</h2>
            <div class="load-grid">
              ${[
                ["钻进阻力", robot ? robot.force.toFixed(1) : "0.0", "kN", "#76ff62"],
                ["扭矩", robot ? robot.torque : 0, "N·m", "#76ff62"],
                ["电流", robot ? robot.current.toFixed(1) : "0.0", "A", "#76ff62"]
              ].map(([label, value, unit, color]) => `<div class="load-card"><div class="metric-label">${label}</div><div class="load-value">${value}<small>${unit}</small></div>${lineChart([18, 28, 24, 42, 38, 52, 45], color)}</div>`).join("")}
            </div>
          </section>

          <section class="panel">
            <h2 class="panel-title">作业负载感知与自适应控制</h2>
            <div class="adaptive-grid">
              ${[
                ["targetDepth", "作业深度", robot ? robot.depth.toFixed(2) : "0.00", state.params.targetDepth.toFixed(2), "m"],
                ["power", "破碎力度", "65", state.params.power.toFixed(0), "%"],
                ["speed", "行进速度", robot ? robot.speed.toFixed(2) : "0.00", state.params.speed.toFixed(2), "m/min"]
              ].map(([key, label, current, target, unit]) => `<div class="adaptive-card"><div class="item-title">${label}</div><div class="adaptive-line"><span>当前</span><strong>${current}${unit}</strong></div><div class="adaptive-line"><span>目标</span><strong>${target}${unit}</strong></div><div class="arrow-buttons"><button data-param="${key}" data-step="up">▲</button><button data-param="${key}" data-step="down">▼</button></div></div>`).join("")}
            </div>
          </section>

          <section class="panel">
            <h2 class="panel-title">远程控制与应急操作</h2>
            <div class="remote-grid">
              <button class="control-button" data-action="takeover">远程接管</button>
              <button class="control-button" data-action="toggle">${state.running ? "暂停作业" : "开始作业"}</button>
              <button class="control-button danger" data-action="stop">急停</button>
              <button class="control-button" data-action="evacuate">撤离</button>
              <button class="control-button" data-action="reset">复位</button>
            </div>
          </section>

          <section class="panel">
            <h2 class="panel-title">异常检测与安全控制</h2>
            <div class="safety-grid">
              ${[
                ["卡滞", warehouse.risk >= 65 ? "高风险" : "低风险", warehouse.risk >= 65 ? "danger" : ""],
                ["陷落风险", warehouse.humidity > 66 ? "中风险" : "低风险", warehouse.humidity > 66 ? "warn" : ""],
                ["倾覆趋势", "低风险", ""],
                ["姿态异常", active ? "中风险" : "正常", active ? "warn" : ""],
                ["声光报警", "联动", "danger"],
                ["安全联动", "待命", ""]
              ].map(([label, value, tone]) => `<div class="safety-card ${tone}"><div class="item-title">${label}</div><span class="badge ${tone || "info"}">${value}</span></div>`).join("")}
            </div>
          </section>
        </div>
      </div>

      <section class="panel control-bottom-video">
        <h2 class="panel-title">视频可视化</h2>
        ${videoGrid()}
      </section>
    </div>
  `;
}

function renderMonitor() {
  const warehouse = getWarehouse();
  pageEls.monitor.innerHTML = `
    <div class="monitor-dashboard">
      <div class="monitor-kpi-row">
        ${[
          ["♨", "平均粮温", warehouse.temp.toFixed(1), "°C", ""],
          ["💧", "平均湿度", warehouse.humidity.toFixed(1), "%RH", ""],
          ["O₂", "O₂", warehouse.oxygen.toFixed(1), "%", ""],
          ["CO₂", "CO₂", warehouse.co2, "ppm", ""],
          ["✤", "粉尘浓度", warehouse.dust.toFixed(2), "mg/m³", ""],
          ["⬟", "综合风险", warehouse.risk, "/100", ""],
          ["III", "中度风险", "III级", "", "risk"]
        ].map(([icon, label, value, unit, tone]) => `<div class="monitor-kpi ${tone}"><div class="monitor-kpi-icon">${icon}</div><div><div class="metric-label">${label}</div><div class="monitor-kpi-value">${value}<small>${unit}</small></div></div></div>`).join("")}
      </div>

      <div class="monitor-main-grid">
        <div class="column">
          <section class="panel">
            <h2 class="panel-title">粮情与环境监测</h2>
            ${warehouseSwitcher()}
            <div class="monitor-left-charts">
              <div class="monitor-chart-card"><div class="item-title">温度趋势</div>${lineChart([21.6, 22.4, 22.8, warehouse.temp - 0.3, warehouse.temp, warehouse.temp + 0.2], "#ffd43b")}</div>
              <div class="monitor-chart-card"><div class="item-title">湿度趋势</div>${lineChart([58, 61, warehouse.humidity - 1, warehouse.humidity, warehouse.humidity + 0.4], "#76ff62")}</div>
              <div class="monitor-chart-card"><div class="item-title">O₂浓度</div>${lineChart([21, 20.8, 20.5, warehouse.oxygen, 20.7, 20.8], "#76ff62")}</div>
              <div class="monitor-chart-card"><div class="item-title">CO₂浓度</div>${lineChart([520, 560, 610, warehouse.co2, 590, 612], "#ffd43b")}</div>
              <div class="monitor-chart-card"><div class="item-title">粉尘浓度</div><div class="gauge big-gauge"><div class="gauge-ring" style="--value:${Math.round(warehouse.dust * 20)}; --tone:#ffd43b" data-value="${warehouse.dust.toFixed(2)}"></div><div class="gauge-label">mg/m³</div></div></div>
              <div class="monitor-chart-card"><div class="item-title">当前板结状态</div><div class="metric-value warn">${warehouse.caking}</div><div class="progress"><span style="width:${warehouse.risk}%"></span></div></div>
              <div class="monitor-chart-card wide"><div class="item-title">板结指数趋势</div>${lineChart([42, 48, 53, 58, warehouse.risk], warehouse.risk >= 60 ? "#ff4b3e" : "#ffd43b")}</div>
            </div>
          </section>
        </div>

        <div class="stack">
          <section class="panel risk-image-panel">
            <h2 class="panel-title">空间风险分布与3D风险图</h2>
            <img class="risk-image" src="./作业监控与控制.png" alt="空间风险分布与3D风险图" />
            <div class="legend"><span class="low">I级 低风险</span><span class="mid">II级 轻度风险</span><span class="high">III级 中度风险</span><span class="danger">IV级 高风险</span></div>
          </section>
        </div>

        <div class="column">
          <section class="panel">
            <h2 class="panel-title">风险识别与评估</h2>
            <div class="risk-bars">
              ${[
                ["板结加剧风险", 68],
                ["霉变/发热风险", 55],
                ["气体危害风险", 72],
                ["粉尘堆积风险", 60],
                ["结构塌陷/滑移风险", 45],
                ["设备/作业安全风险", 50]
              ].map(([label, value]) => `<div class="risk-bar-row"><div><div class="risk-bar-name">${label}</div><div class="progress"><span style="width:${value}%"></span></div></div><span class="badge ${value >= 65 ? "danger" : value >= 45 ? "warn" : "info"}">${value}/100</span></div>`).join("")}
            </div>
          </section>
          <section class="panel">
            <h2 class="panel-title">时序预测</h2>
            ${lineChart([30, 42, 45, 50, 58, 64, warehouse.risk], "#ffd43b")}
          </section>
          <section class="panel">
            <h2 class="panel-title">动态阈值</h2>
            <table class="data-table">
              <thead><tr><th>指标</th><th>当前</th><th>阈值</th><th>趋势</th></tr></thead>
              <tbody>
                <tr><td>粮温</td><td>${warehouse.temp.toFixed(1)}</td><td>28.0</td><td>↑</td></tr>
                <tr><td>湿度</td><td>${warehouse.humidity.toFixed(1)}</td><td>70.0</td><td>↑</td></tr>
                <tr><td>O₂</td><td>${warehouse.oxygen.toFixed(1)}</td><td>18.0</td><td>→</td></tr>
                <tr><td>CO₂</td><td>${warehouse.co2}</td><td>1000</td><td>↑</td></tr>
                <tr><td>板结指数</td><td>${warehouse.risk}</td><td>70</td><td>↑</td></tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>

      <div class="monitor-bottom-grid">
        <section class="panel">
          <h2 class="panel-title">报警管理与联动控制</h2>
          <div class="alarm-level-grid">
            <div class="alarm-level"><strong>12</strong><span>II级提示</span></div>
            <div class="alarm-level warn"><strong>6</strong><span>III级警告</span></div>
            <div class="alarm-level danger"><strong>2</strong><span>IV级紧急</span></div>
          </div>
          <div class="linkage-icons">${["平台弹窗", "声光报警", "APP推送", "停机通风", "暂停作业", "撤离路径", "急停", "安全联动"].map((item) => `<div class="linkage-icon">${item}</div>`).join("")}</div>
        </section>
        <section class="panel">
          <h2 class="panel-title">联动处理策略与决策建议</h2>
          <div class="list">${[`关注${warehouse.id}板结加剧风险`, "启动通风并复测湿度", "粉尘浓度偏高，注意通风", "执行重点巡检与复测"].map((text) => `<div class="list-item"><div class="item-title">${text}</div><button class="action-button" data-execute="${text}">执行</button></div>`).join("")}</div>
        </section>
        <section class="panel">
          <h2 class="panel-title">报警记录与追溯</h2>
          ${alarmList(5)}
        </section>
        <section class="panel monitor-video">
          <h2 class="panel-title">数据视频</h2>
          ${videoGrid()}
        </section>
      </div>
    </div>
  `;
}

function renderMockPage() {
  const mock = mockPages[state.page];
  pageEls.mock.innerHTML = mock ? `
    <div class="mock-page-shell">
      <button class="mock-page-back" data-page-jump="operations" aria-label="返回粮仓作业管理"></button>
      <img class="mock-page-image" src="${mock.image}" alt="${mock.title}" />
    </div>
  ` : "";
}

function renderAnalysis() {
  pageEls.analysis.innerHTML = `
    <div class="analysis-page-shell">
      <img class="analysis-page-image" src="./mock-analysis.png" alt="数据分析与决策支持" />
    </div>
  `;
}

function render() {
  renderDashboard();
  renderOperations();
  renderControl();
  renderMonitor();
  renderAnalysis();
  renderMockPage();
  const activeView = mockPages[state.page] ? "mock" : state.page;
  document.querySelectorAll(".page").forEach((el) => el.classList.toggle("is-active", el.dataset.view === activeView));
  document.querySelectorAll(".nav-button").forEach((el) => el.classList.toggle("is-active", el.dataset.page === state.page));
  const titles = {
    dashboard: "粮仓深钻除板结机器人智能管控平台",
    operations: "粮仓作业管理",
    control: "作业监控与控制",
    monitor: "粮情监测与预警",
    analysis: "数据分析与决策支持"
  };
  document.getElementById("screenTitle").textContent = mockPages[state.page] ? mockPages[state.page].title : titles[state.page];
}

function switchPage(page) {
  state.page = page;
  if (location.hash.replace("#", "") !== page) {
    location.hash = page;
  }
  render();
}

function openModal(html) {
  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("modal").classList.add("is-open");
  document.getElementById("modal").setAttribute("aria-hidden", "false");
}

function closeModal() {
  document.getElementById("modal").classList.remove("is-open");
  document.getElementById("modal").setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-page]");
  if (nav) switchPage(nav.dataset.page);

  const jump = event.target.closest("[data-page-jump]");
  if (jump) switchPage(jump.dataset.pageJump);

  const mockJump = event.target.closest("[data-mock-page]");
  if (mockJump) switchPage(mockJump.dataset.mockPage);

  const warehouse = event.target.closest("[data-warehouse]");
  if (warehouse) {
    state.selectedWarehouseId = warehouse.dataset.warehouse;
    render();
  }

  const mode = event.target.closest("[data-mode]");
  if (mode) {
    state.viewMode = mode.dataset.mode;
    render();
  }

  const filter = event.target.closest("[data-filter]");
  if (filter) {
    state.taskFilter = filter.dataset.filter;
    render();
  }

  const param = event.target.closest("[data-param]");
  if (param) {
    const key = param.dataset.param;
    const unit = key === "speed" ? 0.1 : 1;
    state.params[key] += param.dataset.step === "up" ? unit : -unit;
    state.params[key] = Math.max(key === "speed" ? 0.2 : 1, state.params[key]);
    render();
  }

  const action = event.target.closest("[data-action]");
  if (action) {
    if (action.dataset.action === "toggle") state.running = !state.running;
    if (action.dataset.action === "stop") {
      state.running = false;
      alarms.unshift({
        id: `ALM${String(alarms.length + 1).padStart(3, "0")}`,
        level: "IV",
        type: "人工急停触发",
        warehouseId: state.selectedWarehouseId,
        time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
        status: "处理中",
        suggestion: "保持停机，完成现场安全复核"
      });
    }
    if (action.dataset.action !== "toggle" && action.dataset.action !== "stop") {
      openModal(`<h2>${action.textContent}</h2><p>已对 ${state.selectedWarehouseId} 仓生成模拟控制记录。</p>`);
    }
    render();
  }

  const execute = event.target.closest("[data-execute]");
  if (execute) {
    alarms = alarms.map((item) => item.warehouseId === state.selectedWarehouseId ? { ...item, status: "已处理" } : item);
    openModal(`<h2>决策已执行</h2><p>${execute.dataset.execute}</p><p>${state.selectedWarehouseId} 仓相关告警已更新为已处理。</p>`);
    render();
  }

  const alarm = event.target.closest("[data-alarm]");
  if (alarm) {
    const item = alarms.find((entry) => entry.id === alarm.dataset.alarm);
    if (item) openModal(`<h2>${item.type}</h2><p>仓号：${item.warehouseId}</p><p>等级：${item.level}级</p><p>时间：${item.time}</p><p>状态：${item.status}</p><p>建议：${item.suggestion}</p>`);
  }

  const video = event.target.closest("[data-video]");
  if (video) {
    openModal(`<h2>${video.dataset.video}</h2><div class="video-card" style="min-height:320px"><div class="play">▶</div><div class="progress"><span style="width:58%"></span></div></div>`);
  }

  const open = event.target.closest("[data-open]");
  if (open) {
    const titleMap = { task: "任务下发", strategy: "调度策略", device: "设备台账" };
    openModal(`<h2>${titleMap[open.dataset.open]}</h2><p>当前仓库：${state.selectedWarehouseId}</p><p>这是第一版纯软件模拟弹窗，后续可接入真实表单和接口。</p>`);
  }

  if (event.target.closest(".modal-close") || event.target.id === "modal") closeModal();
});

window.addEventListener("hashchange", () => {
  const page = location.hash.replace("#", "");
  if (pageKeys.includes(page) && page !== state.page) {
    state.page = page;
    render();
  }
});

function tickClock() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  document.getElementById("dateText").textContent = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" });
}

function simulate() {
  const warehouse = getWarehouse();
  warehouse.temp += (Math.random() - 0.5) * 0.12;
  warehouse.humidity += (Math.random() - 0.5) * 0.18;
  const robot = getRobot();
  if (robot && state.running && robot.status !== "待命" && robot.status !== "充电中") {
    robot.progress = Math.min(100, robot.progress + 1);
    robot.depth = Math.min(robot.targetDepth, robot.depth + 0.08);
    robot.current += (Math.random() - 0.5) * 1.2;
    robot.torque = Math.max(0, Math.round(robot.torque + (Math.random() - 0.5) * 6));
  }
  render();
}

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginAccount = document.getElementById("loginAccount");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const appRoot = document.getElementById("app");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const account = loginAccount.value.trim();
  const password = loginPassword.value;

  if (account !== "admin" || password !== "123456") {
    loginError.textContent = "账号或密码错误，请重新输入";
    loginPassword.value = "";
    loginPassword.focus();
    return;
  }

  loginError.textContent = "";
  loginScreen.hidden = true;
  document.body.classList.remove("login-locked");
  appRoot.removeAttribute("aria-hidden");
});

[loginAccount, loginPassword].forEach((input) => {
  input.addEventListener("input", () => {
    loginError.textContent = "";
  });
});

loginAccount.focus();
tickClock();
render();
setInterval(tickClock, 1000);
setInterval(simulate, 4000);
