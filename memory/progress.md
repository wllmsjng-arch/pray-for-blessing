# 开发进度

## 实施步骤

| 步骤 | 内容 | 状态 |
|------|------|------|
| Step 1 | 初始化项目 | ✅ 已完成 |
| Step 2 | 数据定义（fuThemes / blessingTexts） | ✅ 已完成 |
| Step 3 | 状态机框架与今日状态检查（useBlessingStore 第一部分） | 未开始 |
| Step 4 | 随机种子与祝福生成（useBlessingStore 第二部分） | 未开始 |
| Step 5 | 存储操作（useBlessingStore 第三部分） | 未开始 |
| Step 6 | 首页视图（index.tsx） | 未开始 |
| Step 7 | 按钮态组件（ButtonState） | 未开始 |
| Step 8 | 降临态 — 凝现动画（DescendState 第一部分） | 未开始 |
| Step 9 | 降临态 — 收纳动画与保存（DescendState 第二部分） | 未开始 |
| Step 10 | 成功态组件（SuccessState） | 未开始 |
| Step 11 | 红意信封页面（envelope） | 未开始 |
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
