---
name: skill-catalog
description: 把 GitHub 仓库收录进 selected-skills 目录卡片，或更新已收录卡片的来源、许可证、摘要、合集子 skill、安装器映射与计数。用户说“收录这个仓库/链接”“把这个 skill 加进来”“更新一下 xxx 的收录信息”“上游更新了，同步卡片”“补一个 overrides / extra-source”，或者给出一个 GitHub 链接要求整理成目录条目时，必须使用本 skill。它会先把上游浅克隆到 .github-clones 盘点真实 SKILL.md，再按 CONTRIBUTING 的 30 条/5 条、合集、框架与场景规则落盘；不要凭仓库名或 README 摘要直接写卡片。
---

# Skill 收录与更新

这个仓库维护的是**给人读的目录卡片**，不是上游 skill 本体。卡片要被 `tools/scripts/*` 解析成安装规格，所以除了内容准确，还要让来源可解析、场景可选中、计数测试能过。

快速路径：`clone` → `scan` → 按 30/5 规则定形态 → 写卡片 → 补 override / extra-source → README + 场景 → 更新计数 → `npm test` → 汇报。

## 先判断新增还是更新

```bash
rg -n "github.com/<owner>/<repo>|<slug>|<name>" skills README.md tools/installer
```

- 命中已有卡片：走下面的「更新已收录条目」，不要重复建文件。
- 没有命中：走「新增收录」。
- 功能与已有条目重叠：优先更新已有条目，并在「注意点」写清替代关系。

## 新增收录

### 1. 取上游

以下命令在仓库根目录执行；不在根目录时把 `SKILL_DIR` 换成绝对路径。

```bash
SKILL_DIR=.claude/skills/skill-catalog
node "$SKILL_DIR/scripts/upstream.mjs" clone <url|owner/repo>
```

副本落在 `.github-clones/<owner>/<repo>`，默认浅克隆；仓库根的 `.gitignore` 已忽略该目录，脚本在未忽略它的仓库里会回退写入 `.git/info/exclude`。已存在就 `update`。需要历史或旧版本对照时才用 `--full`。`list` 查看现有副本，`remove` 清理；删脏副本会要求 `--force`，先向用户确认。

### 2. 盘点真实内容

```bash
node "$SKILL_DIR/scripts/upstream.mjs" scan <owner/repo>
```

会输出：仓库形态、`SKILL.md` 数量与路径、每个 skill 的 name/description、许可证线索、默认分支、package 信息。需要给脚本用时加 `--json`。

然后必须打开关键的 `SKILL.md` 和 README 读正文，不能只看 scan 摘要。手动搜索副本时路径要显式传入：`rg --hidden -g '!.git/**' -n "关键词" .github-clones/<owner>/<repo>`。重点判断：

- **单 skill**：只有 1 个 `SKILL.md`。
- **合集**：多个 `SKILL.md`。注意区分真正发布的 skill 与 `examples/`、`templates/`、`.agents/` 里的维护用 skill。
- **无 skill**：README 讲的是框架、CLI、库或运行时；如果没有 `SKILL.md` 但 README 明确把仓库本身当作可安装条目，按单条 skill 或框架处理，拿不准先问用户。
- 许可证以仓库里的 LICENSE 文本为准，scan 只是线索。

### 3. 选卡片形态

| 上游形态 | 卡片形态 | 关键动作 |
| --- | --- | --- |
| 1 个 skill | 单条卡片 | `来源 → 地址` 指向该 `SKILL.md` 的 HEAD blob |
| ≥30 个 skill | 一个合集条目 | 只列推荐子 skill 的 `###` 表格；加 `kind: collection` override |
| <30 个 skill | 最多 5 个代表条目 | 其余在「注意点」说明取舍；每个条目各自解析来源 |
| 框架 / CLI / 库 | 一个框架条目 | 「用途」第一句标「框架条目」或「CLI + 内置 skill」；「来源」写安装命令；加 `kind: framework` override |

补充规则：

- 合集条目文件名用来源仓库名；不逐一收录全部子 skill。
- 框架条目只进报告和 `frameworkHints`，不会被安装；场景里出现它时按现有 `quant` 的用法理解，不要当可安装 skill。
- 非合集来源最多 5 个条目。
- 分类只能取自 [CONTRIBUTING.md](../../../CONTRIBUTING.md) 的分类表：`frontend`、`engineering`、`docs`、`data`、`quant`、`creative`、`gamedev`、`research`、`agent`、`meta`。
- slug 用上游名称的小写 kebab-case，必须等于文件名；冲突用 `<source>--<name>`。

