#!/bin/sh
# 承重代码检查 —— 拦住「重写整行时顺手删掉、本地又看不出来」的那一类回归。
#
# 这里每一条都对应一次真实事故，不是假想的风险。加新条目的规矩：
#   只加「删了不会报错、本地 Chrome 桌面看着一切正常、要真机/特定浏览器才暴露」的东西。
#   能被眼睛在 diff 里一眼看见的问题不用进来。
#
# 用法：  sh scripts/check-invariants.sh
# 装成提交前自动跑：  sh scripts/install-hooks.sh

cd "$(dirname "$0")/.." || exit 2

fail=0

# want <文件> <必须出现的字符串> <说明>
want() {
  if ! grep -qF "$2" "$1"; then
    printf '✗ %s\n  缺失: %s\n  影响: %s\n\n' "$1" "$2" "$3"
    fail=1
  fi
}

# want_count <文件> <字符串> <期望次数> <说明>
want_count() {
  got=$(grep -cF "$2" "$1")
  if [ "$got" != "$3" ]; then
    printf '✗ %s\n  "%s" 出现 %s 次，应为 %s 次\n  影响: %s\n\n' "$1" "$2" "$got" "$3" "$4"
    fail=1
  fi
}

# ---------- 下单卡片的丝绸背景 ----------
want index.html 'mask-image:radial-gradient(white,black)' \
  '两张下单卡的圆角裁不住 WebGL 画布，真机上圆角里套硬边方块（c00e047 干过一次）'

want index.html 'border-radius:inherit' \
  '丝绸画布自身的圆角兜底没了，只剩 mask hack 单点支撑'

want_count index.html '.shop-silk-canvas{display:none;}' 1 \
  '丝绸只该在 prefers-reduced-motion 里关。多一处 = 又在某个断点把手机/窄屏的效果关掉了（ee2b164 干过一次）'

if grep -q 'lowPowerLayout.matches) return' index.html; then
  printf '✗ index.html\n  initShopSilkBackground 又在窄屏/触屏直接 return\n  影响: 手机上两张下单卡没有丝绸背景。要省电请降分辨率或按视口暂停，不要整个关掉\n\n'
  fail=1
fi

# ---------- 首页吉祥物 ----------
want index.html 'probeAlpha' \
  'WebM alpha 丢失的探测没了。WebKit 会把透明区填成黄底，直接盖住毛玻璃'

want index.html 'Math.min(video.videoWidth, video.videoHeight)' \
  'iPhone 透明修复又把 16:9 WebM 整帧压成了正方形，小人会变形且发糊'

want index.html 'var renderSize = Math.max(320' \
  'iPhone 透明修复又退回低清画布，高像素屏上的小人会发糊'

want index.html 'useStaticLogo' \
  '微信 / 不支持 WebM 时没有静态 logo 退路，首屏小人直接开天窗'

want assets/mascot-schedule.js 'assets/video/makkie-waving-fixed.webm?v=20260922-holiday-mascots-71' \
  '首页默认 mascot 又引用旧版挥手动画，fixed 版本不会被加载'

want assets/mascot-schedule.js "timeZone: 'America/Los_Angeles'" \
  '节日 mascot 不再按 Los Angeles 日期切换，访客设备时区会导致提前或延后展示'

want index.html 'MakkieMascotSchedule' \
  '节日 mascot 的日期选择器被删掉，所有日期都会退回默认版本'

want index.html 'class="hero-mascot-glass"' \
  '首页 mascot 的毛玻璃组件外层被移除，节日视频会直接浮在背景上'

want index.html 'background:rgba(249,241,229,.26);' \
  '首页 mascot 毛玻璃的半透明背景被移除，只剩无底色边框'

want index.html 'backdrop-filter:blur(18px) saturate(.88);' \
  '首页 mascot 毛玻璃模糊效果被移除'

want index.html 'width:min(36vw,180px);' \
  '首页 mascot 又恢复为过大的 220px 尺寸，毛玻璃圆会遮住太多背景'

for asset in \
  assets/video/makkie-waving-fixed.webm \
  assets/video/makkie-mid-autumn-2026.webm \
  assets/video/makkie-halloween.webm \
  assets/video/makkie-christmas.webm \
  assets/video/makkie-new-year.webm \
  assets/video/makkie-cny-2027.webm
