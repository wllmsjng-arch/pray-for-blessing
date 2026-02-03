# 「红意」iOS APP 实现计划（React Native + Expo）

## 技术选型

- **框架**: React Native + Expo SDK 52+
- **语言**: TypeScript
- **开发环境**: Windows + VS Code（无需 Mac）
- **iOS 构建**: Expo EAS Build（云端编译，无需本地 Xcode）
- **上架**: EAS Submit（需注册 Apple Developer 账号 $99/年）

**为什么选 Expo**:
1. Windows 上即可开发，Expo Go APP 可在手机上实时预览
2. TypeScript/React 是 AI 辅助编码效果最好的语言/框架
3. EAS Build 云端编译 iOS 包，完全不需要 Mac
4. 内置 expo-haptics（震动）、expo-linear-gradient（渐变）等模块
5. 社区生态成熟，文档丰富

**需要准备的**:
- Windows 电脑（已有）
- iPhone 手机（安装 Expo Go 用于开发预览）
- Node.js 环境
- Apple Developer 账号（上架 App Store 前注册，$99/年 ≈ ¥688）

---

## 核心依赖

| 需求 | 包名 | 说明 |
|------|------|------|
| 导航 | expo-router | 文件系统路由，Expo 内置 |
| 动画 | react-native-reanimated | 高性能原生动画引擎 |
| 震动 | expo-haptics | iOS 触觉反馈 |
| 渐变 | expo-linear-gradient | 背景/卡片渐变色 |
| 本地存储 | @react-native-async-storage/async-storage | 键值对存储（每日标记+信封数据） |
| 图片 | expo-image | 高性能图片组件（支持 PNG 透明） |

全部为 Expo 生态内的成熟库，通过 `npx expo install` 一键安装。

---

## 项目文件结构

```
hongyi/
├── app/                          # expo-router 页面目录
│   ├── _layout.tsx               # 根布局（全局背景色、字体加载）
│   ├── index.tsx                 # 首页（3 个状态切换）
│   └── envelope.tsx              # 红意信封页面
├── components/
│   ├── ButtonState.tsx           # 按钮态：「请红意」
│   ├── DescendState.tsx          # 降临态：符+祝福句+「收下祝福」
│   ├── SuccessState.tsx          # 成功态：「红意已入封」
│   ├── ViewingState.tsx          # 回看态：历史信封查看
│   ├── EnvelopeCard.tsx          # 信封列表单条卡片
│   └── FuImage.tsx               # 符图片组件（漂浮动效封装）
├── hooks/
│   └── useBlessingStore.ts       # 核心状态管理 hook（状态机+存储+随机）
├── data/
│   ├── fuThemes.ts               # 10 个符主题定义
│   ├── blessingTexts.ts          # 20 条祝福句
│   └── promptTemplates.ts        # Prompt 模板（图片生成规范，后续阶段用）
├── services/
│   └── imageService.ts           # 图片服务（本地加载 + API 预留）
├── constants/
│   └── colors.ts                 # 色彩方案常量
├── assets/
│   └── fu/                       # 10 张预生成符图片 (PNG 透明背景)
│       ├── chijinjie.png
│       ├── zhushayin.png
│       ├── hongyuhuan.png
│       ├── hongyanxin.png
│       ├── bixieling.png
│       ├── jinboyu.png
│       ├── chiyaoshi.png
│       ├── jiangyuntuan.png
│       ├── chiwenshi.png
│       └── hongmanao.png
├── app.json                      # Expo 配置
├── package.json
└── tsconfig.json
```

---

## 用户交互流程

### 状态机

首页有 4 个视图状态，同页切换，不跳转路由：

```
button（按钮态）→ descend（降临态）→ success（成功态）
                                        ↕
                               viewing（回看态）← 任意态均可进入
```

**状态转换触发条件**:
- `button → descend`：用户点击「请红意」
- `descend → success`：用户点击「收下祝福」
- `任意态 → viewing`：用户在信封列表中点击某条历史记录
- `viewing → 原状态`：用户点击右上角「返回」，恢复进入 viewing 前的 homeState
- APP 启动时：按优先级读取 AsyncStorage 判断今日状态：
  1. 存在 `blessed_YYYY-MM-DD` → 直接进入 `success`
  2. 存在 `generated_YYYY-MM-DD` → 直接进入 `descend`（调用 `generateBlessing()` 还原当日结果，跳过按钮）
  3. 都不存在 → 进入 `button`
  - 跨日自动重置：标记均以当日日期为 key，新的一天无匹配标记，自动回到 `button` 态。

