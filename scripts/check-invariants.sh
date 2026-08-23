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

want index.html 'useStaticLogo' \
  '微信 / 不支持 WebM 时没有静态 logo 退路，首屏小人直接开天窗'

want index.html '@keyframes hero-logo-hop' \
  '降级用的静态 logo 不会动了'

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
