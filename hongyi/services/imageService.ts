import { ImageSource } from 'expo-image';
import { FuTheme } from '../data/fuThemes';

// ==================== 接口定义 ====================

export interface ImageService {
  getFuImage(theme: FuTheme): Promise<ImageSource>;
}

// ==================== MVP：本地图片服务 ====================

class LocalImageService implements ImageService {
  async getFuImage(theme: FuTheme): Promise<ImageSource> {
    // 直接返回 fuThemes.ts 中 require() 预绑定的本地图片
    return theme.image;
  }
}

// ==================== 预留：API 图片服务 ====================

// 后续接入火山引擎等第三方图片大模型 API 时实现
// class ApiImageService implements ImageService {
//   async getFuImage(theme: FuTheme): Promise<ImageSource> {
//     // 1. 从 promptTemplates.ts 获取该主题的 prompt
//     // 2. 调用图片生成 API
//     // 3. 返回生成图片的 URI
//     throw new Error('Not implemented');
//   }
// }

// ==================== 导出默认实例 ====================

export const imageService: ImageService = new LocalImageService();
