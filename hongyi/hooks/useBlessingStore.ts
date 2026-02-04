import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FuTheme, FU_THEMES } from '../data/fuThemes';
import { BLESSING_TEXTS } from '../data/blessingTexts';

// ==================== 类型定义 ====================

export type HomeState = 'loading' | 'button' | 'descend' | 'success' | 'viewing';

export interface Envelope {
  id: string;
  fuId: string;
  fuName: string;
  blessingText: string;
  createdAt: string;
}

export interface CurrentBlessing {
  fuTheme: FuTheme;
  blessingText: string;
  date: string;
}

// ==================== 工具函数 ====================

/** 返回设备本地时区的当日日期，格式 "YYYY-MM-DD" */
export function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** LCG 线性同余生成器 (a=1664525, c=1013904223, m=2^32) */
function createLCG(seed: number) {
  let s = seed;
  return () => {
    s = (1664525 * s + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// ==================== Store ====================

interface BlessingStore {
  // 状态
  homeState: HomeState;
  currentBlessing: CurrentBlessing | null;
  selectedEnvelope: Envelope | null;
  isFromDescend: boolean;

  // 方法
  checkTodayStatus: () => Promise<void>;
  generateBlessing: () => void;
  saveBlessing: () => Promise<void>;
  loadEnvelopes: () => Promise<Envelope[]>;
  viewEnvelope: (envelope: Envelope) => void;
  exitViewing: () => void;
}

// 内部变量：记录进入 viewing 前的状态，用于 exitViewing 恢复
let previousState: HomeState = 'button';

export const useBlessingStore = create<BlessingStore>((set, get) => ({
  homeState: 'loading',
  currentBlessing: null,
  selectedEnvelope: null,
  isFromDescend: false,

  // Step 3: 启动时检查今日状态
  checkTodayStatus: async () => {
    const today = getToday();

    // 优先级 1：今日已收下 → success（静态呈现，无动画）
    const blessed = await AsyncStorage.getItem(`blessed_${today}`);
    if (blessed) {
      set({ homeState: 'success', isFromDescend: false });
      return;
    }

    // 优先级 2：今日已生成但未收下 → 还原数据 + descend
    const generated = await AsyncStorage.getItem(`generated_${today}`);
    if (generated) {
      get().generateBlessing();
      return;
    }

    // 优先级 3：全新一天 → button
    set({ homeState: 'button' });
  },

  // Step 4: 确定性生成当日祝福
  generateBlessing: () => {
    const today = getToday();
    const seed = parseInt(today.replace(/-/g, ''), 10);
    const random = createLCG(seed);

    const fuIndex = Math.floor(random() * FU_THEMES.length);
    const blessingIndex = Math.floor(random() * BLESSING_TEXTS.length);

    set({
      currentBlessing: {
        fuTheme: FU_THEMES[fuIndex],
        blessingText: BLESSING_TEXTS[blessingIndex],
        date: today,
      },
      homeState: 'descend',
    });

    // 写入已生成标记（fire-and-forget，幂等）
    AsyncStorage.setItem(`generated_${today}`, 'true');
  },

  // Step 5: 持久化当前祝福到信封
  saveBlessing: async () => {
    const { currentBlessing } = get();
    if (!currentBlessing) return;

    const today = getToday();

    // 读取现有信封列表
    const raw = await AsyncStorage.getItem('envelopes');
    const envelopes: Envelope[] = raw ? JSON.parse(raw) : [];

    // 幂等保护：同一天只存一条
    if (!envelopes.some((e) => e.id === today)) {
      envelopes.push({
        id: today,
        fuId: currentBlessing.fuTheme.id,
        fuName: currentBlessing.fuTheme.name,
        blessingText: currentBlessing.blessingText,
        createdAt: today,
      });
      await AsyncStorage.setItem('envelopes', JSON.stringify(envelopes));
    }

    // 标记今日已收下
    await AsyncStorage.setItem(`blessed_${today}`, 'true');
  },

  // Step 5: 加载历史信封（按时间倒序）
  loadEnvelopes: async () => {
    const raw = await AsyncStorage.getItem('envelopes');
    const envelopes: Envelope[] = raw ? JSON.parse(raw) : [];
    return envelopes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  // 进入回看态
  viewEnvelope: (envelope: Envelope) => {
    previousState = get().homeState;
    set({
      homeState: 'viewing',
      selectedEnvelope: envelope,
    });
  },

  // 退出回看态，恢复之前的状态
  exitViewing: () => {
    set({
      homeState: previousState,
      selectedEnvelope: null,
    });
  },
}));