### 按钮态（button）

| 元素 | 位置 | 说明 |
|------|------|------|
| 产品名 + 今日日期 | 顶部 | 小字 |
| 「请红意」按钮 | 居中 | 唯一主操作 |
| 「红意信封」入口 | 右上角 | 进入信封页 |

用户点击「请红意」→ 点击后**立即禁用按钮**（防止动画/写入完成前的重复触发）→ 调用 `generateBlessing()`：以当日日期字符串为种子，确定性选取 1 个符主题 + 1 条祝福句（同一天无论点多少次，结果相同）→ 写入 `generated_YYYY-MM-DD` 标记（确保中途退出后下次启动可直接恢复降临态）→ 切换到 `descend`

### 降临态（descend）

| 元素 | 位置 | 说明 |
|------|------|------|
| 符（大） | 居中 | 凝现动画 + 漂浮循环 |
| 祝福句 | 符下方 | 延迟淡入，单行短句 |
| 「收下祝福」按钮 | 下方 | 延迟显现 |
| 「红意信封」入口 | 右上角 | 进入信封页（三态常驻） |

用户点击「收下祝福」→ 点击后**立即禁用按钮** → 立即执行 `saveBlessing()`：将 `{ fuId, blessingText, date }` 追加到 AsyncStorage 信封数组 + 写入 `blessed_YYYY-MM-DD` 标记（此标记决定下次启动时直接进入 success 态）→ 同时播放收纳动画 → 动画结束切换到 `success`

### 成功态（success）

| 元素 | 位置 | 说明 |
|------|------|------|
| 「红意已入封」 | 居中标题 | 深红色 |
| 「今日已祈福」 | 居中副文 | 温灰色小字 |
| 「红意信封」入口 | 右上角 | 进入信封页 |

无主操作按钮，页面安静留白。当日内重新打开 APP 仍显示此状态。

### 回看态（viewing）

| 元素 | 位置 | 说明 |
|------|------|------|
| 符图片 | 居中 | 静态展示，无凝现动画，无漂浮 |
| 祝福句 | 符下方 | 直接显示，无淡入 |
| 日期 | 底部居中 | 温灰色小字，格式 `YYYY/M/D` |
| 「返回」按钮 | 右上角 | 点击回到进入前的 homeState |

纯查看模式，不含「收下祝福」按钮，不改变任何存储数据。hook 内用 `previousState` 变量记录进入 viewing 前的 homeState，用于返回。

### 红意信封页

- 「红意信封」入口固定位于首页右上角，**三态常驻**（button / descend / success 下均可见且可点击）
- 点击后从底部弹出模态页面（下拉列表形式）
- FlatList 按时间倒序展示历史记录
- 用户随时可打开信封列表，随时可点击某封信封在主界面进行切换查看
- 点击某条信封 → 关闭模态 → 首页展示该信封的符 + 祝福句 + 底部日期小字

### 边界情况

| 场景 | 行为 |
|------|------|
| 当日已祈福，重新打开 APP | 直接进入 success 态 |
| 降临态未收下祝福，退出 APP 后重新打开 | 直接进入 descend 态（读取 `generated_` 标记 + 确定性还原当日符与祝福句），无需重新走按钮流程 |
| 跨日后打开 APP | 回到 button 态（新的一天，旧日标记不匹配） |
| 同一天多次点击「请红意」 | 不会发生——已生成后 button 态不再出现（`generated_` 或 `blessed_` 标记确保直接进入 descend 或 success 态） |
| 信封页点击历史记录 | 进入 viewing 态，首页展示对应符 + 祝福句 + 底部日期（仅查看，不改变祈福状态），点击「返回」恢复原状态 |

---

## 技术执行时序

按场景拆解从 APP 入口到最终状态的完整技术调用链。每一步标注：函数/组件 → 存储操作 → 状态变更 → UI/动画触发。

