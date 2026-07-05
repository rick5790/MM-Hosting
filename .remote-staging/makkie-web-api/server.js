require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { db, initDb, UPLOAD_DIR } = require("./db");
const { version } = require("./package.json");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const pickupRoutes = require("./routes/pickupRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const weeklyOrderRoutes = require("./routes/weeklyOrderRoutes");

const PORT = Number(process.env.PORT || 3000);
const ADMIN_UI_DIR = path.join(__dirname, "public-admin");

initDb();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/admin-assets", express.static(ADMIN_UI_DIR));

function formatUptime(seconds) {
  const totalSeconds = Math.floor(seconds);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days} 天 ${hours} 小时`;
  if (hours > 0) return `${hours} 小时 ${minutes} 分钟`;
  return `${minutes} 分钟`;
}

function getHealthSnapshot() {
  const services = {
    api: {
      label: "API 服务",
      ok: true,
      message: "进程运行中"
    },
    database: {
      label: "数据库",
      ok: false,
      message: ""
    },
    uploads: {
      label: "图片上传",
      ok: false,
      message: ""
    }
  };

  try {
    db.prepare("SELECT 1").get();
    services.database.ok = true;
    services.database.message = "SQLite 正常";
  } catch (error) {
    services.database.message = error.message || "数据库异常";
  }

  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.accessSync(UPLOAD_DIR, fs.constants.W_OK);
    services.uploads.ok = true;
    services.uploads.message = "上传目录可写";
  } catch (error) {
    services.uploads.message = error.message || "上传目录异常";
  }

  const allOk = Object.values(services).every((item) => item.ok);

  return {
    ok: allOk,
    service: "Makkie Mua API",
    status: allOk ? "healthy" : "degraded",
    version,
    uptime_seconds: Math.floor(process.uptime()),
    uptime_text: formatUptime(process.uptime()),
    checked_at: new Date().toISOString(),
    server_time: new Intl.DateTimeFormat("zh-CN", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short"
    }).format(new Date()),
    services
  };
}

function renderStatusPage(snapshot) {
  const services = Object.values(snapshot.services);
  const topClass = snapshot.ok ? "ok" : "bad";
  const topText = snapshot.ok ? "一切正常运行中！" : "有服务需要查看";
  const topSub = snapshot.ok ? "Everything's running sweet" : "Some checks need attention";
  const serviceRows = services.map((service) => `
          <div class="service-row">
            <span>${service.label}</span>
            <span class="pill ${service.ok ? "ok" : "bad"}"><i></i>${service.ok ? "正常" : "异常"}</span>
          </div>`).join("");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Makkie Mua API</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 28px;
        background: #FAF3EA;
        color: #4A1B0C;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .card {
        width: min(720px, 100%);
        padding: 34px;
        border: 1px solid #F0E2D0;
        border-radius: 22px;
        background: rgba(255, 252, 247, 0.9);
        box-shadow: 0 24px 70px rgba(113, 43, 19, 0.1);
      }
      .brand { text-align: center; }
      .avatar {
        width: 72px;
        height: 72px;
        margin: 0 auto 14px;
        border: 2px solid #F4C0D1;
        border-radius: 50%;
        background: #FBEAF0;
        color: #D4537E;
        display: grid;
        place-items: center;
        font-size: 36px;
        font-weight: 800;
      }
      h1 {
        margin: 0;
        color: #712B13;
        font-size: 34px;
        line-height: 1.1;
      }
      .status {
        margin-top: 26px;
        padding: 18px;
        border-radius: 18px;
        text-align: center;
      }
      .status.ok { background: #EAF3DE; color: #27500A; }
      .status.bad { background: #FFF0D8; color: #7A330D; }
      .status-main {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        font-size: 18px;
        font-weight: 800;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #639922;
      }
      .status.bad .dot { background: #C96324; }
      .status-sub {
        margin-top: 6px;
        color: #3B6D11;
        font-size: 14px;
        font-weight: 700;
      }
      .status.bad .status-sub { color: #8A4D11; }
      .services {
        margin-top: 22px;
        display: grid;
        gap: 12px;
      }
      .service-row {
        min-height: 58px;
        padding: 14px 16px;
        border-radius: 18px;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        color: #4A1B0C;
        font-weight: 800;
      }
      .pill {
        min-width: 78px;
        padding: 8px 12px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        font-size: 13px;
        font-weight: 900;
      }
      .pill.ok { background: #EAF3DE; color: #3B6D11; }
      .pill.bad { background: #FCE5DC; color: #A13D27; }
      .pill i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
      }
      .info {
        margin-top: 22px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }
      .info-card {
        min-width: 0;
        padding: 18px;
        border-radius: 18px;
      }
      .info-card.version { background: #FBEAF0; }
      .info-card.uptime { background: #FAEEDA; }
      .info-card.time { background: #E1F5EE; }
      .info-label {
        color: #9A5A4F;
        font-size: 13px;
        font-weight: 900;
      }
      .info-value {
        margin-top: 8px;
        color: #4A1B0C;
        font-size: 18px;
        line-height: 1.25;
        font-weight: 900;
        overflow-wrap: anywhere;
      }
      .footer {
        margin-top: 24px;
        text-align: center;
        color: #B4655A;
        font-size: 14px;
        font-weight: 700;
      }
      @media (max-width: 620px) {
        body { padding: 18px; }
        .card { padding: 24px; }
        .info { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main class="card">
      <section class="brand">
        <div class="avatar">M</div>
        <h1>Makkie Mua</h1>
      </section>

      <section class="status ${topClass}">
        <div class="status-main"><span class="dot"></span>${topText}</div>
        <div class="status-sub">${topSub}</div>
      </section>

      <section class="services">
${serviceRows}
      </section>

      <section class="info">
        <div class="info-card version">
          <div class="info-label">版本</div>
          <div class="info-value">v${snapshot.version}</div>
        </div>
        <div class="info-card uptime">
          <div class="info-label">运行</div>
          <div class="info-value">${snapshot.uptime_text}</div>
        </div>
        <div class="info-card time">
          <div class="info-label">现在时间</div>
          <div class="info-value">${snapshot.server_time}</div>
        </div>
      </section>

      <div class="footer">made with love · health check at /health</div>
    </main>
  </body>
</html>`;
}

app.get("/health", (req, res) => {
  const snapshot = getHealthSnapshot();
  res.status(snapshot.ok ? 200 : 503).json({
    ok: snapshot.ok,
    data: {
      ...snapshot
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(ADMIN_UI_DIR, "index.html"), (error) => {
    if (!error) return;
    const snapshot = getHealthSnapshot();
    res.status(snapshot.ok ? 200 : 503).type("html").send(renderStatusPage(snapshot));
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/pickup-locations", pickupRoutes);
app.use("/api/weekly-order", weeklyOrderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Not Found"
  });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;

  res.status(status).json({
    ok: false,
    message: error.message || "Server error"
  });
});

app.listen(PORT, () => {
  console.log(`Makkie Mua API running on http://127.0.0.1:${PORT}`);
});
