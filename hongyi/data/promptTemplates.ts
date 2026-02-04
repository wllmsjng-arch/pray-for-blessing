/**
 * AI 图片生成 Prompt 模板
 *
 * 用于通过第三方图片大模型 API（如火山引擎即梦）生成符图片。
 * MVP 阶段手动在即梦网页端使用这些 prompt 生成图片，后续可由 ApiImageService 自动调用。
 */

// ==================== 通用前缀 ====================

export const PROMPT_PREFIX =
  'Single element, centered composition, no background, transparent PNG, ' +
  'red and gold color scheme, 8K ultra-high quality, studio lighting, ' +
  'photorealistic material texture, cinematic render, ';

// ==================== 通用 Negative Prompt ====================

export const NEGATIVE_PROMPT =
  'text, words, letters, numbers, watermark, signature, logo, ' +
  'human, person, face, hand, finger, body, ' +
  'multiple objects, cluttered, busy background, ' +
  'stock market, chart, graph, arrow, currency, money, coin, ' +
  'low quality, blurry, pixelated, noise, artifacts';

// ==================== 各主题 Prompt ====================

export interface PromptTemplate {
  fuId: string;
  fuName: string;
  prompt: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    fuId: 'chijinjie',
    fuName: '赤金结',
    prompt:
      PROMPT_PREFIX +
      'a red silk thread intricately woven into an ornate metallic knot, ' +
      'satin-like luster on the thread surface, golden metallic reflections, ' +
      'traditional Chinese lucky knot form, tight symmetrical weave',
  },
  {
    fuId: 'zhushayin',
    fuName: '朱砂印',
    prompt:
      PROMPT_PREFIX +
      'a semi-transparent cinnabar seal stamp, rich vermillion red texture, ' +
      'subtle internal veins visible through translucent stone body, ' +
      'traditional Chinese seal form, polished smooth surface with soft glow',
  },
  {
    fuId: 'hongyuhuan',
    fuName: '红玉环',
    prompt:
      PROMPT_PREFIX +
      'a ring-shaped ornament made of red jade and clear glass, ' +
      'deep crimson jade seamlessly fused with transparent crystal, ' +
      'torus form, polished to mirror finish, light refracting through glass sections',
  },
  {
    fuId: 'hongyanxin',
    fuName: '红焰芯',
    prompt:
      PROMPT_PREFIX +
      'a glass orb encasing a single wisp of red flame, ' +
      'the flame frozen mid-dance inside clear crystal sphere, ' +
      'warm ember glow radiating outward, delicate fire filament detail',
  },
  {
    fuId: 'bixieling',
    fuName: '辟邪铃',
    prompt:
      PROMPT_PREFIX +
      'a minimalist bell-shaped metallic body, protective talisman form, ' +
      'burnished red-bronze metal surface, subtle engraved pattern, ' +
      'simple elegant silhouette, warm metallic sheen',
  },
  {
    fuId: 'jinboyu',
    fuName: '金箔羽',
    prompt:
      PROMPT_PREFIX +
      'a feather shape formed by condensed gold leaf on a red base, ' +
      'delicate gold foil texture with visible crinkle detail, ' +
      'deep red undertone showing through gold surface, weightless floating appearance',
  },
  {
    fuId: 'chiyaoshi',
    fuName: '赤曜石',
    prompt:
      PROMPT_PREFIX +
      'a faceted obsidian gemstone in deep red-black color, ' +
      'sharp geometric cut faces with glass-like reflections, ' +
      'dark crimson translucency at thin edges, volcanic stone texture',
  },
  {
    fuId: 'jiangyuntuan',
    fuName: '绛云团',
    prompt:
      PROMPT_PREFIX +
      'a sphere of condensed red mist or cloud, ' +
      'swirling crimson fog tightly gathered into a soft ball form, ' +
      'subtle internal glow, wispy edges dissolving into air, ethereal and dreamlike',
  },
  {
    fuId: 'chiwenshi',
    fuName: '赤纹石',
    prompt:
      PROMPT_PREFIX +
      'a minimalist sculpture carved from red-veined stone, ' +
      'visible red mineral veins running through pale rock body, ' +
      'smooth abstract organic form, polished surface with natural grain texture',
  },
  {
    fuId: 'hongmanao',
    fuName: '红玛瑙',
    prompt:
      PROMPT_PREFIX +
      'a precisely cut red agate gemstone with sharp clean edges, ' +
      'translucent deep red body with visible banding layers, ' +
      'gem-quality clarity, light passing through creating warm inner glow',
  },
];

// ==================== 图片质量控制清单 ====================
//
// 手动筛选生成图片时使用：
// [x] 单元素
// [x] 无背景
// [x] 居中构图
// [x] 红色系
// [x] 高质感
// [x] 无文字
// [x] 无人物
// [x] ≥1024px
// [x] 风格统一