### 场景 1：冷启动（首次使用 / 跨日打开）

1. APP 启动 → `app/index.tsx` 挂载 → 调用 `useBlessingStore()` hook
2. hook 内 `useEffect` 触发 `checkTodayStatus()`
3. `checkTodayStatus()`:
   - 读取 `AsyncStorage["blessed_YYYY-MM-DD"]` → **不存在**
   - 读取 `AsyncStorage["generated_YYYY-MM-DD"]` → **不存在**
   - 设置 `homeState = 'button'`
4. `index.tsx` 根据 `homeState === 'button'` 渲染 `<ButtonState />`
5. 页面呈现：顶部产品名+日期 | 居中「请红意」按钮 | 右上角「红意信封」入口
6. **等待用户操作**

### 场景 2：完整祈福流程（button → descend → success）

**阶段 A：生成祝福（button → descend）**

1. 用户点击「请红意」按钮
2. 调用 `generateBlessing()`：
   - 取当日日期字符串 `"20260203"` → 转为数字 `20260203`
   - 以此为种子初始化线性同余生成器（LCG）
   - 第 1 次随机 → `fuIndex`（0-9）→ 从 `FU_THEMES[]` 选取符主题
   - 第 2 次随机 → `blessingIndex`（0-19）→ 从 `BLESSING_TEXTS[]` 选取祝福句
   - 返回 `{ fuId, fuName, blessingText, date }`
3. 写入 `AsyncStorage.setItem("generated_YYYY-MM-DD", "true")` — 标记已生成
4. 设置 `homeState = 'descend'`
5. `<ButtonState />` 卸载，`<DescendState />` 挂载

**阶段 B：降临动画序列**

6. `DescendState` 挂载瞬间 → `Haptics.impactAsync(ImpactFeedbackStyle.Light)` 触发轻震动
7. 符图片凝现动画启动（`react-native-reanimated`）：
   - `withTiming`: opacity 0→1, scale 0.92→1 | 时长 1200ms | easing: easeOut
8. 符落定后 → 启动漂浮循环：`withRepeat(withSequence(withTiming(-3), withTiming(0)))` | 幅度 ±3px | 周期 4.5s
9. **+800ms** → 祝福句淡入：opacity 0→1 + translateY 8→0 | 时长 800ms
10. **+400ms** → 「收下祝福」按钮显现：opacity 0→1 | 时长 600ms | 无位移
11. **等待用户操作**

**阶段 C：收纳保存（descend → success）**

12. 用户点击「收下祝福」按钮
13. **立即**调用 `saveBlessing()`（数据落盘不等动画）：
    - 读取 `AsyncStorage["envelopes"]` → 解析 JSON 数组
    - 构造新记录 `{ id: getToday(), fuId, fuName, blessingText, createdAt: getToday() }`
    - 追加前检查数组中是否已存在相同 `id`，若存在则跳过（幂等保护）
    - 追加到数组 → `AsyncStorage.setItem("envelopes", JSON.stringify(updated))`
    - `AsyncStorage.setItem("blessed_YYYY-MM-DD", "true")` — 标记已收下
14. **同时**启动收纳动画（"化散"风格）：
    - 符+祝福句容器：`withTiming` opacity 1→0, scale 1→0.85 | 时长 1000ms | easing: easeIn
15. 动画完成 → `runOnJS` 回调 → 设置 `homeState = 'success'`
16. `<DescendState />` 卸载，`<SuccessState animated={true} />` 挂载
17. 「红意已入封」标题：`withTiming` 纯淡入 | 时长 600ms
18. **+300ms** → 「今日已祈福」副文淡入
19. **流程结束**，页面安静留白

### 场景 3：中断恢复（降临态退出后重新打开）

1. APP 启动 → `useBlessingStore()` → `checkTodayStatus()`
2. `checkTodayStatus()`:
   - 读取 `AsyncStorage["blessed_YYYY-MM-DD"]` → **不存在**
   - 读取 `AsyncStorage["generated_YYYY-MM-DD"]` → **存在**
   - 调用 `generateBlessing()` → 确定性还原当日结果（种子相同，结果相同）
   - 设置 `homeState = 'descend'`
