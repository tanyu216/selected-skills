# 场景手册

场景回答「遇到这件事，该用哪些 skill、按什么顺序」，而不是「某个 skill 有什么功能」。

场景固定为 10 个一级场景，只有一层，不建子场景：

| 场景 | 文件 | 解决什么 |
| --- | --- | --- |
| 通用场景（文档处理、搜索） | [general.md](general.md) | 办公文档、联网检索与调研 |
| 产品原型设计（网页设计） | [product-prototype.md](product-prototype.md) | 视觉方向、设计系统、可评审原型 |
| 前端开发 | [frontend-development.md](frontend-development.md) | 框架、构建、组件、样式与前端打磨 |
| 开发 | [development.md](development.md) | spec、tickets、实现流程、测试与审查 |
| 游戏开发 | [game-development.md](game-development.md) | 浏览器游戏与游戏引擎路线 |
| 视频制作 | [video-production.md](video-production.md) | 代码生成、剪辑、动效与数学动画 |
| 数据分析（清洗、统计、可视化） | [data-analysis.md](data-analysis.md) | 数据清洗、统计分析、可视化与交付校验 |
| 量化研究（因子、回测、交易流程） | [quant.md](quant.md) | 因子研究、策略回测、组合与交易流程 |
| 智能体场景（任务看板、工作流） | [agent-workflow.md](agent-workflow.md) | 智能体协作、任务看板与交接 |
| 其他/专业场景 | [specialized.md](specialized.md) | skill 创建、安装与优化 |

规则：

- 分类（`skills/<category>/`）回答「skill 是什么」，场景（本目录）回答「任务怎么做」；两者命名相近但不互相替代。
- 同一个 skill 可以出现在多个场景；按该场景是否需要它来决定，不要求唯一归属。
- 场景按子 skill 粒度列出；合集条目（如 `mattpocock-skills`、`awesome-gamedev-agent-skills`）要展开成实际用到的子 skill，不写合集名本身。
- `grilling` 适用于所有场景，用于动手前澄清需求与边界。
- 场景只引用 skill 名称，不复制 skill 正文，也不链接具体 skill 文件。
- 新增 skill 时补进既有场景，不随意新增场景；调整场景集合先改本页与 [README](../README.md) 的场景表。
