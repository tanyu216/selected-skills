# 容器化安装验证与 CI/CD

用 Docker 模拟一台「干净机器」，验证 `install.sh` / `selected-skills` 的真实安装、升级、卸载与发布包行为。CI 每次提交跑确定性离线套件；发布 tag 时再跑真实上游 smoke 并发布 npm 与验证镜像。

## 快速开始

```bash
# 全部离线套件（确定性、不联网）
./docker/verify.sh

# 只跑一个套件
./docker/verify.sh preflight
./docker/verify.sh install
./docker/verify.sh package

# 单元测试（容器内 npm test）
./docker/verify.sh unit

# 真实上游 smoke（需要网络）
./docker/verify.sh network

# 离线 + 网络
./docker/verify.sh all
```

也可以直接用 Compose：

```bash
docker compose -f docker/compose.yaml run --rm offline
docker compose -f docker/compose.yaml --profile network run --rm network
```

报告写到 `artifacts/`：每个套件一份 `.log`，汇总为 `junit.xml` 与 `results.tsv`（已在 `.gitignore` 中忽略）。

## 验证了什么

| 套件 | 覆盖内容 |
| --- | --- |
| `00-preflight` | Node/tar/git 前置检查、`install.sh --help`、版本、9 个平台检测、非交互参数错误 |
| `10-dry-run` | 全平台 dry-run 计划、不写盘、不创建 pending key |
| `20-install` | general 场景 12 个 skill × 9 个平台、frontmatter 规范化、可执行位、state/日志/pending-keys、非 root 产物 |
| `30-idempotency` | 重复安装跳过、不覆盖用户修改、`--force` 备份后覆盖、无临时目录残留 |
| `40-link-project` | `copy`/`link` 按平台能力回退、项目级安装、`--dest` 约束、hermes 项目级不支持 |
| `50-lifecycle` | `doctor`、`update --check`、用户修改保护、`--force` 更新、单个/全部卸载、`list --installed` |
| `60-selection` | 场景/分类/skill 列表/去重/自定义目录/未知参数/合集提示 |
| `70-package` | `npm pack` 文件清单、全局安装发布包、发布包独立安装场景 |
| `90-network-smoke` | 真实 GitHub 上游 clone 或 tarball 回退、缓存复用（仅在 network 模式） |

离线套件不访问网络：`docker/verify/lib/fixtures.sh` 在 `SELECTED_SKILLS_HOME/sources/github.com/...` 下生成上游 fixture。安装器把「没有 `.git` 的非空目录」当作 tarball 缓存，因此 `--offline` 可以完整跑通。

套件覆盖源码安装（`bash install.sh ...`）与 npm 发布包安装。`curl ... | bash` 远程模式依赖 GitHub 上已发布的 HEAD，不能代表当前工作区，因此未纳入 PR 门禁。

## 镜像设计

- 基础镜像 `node:22-bookworm-slim`，只装 `bash`、`ca-certificates`、`tar`、`which`，可选 `git`。
- 非 root 用户 `verify`（uid/gid 1001）；本地与 CI 通过 `--user $(id -u):$(id -g)` 运行，避免产物归属 root。
- `/opt/verify/fakebin` 放入九个平台的假二进制，让 `detectPlatforms()` 能看到全部平台（模拟已安装 Agent）。
- 每个套件使用独立的临时 `HOME` 与 `SELECTED_SKILLS_HOME`，互不污染。
- 被测项目版本化进镜像（`/opt/selected-skills`）；本地默认再只读挂载当前仓库，方便改代码后立即验证。

### 无 git 场景

```bash
WITH_GIT=false IMAGE=selected-skills-verify:nogit ./docker/verify.sh network
```

镜像里没有 `git`，安装器会走 `fetch` + `tar` 的 tarball 回退；套件会断言没有 `.git` 缓存。CI 用同样的矩阵覆盖 git 与 tarball 两条传输路径。

## 常用环境变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `IMAGE` | `selected-skills-verify:local` | 镜像名 |
| `WITH_GIT` | `true` | `false` 构建无 git 镜像 |
| `NODE_IMAGE` | `node:22-bookworm-slim` | 基础镜像，可换 Node 18/20 |
| `LIVE_MOUNT` | `1` | 是否把当前仓库只读挂载进容器 |
| `SKIP_BUILD` | `0` | `1` 时跳过构建 |
| `ARTIFACTS_DIR` | `<repo>/artifacts` | 报告目录 |
| `SUITE_TIMEOUT` | `600` | 单个套件超时秒数 |
| `KEEP_WORKSPACE` | `0` | 容器内 `1` 时保留临时目录便于排查 |

## CI/CD

### `.github/workflows/ci.yml`

- `unit`：Node 18 / 20 / 22 矩阵跑 `npm test` 与 `npm pack --dry-run`。
- `offline-verify`：8 个套件并行，每个任务构建同一镜像并运行一个 `SUITE`，上传 `junit-<suite>` artifact。
- `network-smoke`：仅在 `schedule`、`workflow_dispatch`、被 Release 调用时运行；矩阵覆盖 `git` 与 `tarball` 两种传输。
- `publish-edge`：main 分支通过后构建并推送 `ghcr.io/<owner>/<repo>/verify:edge`。

### `.github/workflows/release.yml`

推送 `v*` tag 时：

1. 复用 `ci.yml` 的全部门禁（单元 + 离线 + 网络 smoke）。
2. 校验 tag 与 `package.json` version 一致。
3. `npm publish --provenance --access public`。
4. 推送镜像 tag：`v0.1.0`、`latest`、`sha-<commit>`。

需要配置：

- Secret `NPM_TOKEN`：npm 发布 token。
- 仓库 Settings → Actions → Workflow permissions 允许 `GITHUB_TOKEN` 写 packages（或使用已有的 packages 权限）。
- npm 包启用 provenance 需要 `id-token: write`（workflow 已声明）。

## 新增套件

1. 在 `docker/verify/suites/` 新建 `NN-name.sh`，以 `source .../lib/common.sh` 开头，用 `begin_suite` / `finish_suite` 包裹。
2. 在 `docker/verify/entrypoint.sh` 的 `suite_for` 与 `OFFLINE_SUITES` 中登记。
3. 本地 `./docker/verify.sh <name>` 验证；CI 矩阵按需加一项。
4. 需要新 fixture 时，在 `docker/verify/lib/fixtures.sh` 增加 `seed_*`，不要依赖外网。

## 排查

- **构建慢**：CI 使用 GitHub Actions 构建缓存；本地首次拉 `node:22-bookworm-slim` 较慢。
- **artifacts 权限错误**：确认用 `./docker/verify.sh`（自动带 `--user`），或手动 `mkdir -p artifacts` 后重试。
- **网络套件失败**：先确认容器内 DNS 与 GitHub 可达；离线套件不依赖网络，可作为主门禁。
- **改了套件但没生效**：套件来自镜像 `/opt/verify`，改完需要重新构建（`SKIP_BUILD` 会沿用旧镜像）。
