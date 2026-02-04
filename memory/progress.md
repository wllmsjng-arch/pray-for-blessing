# 开发进度

## 实施步骤

| 步骤 | 内容 | 状态 |
|------|------|------|
| Step 1 | 初始化项目 | ✅ 已完成 |
| Step 2 | 数据定义（fuThemes / blessingTexts） | ✅ 已完成 |
| Step 3 | 状态机框架与今日状态检查（useBlessingStore 第一部分） | ✅ 已完成 |
| Step 4 | 随机种子与祝福生成（useBlessingStore 第二部分） | ✅ 已完成 |
| Step 5 | 存储操作（useBlessingStore 第三部分） | ✅ 已完成 |
| Step 6 | 首页视图（index.tsx） | ✅ 已完成 |
| Step 7 | 按钮态组件（ButtonState） | ✅ 已完成 |
| Step 8 | 降临态 — 凝现动画（DescendState 第一部分） | ✅ 已完成 |
| Step 9 | 降临态 — 收纳动画与保存（DescendState 第二部分） | ✅ 已完成 |
| Step 10 | 成功态组件（SuccessState） | ✅ 已完成 |
| Step 11 | 红意信封页面（envelope） | ✅ 已完成 |
| Step 12 | 色彩方案（colors.ts） | ✅ 已完成 |
| Step 13 | 图片资源准备 | 未开始 |
| Step 14 | 图片服务架构预留（imageService） | 未开始 |
| Step 15 | Prompt 模板 | 未开始 |
| Step 16 | 构建与测试 | 未开始 |

---

## 开发日志

### Step 1：初始化项目（2026-02-03）

**完成内容**：

1. 使用 `npx create-expo-app@latest hongyi --template blank-typescript` 创建项目
2. 安装核心依赖：
   - `expo-router@~6.0.23` — 文件系统路由
   - `react-native-reanimated@~4.1.1` — 原生动画引擎
   - `expo-haptics@~15.0.8` — iOS 触觉反馈
   - `expo-linear-gradient@~15.0.8` — 渐变背景
   - `expo-image@~3.0.11` — 高性能图片组件
   - `@react-native-async-storage/async-storage@2.2.0` — 本地键值存储
   - `zustand@^5.0.11` — 全局状态管理（编码前讨论新增，替代纯 React hook，解决跨路由状态共享问题）
   - `react-native-safe-area-context`、`react-native-screens`、`expo-linking`、`expo-constants`、`expo-splash-screen` — expo-router 运行所需
3. 配置工作：
   - `package.json` 入口改为 `"main": "expo-router/entry"`
   - 创建 `babel.config.js`，添加 `react-native-reanimated/plugin`
   - `app.json` 添加 `scheme: "hongyi"`、`ios.bundleIdentifier: "com.hongyi.app"`、启动背景色改为 `#F7F4F0`（宣纸色）
4. 创建目录结构：`app/`、`components/`、`hooks/`、`data/`、`services/`、`constants/`、`assets/fu/`
5. 删除模板文件 `App.tsx`、`index.ts`
6. 文档从根目录迁移至 `memory/` 文件夹

**与 tech.md 的差异**：
- tech.md 写的 Expo SDK 52+，实际安装的是 SDK 54（更新版本，API 兼容）
- 新增 zustand 依赖（tech.md 未写，编码前讨论确认：解决 index.tsx 与 envelope.tsx 跨路由状态共享问题）
- 新增 loading 初始态（tech.md 未写，编码前讨论确认：等待 AsyncStorage 异步读取完成后再切换，避免界面闪烁）
- ViewingState 使用普通 `<Image />` 而非复用 `<FuImage />`（编码前讨论确认）

**备份**：commit `fa323e7`，tag `task1-done`

### Step 2 + Step 12：数据定义 + 色彩方案（2026-02-03）

**完成内容**：