3. 渲染 `<DescendState />` → **从场景 2 阶段 B 第 6 步开始**，完整播放凝现动画序列
4. 用户点击「收下祝福」→ 接续场景 2 阶段 C

> 注：中断恢复后用户看到的符和祝福句与中断前完全一致（确定性生成保证），体验连贯无割裂。

### 场景 4：祈福后重新打开（当日内）

1. APP 启动 → `useBlessingStore()` → `checkTodayStatus()`
2. 读取 `AsyncStorage["blessed_YYYY-MM-DD"]` → **存在**
3. 设置 `homeState = 'success'` → 渲染 `<SuccessState animated={false} />`
4. 所有元素 opacity 直接为 1，即时呈现，无淡入动画，安静留白

---

## 核心定义速查

编码前统一约定所有函数签名、组件接口、状态变量和数据流向，避免在实现步骤中反复查找。

### 工具函数

| 函数 | 归属文件 | 签名 | 说明 |
|------|---------|------|------|
| `getToday()` | `hooks/useBlessingStore.ts` | `() → string` | 返回设备本地时区的当日日期，格式 `"YYYY-MM-DD"`。全局唯一日期源，存储键和随机种子均从此派生 |

### 核心业务函数

| 函数 | 归属文件 | 签名 | 说明 |
|------|---------|------|------|
| `checkTodayStatus()` | `hooks/useBlessingStore.ts` | `() → void` | 启动时调用。按优先级检查 `blessed_` → `generated_` → 无标记，设置 `homeState` 并在 descend 情况下调用 `generateBlessing()` 还原数据 |
| `generateBlessing()` | `hooks/useBlessingStore.ts` | `() → void` | 以 `getToday()` 为种子，确定性选取 `FU_THEMES[fuIndex]` + `BLESSING_TEXTS[blessingIndex]`，将结果写入 `currentBlessing` 状态 |
| `saveBlessing()` | `hooks/useBlessingStore.ts` | `() → Promise<void>` | 将 `currentBlessing` 持久化到 AsyncStorage envelopes 数组（幂等），并写入 `blessed_` 标记 |
| `loadEnvelopes()` | `hooks/useBlessingStore.ts` | `() → Promise<Envelope[]>` | 读取 AsyncStorage 中全部历史信封记录，按时间倒序返回 |

### Hook 导出接口

`useBlessingStore()` 返回以下状态和方法，供 `index.tsx` 及子组件使用：

```ts
{
  // 状态
  homeState: HomeState,                    // 当前视图状态
  currentBlessing: {                       // 当前生成的祝福（descend 态数据源）
    fuTheme: FuTheme,                      //   选中的符主题（含 id, name, image）
    blessingText: string,                  //   选中的祝福句
    date: string                           //   日期 "YYYY-MM-DD"
  } | null,
  selectedEnvelope: Envelope | null,       // 回看态选中的历史信封
  isFromDescend: boolean,                  // SuccessState 动画开关（true=转场淡入，false=静态）

  // 方法
  generateBlessing: () => void,            // 生成当日祝福 → 写入 currentBlessing
  saveBlessing: () => Promise<void>,       // 持久化 currentBlessing
  loadEnvelopes: () => Promise<Envelope[]>,// 加载历史信封
  viewEnvelope: (envelope: Envelope) => void,  // 进入回看态
  exitViewing: () => void,                 // 退出回看态，恢复 previousState
}
```

### 组件 Props 接口

| 组件 | Props | 说明 |
|------|-------|------|
| `<ButtonState />` | 无 props | 内部通过 `useBlessingStore()` 获取 `generateBlessing` 方法 |
| `<DescendState />` | 无 props | 内部通过 `useBlessingStore()` 获取 `currentBlessing`、`saveBlessing` |
| `<SuccessState />` | `animated: boolean` | `true`=从 descend 转场进入播放淡入；`false`=冷启动直接呈现 |
| `<ViewingState />` | `envelope: Envelope` | 接收选中的历史信封数据，静态展示符+祝福句+日期 |
| `<EnvelopeCard />` | `envelope: Envelope, onPress: () => void` | 信封列表单条卡片，点击回调 |
| `<FuImage />` | `theme: FuTheme` | 根据 `theme.image` 渲染符图片，封装漂浮动效 |

