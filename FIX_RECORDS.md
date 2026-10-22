# 修复错题册 · Fix Records

记录已经发生的故障、判断依据、最终修复和防复发措施。排查类似问题前先查本文件；完成故障修复后追加记录，后续发现新证据时补充原条目。

这里记录跨仓库和生产配置问题，但不代替部署：前端在 `MM-Hosting` 发布，后台与 Nginx 通过 SSH 部署，`Makkie-Backend` 仅保留本地备份并保持 `main`。不要记录凭据、客户数据、数据库内容或完整生产配置。

## 记录约定

- 编号使用 `FIX-YYYYMMDD-NN`，日期以美西时间为准，新记录放在索引和正文顶部。
- 区分已验证的事实、推断和待验证事项；HTTP 200 不等于浏览器成功显示。
- 写明最终上线方案、修改位置、验证证据和回滚方式；未采用的建议不能写成已完成。
- 修复不报错、且不能在桌面 Chrome 重现的前端问题时，按 `AGENTS.md` 要求补充 `scripts/check-invariants.sh` 检查。服务端问题应在实际响应或对应服务的检查中验证。
- 涉及真实 GPU、WebKit/iOS、微信、窄屏或减少动态效果时，明确哪些已测、哪些需要用户设备确认。

## 索引

| 编号 | 日期 | 故障 | 根因 | 修复状态 |
| --- | --- | --- | --- | --- |
| [FIX-20261022-01](#fix-20261022-01order-商品图片被跨域策略拦截) | 2026-10-22 | Order 两张商品图不显示 | admin 域名对公开图片返回 CORP `same-origin` | 服务端已上线；手机显示待确认 |

## FIX-20261022-01：Order 商品图片被跨域策略拦截

### 现象与影响

`https://www.makkiemua.com/shop.html` 的「提拉米苏挞挞」「酒酿姜撞奶巴斯克」图片空白，图片位置显示商品名称（`alt`），库存和数量按钮仍正常。左侧「迪拜糯曲奇」图片正常。

### 根因与证据

2026-10-21 的生产安全加固给 `admin.makkiemua.com` 统一设置了 `Cross-Origin-Resource-Policy: same-origin`。商品接口中的两张图片使用 admin 域名，浏览器因此禁止客户网站跨源嵌入这些图片。

| 检查对象 | 修复前结果 | 含义 |
| --- | --- | --- |
| admin `/api/products` | 200；两张受影响图片的 `image_url` 指向 admin 域名 | 前端收到的地址本身可请求 |
| admin `/uploads/collection/提拉米苏挞挞.jpeg` | 200，`image/jpeg`，CORP `same-origin` | 文件存在，但客户网站无法嵌入 |
| admin `/uploads/collection/collection-31.jpg` | 200，`image/jpeg`，CORP `same-origin` | 同上；并非中文文件名导致 |
| api `/uploads/collection/collection-30.jpg?v=20260619` | 200，`image/jpeg`，CORP `cross-origin` | 正常旧图与坏图的关键差异 |

前端 `assets/shop-page.js` 的 `normalizeProduct()` 通过 `toCloudUrl()` 保留绝对图片 URL，`renderShop()` 再将其写入 `<img src>`。本次没有发现这里存在 URL 拼接错误。

CORP（`Cross-Origin-Resource-Policy`）与 CORS 是不同检查；普通跨源 `<img>` 即使收到 200，也可能被 CORP 禁止显示。只检查状态码或文件是否存在，会漏掉本次问题。

### 最终修复

在生产 Nginx 的 HTTP 上下文添加按 URI 选择的策略，并让 admin server 的 CORP 响应头使用该变量：

```nginx
map $uri $makkie_admin_resource_policy {
    default "same-origin";
    ~^/uploads/collection/ "cross-origin";
}

# admin server 内替换原有 CORP add_header，其他响应头保持原样。
add_header Cross-Origin-Resource-Policy $makkie_admin_resource_policy always;
```

只对公开商品图片目录放行，其他 admin 资源继续使用 `same-origin`。这样现有图片和以后上传至同一目录的商品图片都适用，不需要改商品数据或前端地址。

最初建议过把商品图片地址改成 api 域名；最终没有采用该方案，也没有修改数据库或上传逻辑。

修改与部署位置：

- 生产：`/etc/nginx/sites-available/default`，经语法检查后平滑重载。
- 本地备份：`Makkie-Backend/makkie-web-api/ops/nginx/site.conf`。
- 后台说明：`Makkie-Backend/makkie-web-api/docs/SECURITY_HARDENING.md`。
- 本次没有修改或发布客户前端，也没有移除任何可见功能。

### 验证与局限

2026-10-22 已完成：

- `sudo nginx -t` 通过，重载后 Nginx 状态为 `active`。
- 内部 `http://127.0.0.1:3001/api/products` 返回 200。
- 两张受影响商品图的线上 HEAD 请求均返回 200、`image/jpeg` 和单个 CORP `cross-origin` 响应头。
- admin `/api/products` 仍返回 200 和 CORP `same-origin`。
- api 域名的旧商品图仍返回 200 和 CORP `cross-origin`。

当时没有可连接的浏览器实例，因此没有实际浏览器显示验证。真实 GPU、WebKit/iOS、微信、窄屏和 `prefers-reduced-motion` 均未实测；手机显示仍需用户刷新订单页确认。服务端响应修复已验证，不应据此声称所有设备显示已确认。

### 回滚与防复发

部署前备份位于生产 `/etc/nginx/order-images-backup-5gZgBQ7V/default`。如需回滚，恢复到 `/etc/nginx/sites-available/default`，运行 `sudo nginx -t`，通过后重载；回滚会重新引入图片跨域限制。

今后调整 Nginx、CORP、CSP 或跨域策略时：

1. 从客户页面实际使用的接口读取图片 URL，不要只检查预设的 api 域名。
2. 同时检查公开图片与受保护资源的响应头，确认放行范围没有扩大。
3. 保留一张 api 域名旧图和一张 admin 域名图片作为回归样本；中文文件名使用 URL 编码请求。
4. 检查实际客户页面能否加载图片，并明确手机/WebKit/微信的验证状态。
5. 保留本条公开图片目录例外；后续安全加固不能再次全域覆盖为 `same-origin`。

## 新记录模板

```markdown
## FIX-YYYYMMDD-NN：简短故障名称

### 现象与影响
页面、触发条件、受影响功能、正常对照。

### 根因与证据
实际请求、响应或代码证据；区分事实与推断。

### 最终修复
实际修改、仓库/配置路径、部署范围与状态；如有移除，写明内容和原因。

### 验证与局限
已执行检查及结果；未验证环境、需要设备确认的内容。

### 回滚与防复发
备份或回滚方式、必须保留的兼容措施、对应回归检查。
```
