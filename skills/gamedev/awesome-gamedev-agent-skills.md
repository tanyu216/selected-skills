---
name: Awesome GameDev Agent Skills
category: gamedev
source: https://github.com/gamedev-skills/awesome-gamedev-agent-skills
license: Apache-2.0
tags: [gamedev, collection, engines]
summary: 78 个游戏开发 skill 的合集：学科、类型、引擎与发布流程。
---

# Awesome GameDev Agent Skills

## 用途

按「先路由、再专项」组织的游戏开发 skill 合集，共 78 个：1 个 router + 77 个专项，覆盖学科（15）、游戏类型（9）、Godot（16）、其他引擎（12）、Ebitengine（1）、Unity（8）、Unreal（6）、Web 引擎（6）与发布流程（4）。

推荐标记：`首选` = 第一次使用先读或先跑；`常用` = 高频；`—` = 特定场景。

### router（1）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `router` | 识别引擎与任务，把请求路由到正确的专项 skill。 | 首选 |

### disciplines（15）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `game-feel` | 震屏、顿帧、缓动、挤压拉伸与分层反馈等手感技巧。 | 常用 |
| `level-design` | 白盒到可玩关卡、玩家度量、节奏与遭遇设计。 | 常用 |
| `game-ui-ux` | HUD、菜单与覆盖层的响应式布局、安全区与手柄焦点。 | 常用 |
| `performance-optimization` | 先测量再定位 CPU/GPU 瓶颈，并用池化、合批等手段修复。 | 常用 |
| `ai-behavior-trees-utility-ai` | 行为树运行时（黑板、组合节点、装饰器）与 Utility AI 响应曲线。 | — |
| `audio-design` | 总线与分贝、ducking、自适应音乐、音效变化与节拍同步。 | — |
| `camera-systems` | 2D 跟随死区、3D 第三人称/第一人称相机、多目标取景与震屏。 | — |
| `create-game-assets` | 规划、生成、筛选、规范化与校验统一的视觉资产。 | — |
| `dialogue-systems` | 分支对话节点图、条件与变量、本地化钩子，Ink/Yarn 选型。 | — |
| `game-ai` | 有限状态机、行为树、转向行为与 A* 寻路。 | — |
| `input-systems` | 动作映射、重绑定与冲突检测、多设备、摇杆死区。 | — |
| `physics-tuning` | 固定/可变步长、渲染插值、CCD 防穿透、抖动与碰撞层。 | — |
| `procedural-gen` | 种子随机、噪声地形、地牢生成与波函数坍缩。 | — |
| `save-systems` | 序列化范围、存档槽、原子写入、schema 版本与迁移。 | — |
| `shader-programming` | 顶点→片元管线、坐标空间、UV 数学与常见 2D/3D 效果。 | — |

### genres（9）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `card-game` | 卡牌数据、牌库/手牌/弃牌区、回合结构与效果结算。 | — |
| `fps-shooter` | 移动与视角控制、hitscan 或弹道射击、武器、生命与敌人 AI。 | — |
| `platformer` | 跑跳控制、coyote time、跳跃缓冲、可变跳高与墙跳墙滑。 | — |
| `puzzle` | 棋盘状态、输入、规则结算、计分与撤销。 | — |
| `roguelike` | 回合制网格移动、程序地牢、永久死亡、视野与掉落表。 | — |
| `rpg` | 属性与升级、背包装备、任务、分支对话、存读档与战斗。 | — |
| `survival-crafting` | 资源采集、背包、合成科技树、生存需求与基地建造。 | — |
| `tower-defense` | 敌人路径行进、波次生成、炮塔索敌、经济与生命。 | — |
| `visual-novel` | 分支脚本、角色背景、选项文本框、存读档与跳过/自动。 | — |

### godot（16）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `godot-nodes-scenes` | 场景树与节点组合、运行时实例化 PackedScene、autoload。 | 常用 |
| `godot-gdscript` | 静态类型、节点生命周期、@export/@onready、信号与 await。 | 常用 |
| `godot-2d-movement` | CharacterBody2D + move_and_slide 的平台/俯视角移动与斜坡。 | — |
| `godot-3d-essentials` | Node3D、Camera3D、光照、WorldEnvironment 与 GridMap。 | — |
| `godot-animation` | AnimationPlayer 关键帧、AnimationTree 状态机与 Tween。 | — |
| `godot-audio` | AudioStreamPlayer、音频总线、音乐/音效路由与节拍同步。 | — |
| `godot-csharp` | Godot 4.7 的 C#/.NET：partial 类、生命周期、导出字段与信号。 | — |
| `godot-export` | 导出模板、平台预设与 headless CI 导出、Web 的 COOP/COEP。 | — |
| `godot-gdscript-headless-testing` | 用 `godot --headless` 跑 GDScript 测试并以非零码退出。 | — |
| `godot-multiplayer` | ENetMultiplayerPeer、@rpc、节点权威与状态同步。 | — |
| `godot-physics` | RigidBody/StaticBody/Area/CharacterBody、碰撞层与射线。 | — |
| `godot-resources` | 自定义 Resource、.tres/.res 存档、实例化与按需加载。 | — |
| `godot-shaders` | canvas_item / spatial shader、uniform、TIME 与屏幕纹理。 | — |
| `godot-signals-groups` | 自定义信号、Callable 连接与 group 广播解耦。 | — |
| `godot-tilemap` | TileMapLayer/TileSet、碰撞/导航数据、地形自动拼接。 | — |
| `godot-ui-control` | Control 锚点、Container、Theme 与键盘/手柄焦点。 | — |

