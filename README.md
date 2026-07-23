# IMO Training Platform

奥数（IMO级别）训练平台 — 支持图片/LaTeX提交、管理员批改、求助系统、等级系统。

## 部署到 Railway

### 步骤

1. **注册并登录** [railway.app](https://railway.app)（GitHub 登录即可）

2. **创建 GitHub 仓库**
```bash
cd /Users/weihuang/Documents/try1try
git init
git add .
git commit -m "init"
# 在 GitHub 上创建仓库，然后：
git remote add origin https://github.com/YOUR_USER/imo-platform.git
git push -u origin main
```

3. **连接 Railway**
   - Railway 控制台 → New Project → Deploy from GitHub repo
   - 选择刚才推送的仓库
   - 自动识别 Dockerfile 并开始构建

4. **配置环境变量**
   - 在 Railway 项目 Settings → Variables 中添加：
     - `NEXTAUTH_SECRET` = 任意随机字符串（可用 `openssl rand -hex 32` 生成）
     - `NEXTAUTH_URL` = Railway 分配的域名（如 `https://imo-platform.up.railway.app`）
     - `DATABASE_URL` = `file:/data/app.db`（默认，无需修改）

5. **添加持久化存储**
   - 在 Railway 项目 Settings → Volumes 中：
   - 创建 Volume，挂载路径 `/data`（数据库文件和上传图片会存这里）

6. **部署完成**
   - Railway 会自动构建并启动
   - 首次启动会自动运行数据库迁移和种子数据
   - 访问分配的域名即可使用

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 学生 | demo | student123 |

### 本地开发

```bash
# 安装依赖
npm install

# 初始化数据库
npm run setup

# 启动开发服务器
npm run dev
```