### 数据流向（种子 → 渲染）

生成到渲染的完整数据链路：

```
用户点击「请红意」
  ↓
generateBlessing()
  ├── getToday() → "2026-02-03"
  ├── parseInt("20260203") → 种子
  ├── LCG(种子) → fuIndex=3, blessingIndex=7
  ├── FU_THEMES[3] → { id:"hongyanxin", name:"红焰芯", image:require(...) }
  ├── BLESSING_TEXTS[7] → "红意相护，平安喜乐"
  └── 写入 currentBlessing = { fuTheme, blessingText, date }
  ↓
homeState 切为 'descend'
  ↓
<DescendState /> 挂载
  ├── 从 useBlessingStore() 读取 currentBlessing
  ├── <FuImage theme={currentBlessing.fuTheme} />  → 渲染符图片 + 漂浮动效
  └── <Text>{currentBlessing.blessingText}</Text>   → 渲染祝福句
```

### 类型定义

```ts
type HomeState = 'button' | 'descend' | 'success' | 'viewing';

interface FuTheme {
  id: string;          // "chijinjie"
  name: string;        // "赤金结"
  image: ImageSource;  // require('../assets/fu/chijinjie.png')
}

interface Envelope {
  id: string;          // = createdAt，日期字符串即唯一标识
  fuId: string;        // 符主题 id
  fuName: string;      // 符主题中文名
  blessingText: string;// 祝福句
  createdAt: string;   // "YYYY-MM-DD"
}
```

---

## 实现步骤

### Step 1: 初始化项目

在当前目录 `pray-for-blessing/` 下创建 Expo 项目：

```bash
npx create-expo-app@latest hongyi --template blank-typescript
cd hongyi
npx expo install react-native-reanimated expo-haptics expo-linear-gradient expo-image @react-native-async-storage/async-storage expo-router
```

配置 `babel.config.js` 添加 `react-native-reanimated/plugin`。

### Step 2: 数据定义（data/）

**`data/fuThemes.ts`** — 10 个符主题：
```ts
export interface FuTheme {
  id: string;
  name: string;          // 中文名："赤金结"
  image: ImageSource;    // require('../assets/fu/chijinjie.png')
}
export const FU_THEMES: FuTheme[] = [ ... ];
```

**`data/blessingTexts.ts`** — 20 条祝福句：
```ts
export const BLESSING_TEXTS: string[] = [
  "红意临门，诸事顺遂",
  "吉光落定，万象开阔",
  // ... 共 20 条
];
```

### Step 3: 状态机框架与今日状态检查（hooks/useBlessingStore.ts — 第一部分）

用 React hook + AsyncStorage 实现业务逻辑，本步完成 hook 骨架和状态初始化。

**状态机**:
```
type HomeState = 'button' | 'descend' | 'success' | 'viewing';
```

**核心函数**:
- `checkTodayStatus()`: 按优先级读取 AsyncStorage 判断今日状态：`blessed_YYYY-MM-DD` 存在 → `success`；`generated_YYYY-MM-DD` 存在 → `descend`（调用 `generateBlessing()` 还原当日结果）；都不存在 → `button`

**数据存储结构**（AsyncStorage）:
```
"generated_2026-02-02" → "true"        // 每日已生成标记（点击「请红意」时写入）
"blessed_2026-02-02" → "true"          // 每日已收下标记（点击「收下祝福」时写入）
"envelopes" → JSON string of:          // 信封列表
  [
    { id, fuId, fuName, blessingText, createdAt },
    // id = createdAt 日期字符串（如 "2026-02-03"），每天仅一条祝福，日期即唯一标识
    ...
  ]
```

### Step 4: 随机种子与祝福生成（hooks/useBlessingStore.ts — 第二部分）

**核心函数**:
- `generateBlessing()`: 用日期字符串做种子生成确定性随机数 → 选取符+祝福句（同一天结果固定）

**随机种子**:
- 将日期字符串 `"20260202"` 转为数字作为种子
- 用简单的线性同余生成器产生确定性伪随机数
- 保证同一天无论打开多少次 APP，生成的符+祝福句组合相同

