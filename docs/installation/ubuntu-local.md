# Ubuntu 本地容器调试

本配置默认运行固定版本的 New API 官方镜像，并使用 MySQL 8.0 与 Redis 7。浏览器入口固定为 `http://localhost:7777`，数据库和 Redis 不暴露宿主机端口。修改源码后也可以切换到本地构建模式。

## 前置条件

- 64 位 Ubuntu
- Docker Engine
- Docker Compose v2（命令为 `docker compose`）
- OpenSSL
- 当前用户可以执行 `docker info`

## 启动

```bash
git clone https://github.com/wangshun-china/new-api.git
cd new-api
chmod +x scripts/local-dev.sh
./scripts/local-dev.sh up
```

首次启动会执行以下操作：

1. 在根目录生成权限为 `600` 的 `.env`，其中包含随机的 MySQL、Redis、会话和加密密钥。
2. 拉取 `.env` 中固定的 New API 镜像版本。
3. 启动 MySQL、Redis 和 New API，并等待三个服务通过健康检查。
4. 将 New API 容器的 `3000` 端口映射到 Ubuntu 的 `7777`。

首次拉取镜像的耗时取决于网络。启动成功后访问：

```text
http://localhost:7777
```

如果 Ubuntu 运行在远程服务器或虚拟机中，请访问 `http://<Ubuntu-IP>:7777`，并确认防火墙允许该测试端口。正式部署时不应直接暴露 7777，应改为仅监听 `127.0.0.1` 并通过 HTTPS 反向代理提供服务。

## 常用命令

```bash
# 查看服务状态
./scripts/local-dev.sh status

# 跟踪 New API 日志
./scripts/local-dev.sh logs

# 重启服务
./scripts/local-dev.sh restart

# 停止服务（保留数据库和 Redis 数据）
./scripts/local-dev.sh down

# 仅校验 Compose 配置
./scripts/local-dev.sh config
```

修改前端或后端源码后，使用下面的命令构建当前源码并替换正在运行的官方镜像：

```bash
./scripts/local-dev.sh build
```

源码构建需要下载 Bun、Go 和前端依赖，第一次执行会明显慢于 `up`。

## 修改端口或配置

首次启动后编辑根目录 `.env`：

```dotenv
NEW_API_BIND_ADDRESS=0.0.0.0
NEW_API_PORT=7777
```

修改后重新执行：

```bash
./scripts/local-dev.sh down
./scripts/local-dev.sh up
```

`.env` 已被 Git 忽略，不要把其中的密码和密钥提交到仓库。可提交的字段样例位于 `.env.local.example`。

## 测试完成后的检查

1. 打开初始化页面并创建 Root 管理员。
2. 新建测试渠道并确认渠道测试通过。
3. 创建普通用户，让用户自行创建令牌。
4. 使用统一模型名发起一次非流式请求和一次流式请求。
5. 禁用该普通用户，确认原令牌不能继续调用。

## GitHub Actions 手动部署

仓库中的 `Build and Deploy New API` 工作流仅支持手动触发。进入 GitHub 仓库的
`Actions` 页面，选择该工作流并点击 `Run workflow`，然后选择 `wsl` 或 `aliyun`
目标环境。工作流会调度带有对应环境标签的 Self-hosted Runner。

工作流使用 GHCR 保存当前源码构建出的镜像，并在目标 Runner 上复用
`new-api-local` Compose 项目及其 MySQL、Redis 数据卷。部署前需要配置以下仓库
Secrets：

- `NEW_API_MYSQL_ROOT_PASSWORD`
- `NEW_API_MYSQL_PASSWORD`
- `NEW_API_REDIS_PASSWORD`
- `NEW_API_SESSION_SECRET`
- `NEW_API_CRYPTO_SECRET`

Self-hosted Runner 必须安装 Docker、Docker Compose v2 和 curl，并带有 `wsl`
或 `aliyun` 标签。部署入口固定为 `http://<Runner-IP>:7777`。
