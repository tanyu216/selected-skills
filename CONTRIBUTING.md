# Contributing

参与即表示同意按 [MIT 许可证](LICENSE) 授权提交内容。

## 收录标准

- 能定位到上游来源，并能用一句话说清用途。
- 能写出不适用的场景；写不出说明还没理解它。
- 与已收录 skill 功能重复的不重复收录，在条目中注明替代关系。

无法确认的来源或许可证写 `unknown`，不要臆造。源码可见但非 OSI 的许可证写清 `source-available`，不要写成 MIT 或 Apache-2.0。

## 新增 skill

1. 从下方分类中选一个，复制 [_templates/skill.md](_templates/skill.md)。
2. 保存为 `skills/<category>/<slug>.md`。slug 为上游名称的小写 kebab-case；同名冲突用 `<source>--<name>`。
3. 填写 frontmatter：`name`、`category`、`source`、`license`、`tags`、`summary`。
4. 按模板写正文，没有内容的小节写「无」。
5. 在 [README](README.md) 的 Skill 索引中加一行。
6. 确认安装器能解析来源：正文「来源 → 地址」应直接指向上游 `SKILL.md`；否则在 `tools/installer/overrides.json` 补条目。场景引用但未收录的 skill，补进 `tools/installer/extra-sources.json`。

## 分类

| 目录 | 收录内容 |
| --- | --- |
| `frontend` | 前端与 UI |
| `engineering` | 构建、测试、审查、调试、架构 |
| `docs` | 文档与办公（docx / xlsx / pdf） |
| `data` | 数据与可视化 |
| `quant` | 量化研究、交易策略与回测 |
| `creative` | 设计与视频 |
| `gamedev` | 游戏开发（引擎、玩法、资产、发布） |
| `research` | 搜索、抓取与调研 |
| `agent` | 智能体、任务看板与工作流 |
| `meta` | skill 的创建、安装与优化 |

## 合集与代表条目

- 单一来源有 30 个及以上 skill 时，只建一个合集条目，文件名用来源仓库名；正文在「用途」下用分组表格列出推荐使用的子 skill 并标推荐等级，不逐一收录全部子 skill，未收录的在「注意点」说明取舍。
- 单一来源少于 30 个 skill 时，最多收录 5 个代表条目；未收录的子 skill 在「注意点」里说明取舍。
- 框架、CLI、运行时不是 skill：仍按一个条目记录，在「用途」第一句标注「框架条目」或「CLI + 内置 skill」，并在「来源」记录安装命令。
- 合集条目同样只保留五个正文小节；子 skill 表放在「用途」的 `###` 小节里，不新增顶级小节。

## 场景手册

场景固定为 10 个一级场景，不建子场景：通用场景（文档处理、搜索）、产品原型设计（网页设计）、前端开发、开发、游戏开发、视频制作、数据分析（清洗、统计、可视化）、量化研究（因子、回测、交易流程）、智能体场景（任务看板、工作流）、其他/专业场景（meta）。

- 同一个 skill 可以出现在多个场景的 `skills:` 里，按该场景的实际需要决定，不要求唯一归属。
- 场景按子 skill 粒度列出；合集条目（如 `mattpocock-skills`、`awesome-gamedev-agent-skills`）要展开成实际用到的子 skill，不写合集名本身。
- `grilling` 适用于所有场景，用于动手前澄清需求与边界。
- 新增 skill 时补进既有场景，不新增场景文件；调整场景集合先改 [scenarios/README.md](scenarios/README.md) 与 [README](README.md) 的场景表。
- 场景只引用 skill 名称，不复制 skill 正文，也不链接具体 skill 文件。

## 约定

- 正文用中文，slug 和标签用英文。
- 标签 2–5 个，全小写 kebab-case。
- `summary` 只写一句话，不写营销话术。
- 「来源」只指向仓库的最新版本（`HEAD` 或默认分支），不记录 commit、版本号或发布日期；上游更新时无需维护。

## 自检

提交前运行 `npm test`；改动安装器、`install.sh` 或发布配置时，再运行 `./docker/verify.sh`（离线确定性套件）。

### pre-push 门禁

仓库带一个 pre-push 钩子：推送前自动在容器里跑 `docker/verify.sh offline` 与 `unit`，任一失败即阻止 push。

```bash
npm run setup:hooks    # 每个 clone 执行一次（git config core.hooksPath .githooks）
```

- 工作区干净且该提交的 tree 已通过验证时，钩子会命中缓存直接放行；需要强制重跑：`rm .git/selected-skills-verify/pre-push.stamp`
- 删除分支/标签不触发验证
- `git push --no-verify` 可绕过，仅用于确认风险的紧急情况

- [ ] 文件名与 slug 一致，未与已有文件重名
- [ ] 分类在 CONTRIBUTING 的分类表之内
- [ ] 五个正文小节齐全
- [ ] 未编造来源或许可证
- [ ] 来源指向最新版本，URL 与正文不含 commit 哈希或版本号
- [ ] 合集条目列出了全部子 skill，数量与上游一致
- [ ] 非合集来源不超过 5 个条目
- [ ] CLI / 框架条目记录了类型与安装命令
- [ ] 许可证未把 `source-available` 或自定义许可写成 MIT / Apache-2.0
- [ ] README 索引已更新
- [ ] 新 skill 已补进至少一个场景的 `skills:` 列表（场景集合见 [scenarios/README.md](scenarios/README.md)）
