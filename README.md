# selected-skills

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

精选好用的 skill 合集：每个 skill 记录用途、适用边界和典型场景，方便按需查找与组合。

## 目录结构

```text
selected-skills/
├── skills/                 # 一个 skill 一个文件
│   ├── frontend/           # 前端与 UI
│   ├── engineering/        # 构建、测试、审查、调试、架构
│   ├── docs/               # 文档与办公（docx / xlsx / pdf）
│   ├── data/               # 数据与可视化
│   ├── quant/              # 量化研究、交易策略与回测
│   ├── creative/           # 设计与视频
│   ├── gamedev/            # 游戏开发（引擎、玩法、资产、发布）
│   ├── research/           # 搜索、抓取与调研
│   └── agent/              # 智能体、任务看板与工作流
├── scenarios/              # 场景手册：9 个一级场景，什么任务该用哪些 skill
├── _templates/             # skill 与 scenario 模板
├── tools/                  # 安装器、测试与安装文档（install.sh 为入口）
├── CONTRIBUTING.md
└── LICENSE
```

## Skill 索引

<!-- 新增 skill 后在此登记，按分类排序。 -->

| 分类 | skill | 一句话用途 | 来源 |
| --- | --- | --- | --- |
| frontend | [daisyui](skills/frontend/daisyui.md) | daisyUI 组件类、语义色与主题在 Tailwind CSS 中的用法。 | [daisyUI](https://github.com/saadeghi/daisyui) |
| frontend | [design-system](skills/frontend/design-system.md) | 三层 design token、组件规范与品牌一致性的系统化设计。 | [Design System](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| frontend | [design-taste-frontend](skills/frontend/design-taste-frontend.md) | 基于 247 个精选站点提炼的前端美术指导与反模板化规则。 | [Design Taste (Frontend)](https://github.com/Leonxlnx/taste-skill) |
| frontend | [design](skills/frontend/design.md) | 品牌识别、Logo、CIP、图标、海报与社交图的综合设计流程。 | [Design (ui-ux-pro-max)](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| frontend | [finesse-term](skills/frontend/finesse-term.md) | 把用户口语化的 Web / H5 描述翻译成准确术语和可执行需求。 | [Finesse Term](https://github.com/mouse-lin/finesse-term) |
| frontend | [finesse-ui](skills/frontend/finesse-ui.md) | 构建和打磨高完成度 Web 界面，含视觉、无障碍与动效审计。 | [Finesse UI](https://github.com/mouse-lin/finesse-skill) |
| frontend | [impeccable](skills/frontend/impeccable.md) | 前端界面的设计、审查、打磨、简化、硬化与动效改进。 | [Impeccable](https://github.com/pbakaus/impeccable) |
| frontend | [interface-design](skills/frontend/interface-design.md) | 面向仪表盘、后台、SaaS 工具与数据界面的 craft-first 设计。 | [Interface Design](https://github.com/Dammyjay93/interface-design) |
| frontend | [nuxt](skills/frontend/nuxt.md) | Nuxt 全栈框架的 SSR、自动导入、文件路由与服务端路由用法。 | [Nuxt](https://github.com/antfu/skills) |
| frontend | [ui-styling](skills/frontend/ui-styling.md) | 用 shadcn/ui、Tailwind 与 canvas 构建可访问的响应式界面。 | [UI Styling](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| frontend | [ui-ux-pro-max](skills/frontend/ui-ux-pro-max.md) | 面向 Web、移动与桌面界面的设计、审查与修复指南，带可检索的本地设计数据。 | [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| frontend | [vue](skills/frontend/vue.md) | Vue 3 Composition API、script setup、响应式与内置组件的写法约定。 | [Vue](https://github.com/antfu/skills) |
| engineering | [antfu](skills/engineering/antfu.md) | Anthony Fu 的 JavaScript / TypeScript 项目工具链、代码组织与发布约定。 | [Antfu](https://github.com/antfu/skills) |
| engineering | [mattpocock-skills](skills/engineering/mattpocock-skills.md) | 39 个工程流程 skill 的合集：规格、拆分、实现、审查、调试与架构。 | [Matt Pocock Skills](https://github.com/mattpocock/skills) |
| engineering | [open-code-review-delegate](skills/engineering/open-code-review-delegate.md) | OCR 委托模式：宿主 Agent 自己审查，OCR 只做文件选择与规则解析。 | [Open Code Review (Delegate)](https://github.com/alibaba/open-code-review) |
| engineering | [open-code-review](skills/engineering/open-code-review.md) | 用 ocr CLI 对 Git 变更做 AI 代码审查，输出行级评论并可自动修复。 | [Open Code Review](https://github.com/alibaba/open-code-review) |
| engineering | [playwright-cli](skills/engineering/playwright-cli.md) | 用 playwright-cli 做浏览器自动化、网页测试与 Playwright 测试。 | [Playwright CLI](https://github.com/microsoft/playwright-cli) |
| engineering | [vite](skills/engineering/vite.md) | Vite 配置、插件 API、SSR 与 Vite 8 Rolldown 迁移。 | [Vite](https://github.com/antfu/skills) |
| engineering | [vitest](skills/engineering/vitest.md) | Vitest 的单元测试、mock、覆盖率与测试筛选。 | [Vitest](https://github.com/antfu/skills) |
| docs | [docx](skills/docs/docx.md) | 创建、读取、编辑 Word 文档与 .dotx 模板。 | [DOCX](https://github.com/anthropics/skills) |
| docs | [pdf](skills/docs/pdf.md) | PDF 读取、合并拆分、表单、加密、水印与扫描件 OCR。 | [PDF](https://github.com/anthropics/skills) |
| docs | [pptx](skills/docs/pptx.md) | 创建和编辑 PowerPoint 演示文稿与 .potx 模板。 | [PPTX](https://github.com/anthropics/skills) |
| docs | [xlsx](skills/docs/xlsx.md) | 创建、读取、编辑 Excel 工作簿与 CSV / TSV。 | [XLSX](https://github.com/anthropics/skills) |
| data | [knowledge-work-plugins-data](skills/data/knowledge-work-plugins-data.md) | Anthropic 官方数据分析插件：SQL、探索、可视化、看板、统计与交付校验。 | [Knowledge Work Plugins · Data](https://github.com/anthropics/knowledge-work-plugins/tree/HEAD/data) |
| data | [polars](skills/data/polars.md) | 高性能 DataFrame：表达式 API、惰性优化、流式处理与 pandas 迁移。 | [K-Dense Scientific Agent Skills](https://github.com/K-Dense-AI/scientific-agent-skills) |
| data | [exploratory-data-analysis](skills/data/exploratory-data-analysis.md) | 有边界的本地 EDA：画像、缺失与泄漏审计、异常与变换敏感性。 | [K-Dense Scientific Agent Skills](https://github.com/K-Dense-AI/scientific-agent-skills) |
| data | [statistical-analysis](skills/data/statistical-analysis.md) | 统计检验选择、假设检查、效应量、功效与 APA 报告。 | [K-Dense Scientific Agent Skills](https://github.com/K-Dense-AI/scientific-agent-skills) |
| data | [scikit-learn](skills/data/scikit-learn.md) | 监督与无监督学习、模型评估、调参与 Pipeline。 | [K-Dense Scientific Agent Skills](https://github.com/K-Dense-AI/scientific-agent-skills) |
| data | [statsmodels](skills/data/statsmodels.md) | OLS / GLM / 离散与混合模型、ARIMA / SARIMAX 的拟合与推断。 | [K-Dense Scientific Agent Skills](https://github.com/K-Dense-AI/scientific-agent-skills) |
| quant | [alphalens-reloaded](skills/quant/alphalens-reloaded.md) | 因子绩效分析：IC/IR、分位收益、换手与分组分析。 | [Alphalens Reloaded](https://github.com/stefan-jansen/alphalens-reloaded) |
| quant | [claude-trading-skills](skills/quant/claude-trading-skills.md) | 74 个交易与投资流程 skill 的合集：市场状态、组合、选股、交易计划、复盘与策略研究。 | [Claude Trading Skills](https://github.com/tradermonty/claude-trading-skills) |
| quant | [optuna](skills/quant/optuna.md) | 超参数优化：define-by-run 搜索空间、剪枝、并行与试验管理。 | [Optuna](https://github.com/optuna/optuna) |
| quant | [qlib](skills/quant/qlib.md) | 面向 AI 的量化投资框架：数据、因子、模型、回测、组合优化与自动研究流水线。 | [Qlib](https://github.com/microsoft/qlib) |
| quant | [tradingagents](skills/quant/tradingagents.md) | 多 Agent LLM 交易研究框架：分析师、研究员、交易员、风控与组合经理协作决策。 | [TradingAgents](https://github.com/TauricResearch/TradingAgents) |
| creative | [brand](skills/creative/brand.md) | 品牌语调、视觉识别、信息框架与品牌一致性。 | [Brand (ui-ux-pro-max)](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| creative | [figma](skills/creative/figma.md) | 把 Figma 资源、品牌 token、组件与 storyboard 带进 HyperFrames 视频。 | [Figma](https://github.com/heygen-com/hyperframes) |
| creative | [frame-smith](skills/creative/frame-smith.md) | 以 Remotion 或 HyperFrames 为运行时的宣传片与竖屏短视频导演 skill。 | [Frame Smith](https://github.com/mouse-lin/frame-smith) |
| creative | [hyperframes-cli](skills/creative/hyperframes-cli.md) | HyperFrames 的命令行工作流：脚手架、检查、预览、渲染、发布与故障恢复。 | [HyperFrames CLI](https://github.com/heygen-com/hyperframes) |
| creative | [hyperframes](skills/creative/hyperframes.md) | 用 HTML 渲染视频的 HyperFrames 入口；适合缺素材的文字片、宣传片、音乐卡点与口播包装。 | [HyperFrames](https://github.com/heygen-com/hyperframes) |
| creative | [manim-video](skills/creative/manim-video.md) | 用 Manim CE 制作 3Blue1Brown 风格的数学与技术动画。 | [Manim Video](https://github.com/browser-use/video-use) |
| creative | [media-use](skills/creative/media-use.md) | 为 HyperFrames 视频获取或生成音乐、音效、图像、配音与视频素材。 | [Media Use](https://github.com/heygen-com/hyperframes) |
| creative | [remotion-to-hyperframes](skills/creative/remotion-to-hyperframes.md) | 把 Remotion 等既有视频代码或素材迁移到 HyperFrames 并逐帧校验。 | [Remotion to HyperFrames](https://github.com/heygen-com/hyperframes) |
| creative | [remotion-video-toolkit](skills/creative/remotion-video-toolkit.md) | Remotion + React 的程序化视频工具包：动画、渲染、字幕、3D、图表与转场。 | [Remotion Video Toolkit](https://github.com/shreefentsar/remotion-video-toolkit) |
| creative | [remotion](skills/creative/remotion.md) | 用 React 以代码制作视频的框架；适合表格批量、多场景长片与实时换内容的直播。 | [Remotion (Framework)](https://github.com/remotion-dev/remotion) |
| creative | [video-downloader](skills/creative/video-downloader.md) | 下载或打开多平台视频，并生成带时间戳的多模态转写稿。 | [Video Downloader](https://github.com/kangarooking/kangarooking-skills/tree/main/video-downloader) |
| creative | [video-use](skills/creative/video-use.md) | 通过对话剪辑视频：转写、剪切、调色、字幕与叠加动画。 | [Video Use](https://github.com/browser-use/video-use) |
| gamedev | [awesome-gamedev-agent-skills](skills/gamedev/awesome-gamedev-agent-skills.md) | 78 个游戏开发 skill 的合集：学科、类型、引擎与发布流程。 | [Awesome GameDev Agent Skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) |
| gamedev | [threejs-aaa-graphics-builder](skills/gamedev/threejs-aaa-graphics-builder.md) | 把 Three.js 原型画面升级为高级浏览器图形：材质、着色器、VFX、光照与 LOD。 | [Three.js AAA Graphics Builder](https://github.com/majidmanzarpour/threejs-game-skills) |
| gamedev | [threejs-game-director](skills/gamedev/threejs-game-director.md) | Three.js 浏览器游戏的入口，把工作路由到玩法、美术、UI、资产、调试与发布。 | [Three.js Game Director](https://github.com/majidmanzarpour/threejs-game-skills) |
| gamedev | [threejs-game-ui-designer](skills/gamedev/threejs-game-ui-designer.md) | 为 Three.js 浏览器游戏设计 HUD、菜单与覆盖层的布局与状态。 | [Three.js Game UI Designer](https://github.com/majidmanzarpour/threejs-game-skills) |
| gamedev | [threejs-gameplay-systems](skills/gamedev/threejs-gameplay-systems.md) | 搭建和迭代 Three.js 可玩系统：核心循环、关卡、输入、相机、碰撞与手感。 | [Three.js Gameplay Systems](https://github.com/majidmanzarpour/threejs-game-skills) |
| gamedev | [threejs-qa-release](skills/gamedev/threejs-qa-release.md) | Three.js 游戏的 QA、移动端适配、生产构建、静态托管与视觉回归。 | [Three.js QA Release](https://github.com/majidmanzarpour/threejs-game-skills) |
| research | [tavily-entity](skills/research/tavily-entity.md) | 从网上补全公司、人物或组织的 CRM 字段，支持已有 CSV。 | [Tavily Entity](https://github.com/tavily-ai/skills) |
| research | [tavily-list](skills/research/tavily-list.md) | 用 Tavily 生成去重的匹配表，明确「表里是搜索结果而非全集」。 | [Tavily List](https://github.com/tavily-ai/skills) |
| research | [tavily-monitor](skills/research/tavily-monitor.md) | 建立按周期运行的搜索或提取监控，并保存基线用于比较变化。 | [Tavily Monitor](https://github.com/tavily-ai/skills) |
| research | [tavily-research](skills/research/tavily-research.md) | 多来源综合的深度研究报告，输出带引用的报告。 | [Tavily Research](https://github.com/tavily-ai/skills) |
| research | [tavily-search](skills/research/tavily-search.md) | 用 Tavily 做面向 LLM 的网页搜索，并覆盖提取、站点地图与抓取。 | [Tavily Search](https://github.com/tavily-ai/skills) |
| agent | [meerkat-taskpanel](skills/agent/meerkat-taskpanel.md) | 面向 AI Agent 团队的本机任务看板：卡片流转、交付报告、独立审查与 supervisor 调度。 | [Meerkat TaskPanel](https://github.com/tanyu216/meerkat-taskpanel) |

## 场景

场景回答「遇到这类任务，按什么顺序用哪些 skill」，是按用途划分的一级场景；它与上方按 skill 类型划分的分类不是同一套轴。

| 场景 | 目标 | 主要 skill |
| --- | --- | --- |
| [通用场景（文档处理、搜索）](scenarios/general.md) | 交付办公文档，或带引用的调研结论 | pdf · docx · pptx · xlsx · tavily-search · tavily-research |
| [产品原型设计（网页设计）](scenarios/product-prototype.md) | 可评审、可交付实现的页面原型 | brand · design-taste-frontend · ui-ux-pro-max · design-system · finesse-ui · impeccable |
| [WEB开发](scenarios/web-development.md) | 可构建、可测试、可审查合并的 Web 改动 | antfu · to-spec · to-tickets · implement-spec · code-review · vue/nuxt · vite · vitest · playwright-cli |
| [游戏开发](scenarios/game-development.md) | 可玩、可部署的浏览器游戏 | router · threejs-game-director · threejs-gameplay-systems · threejs-qa-release |
| [视频制作](scenarios/video-production.md) | 可交付的成片或竖屏短视频 | hyperframes · remotion · frame-smith · media-use · video-use |
| [数据分析（清洗、统计、可视化）](scenarios/data-analysis.md) | 数据清洗、统计分析、可视化与交付校验 | tavily-search · tavily-research · xlsx · polars · exploratory-data-analysis · statistical-analysis · data-visualization |
| [量化研究（因子、回测、交易流程）](scenarios/quant.md) | 因子研究、策略回测、组合与交易流程 | qlib · alphalens-reloaded · optuna · backtest-expert · manifoldbt-backtester · tradingagents · trading-skills-navigator · vcp-screener |
| [智能体场景（任务看板、工作流）](scenarios/agent-workflow.md) | 智能体协作、任务看板与交接 | setup-meerkat · meerkat · jobs/linus/turing · reviewer · meerkat-chat · handoff |
| [其他/专业场景](scenarios/specialized.md) | meta：skill 创建、安装与优化 | writing-for-agents |

> 场景的 `skills:` 按具体 skill 列出；合集条目（如 `mattpocock-skills`、`awesome-gamedev-agent-skills`）要展开成实际用到的子 skill，不写合集名本身。`grilling` 适用于所有场景。

## 安装

把上游真实 skill 安装到目标 Agent 平台（不是复制本目录的卡片）：

```bash
# 交互向导
npx selected-skills@latest install

# 按场景 / 分类 / 全部
npx selected-skills@latest install --platform claude --scenario video-production
npx selected-skills@latest install --platform claude --category data,quant
npx selected-skills@latest install --platform claude --all --yes

# 源码安装
bash install.sh install --platform claude --scenario general
```

支持平台：`claude`、`codex`、`pi`、`opencode`、`cursor`、`grok`、`gemini`、`openclaw`、`hermes`。安装器会按需 clone 上游仓库、处理依赖与 API key，并支持 `update` / `sync` / `uninstall`。完整说明见 [tools/docs/INSTALL.md](tools/docs/INSTALL.md)。

## 容器化安装验证与 CI/CD

用 Docker 模拟干净机器，验证安装、升级、卸载与 npm 发布包：

```bash
./docker/verify.sh          # 全部离线确定性套件
./docker/verify.sh network  # 真实上游 smoke（需要网络）
./docker/verify.sh unit     # 容器内 npm test
```

离线套件使用容器内 fixture 上游缓存，不依赖网络；CI 在 [.github/workflows/ci.yml](.github/workflows/ci.yml) 中并行运行 8 个套件，推送 `v*` tag 时由 [.github/workflows/release.yml](.github/workflows/release.yml) 校验 tag、发布 npm 并推送 GHCR 验证镜像。设计、套件清单与新增方法见 [docker/README.md](docker/README.md)。

## 收录方式

1. 在 `skills/<分类>/` 下按模板新建文件，文件名用小写 kebab-case。
2. 填写 frontmatter 和五个正文小节。
3. 更新本页索引；把新 skill 补进 `scenarios/` 中它所属的场景（场景集合见 [scenarios/README.md](scenarios/README.md)，不随意新增）。

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE) © 2026 tanyu