### 4. 写卡片

复制 [_templates/skill.md](../../../_templates/skill.md)，保留五个正文小节：`用途`、`适用 / 不适用`、`典型场景`、`注意点`、`来源`。没有内容的小节写「无」。

frontmatter：

```yaml
---
name: 展示名称
category: frontend
source: https://github.com/owner/repo
license: MIT
tags: [tag-one, tag-two]
summary: 一句话说明它解决什么问题。
---
```

- `tags` 2–5 个，全小写 kebab-case。
- `summary` 一句话，不写营销话术。
- 「来源 → 地址」指向仓库最新版本（`HEAD` 或默认分支），**不写 commit、版本号或日期**；用户给 tag/commit URL 时也要归一化到 HEAD。
- 单 skill 的地址必须形如 `https://github.com/<owner>/<repo>/blob/HEAD/<path>/SKILL.md`，安装器才能自动解析。
- 合集条目把子 skill 表放在「用途」的 `###` 小节，不新增顶级小节；推荐等级用 `首选 / 常用 / 通用 / 按需`。
- 许可证无法确认写 `unknown`；源码可见但非 OSI 写 `source-available`，不要冒充 MIT / Apache-2.0。

### 5. 接通安装器

按顺序检查：

1. 单 skill 且「地址」是 `blob/<ref>/.../SKILL.md`：`tools/scripts/sources.js` 自动解析，不需要 override。
2. 否则补 [overrides.json](../../../tools/installer/overrides.json)（key 是卡片 slug）：
   - 单 skill 非标准路径：`{"kind":"skill","repo":"owner/repo","path":"..."}`；根目录 skill 用 `"path":""` 和 `"root":true`。
   - 合集：`{"kind":"collection","repo":"owner/repo","paths":["skills"]}`，`paths` 是仓库内相对路径，安装时递归找含 `SKILL.md` 的目录；根级还有一个 router skill 时可以写多个路径，如 `["router","skills"]`。
   - 框架：`{"kind":"framework","repo":"owner/repo","path":"","reason":"..."}`。
3. 只在场景里引用、没有单独卡片的子 skill：补 [extra-sources.json](../../../tools/installer/extra-sources.json) 的 `{ "repo": "owner/repo", "path": "..." }`。
4. 依赖 CLI、运行时或 API key 时补 [dependencies.json](../../../tools/installer/dependencies.json)：在 `dependencies` 里声明可检测的 `check` / `install` / `keys`，再挂到 `skillRequires` 或 `collectionRequires`；key 挂到 `skillKeyBundles` 或 `collectionKeyBundles`。没有可检测命令就用 `kind:"manual"` + `note`，不要假装能自动安装。只写环境变量名和官方地址，绝不写真实 key。

不要让来源停留在 `unresolved`：`doctor` 和 `--strict-scenarios` 会失败。

### 6. 更新 README 与场景

- [README.md](../../../README.md) 的 Skill 索引表：按现有分类顺序插入一行，链接卡片，来源链接写仓库地址。
- 至少补进一个既有场景的 `skills:` 列表；场景固定 10 个，不新增场景文件。
- 场景按**子 skill 粒度**引用：合集条目不要写合集 slug，写实际会用到的子 skill，并确保每个名字都能解析（有卡片或在 `extra-sources.json` 里）。
- 选择场景看任务用途，不只看分类；对照 [scenarios/README.md](../../../scenarios/README.md) 的 10 个场景。必要时只在正文补一句用途，不动推荐顺序。
- 如果新 skill 改变了场景的主路线，同步 README 的「场景」表；只补一个可选 skill 则不用动表。

### 7. 更新计数

改完卡片/场景/extra source 后运行：

```bash
npm test
```

- [tools/test/scenarios.test.js](../../../tools/test/scenarios.test.js) 里有 `--all` 的 skill/framework 总数和各场景 skill 数。
- [tools/docs/INSTALL.md](../../../tools/docs/INSTALL.md) 里有「当前 N 个」。
- 按测试报出的实际值更新数字，但先确认变化符合预期：合集卡片和框架不会计入 `--all` 的 skill 数；场景里新增一个可解析 skill 才会让该场景 +1；重名去重可能让计数不变。
- 不要为了过测试删断言或改筛选条件。

### 8. 校验

