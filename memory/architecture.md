# 文件架构说明

## 项目文档

| 文件 | 作用 |
|------|------|
| `tech.md` | 技术实现计划，包含选型、依赖、步骤、动画规范、色彩方案 |
| `开盘前红意MVP产品设计文档.md` | 产品设计文档，定义交互流程、内容规范、MVP 范围 |
| `progress.md` | 开发进度记录 |
| `architecture.md` | 本文件，文件架构说明 |

## 项目代码（hongyi/）

> 以下文件将在开发过程中逐步创建，创建后更新本表。

### 页面（app/）

| 文件 | 作用 |
|------|------|
| `app/_layout.tsx` | 根布局，全局背景色、字体加载、路由栈配置（含 envelope 的 modal presentation） |
| `app/index.tsx` | 首页，根据状态机渲染 ButtonState / DescendState / SuccessState |
| `app/envelope.tsx` | 红意信封页面，底部弹出模态，展示历史祈福记录列表 |

### 组件（components/）

| 文件 | 作用 |
|------|------|
| `components/ButtonState.tsx` | 按钮态：显示「请红意」按钮，玉石质感样式 |
| `components/DescendState.tsx` | 降临态：符凝现动画 + 祝福句淡入 + 收下祝福按钮 + 收纳动画 |
| `components/SuccessState.tsx` | 成功态：显示「红意已入封」「今日已祈福」 |
| `components/EnvelopeCard.tsx` | 信封列表单条卡片，日期 + 渐隐祝福句 |
| `components/FuImage.tsx` | 符图片组件，封装漂浮动效 |

### 状态管理（hooks/）

| 文件 | 作用 |
|------|------|
| `hooks/useBlessingStore.ts` | 核心 hook：状态机、AsyncStorage 读写、日期种子随机、信封历史管理 |

### 数据（data/）

| 文件 | 作用 |
|------|------|
| `data/fuThemes.ts` | 10 个符主题定义（id、名称、图片引用） |
| `data/blessingTexts.ts` | 20 条祝福句 |
| `data/promptTemplates.ts` | AI 图片生成 Prompt 模板（后续阶段用） |

### 服务（services/）

| 文件 | 作用 |
|------|------|
| `services/imageService.ts` | 图片服务抽象，MVP 用本地加载，预留 API 接口 |

### 常量（constants/）

| 文件 | 作用 |
|------|------|
| `constants/colors.ts` | 全局色彩方案常量 |

### 资源（assets/）

| 目录 | 作用 |
|------|------|
| `assets/fu/` | 10 张符图片（PNG 透明背景，1024×1024） |
