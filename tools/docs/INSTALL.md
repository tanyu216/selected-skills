# 安装 selected-skills

把本目录里的 skill **上游真实内容**（不是目录卡片）安装到各个 Agent 平台。安装器会按需 clone 上游仓库、复制 skill 目录、安装可自动化的依赖，并在需要时提示配置 API key。

## 前置条件

- Node.js >= 18
- `git`（推荐；没有 git 时回退到 tarball 下载，需要 `tar`）
- 可选：`npm`（Node 自带）、`uv` 或 `pipx`（安装 Tavily CLI 等 Python 工具）

Windows 用户建议使用 `npx`；`install.sh` 只支持 Unix。

## 快速开始

```bash
# 交互式向导（推荐）
npx selected-skills@latest install

# 全局安装命令
npm i -g selected-skills
selected-skills install

# 源码安装（在仓库根目录）
bash install.sh install

# 源码远程安装
curl -fsSL https://raw.githubusercontent.com/tanyu216/selected-skills/HEAD/install.sh | bash -s -- install
```

发布到 npm 前，也可以在本仓库运行 `npx . install`。

## 向导流程

1. 选择目标平台（自动勾选本机检测到的平台）
2. 选择全局 / 当前项目，以及复制 / 软链接
3. 选择安装内容：场景整包、分类整包、全部、手动输入 slug
4. 确认依赖与 key
5. 确认摘要并执行
6. 输出成功 / 跳过 / 失败、license 汇总、依赖与 key 提示

## 平台

| 平台 | 全局目录 | 项目目录 |
| --- | --- | --- |
| claude | `~/.claude/skills` | `.claude/skills` |
| codex | `~/.codex/skills` | `.codex/skills` |
| pi | `~/.pi/agent/skills`（或 `PI_CODING_AGENT_DIR`） | `.pi/skills` |
| opencode | `$XDG_CONFIG_HOME/opencode/skills` | `.opencode/skills` |
| cursor | `~/.cursor/skills` | `.cursor/skills` |
| grok | `$GROK_HOME/skills`（默认 `~/.grok/skills`） | `.grok/skills` |
| gemini | `~/.gemini/skills` | `.gemini/skills` |
| openclaw | `~/.openclaw/skills` | `<项目>/skills` |
| hermes | `$HERMES_HOME/skills`（默认 `~/.hermes/skills`） | 不支持 |

默认安装方式为 **copy**：每个平台一份实体目录，行为最可预测。`--method link` 仅建议用于明确支持软链接的平台（Claude、Gemini、OpenClaw 全局、pi）。

## 选择安装内容

```bash
# 按场景
selected-skills install --platform claude --scenario video-production
selected-skills install --platform claude --scenario data-analysis,quant

# 按分类
selected-skills install --platform claude --category data,quant

# 全部可独立安装的 skill（当前 104 个）
selected-skills install --platform claude --all --yes

# 精确指定
selected-skills install --platform claude --skills tavily-search,playwright-cli

# 展开合集（会一次安装大量子 skill）
selected-skills install --platform claude --all --include-collections --yes

# 项目级安装
selected-skills install --platform cursor --scope project --cwd ../myapp

# 预演，不联网、不写盘
selected-skills install --platform claude --all --dry-run
```

合集包（`mattpocock-skills`、`awesome-gamedev-agent-skills`、`meerkat-taskpanel`、`knowledge-work-plugins-data`、`claude-trading-skills`）默认不展开，需要显式加 `--include-collections`。

## 依赖与 key

安装器只自动执行 `tools/installer/dependencies.json` 里声明、且可检测的命令：

- `tvly`（PyPI 包 `tavily-cli`）：`uv tool install tavily-cli`，无 uv 时回退 `pipx`
- `playwright-cli`：`npm i -g @playwright/cli@latest`
- `ocr`：`npm i -g @alibaba-group/open-code-review`
- `hyperframes`：`npm i -g hyperframes`
- Remotion、Qlib、Alphalens、Optuna 等 Python/项目级依赖：按提示在项目/venv 内安装，不全局装

其余依赖（ffmpeg、LaTeX、Manim、MCP 连接器、交易数据接口）只打印提示，不执行上游安装脚本。

### key

- `TAVILY_API_KEY`：输入后执行 `tvly login --api-key`；跳过时写入 `~/.selected-skills/pending-keys.sh`
- `FMP_API_KEY` / `FINVIZ_API_KEY` / `ALPACA_API_KEY` / `ALPACA_SECRET_KEY` / `ALPACA_PAPER`：打印 `export` 示例
- `ELEVENLABS_API_KEY` / `GEMINI_API_KEY` / `ATLAS_CLOUD_API_KEY` / `MUAPI_API_KEY` / `FIGMA_TOKEN` / `OCR_LLM_ENDPOINT`：打印 `export` 示例
- Snowflake / Databricks / BigQuery：通过 data 插件的 `.mcp.json` 配置，没有统一 env 名

跳过 key 时不会把任何真实 key 写入 state 或日志；`pending-keys.sh` 只包含占位符，权限为 0600。

CI 可用 `--key TAVILY_API_KEY=...` 显式传入，但注意命令行参数可能在进程列表中短暂可见。

## 升级、同步与卸载

```bash
# 只检查上游是否有更新
selected-skills update --check

# 刷新已安装的 skill（copy 平台重新复制；link 平台自动跟随源）
selected-skills update --yes

# 目标被删掉时重建
selected-skills update --repair --yes

# 补齐合集新增的子 skill；--prune 移除上游已删除的
selected-skills sync --collections --yes
selected-skills sync --collections --prune --yes

# 卸载
selected-skills uninstall --platform claude --skills tavily-search --yes
selected-skills uninstall --all --yes

# 体检
selected-skills doctor
selected-skills doctor --check-updates --json
```

`update` 不会覆盖被用户改过的目标：默认跳过，`--force` 会先备份到 `~/.selected-skills/backups/` 再覆盖。

## 运行时目录

```text
~/.selected-skills/                    # 可用 SELECTED_SKILLS_HOME 覆盖
├── sources/github.com/<owner>/<repo>/ # 每个上游仓库只 clone 一次
├── state.json                         # 已安装 skill、平台、commit、内容 hash
├── backups/<platform>/<slug>-<ts>/    # --force 覆盖前的备份
├── pending-keys.sh                    # 跳过的 key 配置示例，0600
└── logs/last-install.json             # 最近一次安装日志
```

`state.json` 是卸载与更新判断的依据；不要手动编辑。

## 故障排查

- **没有 git**：自动回退 tarball；`--offline` 只使用已有缓存。
- **clone / fetch 失败**：安装器会删除半成品后重试一次；仍失败时在报告里列出该仓库。
- **目标已存在**：默认跳过；`--force` 会备份后覆盖。
- **Codex 看不到 skill**：确认版本支持 skills；旧版可能需要开启 `[features] skills = true`，或把目标设为 `--dest ~/.agents/skills`。
- **Gemini / OpenClaw / Hermes 看不到新 skill**：按报告里的提示执行 `/skills reload`、`openclaw skills list` 或 `hermes skills list`。
- **上游有嵌套 SKILL.md**：安装器会警告；Codex/Hermes 的递归扫描可能把它识别成额外 skill。
- **license**：报告会汇总每个 skill 的 license；Remotion 是自定义非 OSI 许可，`remotion-video-toolkit` 上游无 LICENSE，商用前请确认。

## 测试

```bash
npm test

# 真实上游 smoke（联网）
SKILLS_NETWORK_TESTS=1 node --test
```
