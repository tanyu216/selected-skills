# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 仓库是什么

本仓库由两条互相依赖的主线组成：

1. **Skill 目录卡片**：`skills/<category>/<slug>.md` 是给人读的精选条目（用途、边界、场景、来源），不是可安装的 skill 本体；`scenarios/*.md` 是「任务 → 用哪些 skill」的场景手册。
2. **安装器**：`tools/` 下的 Node ESM CLI（`selected-skills`）读取这些卡片与场景，解析上游 GitHub 仓库里的真实 `SKILL.md`，clone 后复制/软链到 9 个 Agent 平台。`install.sh` 只是引导脚本（本地执行或 curl 远程执行）。

正文、README、CONTRIBUTING、场景文档均用中文；slug、标签和代码标识用英文。仓库没有 lint/format 脚本，本地校验就是 `npm test` 与容器套件。

## 常用命令

```bash
# 单元测试（node:test，自动发现 tools/test/*.test.js）
npm test

# 跑单个测试文件 / 单个用例
node --test tools/test/install.test.js
node --test --test-name-pattern "existing targets" tools/test/install.test.js

# 真实上游 smoke（联网，默认 skip）
SKILLS_NETWORK_TESTS=1 npm test

# 源码方式运行安装器
node tools/bin/selected-skills.js install --platform claude --scenario general
npx . install --platform claude --dry-run

# 发布包内容检查
npm pack --dry-run
```

### 容器验证

```bash
./docker/verify.sh              # 8 个离线确定性套件
./docker/verify.sh unit         # 容器内 npm test
./docker/verify.sh network      # 真实上游 smoke（需网络）
./docker/verify.sh install      # 只跑单个套件
WITH_GIT=false ./docker/verify.sh network   # 验证无 git 时的 tarball 回退
SKIP_BUILD=1 ./docker/verify.sh offline     # 复用已有镜像
```

常用变量：`LIVE_MOUNT`、`SKIP_BUILD`、`IMAGE`、`NODE_IMAGE`、`ARTIFACTS_DIR`、`SUITE_TIMEOUT`。报告写入 `artifacts/`（已被 gitignore）。

套件脚本来自镜像内 `/opt/verify`，**改了 `docker/verify/` 下的套件必须重建镜像**；`SKIP_BUILD=1` 会沿用旧套件。当前仓库通过 `LIVE_MOUNT=1` 以只读方式覆盖 `/opt/selected-skills`，所以改 `tools/`、`skills/`、`scenarios/` 后无需重建即可验证。

### pre-push 门禁

```bash
npm run setup:hooks    # 每个 clone 执行一次（git config core.hooksPath .githooks）
rm .git/selected-skills-verify/pre-push.stamp   # 强制重跑
git push --no-verify   # 仅确认风险时绕过
```

钩子在 push 前跑 `docker/verify.sh offline` 与 `SKIP_BUILD=1 docker/verify.sh unit`；工作区干净且同一 tree 已通过时命中缓存。删除分支/tag 不触发。

## 架构

### 解析与安装流水线

```
skills/**/*.md  ──loadCatalog()──►  catalog entries（slug=文件名，category=目录名）
                                      │
tools/installer/overrides.json ───────┤ resolveCatalogEntry()
tools/installer/extra-sources.json ───┘
                                      ▼
                              source index（每个 slug 一条 spec）
scenarios/*.md (frontmatter.skills) ──buildSelection()──► selected specs
                                      ▼
                              installSkills()
                                      ▼
             ensureRepo() → copy/link → state.json + logs
```

关键文件：

- [tools/scripts/catalog.js](tools/scripts/catalog.js)：递归扫描 `skills/`，解析卡片 frontmatter，并用正则从正文取 `- 地址：` / `- 安装：` 两行。
- [tools/scripts/sources.js](tools/scripts/sources.js)：把卡片来源解析成 spec。优先级：`overrides.json` > 正文地址 > frontmatter `source`；只有 `github.com/<owner>/<repo>/blob/<ref>/.../SKILL.md` 能自动解析，其余标为 `unresolved`。`extra-sources.json` 补充「只被场景引用、未单独收录」的 skill。
- [tools/scripts/scenarios.js](tools/scripts/scenarios.js)：合并 `--scenario` / `--category` / `--skills` / `--all`，处理去重、来源冲突与合集提示。
- [tools/scripts/install.js](tools/scripts/install.js)：按仓库分组 clone，规范化上游 `SKILL.md`，处理越界引用、嵌套 skill、copy/link 回退与 `--force` 备份。
- [tools/scripts/git.js](tools/scripts/git.js)：上游缓存位于 `<SELECTED_SKILLS_HOME>/sources/github.com/<owner>/<repo>`；优先 sparse clone，无 git 时回退 GitHub tarball。
- [tools/scripts/state.js](tools/scripts/state.js)：`state.json` 记录每个平台目录的 `sourceHash` / `installedHash`；`update`/`uninstall` 用 hash 判断用户是否改过文件，默认不覆盖、不删除。
- [tools/scripts/update.js](tools/scripts/update.js)：`update` 刷新已装内容，`sync --collections` 补齐/裁剪合集的子 skill，`uninstall` 依据 state 删除。
- [tools/scripts/frontmatter.js](tools/scripts/frontmatter.js)：极简 YAML 子集解析器（无第三方依赖）。安装时把上游 `name` 改成目录 slug，缺失的 `description` 用卡片 `summary` 补。
- [tools/installer/dependencies.json](tools/installer/dependencies.json)：skill → 依赖、依赖 → key、合集 key bundle、框架提示的唯一清单；`deps.js` / `keys.js` 只执行这里声明且可检测的命令。