**日期统一规则**:
- 全局使用一个 `getToday()` 工具函数获取当日日期，返回 `YYYY-MM-DD` 格式字符串（如 `"2026-02-03"`）
- 使用**设备本地时区**（`new Date()` 取年月日），不做 UTC 转换
- 存储键派生：`blessed_${getToday()}`、`generated_${getToday()}`
- 随机种子派生：`parseInt(getToday().replace(/-/g, ''))` → 数字 `20260203`
- 两者从同一个 `getToday()` 调用结果派生，确保不会出现日期不一致

### Step 5: 存储操作（hooks/useBlessingStore.ts — 第三部分）

**核心函数**:
- `saveBlessing()`: 构造 `{ id: getToday(), fuId, fuName, blessingText, createdAt: getToday() }` 追加到 AsyncStorage 的信封数组 + 标记今日已祈福。`id` 直接使用日期字符串，每天仅一条记录，无需 UUID。追加前检查数组中是否已存在相同 `id`，若存在则跳过（幂等保护）
- `loadEnvelopes()`: 读取 AsyncStorage 中全部历史信封记录

### Step 6: 首页视图（app/index.tsx）

根据 `homeState` 渲染不同子组件（同页状态切换，无路由跳转）：

```tsx
export default function Home() {
  const { homeState, ... } = useBlessingStore();

  return (
    <LinearGradient colors={['#F7F4F0', '#EDE8E3']} style={styles.container}>
      {/* 底层：极淡网格纹理（宣纸质感） */}
      <GridBackground />

      {/* 顶部栏 */}
      <Header />

      {/* 中央内容：根据状态切换 */}
      {homeState === 'button'  && <ButtonState />}
      {homeState === 'descend' && <DescendState />}
      {homeState === 'success' && <SuccessState animated={isFromDescend} />}
      {homeState === 'viewing' && <ViewingState envelope={selectedEnvelope} />}
    </LinearGradient>
  );
}
```

**背景设计**：
- 底色：暖白渐变 `#F7F4F0` → `#EDE8E3`（宣纸/米纸色调）
- 网格：用 `GridBackground` 组件绘制极淡的细线网格（线色 `rgba(180,170,160,0.06)`，间距约 40px），模拟传统纸张的隐约纹理
- 整体观感：安静、通透、留白充足，像一张展开的宣纸

### Step 7: 按钮态组件（components/ButtonState.tsx）

- 居中显示「请红意」按钮
- **形态**：圆角矩形（圆角 16px），不用胶囊形，更接近玉石/印章的方正感
- **色彩**：深沉低饱和红，双层渐变模拟红翡翠质感
  - 外层：`#6B2D2D` → `#8B3A3A`（暗红玉底色）
  - 内侧加一层半透明高光 `rgba(255,255,255,0.06)`，模拟玉石表面的温润光泽
- **边框**：极细描边 `rgba(139,58,58,0.25)`，不用金色，保持内敛
- **阴影**：柔和扩散阴影 `rgba(107,45,45,0.12)`，不发光，像石头自然投下的影子
- **文字**：暖白 `#F2EDE9`，字号适中，不加粗——端庄而非张扬
- 点击 → 调用 `generateBlessing()` → 状态切为 `descend`
- 无呼吸光效（去掉，保持静谧）

### Step 8: 降临态 — 凝现动画（components/DescendState.tsx — 第一部分）

使用 `react-native-reanimated` 实现全部动画。**设计原则：含蓄、内敛，如晨雾凝聚、墨入水中，不弹跳、不夸张。**

**动画序列（"凝现"风格）**:
1. 组件挂载 → `Haptics.impactAsync(ImpactFeedbackStyle.Light)` 轻触感（比 Medium 更含蓄）
2. 符图片：**不用 `withSpring` 弹跳**，改用 `withTiming` 缓入
   - opacity 0→1（时长 1200ms，easing: easeOut）
   - scale 0.92→1（极微幅放大，几乎感知不到缩放，只感受到"逐渐清晰"）
   - 整体效果：像雾气中凝聚出一个实体，而非弹入画面
3. 符落定后启动漂浮循环：`withRepeat(withSequence(withTiming(-3), withTiming(0)))`
   - 幅度缩至 **3px**（原 8px），周期拉长至 **4.5 秒**
   - 几乎察觉不到在动，但静看时能感受到"活的"