1. 创建 `constants/colors.ts` — 全局色彩方案（12 个值），与 tech.md Step 12 完全一致
2. 创建 `data/blessingTexts.ts` — 20 条祝福句，与产品设计文档 5.2 完全一致
3. 创建 `data/fuThemes.ts` — 10 个符主题 `{ id, name, image }`，image 用 `require()` 指向 `assets/fu/`
4. 创建 `assets/fu/*.png` × 10 — 1×1 透明占位图，防止 Metro bundler 报错，后续替换为 AI 生成的真图
5. 同步更新 `tech.md`（10 处修改）：加入 zustand 依赖、loading 初始态、LCG 参数、GridBackground/Header 组件、ViewingState 用普通 Image 等编码前讨论确认的变更

**备份**：tag `task2-done`

### Step 3 + Step 4 + Step 5：useBlessingStore 完整实现（2026-02-04）

**完成内容**：

Steps 3、4、5 均为同一文件 `hooks/useBlessingStore.ts`，一次性完成。

1. **类型定义**（Step 3）：
   - `HomeState` — 5 态联合类型：`'loading' | 'button' | 'descend' | 'success' | 'viewing'`
   - `Envelope` — 信封记录接口：`{ id, fuId, fuName, blessingText, createdAt }`
   - `CurrentBlessing` — 当前祝福接口：`{ fuTheme: FuTheme, blessingText: string, date: string }`

2. **工具函数**（Step 3 + 4）：
   - `getToday()` — 设备本地时区日期，格式 `YYYY-MM-DD`，全局唯一日期源
   - `createLCG(seed)` — 线性同余生成器，参数 `a=1664525, c=1013904223, m=2^32`

3. **Zustand store**（Step 3）：
   - 状态字段：`homeState`（初始 `'loading'`）、`currentBlessing`、`selectedEnvelope`、`isFromDescend`
   - 模块级 `previousState` 内部变量，不暴露给外部

4. **checkTodayStatus()**（Step 3）：
   - 异步读取 AsyncStorage，按优先级 `blessed_` → `generated_` → 无标记 切换 homeState
   - `generated_` 存在时调用 `generateBlessing()` 还原当日数据

5. **generateBlessing()**（Step 4）：
   - 以 `parseInt(getToday().replace(/-/g,''))` 为种子，LCG 两次取随机 → `fuIndex`（0-9）+ `blessingIndex`（0-19）
   - 设置 `currentBlessing` + `homeState='descend'`
   - Fire-and-forget 写入 `generated_` 标记

6. **saveBlessing()**（Step 5）：
   - 从 `currentBlessing` 构造 `Envelope`，追加到 AsyncStorage `envelopes` 数组（幂等保护）
   - 写入 `blessed_` 标记

7. **loadEnvelopes()**（Step 5）：
   - 读取 AsyncStorage 全部信封，按时间倒序返回

8. **viewEnvelope() / exitViewing()**（Step 3）：
   - 进入回看态记录 `previousState`，退出时恢复

**与 tech.md 的一致性**：完全一致，无差异。所有函数签名、状态字段、存储键格式、LCG 参数均与 tech.md 核心定义速查章节吻合。

**TypeScript 检查**：`npx tsc --noEmit` 通过，无自身类型错误（仅 node_modules 内部类型冲突，属 Expo 项目常见现象）。

### Step 6：首页视图 + 基础组件（2026-02-04）

**完成内容**：

1. **`app/_layout.tsx`** — 根布局：
   - Stack 导航器，`headerShown: false`（全局隐藏原生导航栏）
   - `index` 路由 + `envelope` 路由（`presentation: 'modal'`，iOS 底部弹出卡片式模态）
   - `StatusBar style="dark"`（深色文字状态栏，匹配暖白背景）

2. **`app/index.tsx`** — 首页主视图：
   - `SplashScreen.preventAutoHideAsync()` 模块级调用，启动时保持启动屏
   - `useEffect` 中调用 `checkTodayStatus()`，完成后 `SplashScreen.hideAsync()`（启动屏 → 首页无缝过渡）
   - `homeState === 'loading'` 时仅渲染暖白渐变（与启动屏背景色 `#F7F4F0` 一致，无闪烁）
   - 其余状态渲染：`GridBackground` + `Header` + 状态组件条件切换
   - 状态组件分发：`button → <ButtonState />`、`descend → <DescendState />`、`success → <SuccessState animated={isFromDescend} />`、`viewing → <ViewingState envelope={selectedEnvelope} />`