### other-engines（12）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `bevy-ecs` | Bevy 的 App/Plugin、Component/Resource、Query 与系统排序。 | 常用 |
| `defold-core` | Defold 的 game.project、collection、Lua 生命周期与消息传递。 | 常用 |
| `love2d-core` | LÖVE 的 load/update/draw、delta 移动、输入与屏幕状态。 | 常用 |
| `pygame-core` | pygame 的 init/event/update/draw、Surface/Rect 与 Sprite/Group。 | 常用 |
| `roblox-luau` | Luau 实例操作、服务端/客户端脚本与 RemoteEvent 通信。 | 常用 |
| `roblox-characters` | 角色重生、Humanoid、R6/R15、动画与工具持有。 | — |
| `roblox-datastores` | DataStoreService 读写、pcall 重试、BindToClose 与有序存储。 | — |
| `roblox-networking` | RemoteEvent/Function、服务端权威、参数校验与限流。 | — |
| `roblox-physics` | 装配体、约束、碰撞组、射线/重叠查询与力/冲量。 | — |
| `roblox-simulator-economy` | 模拟器/放置游戏的经济、升级曲线、转生与离线收益。 | — |
| `roblox-studio-workflow` | 在既有 Studio 工程里安全增改、复用模块与 Attribute。 | — |
| `roblox-ui` | ScreenGui/PlayerGui、UDim2 响应式布局、安全区与多端输入。 | — |

### ebitengine（1）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `ebitengine-game` | 用 Go + Ebitengine 做 2D 游戏：循环、输入、渲染与打包。 | 常用 |

### unity（8）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `unity-csharp-scripting` | MonoBehaviour 生命周期、组件访问、协程与 Inspector 序列化。 | 常用 |
| `unity-animation` | Animator Controller 状态、参数、混合树、层与人形 IK。 | — |
| `unity-build-pipeline` | 构建设置、IL2CPP/Mono、代码剥离与 scripted/CI 构建。 | — |
| `unity-input-system` | Input Actions、Action Map、PlayerInput 与回调/轮询。 | — |
| `unity-navmesh` | 烘焙 NavMesh、NavMeshAgent 寻路与动态障碍。 | — |
| `unity-physics` | Rigidbody、碰撞体、触发器、层碰撞、射线与关节。 | — |
| `unity-scriptableobjects` | 用 ScriptableObject 做配置、共享变量、事件通道与注册表。 | — |
| `unity-tilemap-2d` | Grid/Tilemap、Tile Palette、Tilemap Collider 与运行时绘制。 | — |

### unreal（6）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `unreal-blueprints` | 蓝图类、事件图、构造脚本、变量/函数/宏与蓝图通信。 | 常用 |
| `unreal-behavior-trees` | 行为树与黑板：组合节点、Task、Decorator、Service 与 AIController。 | — |
| `unreal-cpp-gameplay` | UCLASS/UPROPERTY/UFUNCTION 与 Gameplay 框架、模块 Build.cs。 | — |
| `unreal-enhanced-input` | Input Action、Mapping Context、修饰器与触发器绑定。 | — |
| `unreal-niagara` | Niagara 系统/发射器、模块、User 参数与蓝图/C++ 驱动。 | — |
| `unreal-packaging` | 打包流程、Development/Shipping、cook、打包设置与命令行。 | — |

### web-engines（6）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `threejs-scene-setup` | Scene/Camera/Renderer、setAnimationLoop、响应式与 OrbitControls。 | 常用 |
| `phaser-core` | Phaser 4 的 Game 配置、Scene 生命周期、加载器与相机。 | 常用 |
| `phaser-arcade-physics` | Arcade 物理世界、速度/加速度/重力、碰撞与组。 | — |
| `pixijs-rendering` | PixiJS v8 Application、Assets、Container/Sprite 与 ticker。 | — |
| `threejs-gltf-loading` | GLTFLoader、AnimationMixer、DRACO/Meshopt 与 KTX2。 | — |
| `threejs-materials-lighting` | 材质选择、各类光源、阴影与环境贴图。 | — |

### workflows（4）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `prototype-fast` | 约一小时做出可玩原型，用灰盒与硬时间盒回答「好玩吗」。 | 首选 |
| `game-jam` | 限时 game jam 的范围锁定、排期、砍功能与按时提交。 | 常用 |
| `itch-publish` | itch.io 项目页与 butler push 的频道发布。 | 常用 |
| `steam-publish` | Steamworks/SteamPipe 的 depot、包配置、steamcmd 与发布清单。 | — |

## 适用 / 不适用

- **适用**：需要按引擎落地具体实现；需要跨引擎的学科知识（手感、关卡、性能、存档）；从原型到 itch / Steam 发布。
- **不适用**：想要一条端到端、产品化的浏览器游戏流水线（本合集按引擎与学科拆分）；需要外部资产生成 API（用 `create-game-assets` 的流程，再接生成服务）。

## 典型场景

- **触发语句**：「用 Godot 做个平台跳跃」「Unity 的 NavMesh 怎么配」「这个 3D 场景怎么优化」。
- **要点**：永远先过 `router`；引擎名与子 skill 名是字面匹配，不要凭名字猜用途。

## 注意点

- `router` 不是可选项；它同时识别引擎与任务类型。
- 安装会一次性放入全部 78 个 skill，没有逐个安装的命令。
- 引擎专项 skill 的版本号写死在内容里（如 Godot 4.7、Unity 6.3 LTS），跨版本使用前先核对。

## 来源

- 地址：https://github.com/gamedev-skills/awesome-gamedev-agent-skills
- 许可证：Apache-2.0
- 安装：`npx skills add gamedev-skills/awesome-gamedev-agent-skills`
