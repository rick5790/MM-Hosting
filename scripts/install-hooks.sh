#!/bin/sh
# 让 git 用仓库里的钩子（提交前自动跑 check-invariants.sh）。
# 撤销：git config --unset core.hooksPath
cd "$(dirname "$0")/.." || exit 2
chmod +x scripts/githooks/pre-commit scripts/check-invariants.sh
git config core.hooksPath scripts/githooks
echo "已启用：每次 commit 前自动跑 scripts/check-invariants.sh"
echo "撤销：git config --unset core.hooksPath"