### 选择语义（容易踩坑）

- spec 的 `kind` 有四种：`skill`、`framework`、`collection`、`unresolved`。
- `framework` 只进报告和 `frameworkHints`，**不会被安装**；`unresolved` 会让 `doctor` 与 `--strict-scenarios` 失败。
- `collection` 默认只给提示，必须加 `--include-collections` 才展开；`--all` 也不展开合集。合集必须由 override 提供 `paths`，安装时递归找出含 `SKILL.md` 的目录。
- `extra-sources.json` 的条目只有场景里才会被选中；`--all` 会包含它们。
- 卡片 slug 与上游目录名不一定相同；安装目录名始终用卡片 slug，上游 `SKILL.md` 的 `name` 会被规范化成该 slug。
- 同一 slug 指向不同仓库会直接报来源冲突；已安装同名但来源不同时会拒绝覆盖，要求先卸载。

### 平台与安装方式

平台表在 [tools/scripts/platforms.js](tools/scripts/platforms.js)，共 9 个（claude、codex、pi、opencode、cursor、grok、gemini、openclaw、hermes）。全局/项目目录、是否支持软链都在这里定义；hermes 不支持项目级，openclaw 项目级也不支持 link。默认 `copy`；`--method link` 仅在平台声明支持且上游 frontmatter 无需规范化时生效，否则自动回退 copy。

运行时目录默认 `~/.selected-skills`（`SELECTED_SKILLS_HOME` 可覆盖），包含 sources 缓存、`state.json`、`backups/`、`logs/last-install.json`、`pending-keys.sh`。`state.json` 是 update/uninstall 的唯一依据，不要手改。

### 容器验证模型

[docker/verify.sh](docker/verify.sh) 构建一个只有 Node/基础工具的干净镜像，以非 root 用户运行 [docker/verify/entrypoint.sh](docker/verify/entrypoint.sh) 中的套件。离线套件由 [docker/verify/lib/fixtures.sh](docker/verify/lib/fixtures.sh) 在容器内生成假上游缓存；安装器把「没有 `.git` 的非空目录」当作 tarball 缓存，因此 `--offline` 能完整跑通。新增套件要改 `entrypoint.sh` 的 `suite_for` 与 `OFFLINE_SUITES`，并在 CI 矩阵登记。

## 改动时的不变式

### 新增或修改 skill 卡片

1. 复制 [_templates/skill.md](_templates/skill.md) 到 `skills/<category>/<slug>.md`，保留 frontmatter（`name`、`category`、`source`、`license`、`tags`、`summary`）和五个正文小节；没有内容写「无」。
2. 来源只指向默认分支/HEAD，不写 commit 或版本号；无法确认的许可证写 `unknown`，非 OSI 的写 `source-available`，不要冒充 MIT。
3. 更新 [README.md](README.md) 的 Skill 索引，并把新 skill 补进至少一个已有场景的 `skills:` 列表。场景固定 10 个，不新增场景文件。
4. 如果正文地址不能被 `sources.js` 解析，补 [tools/installer/overrides.json](tools/installer/overrides.json)；如果这个 skill 只在场景里引用、没有单独卡片，补 `extra-sources.json`。
5. 改完数量后更新硬编码断言：[tools/test/scenarios.test.js](tools/test/scenarios.test.js) 中 `--all` 的 100 skills / 6 frameworks，以及各场景的 skill 计数；同时更新 [tools/docs/INSTALL.md](tools/docs/INSTALL.md) 里的「当前 100 个」。来源解析与 `extra-sources.json` 的完整性由 `sources.test.js` 约束。

### 卡片收录规则（CONTRIBUTING）

- 单一来源 ≥30 个 skill：只建一个合集条目，在「用途」的 `###` 子表只列推荐使用的子 skill 并标推荐等级，不逐一收录全部子 skill。
- 单一来源 <30 个：最多 5 个代表条目，其余在「注意点」说明取舍。
- 框架/CLI/运行时不是 skill 时仍建一个条目，标注「框架条目」或「CLI + 内置 skill」，并在「来源」记录安装命令。
- 场景按子 skill 粒度列出；合集名本身不写进场景。

### 安装器与验证

- 安装器无第三方依赖，保持 Node >= 18 与 ESM；新增解析/平台/状态逻辑时同步补 `tools/test/*.test.js`。
- 涉及安装、更新、卸载、平台目录、发布包行为，改完先 `npm test`，再 `./docker/verify.sh offline`；改 `docker/verify/` 套件则必须重建镜像。
- 新增依赖或 key 只加到 `tools/installer/dependencies.json`，不要在代码里硬编码；跳过 key 时只能写占位符到 `pending-keys.sh`，不能写真实值。
- CI 在 [.github/workflows/ci.yml](.github/workflows/ci.yml) 跑 Node 18/20/22 单元测试 + 8 个离线套件并行；发布 [.github/workflows/release.yml](.github/workflows/release.yml) 要求 tag `vX.Y.Z` 与 `package.json` 版本一致后才 publish npm 与镜像。
- `package.json` 的 `files` 白名单包含 `tools`、`skills`、`scenarios`、`install.sh`；新增运行必需文件时确认会被打包。