4. 符落定 **800ms** 后，祝福句以 `withTiming`（时长 800ms）从 opacity 0→1 + translateY 8→0 淡入微移
5. 祝福句出现 **400ms** 后，「收下祝福」按钮 opacity 0→1 缓慢显现（时长 600ms），无位移

### Step 9: 降临态 — 收纳动画与保存（components/DescendState.tsx — 第二部分）

**「收下祝福」点击后 → 先保存，再播放收纳动画**:
1. 点击瞬间立即执行 `saveBlessing()`（数据持久化不依赖动画）
2. 同时启动收纳动画（"化散"风格）：
   - 符+祝福句容器：`withTiming`（时长 1000ms，easing: easeIn）
   - opacity 1→0（主要靠淡出）
   - scale 1→0.85（轻微缩小，不飞走）
   - 不做 translateX/Y 大幅位移——不"飞向右上角"，而是原地安静消散
3. 动画完成回调 `runOnJS` 中切状态为 `success`（仅切视图状态，数据已安全落盘）
4. 整体效果：像一缕檀烟散去，不是物体飞走

### Step 10: 成功态组件（components/SuccessState.tsx）

- 接收 `animated` 布尔参数（由 `index.tsx` 根据进入方式传入）
  - `animated=true`（从 descend 转场进入）：「红意已入封」`withTiming` 纯淡入 600ms → +300ms「今日已祈福」淡入
  - `animated=false`（APP 冷启动恢复）：所有元素 opacity 直接为 1，无动画，即时呈现
- 「红意已入封」标题：深红 `#6B2D2D`，正常字重
- 「今日已祈福」：温灰色 `#9E918A` 小字
- 无操作按钮，页面安静留白

### Step 11: 红意信封页面（app/envelope.tsx）

使用 expo-router 的 `presentation: 'modal'` 实现从底部弹出的模态页面（在 `app/_layout.tsx` 中为 `envelope` 路由配置 `<Stack.Screen name="envelope" options={{ presentation: 'modal' }} />`）：

**列表**:
- `FlatList` 按时间倒序展示
- 每条 `EnvelopeCard`：
  - 左侧日期（`MM/dd` 格式）
  - 右侧祝福句（单行，尾部用 `LinearGradient` mask 渐隐）
  - 卡片背景：暖白微红渐变 `#F5EFEB` → `#EEE6E0`，轻微红色调透出
  - 外层柔和阴影 `rgba(107,45,45,0.06)`，像纸片自然浮起的投影

**点击交互**:
- 点击某条信封 → 关闭模态 → hook 记录 `previousState = homeState`，将选中信封数据存入 `selectedEnvelope`，设置 `homeState = 'viewing'`
- 首页渲染 `<ViewingState />`：静态展示该信封的符+祝福句+底部日期
- 点击右上角「返回」 → 设置 `homeState = previousState`，清空 `selectedEnvelope`

### Step 12: 色彩方案（constants/colors.ts）

**视觉关键词：含蓄、端庄、静谧 | 白底红韵、宣纸质感**

```ts
export const COLORS = {
  // 背景：暖白渐变（宣纸色）
  background:   ['#F7F4F0', '#EDE8E3'],

  // 网格线：极淡，隐约可见
  grid:         'rgba(180,170,160,0.06)',

  // 主色：深沉低饱和红（红翡翠/玛瑙色）
  primary:      '#6B2D2D',               // 按钮底色
  primaryLight: '#8B3A3A',               // 按钮渐变亮部
  primaryGlow:  'rgba(139,58,58,0.25)',  // 按钮描边

  // 点缀：哑光铜（替代原来的亮金色，更内敛）
  accent:       '#A67C5B',

  // 文字
  text:         '#2D2424',               // 主文字：深棕黑（不用纯黑）
  textMuted:    '#9E918A',               // 辅助文字：温灰
  textOnButton: '#F2EDE9',              // 按钮上的文字：暖白

  // 信封卡片
  cardStart:    '#F5EFEB',               // 暖白微红
  cardEnd:      '#EEE6E0',               // 暖白微灰
  cardShadow:   'rgba(107,45,45,0.06)',  // 极柔阴影

  // 祝福句文字色
  blessing:     '#6B2D2D',               // 与主色同系，沉稳
};
```