do
  if [ ! -f "$asset" ]; then
    printf '✗ %s\n  节日 mascot 资源缺失，命中对应日期时首页会空白\n\n' "$asset"
    fail=1
  fi
done

if [ -e assets/video/makkie-waving-clean.webm ]; then
  printf '✗ assets/video/makkie-waving-clean.webm\n  旧版挥手动画仍在仓库中，容易被误引用并增加发布体积\n\n'
  fail=1
fi

want index.html '@keyframes hero-logo-hop' \
  '降级用的静态 logo 不会动了'

# ---------- iPhone / Duo / 折叠屏布局 ----------
for html in ./*.html; do
  want "$html" 'width=device-width, initial-scale=1.0, viewport-fit=cover' \
    'iPhone 刘海、横屏安全区和折叠屏视口不能延伸到完整屏幕，左右内容可能被系统区域挤压'
done

want index.html 'min-height:100dvh;' \
  '首页又只依赖静态 vh/svh，iPhone 地址栏收放后首屏会被裁切或留下大块空白'
want index.html '6.8 · iPhone / Duo / foldable viewport hardening' \
  '首页针对极窄屏、短横屏和铰链视口的覆盖被删了，桌面检查不会发现'
want assets/subpages.css '6.8 · iPhone / Duo / foldable viewport hardening' \
  '子页面针对极窄屏、短横屏和铰链视口的覆盖被删了，桌面检查不会发现'
want index.html '@media (horizontal-viewport-segments:2)' \
  'Duo 一类双屏设备失去物理铰链避让，居中内容会落在铰链下面'
want assets/subpages.css '@media (horizontal-viewport-segments:2)' \
  '子页面在双屏设备上失去物理铰链避让'
want index.html '@media (spanning:single-fold-vertical)' \
  '旧版 Edge/Surface Duo 的铰链避让被删了'
want assets/subpages.css '@media (spanning:single-fold-vertical)' \
  '子页面失去旧版 Edge/Surface Duo 的铰链避让'
want index.html "const mobileTabsQuery = window.matchMedia('(max-width: 820px), (max-width: 980px) and (max-height: 500px) and (orientation: landscape)');" \
  '展开折叠屏和 iPhone 横屏又会误用桌面导航，容易挤出视口'

for html in collection.html contact.html instagram.html intro.html layers.html privacy.html shop.html terms.html; do
  want "$html" 'assets/subpages.css?v=20260922-creative-first-70' \
    '子页面仍可能从浏览器缓存拿到 6.7 样式，看不到折叠屏修复'
  want "$html" 'assets/subpages.js?v=20260922-creative-first-70' \
    '子页面仍可能从浏览器缓存拿到旧的图鉴窄屏加载逻辑'
done

want index.html 'collectionGroupOrderByZh' \
  '首页图鉴实时数据又会按接口顺序覆盖首屏顺序，加载后卡片会跳位'
want assets/subpages.js 'collectionGroupOrderByZh' \
  '独立图鉴页实时数据又会按接口顺序覆盖首屏顺序，加载后卡片会跳位'
want index.html 'menu-card--creative' \
  '首页创意甜品卡片失去专用微光标题标记'
want assets/subpages.css 'menu-card-title--creative' \
  '独立图鉴页创意甜品标题失去 Layer 风格的微光效果'
want index.html "if (a.title.zh === '创意甜品') return -1;" \
  '首页图鉴的创意甜品不再固定为第一个分类'
want assets/subpages.js "if (a.title.zh === '创意甜品') return -1;" \
  '独立图鉴页的创意甜品不再固定为第一个分类'

# ---------- 手机汉堡侧栏社交入口 ----------
want index.html 'class="mobile-drawer-socials"' \
  '首页手机侧栏的 SOCIALS 卡片被删了，桌面检查不会发现'
want assets/subpages.js 'class="mobile-drawer-socials"' \
  '子页面手机侧栏不再生成 SOCIALS 卡片'
want index.html 'data-mobile-socials-title>社交媒体' \
  '首页手机侧栏的社交媒体标题不再跟随语言显示中文'
want assets/subpages.js "currentLang === 'en' ? 'SOCIALS' : '社交媒体'" \
  '子页面手机侧栏的社交媒体标题不再跟随语言切换'
want assets/subpages.css '.mobile-drawer-socials{display:none;}' \
  'SOCIALS 卡片失去桌面隐藏兜底，可能跑到非手机布局'
want index.html '手机侧栏切换语言时保持抽屉打开' \
  '首页手机侧栏切换语言后又自动关闭'
want assets/subpages.js '切换语言后恢复原有打开状态与焦点' \
  '子页面重建导航后没有恢复手机侧栏，切换语言会让侧栏消失'

# ---------- 图鉴图片首开速度 ----------
want collection.html '<link rel="preconnect" href="https://admin.makkiemua.com" crossorigin>' \
  '进入图鉴时没有提前建立图片域名连接，首次打开分类会多等一轮 DNS/TLS'

want assets/subpages.js "warmCollectionGroup(targetId, 'high')" \
  '点击图鉴分类前没有提升首屏图片请求优先级，弹窗会先出现空白图片格'

want assets/subpages.js 'loading="${index < visibleCount ? '\''eager'\'' : '\''lazy'\''}"' \
  '图鉴弹窗首屏图片又全部退回 lazy，只有打开后浏览器才开始慢慢排队'

want assets/subpages.js '保留已经解码的图片 DOM' \
  '关闭图鉴又销毁图片节点，重复打开同一分类会重新请求和解码'

want assets/subpages.js "cache: 'no-store'" \
  '独立图鉴页又允许 Safari 缓存目录 JSON，后台新增的图鉴可能隔天仍不出现'

want assets/subpages.js "window.addEventListener('pageshow'" \
  '独立图鉴页从 Safari 返回缓存恢复时不再主动同步后台目录'

want index.html "cache: 'no-store'" \
  '首页图鉴又允许 Safari 缓存目录 JSON，后台新增的图鉴可能隔天仍不出现'

want index.html "window.addEventListener('pageshow'" \
  '首页从 Safari 返回缓存恢复时不再主动同步后台图鉴目录'
want index.html 'collectionGroupEnglishByZh' \
  '首页实时图鉴覆盖后，英文分类会退回中文'
want assets/subpages.js 'collectionItemEnglishByZh' \
  '独立图鉴页遇到缺失或错误的 name_en 时会继续显示中文'
want assets/subpages.js "['豆乳年糕胖曲奇', 'Soy Milk Rice Cake Makkie']" \
  '豆乳年糕胖曲奇的英文名会重新粘在一起'
want assets/subpages.js 'stackedEn:' \
  '英文层次页仍会加载带中文标注的 SVG'
want 'assets/images/svg/1-斑斓芭乐巴斯克-展开-en.svg' 'Guava Basque Cheesecake' \
  '英文层次图的芭乐巴斯克标注缺失'

# ---------- Google Analytics 电商漏报 ----------
for html in ./*.html; do
  want "$html" 'assets/analytics.js?v=20260903-ga4-ecommerce-67' \
    '该页面未加载统一 GA4 标签，访问与转化会从报表中消失'
done

want assets/analytics.js "send('purchase'" \
  'GA4 没有 purchase 事件，“电商购买次数 / 下单量”会一直为 0'
want assets/analytics.js 'transaction_id:' \
  'purchase 缺少唯一订单号，GA4 无法正确识别和去重交易'
want assets/shop-page.js 'MakkieAnalytics.purchase' \
  '独立商城下单成功后没有上报 purchase'
want index.html 'MakkieAnalytics.purchase' \
  '首页商城下单成功后没有上报 purchase'
want index.html 'MakkieAnalytics.cakeInquiry' \
  '蛋糕询单成功后没有上报 generate_lead'

# ---------- 吉祥物彩蛋 ----------
want intro.html 'makkieMascotZone' '关于我们的浮动彩蛋没了'
want contact.html 'makkieMascotZone' '联系我们的浮动彩蛋没了'
want assets/subpages.css '.story-page{padding:0 1.5rem 5.4rem;background:var(--bg);position:relative;}' \
  '关于我们少了 position:relative，彩蛋会飞到整页右下角'
want assets/subpages.css '.contact-page{padding:1.5rem 1.5rem 5rem;background:var(--bg);position:relative;}' \
  '联系我们少了 position:relative，彩蛋会飞到整页右下角'

if [ "$fail" = 0 ]; then
  echo '✓ 承重代码检查通过'
fi
exit "$fail"