3. **`components/GridBackground.tsx`** — 宣纸网格纹理：
   - `Dimensions.get('window')` 计算屏幕尺寸，生成垂直 + 水平线条数组
   - 线色 `COLORS.grid`（`rgba(180,170,160,0.06)`），线宽 `StyleSheet.hairlineWidth`，间距 40px
   - `StyleSheet.absoluteFill` + `pointerEvents="none"` 覆盖全屏且不阻挡触摸

4. **`components/Header.tsx`** — 顶部栏：
   - 左侧：产品名「红意」（18px, medium weight）+ 今日日期小字（12px, 温灰色）
   - 右侧：viewing 态显示「返回」（调用 `exitViewing()`），其余态显示「红意信封」（`router.push('/envelope')`）
   - `useSafeAreaInsets()` 适配刘海屏安全区域
   - 使用 Zustand selector `useBlessingStore(s => s.homeState)` 精确订阅

5. **占位组件**（为 index.tsx 编译通过而创建，后续 Task 完整实现）：
   - `components/ButtonState.tsx` — 占位，Task 5 替换
   - `components/DescendState.tsx` — 占位，Task 5 替换
   - `components/SuccessState.tsx` — 占位，Props 接口 `{ animated: boolean }` 已就绪
   - `components/ViewingState.tsx` — 占位，Props 接口 `{ envelope: Envelope }` 已就绪
   - `app/envelope.tsx` — 占位，Task 6 替换

**与 tech.md 的一致性**：

- `_layout.tsx`：与 tech.md Step 11 中 `presentation: 'modal'` 描述一致
- `index.tsx`：与 tech.md Step 6 代码示例结构一致，新增了 `SplashScreen` 管理（tech.md 未提及，属于实现优化，确保启动屏 → 首页无缝过渡）
- `GridBackground.tsx`：线色、间距与 tech.md Step 6 背景设计完全一致
- `Header.tsx`：与 tech.md 中各状态的「右上角入口」描述一致（三态常驻「红意信封」，回看态显示「返回」）
- 占位组件的 Props 接口与 tech.md 核心定义速查中的组件 Props 接口完全匹配

**TypeScript 检查**：`npx tsc --noEmit` 通过，零错误。

### Step 7 + Step 8 + Step 9 + Step 10：按钮态 + 降临态 + 成功态 + FuImage（2026-02-04）

**完成内容**：

Steps 7–10 涉及 4 个组件文件，一次性完成。另新建 FuImage 组件。

1. **`components/FuImage.tsx`**（新建 — 符图片组件）：
   - Props：`{ theme: FuTheme }`
   - 使用 `expo-image` 的 `Image` 组件渲染符图片，`contentFit="contain"`，尺寸 220×220
   - 漂浮动效：`withRepeat(withSequence(withTiming(-3, 2250ms), withTiming(0, 2250ms)), -1, false)`
   - 幅度 ±3px，周期 4.5s（上 2.25s + 下 2.25s），无限循环
   - 挂载即开始漂浮，凝现动画由 DescendState 外层 wrapper 控制

2. **`components/ButtonState.tsx`**（替换占位 — Step 7）：
   - 无 props，内部通过 Zustand selector 获取 `generateBlessing`
   - 居中「请红意」按钮，`TouchableOpacity` 包裹 `LinearGradient`
   - 形态：圆角矩形（`borderRadius: 16`），深红渐变 `#6B2D2D` → `#8B3A3A`
   - 半透明高光覆盖层 `rgba(255,255,255,0.06)`（`StyleSheet.absoluteFillObject`）
   - 极细描边 `rgba(139,58,58,0.25)`（`StyleSheet.hairlineWidth`）
   - 柔和阴影 `rgb(107,45,45)` opacity 0.12，模拟石头自然投影
   - 文字：暖白 `#F2EDE9`，fontSize 18，fontWeight '400'，letterSpacing 4
   - 点击后 `useState` 立即禁用按钮（防重复触发），调用 `generateBlessing()`