字体：系统默认苹方。祝福句和标题不加粗，用 regular/medium 字重保持端庄感。

### Step 13: 图片资源准备

1. 在即梦 AI 网页端（jimeng.jianying.com）生成 10 张符图片
2. 每个主题生成 3-5 张候选，人工筛选最佳 1 张
3. 去除背景，导出 PNG（透明通道），尺寸 1024×1024
4. 放入 `assets/fu/` 目录，文件名与 `fuThemes.ts` 中的 id 对应

### Step 14: 图片服务架构预留（services/imageService.ts）

```ts
interface ImageService {
  getFuImage(theme: FuTheme): Promise<ImageSource>;
}

// MVP: 直接返回本地 require 图片
class LocalImageService implements ImageService { ... }

// 后续: 调用火山引擎 API
class ApiImageService implements ImageService { ... }
```

### Step 15: Prompt 模板（data/promptTemplates.ts）

每个符主题的 AI 生成 Prompt：
- 通用前缀：单元素、无背景、透明 PNG、红金色系、8K 质感、居中构图
- 主题描述：如赤金结 → "红线缠绕金属结，缎面光泽，金属反光"
- Negative prompt：无文字、无人物、无多余元素、无股票相关内容

图片质量控制清单（手动筛选时使用）：
- [x] 单元素 [x] 无背景 [x] 居中 [x] 红色系 [x] 高质感 [x] 无文字 [x] 无人物 [x] ≥1024px [x] 风格统一

### Step 16: 构建与测试

**开发阶段**:
```bash
npx expo start
```
手机安装 Expo Go → 扫码 → 实时预览（注意：震动反馈需要在真机 Expo Go 中才生效）

**构建 iOS 包**:
```bash
npx eas build --platform ios
```
首次需配置 Apple Developer 账号凭据，EAS 在云端 Mac 上完成编译。

**上架 App Store**:
```bash
npx eas submit --platform ios
```

---

## 前置条件

在开始编码前需要完成：
1. **安装 Node.js**: 从 nodejs.org 下载 LTS 版本安装
2. **安装 VS Code**: 从 code.visualstudio.com 下载安装
3. **手机安装 Expo Go**: App Store 搜索 "Expo Go" 安装
4. **注册 Expo 账号**: expo.dev 免费注册
5. **（上架前）注册 Apple Developer 账号**: developer.apple.com（$99/年）

---

## 关键文件清单

| 文件 | 作用 | 优先级 |
|------|------|--------|
| `hooks/useBlessingStore.ts` | 核心：状态机+存储+随机选取 | P0 |
| `components/DescendState.tsx` | 核心交互：动画+震动+收纳 | P0 |
| `app/index.tsx` | 首页路由与状态分发 | P0 |
| `data/fuThemes.ts` + `blessingTexts.ts` | 内容数据定义 | P0 |
| `components/EnvelopeCard.tsx` | 信封卡片 UI（渐变+渐隐） | P1 |
| `components/ViewingState.tsx` | 回看态 UI（静态符+祝福句+日期） | P1 |
| `app/envelope.tsx` | 信封列表页 | P1 |
| `services/imageService.ts` | 图片服务抽象 | P1 |
| `data/promptTemplates.ts` | Prompt 模板 | P2 |

---

## 验证方式

1. **状态流转**: 启动 APP → 暖白宣纸底+隐约网格 → 看到深红玉石质感「请红意」按钮 → 点击 → 轻触感+符从透明缓缓凝现+祝福句淡入 → 点击「收下祝福」→ 符安静消散 → 显示「今日已祈福」→ 杀掉 APP 重开 → 仍显示「今日已祈福」
2. **跨日重置**: 等到第二天（或清除 AsyncStorage 模拟）→ 重开 APP → 回到「请红意」状态
3. **信封列表**: 点击右上角「红意信封」→ 进入列表 → 显示历史记录（日期+渐隐祝福句+红色渐变卡片）→ 点击某条 → 回到首页展示对应符+祝福句+底部日期
4. **真机震动**: Expo Go 中点击「请红意」后感受到一次轻震动
5. **iOS 构建**: `eas build --platform ios` 成功输出 .ipa 文件
