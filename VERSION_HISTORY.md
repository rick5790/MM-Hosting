# 版本记录与维护约定

维护前端版本、分支和发布状态，并记录版本管理中已经发生的错误。每次版本操作前先查阅本文，操作后按实际证据更新；不能把对话中的推测当作已发布事实。

## 当前核验状态

核验日期：2026-11-18（America/Los_Angeles）；本次前端任务已重新 fetch，origin/main 仍为 `4af3ad9`。PR #75 的合并事实与该 main 合并提交一致；PR #76 已通过 GitHub 接口核验为 open、draft、未合并。

- 仓库：`MM-Hosting`；远端：`rick5790/MM-Hosting`。
- 当前工作分支：`7.6`，基线为刚 fetch 的 origin/main `4af3ad9`。用户随后明确要求数字分支并推送；核实本地/远端未占用 `7.6` 后，将尚未推送的 `fix/cake-inquiry-english` 改名。`VERSION` 与九个页面的 `site-version` 同步为 `7.6`。
- PR #75 的 `7.5` 已于 2026-11-05 12:44:30 PST 合并；2026-11-09 GitHub 状态核验为 merged，本次刷新后的 main 仍含同一合并提交。
- `7.5` 原从 `origin/main`（`2bf2da6`）创建；现已合并，不在此分支悄悄追加新前端发布，也不自行猜测下一版本号。
- “合入 main”和“线上页面已部署”分别记录；未核对部署任务或线上版本时，不把合并当作上线验证。
- 本地 `main` 可能落后于远端；做比较时使用刚 fetch 的 `origin/main`，不要凭本地分支或旧对话判断。
- 2026-11-05 后台独立部署：刷新恢复管理页、补上实时搜索折叠结构；脚本缓存标记 `20261105-restore-admin-view`。341 项契约及页面/API 健康检查通过，备份 `/home/ubuntu/admin-view-restore-backup-LJZvXjsj`。这不构成新的前端发布版本；实际浏览器刷新仍需用户确认。
- 后续同日后台部署：按参考重排营收看板、保留原生分区折叠、适配手机/展开触屏；JS/CSS 缓存标记 `20261105-analytics-responsive`。344 项契约、HTTPS 内容逐字节校验及 API 200 通过，备份 `/home/ubuntu/admin-analytics-responsive-backup-y1lYIlh6`；浏览器视觉验收待完成。
- 2026-11-09 后台独立部署：团购保留至美西周日结束、合并账号按下单人归组、移动端详情弹窗、业务标题汉化、会员分区间距及可忽略的 Gmail/IP 重复账号提示；缓存标记 `20261109-accounts-sunday-mobile`。349 项契约及隔离 SQLite、本地 DOM 回归通过；HTTPS 静态文件逐字节匹配，API 200，原订单/余额/账号关联均未改变。备份 `/home/ubuntu/admin-nov09-backup-LadBb9cn`。
- 同日后续后台静态部署：Pickup 按人列表只显示商品合计，个人详情改为手机/Duo/桌面弹窗；备注、原订单和交付操作移入弹窗，未分组逐单界面不变。当次缓存 `20261109-pickup-customer-popup`，352 项契约、本地 DOM、HTTPS 字节比对及 API 健康检查通过。备份 `/home/ubuntu/admin-pickup-customer-popup-backup-Xvqtdnpi`；没有重启服务或更改数据库。
- 2026-11-18 图片热修与后台说明入口：只对新增 products 图片目录补齐 CORP 公开例外；后台图鉴/本周产品预览官网说明，产品管理独立编辑，图鉴重新上架保留既有说明。当前后台缓存 `20261118-product-description`。354 项契约、专项请求/DOM 检查、HTTPS 字节校验及图片/保护路径检查通过；原说明与库存未改，没有新前端版本或 PR。
- 当前前端工作分支补齐蛋糕询单双语，代码提交 `61812b9` 已推送 origin/7.6；草稿 PR [#76](https://github.com/rick5790/MM-Hosting/pull/76) 为 7.6 → main。推送与 PR 的完整 GitHub Actions 均通过；尚未合并，未执行客户网站部署。用户明确要求等待 marketing strategy announcement，未启用自动合并。之前的后台镜像仍为 main 上未提交备份。没有可连接的浏览器，真实手机/Duo 视觉验收待用户确认。

## 7.6：蛋糕询单双语，等待营销公告（2026-11-18）

- 分支：`7.6`；基线 origin/main `4af3ad9`；关联 FIX-20261118-03。原工作分支 `fix/cake-inquiry-english` 尚未推送、没有 PR，按用户最新要求改为未占用的下一数字版本，不在已合并的 7.5 上追加发布。
- 内容：两款整糕、17 个口味、组成/尺寸、日历/档期提示、询单确认、付款/汇率/复制、成功页和蛋糕订单卡补齐英文；切换保留输入、日期、步骤与提交锁，API 原始口味、价格与档期规则不变。
- 检查：本地定向双语回归、承重、九页静态站点、版本/资源约定、21 个节日边界及 Duo 回归通过。既有静态检查通过本地 JS 环境适配执行，本地未运行完整 shell CI/HTTP smoke；推送后代码提交 `61812b9` 的 [push CI](https://github.com/rick5790/MM-Hosting/actions/runs/44415890990) 和 [PR CI](https://github.com/rick5790/MM-Hosting/actions/runs/44416196540) 均 success，后者 quality-gate 的 release/regression/integration 步骤通过，包含完整 shell 流水线及 HTTP smoke。
- 发布：代码提交 `61812b9` 已推送 `origin/7.6`；草稿 PR [#76](https://github.com/rick5790/MM-Hosting/pull/76) 已创建，head 7.6、base main、open、draft、merged=false、auto_merge=null。创建后远端 main 仍为 `4af3ad9`。尚未合并，未执行客户网站部署，本次不修改后台。真实 GPU、WebKit/iOS/Duo、微信、窄屏与减少动态效果未验证。
- 暂缓条件：用户要求等待 marketing strategy announcement。只推送，不合并、不启用自动合并、不发布；公告内容尚未提供，不自行补写。解除暂缓需用户明确确认。

## 图片热修与后台说明入口（2026-11-18，美西时间）

- 关联：FIX-20261118-01、FIX-20261118-02；前端发布号不变，本次不创建分支、提交或 PR。
- Nginx：补上 `/uploads/products/` 的 cross-origin 例外，保留 collection 和默认保护；语法通过后平滑 reload，应用无重启。备份 `/etc/nginx/order-images-products-backup-dznixpt1/default`。
- 后台：图鉴与本周产品显示同一份产品说明，管理页独立保存；不存在说明字段的图鉴重上架操作不再清空原说明。静态缓存 `20261118-product-description`，备份 `/home/ubuntu/admin-product-description-backup-SvTYdw0V`。
- 验证：354 项契约、专项请求夹具、本地 DOM 和 CSS 结构通过；线上 HTML/JS/CSS 与部署内容逐字节一致；3 张公开图片与 6 个受保护路径检查通过。部署前后公开商品 JSON 相同，说明仍在、售罄库存仍为 0；无生产数据修订或数据库迁移。
- 镜像：后台 main 未提交备份已同步；根目录错题册/规则/版本记录随后随前端 7.6 分支归档推送，不代表再次部署后台。真实 GPU、WebKit/iOS/Duo、微信、窄屏与减少动态效果仍待实机确认。

## 后台自提卡片后续部署（2026-11-09，美西时间）

- 关联记录：FIX-20261109-04；客户网站仍为 7.5，本次无新前端发布/PR。
- 内容：按人列表精简为购买商品及总数量，点击打开个人详情弹窗；原备注、金额、逐单表单和交付操作完整保留在弹窗。关闭保持 Pickup 模式、列表滚动及焦点，未分组视图不变。
- 发布与验证：缓存 `20261109-pickup-customer-popup`；352 项契约、JS 语法/CSS 结构及本地 DOM 回归通过，线上静态内容逐字节匹配且 API 健康；备份 `/home/ubuntu/admin-pickup-customer-popup-backup-Xvqtdnpi`。只改静态后台及配套检查/文档，无重启或数据库更改，镜像同步到 Makkie-Backend main 未提交备份。
- 设备验收：浏览器未连接；真实 GPU、Safari/iOS/Duo、微信、窄屏及减少动态效果待实测，不能用 DOM 解析代替。

## 后台独立部署（2026-11-09，美西时间）

- 关联记录：FIX-20261109-01、FIX-20261109-02、FIX-20261109-03；不改变客户网站的 `VERSION`。
- 当前团购在最后有效自提日期所在周的周日结束后归档，采用 `America/Los_Angeles`；不延长下单截止或重新开放团购。
- 普通订单与自提分组共用最新账号关联，保留原始订单操作；移动端订单/会员详情改为弹窗，桌面保留侧栏。
- 重复账号只建议、不自动合并。忽略按账号对持久保存；Gmail 规则限个人 Gmail/Googlemail，IP 为共享网络弱提示，从上线后的登录/会话恢复开始积累，不补造历史 IP。
- 验证：349 项 UI 契约、周日/DST 边界及账号关联/忽略/Gmail/IP 隔离数据库回归、原有批量合并回归、本地 DOM 结构回归；线上 210 条订单的按下单人分组身份不一致数为 0，未认证忽略请求返回 401，无效管理请求返回 400。未对真实顾客执行忽略或合并作为测试。
- 发布：SSH 部署已完成，只重启 `makkie-web-api`；缓存 `20261109-accounts-sunday-mobile`，备份 `/home/ubuntu/admin-nov09-backup-LadBb9cn`，本地 `Makkie-Backend` main 镜像已同步且不提交。
- 回滚：优先恢复备份代码/静态文件并重启该服务；新增表可保留，不盲目覆盖已接收新订单的在线数据库。
- 验收边界：DOM 解析不等于浏览器渲染；真实 GPU、WebKit/iOS、微信、窄屏及减少动态效果尚未验证。

## 7.5（记录日期：2026-11-05，美西时间）

- 用户明确要求：网页及 agent 相关改动通过 7.5 PR，后台直接通过 SSH 修改；两个发布面独立。
- 仓库 / 分支：`MM-Hosting` / `7.5`；基线 `origin/main` `2bf2da6`。
- 内容：仅 Duo 外屏竖屏的首页右侧悬浮菜单和右开导览；agent 规则、错题册、版本文档、视觉 QA 状态、定向回归及 CI。对应 FIX-20261105-03，另记录已独立部署的看板 FIX-20261105-02。
- PR：[ #75](https://github.com/rick5790/MM-Hosting/pull/75)，head `7.5` → base `main`；2026-11-09 复核已于 2026-11-05 12:44:30 PST 合并，main 合并提交 `4af3ad9`。创建时的 draft 状态不是当前状态。
- 检查：提交 `c4e497b` 通过承重 invariant、外屏定向/切屏模拟、五段内联 JS 语法、九页静态站点、版本/缓存约定、发布上下文和 21 项节日边界。本地无 Node CLI，脚本通过本地 Node 执行环境验证；完整 CI 和 HTTP smoke 以 PR Actions 结果为准，不把本地部分检查写成完整流水线通过。
- 发布：前端已合入 main，尚未核对客户站点线上部署与设备效果；后台独立部署完成且镜像同步到 `Makkie-Backend` main，没有后台发布提交。
- 设备验证：没有浏览器实例，`design-qa.md` 为 blocked；真实 GPU、WebKit/iOS、微信、窄屏、减少动态效果未完成验收。
- 新教训：外屏硬件像素不是网页视口；WebKit 官方外屏竖屏 382px、内屏分窗 385px，不能用一个宽泛的“触屏/窄屏”条件当作外屏识别，也不能把 partially-folded API 当作内/外屏识别。

## 近期版本索引

下表合并日期取自 Git 合并提交日期，只表示代码合并；更早版本仍可从 `main` 历史查询，不编造缺失记录。

| 前端版本 | 合并日期 | PR | main 合并提交 | 主要内容 / 状态 |
| --- | --- | --- | --- | --- |
| 7.6 | 未合并 | [#76](https://github.com/rick5790/MM-Hosting/pull/76)，草稿 | — | 蛋糕询单双语；已推送、代码 CI 通过；等待营销公告，禁止自动合并/发布 |
| 7.5 | 2026-11-05 | [#75](https://github.com/rick5790/MM-Hosting/pull/75) | `4af3ad9` | Duo 外屏竖屏导览及 agent/版本/错题记录；已合并，客户站点部署及设备验收未核验 |
| 7.4 | 2026-10-27 | [#74](https://github.com/rick5790/MM-Hosting/pull/74) | `2bf2da6` | 修复错题册、平板/展开触屏导航、Firefox 商品图布局；已合并 |
| 7.3.1 | 2026-10-04、2026-10-09 | [#71](https://github.com/rick5790/MM-Hosting/pull/71)、[#72](https://github.com/rick5790/MM-Hosting/pull/72) | `d488d01`、`59d3199` | 手机菜单及蛋糕档期锁定；已合并 |
| 7.3 | 2026-10-04 | [#70](https://github.com/rick5790/MM-Hosting/pull/70) | `f25db04` | 版本元数据统一到 7.3；已合并 |
| 7.2 | 2026-09-22 | [#69](https://github.com/rick5790/MM-Hosting/pull/69) | `5fec8b1` | 中秋彩蛋与相关页面改动；已合并 |
| 7.1 | 2026-09-22 | [#65](https://github.com/rick5790/MM-Hosting/pull/65)、[#66](https://github.com/rick5790/MM-Hosting/pull/66) | `512c6ab`、`5b770e8` | 版本及中秋相关改动；已合并 |
| 7.0 | 2026-09-21、2026-09-22 | [#63](https://github.com/rick5790/MM-Hosting/pull/63)、[#64](https://github.com/rick5790/MM-Hosting/pull/64) | `6978158`、`e203f3a` | 创意甜品、图鉴及发布检查相关改动；已合并 |

## 三种“版本”不要混用

| 标记 | 含义 | 维护方式 |
| --- | --- | --- |
| `VERSION`、页面 `site-version`、数字发布分支 | 客户网站的发布版本 | 按明确的发布任务一起更新，并运行版本检查 |
| CSS/JS URL 的 `?v=日期-说明` | 浏览器资源缓存版本 | 资源变更时更新；共享资源在所有引用页面保持一致 |
| 后台通过 SSH 部署的文件与备份 | 独立的后台部署记录 | 记录缓存版本、部署时间、备份和验证，不自动等同于前端版本 |

`Makkie-Backend` 仅为本地静态备份，保持 `main`，不在那里创建前端发布分支或发布提交。后台部署不会自动发布客户网站。

## 每次版本操作的顺序

1. 核对工作目录确为 `/Users/rickmac/Documents/VS-Code/MM-Hosting`，检查当前分支和未提交改动。
2. 执行 `git fetch origin --prune`，再核对 `origin/main`、目标分支和 PR 的实时状态。
3. 用户指定版本时遵循指定版本；需要新版本时先确定发布目标，不根据旧对话自行猜号，也不在已合并分支上悄悄追加新发布。
4. 数字发布分支与 `VERSION`、九个 HTML 的 `site-version` 保持一致。文档变更不应为了凑版本号而自动升级发布版本。
5. 新 PR 的目标通常为最新 `main`；如使用其他基线，必须有当前工作流依据。不要把已合并的旧发布分支误作目标。
6. 提交前执行 `git diff --check`、`sh scripts/check-invariants.sh` 以及相关版本/站点检查；不能把未运行的检查写成通过。
7. 推送、创建 PR、合并、线上部署和设备验证分别记录状态；只完成前一步不能代替后一步。
8. 仅在用户要求清理分支时，按 `git ... --merged origin/main` 核实后删除已合并分支，保留 `main`、当前未合并工作及不能确认已合并的分支。

## 已经学到的教训

- **旧引用导致 PR 指错基线**：曾误将 PR #74 指向已经合并的 `7.3.1`。根因是没有先 fetch；后来核实 PR #72 并把目标改为 `main`。以后先刷新远端，再判断合并状态。
- **重命名来源分支会影响 PR**：将 `docs/fix-records-order-images` 改名为 `7.4` 后，原 PR #73 被 GitHub 关闭，后来用 #74 替代。以后操作后立即核对 PR 的开闭状态、head 和 base，不假设链接继续有效。
- **同名本地/远端分支不一定同状态**：清理时本地 `7.1` 已合并，远端 `7.1` 仍有不在 main 中的提交。必须分别检查，不能按版本号批量猜删。
- **推送不是发布**：前端 Firefox/触屏修复推到 `7.4` 后，仍需合并和部署才能让客户看到。后台修复则走 SSH，不能混为一个发布动作。
- **生产机不承担 DOM 压力回归**：2026-11-01 的临时 DOM 测试期间出现生产连接超时，具体主机故障根因尚未取证。今后 DOM/浏览器回归在本地或隔离环境进行；生产只做轻量检查和部署验证。不能把怀疑写成已确认原因。

具体故障、修复和回滚方法详见 `FIX_RECORDS.md`；本文维护版本与发布上下文，避免重复或互相矛盾。

## 后续版本记录模板

```markdown
### X.Y[.Z]（记录日期：YYYY-MM-DD，美西时间）
- 仓库 / 分支：
- 基线：刚核验的 origin/main 提交或明确指定的其他基线
- 主要改动 / 关联错题编号：
- PR：链接、head、base、open/merged/closed
- 提交与检查：实际执行的检查及结果
- 发布：未发布 / 部署中 / 已发布；对应证据
- 设备验证：已测环境与尚未验证的环境
- 本次新教训：事实、原因、防复发约定
```
