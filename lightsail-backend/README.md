# lightsail-backend — 线上后端镜像备份

这是 **Amazon Lightsail** 上实际运行的后端 `makkie-web-api`(Node/Express)的**只读镜像备份**。

- 生产环境(admin.makkiemua.com、makkiemua.com 的 API)跑的就是这套。
- 这**不是**本地开发后端 —— 本地开发用的是 `backend/`(Python FastAPI，已被 .gitignore 排除)。
- 日常改动直接在 Lightsail 上做；这里只是版本备份，方便回溯。

**不包含**(故意排除):`node_modules/`、`.env`(密钥)、`*.sqlite`(数据库)、`uploads/`(用户图片)。

## 更新备份(从 Lightsail 拉最新代码)

```bash
rsync -az --delete \
  --exclude='node_modules' --exclude='.env*' --exclude='*.sqlite' \
  --exclude='uploads' --exclude='*.log' --exclude='.git' \
  -e "ssh -i ~/.ssh/makkie_lightsail" \
  ubuntu@52.13.201.129:makkie-web-api/ lightsail-backend/makkie-web-api/
git add lightsail-backend && git commit -m "Sync lightsail-backend backup"
```
