# Repository and deployment boundaries

## Version branches

- 版本上下文与既往教训维护在 `VERSION_HISTORY.md`。版本、分支、PR 或发布操作前先查阅，先 fetch 再核验 `origin/main` 与 PR 状态；完成操作后更新记录，明确区分推送、合并、发布和设备验证。
- 用户要求等待 marketing strategy announcement 的版本只能推送并保持草稿 PR；公告内容未提供时不自行编写，不启用自动合并，不合入 main 或发布，直到用户明确解除暂缓。

- `MM-Hosting` is the only repository used for release/version branches such as `5.30` and `5.31`.
- Create, switch, rename, delete, commit, and push release branches only in `MM-Hosting`, unless the user explicitly requests otherwise.
- Before any branch operation, verify that the working directory is `/Users/rickmac/Documents/VS-Code/MM-Hosting`.

## Makkie-Backend

- `/Users/rickmac/Documents/VS-Code/Makkie-Backend` is only a local static backup/mirror of the backend and admin files deployed to the SSH server.
- Keep `Makkie-Backend` on `main`. Do not create release branches or release commits in that repository unless the user explicitly requests it.
- Backend/admin changes may remain as uncommitted local backup changes after they are deployed through SSH.

## Deployment

- Deploy backend and admin changes to the production server through SSH, following the deployment and backup checks in the backend repository's own `AGENTS.md`.
- The customer-facing `MM-Hosting` site is managed from this repository. Do not assume that an SSH backend deployment publishes frontend changes.
- 后台团购归档与截单分开：最后自提日所在周的周日结束后，按 America/Los_Angeles 的周一零点归档，不用服务器本地时区或固定 24 小时计算。按下单人分组必须使用最新关联账号的主身份，不按昵称或缓存订单上的旧 user_id 直接分组。
- 重复账号检测只提供建议；忽略须按账号对持久化，不因重扫再次出现，不能自动合并。IP 只作为共享网络的弱信号；DOM/浏览器测试仅在本地运行，轻量 SQLite 回归必须显式指定临时 DB_FILE/UPLOAD_DIR，绝不对生产数据库运行测试种子。
- 公开商品图片目前包括 `/uploads/collection/` 和 `/uploads/products/`；Nginx 的 CORP 例外必须覆盖两者，其他后台资源保持 `same-origin`，不能全放开 `/uploads/`。新增上传目录后用后台 `scripts/checkPublicImagePolicy.js --live` 核对实际菜单图片、旧图和受保护路径；HTTP 200 不代表浏览器可嵌入。
- 官网商品说明的真值是 `products.description`，不是内部备注或图鉴的独立字段。图鉴/后台应展示同一份说明；没有 description 输入的图鉴重新上架操作必须保留旧说明，独立保存说明时不得夹带旧库存、价格或档期设置。

# Frontend regressions: standing defences

- 故障修复错题册维护在仓库根目录 `FIX_RECORDS.md`。排查类似故障前先查阅；完成故障修复后按其中模板追加根因、实际修复、验证局限与防复发措施，并更新索引。不得将未采用的建议记成已部署方案。
- Duo 的硬件像素、逻辑屏幕和 Safari 网页视口不同。调整外屏/内屏专属行为前先核对 WebKit 官方视口表，不用图片分辨率直接当 CSS 宽度，也不靠 UA 或实验性的 posture API 猜折叠状态。外屏竖屏菜单定向与切屏回归由 `scripts/ci/check-duo-navigation.mjs` 保护；实测前不得声称所有显示模式已确认。
- 蛋糕询单必须覆盖整个中英流程，不能只翻译入口。显示名称与 API 的 cake_id / 中文口味原值分开；切语言保留输入、日期、步骤及提交中的禁用状态，不翻译顾客备注。运行 `scripts/ci/check-cake-i18n.mjs`，不能把双语文案改动变成价格、14 天提前量或档期规则的改动。

These rules exist because the same class of bug has now happened four times in
`index.html`: something invisible in a desktop Chrome check was dropped, and it
was only caught weeks later by the user on a real phone.

## Load-bearing code

- Some CSS/JS here works around browser bugs and *looks like dead code*. Such
  blocks are marked `承重 · 勿删` with the reason and the commit history. Never
  delete, "clean up", or fold away a marked block. If a change genuinely
  requires touching one, say so in the commit message.
- Before rewriting a single-line CSS rule that packs many declarations, compare
  the declaration list property by property, or split the rule across lines in
  the same commit. A one-line rule shows up in `git diff` as one `-` and one
  `+`; a dropped declaration inside it is invisible. That is exactly how
  `c00e047` lost the `mask-image` corner-clip hack.
- Run `sh scripts/check-invariants.sh` before committing frontend changes.
  `sh scripts/install-hooks.sh` wires it into `pre-commit`. Add a check there
  whenever you fix a bug that leaves no error behind **and** does not reproduce
  in desktop Chrome.

## Never remove a feature as a side effect

- Do not disable or delete anything the user can see — an animation, an effect,
  a layout element — as a side effect of a performance, compatibility, or
  responsive fix. Ask first. Removing a feature is the user's call, not a free
  optimisation.
- Making an effect cheaper means: lower the render resolution, pause it
  off-screen, cut the frame rate. It does not mean `display:none` at one
  breakpoint. `ee2b164` killed the shop cards' silk background on phones this
  way and nobody noticed for weeks.
- If a commit removes or disables anything, the message must name it.

## Commit messages

- Never `update`, `fix`, `polish`, or any other subject that does not say what
  changed. Subject line: what changed, and where.
- Removals get their own line in the body: what went away and why.

## Verification blind spots

Desktop Chrome passing is not a pass. Every regression in this list hid in one
of these:

- **Real-GPU compositing** — rounded-corner clipping of a composited canvas or
  video layer. Headless Chrome renders WebGL through SwiftShader and clips
  correctly, so it cannot reproduce this.
- **WebKit** — desktop Safari and *every* iOS browser. It drops the alpha
  channel of WebM video (the mascot's yellow disc) and only supports
  transparent video as HEVC-with-alpha in MP4/MOV.
- **WeChat's in-app browser** — mostly refuses inline video autoplay.
- **Narrow breakpoints** and **`prefers-reduced-motion`** — rules there are
  never exercised by a normal desktop check.

State plainly which of these you could not verify, and ask the user to check on
the device. Do not report a fix as confirmed on the strength of a headless
screenshot alone.