3. **`components/DescendState.tsx`**（替换占位 — Steps 8 + 9）：
   - 无 props，内部通过 Zustand selector 获取 `currentBlessing` 和 `saveBlessing`
   - **7 个 Shared Value** 驱动 4 阶段动画序列：
     - Phase 1 凝现（t=0）：`fuOpacity` 0→1 + `fuScale` 0.92→1，1200ms，`Easing.out(quad)`
     - Phase 2 祝福句（t=2000ms）：`textOpacity` 0→1 + `textTranslateY` 8→0，800ms
     - Phase 3 按钮（t=2400ms）：`buttonOpacity` 0→1，600ms
     - Phase 4 收纳化散（用户点击触发）：`containerOpacity` 1→0 + `containerScale` 1→0.85，1000ms，`Easing.in(quad)`
   - 挂载瞬间 `Haptics.impactAsync(ImpactFeedbackStyle.Light)` 轻震动
   - 收纳完成回调 `runOnJS(onCollectionComplete)` 调用 `useBlessingStore.setState({ homeState: 'success', isFromDescend: true })`
   - 「收下祝福」为文字按钮，哑光铜色 `COLORS.accent`，点击后 `useState` 立即禁用
   - `saveBlessing()` 在点击瞬间 fire-and-forget 执行，不等动画

4. **`components/SuccessState.tsx`**（替换占位 — Step 10）：
   - Props：`{ animated: boolean }`
   - `animated=true`（从 descend 转场进入）：
     - 「红意已入封」`Animated.Text` 淡入 600ms
     - +300ms 后「今日已祈福」`Animated.Text` 淡入 600ms
   - `animated=false`（冷启动恢复）：所有 opacity 初始值 1，无动画，即时呈现
   - 「红意已入封」：深红 `COLORS.primary`（`#6B2D2D`），fontSize 22，fontWeight '400'
   - 「今日已祈福」：温灰 `COLORS.textMuted`（`#9E918A`），fontSize 14

**与 tech.md 的一致性**：

- FuImage：漂浮参数（±3px / 4.5s）与 tech.md Step 8 完全一致
- ButtonState：渐变色、圆角、高光、描边、阴影、文字色均与 tech.md Step 7 完全一致
- DescendState：
  - 4 阶段动画时序与 tech.md Steps 8–9 的技术执行时序完全吻合
  - 凝现用 `withTiming`（非 `withSpring`），符合"不弹跳"原则
  - 化散用 `easeIn` 淡出+微缩，符合"原地安静消散"描述
  - `saveBlessing()` 在点击瞬间立即执行，不依赖动画完成
- SuccessState：animated 参数分支、文字色、字号均与 tech.md Step 10 完全一致

**TypeScript 检查**：`npx tsc --noEmit` 通过，零错误。

### Step 11：红意信封页面 + 回看态 + EnvelopeCard（2026-02-04）

**完成内容**：

Step 11 涉及 3 个文件：1 个页面替换占位 + 1 个组件替换占位 + 1 个新建组件。

1. **`app/envelope.tsx`**（替换占位 — 红意信封模态页面）：
   - 使用 `expo-router` 的 `presentation: 'modal'`（在 `_layout.tsx` 中已配置），iOS 底部上滑卡片式模态
   - 顶部栏：左侧「红意信封」标题（18px, medium weight, 深棕黑色）+ 右侧「关闭」按钮（哑光铜色 `COLORS.accent`）
   - `useSafeAreaInsets()` 适配刘海屏安全区域（顶部 + 底部）
   - 使用 Zustand selector 精确订阅 `loadEnvelopes` 和 `viewEnvelope`
   - `useEffect` 挂载时调用 `loadEnvelopes()` 异步加载历史信封，`useState` 存储列表
   - `FlatList` 按时间倒序渲染 `EnvelopeCard`，`keyExtractor` 使用 `envelope.id`（日期字符串唯一）
   - 点击某条信封 → `viewEnvelope(envelope)`（同步更新 Zustand state）→ `router.back()`（关闭模态）→ 首页自动渲染 ViewingState
   - 空态处理：无信封时居中显示「尚无红意信封」温灰色小字
   - 背景：暖白渐变 `COLORS.background`，与首页视觉统一

