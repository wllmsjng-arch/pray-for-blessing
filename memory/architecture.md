# 文件架构说明

## 项目文档（memory/）

| 文件 | 作用 |
|------|------|
| `memory/tech.md` | 技术实现计划，包含选型、依赖、步骤、动画规范、色彩方案、核心定义速查 |
| `memory/开盘前红意MVP产品设计文档.md` | 产品设计文档，定义交互流程、内容规范、MVP 范围 |
| `memory/progress.md` | 开发进度记录，含每步完成内容和与 tech.md 的差异说明 |
| `memory/architecture.md` | 本文件，文件架构说明 |

---

## 项目代码（hongyi/）

### 根目录配置文件

| 文件 | 作用 | 状态 |
|------|------|------|
| `hongyi/app.json` | Expo 配置：应用名、scheme、bundleIdentifier、启动背景色、expo-router 插件 | ✅ 已创建 |
| `hongyi/package.json` | 依赖清单，入口为 `expo-router/entry` | ✅ 已创建 |
| `hongyi/babel.config.js` | Babel 配置，加载 `react-native-reanimated/plugin`（必须放在 plugins 最后） | ✅ 已创建 |
| `hongyi/tsconfig.json` | TypeScript 配置，继承 `expo/tsconfig.base`，开启 strict 模式 | ✅ 已创建 |
| `hongyi/.gitignore` | Git 忽略规则，排除 node_modules/、.expo/、ios/、android/ 等 | ✅ 已创建 |

### 页面（app/）

> expo-router 文件系统路由：文件名即路由路径。

| 文件 | 作用 | 状态 |
|------|------|------|
| `app/_layout.tsx` | 根布局：Stack 导航器配置，envelope 路由设置 `presentation: 'modal'`（底部弹出） | ✅ 已创建 |
| `app/index.tsx` | 首页：根据 `homeState` 渲染 ButtonState / DescendState / SuccessState / ViewingState，loading 态显示空白等待 | ✅ 已创建 |
| `app/envelope.tsx` | 红意信封页面：FlatList 倒序展示历史记录，点击某条 → 关闭模态 → 首页进入 viewing 态 | ✅ 已创建 |

### 组件（components/）

| 文件 | 作用 | 状态 |
|------|------|------|
| `components/ButtonState.tsx` | 按钮态：居中「请红意」按钮，圆角矩形玉石质感，深红渐变 + 半透明高光 | ✅ 已创建 |
| `components/DescendState.tsx` | 降临态：符凝现动画（opacity+scale 1200ms）→ 漂浮循环 → 祝福句淡入 → 收下祝福按钮 → 收纳化散动画 | ✅ 已创建 |
| `components/SuccessState.tsx` | 成功态：接收 `animated` prop，true 时播放淡入动画，false 时静态呈现 | ✅ 已创建 |
| `components/ViewingState.tsx` | 回看态：普通 `<Image />` 静态展示符 + 祝福句 + 底部日期，右上角返回按钮 | ✅ 已创建 |
| `components/EnvelopeCard.tsx` | 信封卡片：左侧日期 + 右侧祝福句（LinearGradient mask 渐隐），暖白微红渐变背景 | ✅ 已创建 |
| `components/FuImage.tsx` | 符图片组件：封装漂浮动效（withRepeat ±3px / 4.5s），仅 DescendState 使用 | ✅ 已创建 |
| `components/GridBackground.tsx` | 宣纸网格纹理：极淡细线网格 `rgba(180,170,160,0.06)`，间距 40px | ✅ 已创建 |
| `components/Header.tsx` | 顶部栏：产品名 + 今日日期（小字），右上角「红意信封」入口 / 回看态「返回」按钮 | ✅ 已创建 |

### 状态管理（hooks/）

| 文件 | 作用 | 状态 |
|------|------|------|
| `hooks/useBlessingStore.ts` | **Zustand** 全局 store（非普通 React hook），解决跨路由状态共享。包含：状态机（loading/button/descend/success/viewing）、getToday()、LCG 确定性随机、checkTodayStatus()、generateBlessing()、saveBlessing()、loadEnvelopes()、viewEnvelope()、exitViewing()、previousState 内部变量 | ✅ 已创建 |

### 数据（data/）

| 文件 | 作用 | 状态 |
|------|------|------|
| `data/fuThemes.ts` | 10 个符主题定义：`{ id, name, image }` 数组，image 为 `require('../assets/fu/xxx.png')` | ✅ 已创建 |
| `data/blessingTexts.ts` | 20 条祝福句字符串数组 | ✅ 已创建 |
| `data/promptTemplates.ts` | AI 图片生成 Prompt 模板（后续阶段用，MVP 不调用） | 待创建 |

### 服务（services/）

| 文件 | 作用 | 状态 |
|------|------|------|
| `services/imageService.ts` | 图片服务抽象层：MVP 用 `LocalImageService` 返回本地 require 图片，预留 `ApiImageService` 接口 | 待创建 |

### 常量（constants/）

| 文件 | 作用 | 状态 |
|------|------|------|
| `constants/colors.ts` | 全局色彩方案：背景渐变、网格线、主色深红、哑光铜点缀、文字色、信封卡片色 | ✅ 已创建 |

### 资源（assets/）

| 目录/文件 | 作用 | 状态 |
|-----------|------|------|
| `assets/fu/` | 10 张符图片目录（PNG 透明背景，1024×1024），文件名与 fuThemes.ts 中 id 对应 | ✅ 目录已创建，图片待生成 |
| `assets/icon.png` | 应用图标（Expo 模板默认） | ✅ 模板自带 |
| `assets/splash-icon.png` | 启动屏图标（Expo 模板默认） | ✅ 模板自带 |

---

## 依赖关系图

```
app/_layout.tsx
  └── app/index.tsx
        ├── hooks/useBlessingStore.ts (Zustand store)
        │     ├── data/fuThemes.ts
        │     ├── data/blessingTexts.ts
        │     └── AsyncStorage (运行时读写)
        ├── components/GridBackground.tsx
        ├── components/Header.tsx
        │     └── constants/colors.ts
        ├── components/ButtonState.tsx
        │     ├── hooks/useBlessingStore.ts
        │     └── constants/colors.ts
        ├── components/DescendState.tsx
        │     ├── hooks/useBlessingStore.ts
        │     ├── components/FuImage.tsx
        │     └── constants/colors.ts
        ├── components/SuccessState.tsx
        │     └── constants/colors.ts
        └── components/ViewingState.tsx
              ├── data/fuThemes.ts (通过 fuId 查找 image)
              └── constants/colors.ts
  └── app/envelope.tsx
        ├── hooks/useBlessingStore.ts (同一 Zustand 实例)
        ├── components/EnvelopeCard.tsx
        │     └── constants/colors.ts
        └── constants/colors.ts
```

## 关键架构决策

| 决策 | 原因 |
|------|------|
| Zustand 替代纯 React hook | `index.tsx` 和 `envelope.tsx` 是不同路由，普通 useState 无法共享状态；Zustand 天然全局单例 |
| loading 初始态 | checkTodayStatus() 读 AsyncStorage 是异步的，需要等待完成后再渲染，避免界面闪烁 |
| ViewingState 用普通 Image | 回看态要求静态无动画，复用 FuImage 反而需要加参数控制，不如直接用 Image 简洁 |
| expo-router presentation:'modal' | iOS 上自动呈现为底部上滑卡片式模态，无需自定义动画 |
| LCG 确定性随机 | 保证同一天多次打开结果相同，参数 a=1664525, c=1013904223, m=2^32 |