```bash
npm test
node --test tools/test/sources.test.js
node tools/bin/selected-skills.js doctor
node tools/bin/selected-skills.js install --scenario <name> --strict-scenarios --dry-run
./docker/verify.sh offline   # 改了 installer / overrides / extra-sources / scenarios 时
```

`doctor` 检查 unresolved 来源；带 `--strict-scenarios` 的 dry-run 检查场景里每个名字都能选中（`<name>` 是场景 slug，如 `game-development`），但不会写文件。doctor 可能报与本卡片无关的本地缓存路径警告（exit 0），只处理本次改动引入的 unresolved。Docker 不可用时至少跑完 `npm test` 并明确说明 offline 套件没跑。推送前还有 pre-push 门禁；不要主动 commit 或 push，除非用户要求。

## 完成前自检

- [ ] 卡片五节齐全，slug 与文件名一致，分类在 CONTRIBUTING 表内
- [ ] 地址无 commit/版本号，单 skill 指向 `SKILL.md`
- [ ] README 索引已加行，来源链接写仓库地址
- [ ] 至少一个既有场景已更新；合集按子 skill 粒度引用
- [ ] 所有场景引用的名字都能解析，没有 `unresolved`
- [ ] 依赖 / key 已声明（如有），没有把真实 key 写进仓库
- [ ] `npm test` 通过；计数与 INSTALL.md 已按实际结果更新

## 更新已收录条目

1. 用 slug、名称或 source 找到卡片和对应 override。
2. `update` 上游副本（不存在就先 `clone`），再 `scan`：

   ```bash
   node "$SKILL_DIR/scripts/upstream.mjs" update <owner/repo>
   node "$SKILL_DIR/scripts/upstream.mjs" scan <owner/repo>
   ```

3. 与卡片逐项对照：
   - 上游 skill 总数是否变了；卡片里写的数量是否还准确。
   - 新增/删除/改名的子 skill；合集表格与推荐等级是否要调整；非合集是否有新的代表条目值得收录。
   - 上游能力、限制、依赖是否变化，卡片正文与「注意点」是否需要更新。
   - 许可证、默认分支、安装命令、package 名是否变化。
   - 「地址」是否仍指向存在的 `SKILL.md`；override 的 `path` / `paths` 是否仍存在。
   - `extra-sources.json` 的路径、`dependencies.json` 的 require/key 是否仍适用。
   - README 的 summary/来源链接、场景里的名字是否过时。
4. 做最小改动。保持 slug 稳定；上游改名时更新 `name` 并在「注意点」注明改名，不要静默改 slug。
5. 如果上游删除了某个已收录 skill，或形态跨过 30 条阈值（单条 ↔ 合集），先向用户说明影响再动：删除卡片、拆分/合并条目会改变安装结果。
6. 只有新增/删除卡片或 extra source 时才需要改 `--all` 计数；只更新卡片正文不用动。
7. 跑 `npm test`（以及改了安装映射时的 offline 套件），汇报变化。

## 汇报格式

```text
已收录：skills/<category>/<slug>.md（单 skill / 合集 / 框架）
上游：<owner/repo>，<N> 个 SKILL.md，<license>，<branch> @ <short-sha>
来源解析：自动 / overrides.json（kind + paths）/ extra-sources.json（N 个）
依赖：dependencies.json（新增 <dep> / <key>）或无
同步：README 索引；scenarios/<name>.md（新增 <slug>）；计数已更新
校验：npm test 通过；offline 套件通过 / 未运行（原因）
待确认：许可证 unknown、未收录的取舍、形态变化
```

## 常见坑

- 卡片正文的 `- 地址：` 优先于 frontmatter `source`；两处不一致时以正文为准。
- 合集条目的 `paths` 缺失会让来源解析失败；`extra-sources.json` 只被场景选中，`--all` 也会包含它们。
- 仓库根 skill 的 `path` 是空字符串，不是 `"."`。
- `sources.js` 只自动识别 `github.com/<owner>/<repo>/blob/<ref>/.../SKILL.md`；仓库根或 tree URL 不会自动变成 skill。
- 场景里写了合集 slug 或未登记的子 skill，会得到 unresolved 或选不中；必须落到卡片或 extra source。
- README 索引按分类分组，不是全表字母序；插到同分类块里。
- `scan` 的许可证是正则判断，商业/自定义许可要自己读 LICENSE；不确定就写 `unknown` 并告诉用户。
- 上游仓库可能是 monorepo，示例里的 `SKILL.md` 不算发布 skill；数量阈值按真正分发的 skill 算。