2. **`components/EnvelopeCard.tsx`**（新建 — 信封列表单条卡片）：
   - Props：`{ envelope: Envelope, onPress: () => void }`，与 tech.md 核心定义速查完全匹配
   - 卡片背景：`LinearGradient` 水平渐变 `COLORS.cardStart`（`#F5EFEB`）→ `COLORS.cardEnd`（`#EEE6E0`），暖白微红色调
   - 左侧：日期 `MM/dd` 格式（保留前导零，如 `02/04`），温灰色 14px，固定宽 50px
   - 右侧：祝福句单行，`numberOfLines={1}` + `ellipsizeMode="clip"`（不显示 "..."，纯裁切）
   - 祝福句右侧覆盖 `LinearGradient` 渐隐遮罩（`transparent` → `COLORS.cardEnd`，宽 40px），文字尾部自然消散
   - 卡片阴影：`shadowColor: rgb(107,45,45)` + `shadowOpacity: 0.06`（柔和极淡阴影，像纸片自然浮起）
   - 圆角 12px，水平外边距 20px，垂直间距 12px（6+6）
   - `TouchableOpacity` 包裹，`activeOpacity: 0.7`

3. **`components/ViewingState.tsx`**（替换占位 — 回看态组件）：
   - Props：`{ envelope: Envelope }`，与 tech.md 核心定义速查完全匹配
   - 通过 `envelope.fuId` 在 `FU_THEMES` 数组中查找对应符主题，获取 `image`
   - 符图片：React Native 原生 `<Image />`（非 `expo-image`，非 `FuImage`），静态展示，无凝现动画，无漂浮动效。尺寸 220×220，`resizeMode="contain"`
   - 祝福句：直接显示（无淡入动画），深红色 `COLORS.blessing`，fontSize 17，letterSpacing 2
   - 日期：页面下方居中，温灰色 `COLORS.textMuted`，fontSize 13，格式 `YYYY/M/D`（不补零，如 `2026/2/4`）
   - 布局：flex 容器使用 `alignSelf: 'stretch'` 撑满父级宽度，内部 `center` 区域 `flex: 1` + `justifyContent: 'center'` 将符+祝福句垂直居中，日期自然落在底部（`marginBottom: 40` 留出安全距离）

**与 tech.md 的一致性**：

- `envelope.tsx`：
  - 模态方式（`presentation: 'modal'`）与 tech.md Step 11 描述完全一致
  - FlatList 倒序、点击关闭模态+切换 viewing 态的交互链路与技术执行时序吻合
  - Zustand selector 精确订阅，与其他组件风格一致
- `EnvelopeCard.tsx`：
  - Props 接口 `{ envelope: Envelope, onPress: () => void }` 与 tech.md 核心定义速查完全匹配
  - 卡片渐变色 `cardStart → cardEnd`、阴影 `cardShadow` 色值均与 tech.md Step 11 + `colors.ts` 完全一致
  - 祝福句渐隐用 `LinearGradient` mask 实现，符合 tech.md「尾部用 LinearGradient mask 渐隐」描述
- `ViewingState.tsx`：
  - 用 RN 原生 `<Image />` 而非 `<FuImage />`，符合 tech.md「ViewingState 使用普通 Image」决策
  - 静态无动画、日期格式 `YYYY/M/D` 均与 tech.md 回看态描述完全一致

**TypeScript 检查**：`npx tsc --noEmit` 通过，零错误。
