import { ImageSource } from 'expo-image';

export interface FuTheme {
  id: string;
  name: string;
  image: ImageSource;
}

export const FU_THEMES: FuTheme[] = [
  { id: 'chijinjie', name: '赤金结', image: require('../assets/fu/chijinjie.png') },
  { id: 'zhushayin', name: '朱砂印', image: require('../assets/fu/zhushayin.png') },
  { id: 'hongyuhuan', name: '红玉环', image: require('../assets/fu/hongyuhuan.png') },
  { id: 'hongyanxin', name: '红焰芯', image: require('../assets/fu/hongyanxin.png') },
  { id: 'bixieling', name: '辟邪铃', image: require('../assets/fu/bixieling.png') },
  { id: 'jinboyu', name: '金箔羽', image: require('../assets/fu/jinboyu.png') },
  { id: 'chiyaoshi', name: '赤曜石', image: require('../assets/fu/chiyaoshi.png') },
  { id: 'jiangyuntuan', name: '绛云团', image: require('../assets/fu/jiangyuntuan.png') },
  { id: 'chiwenshi', name: '赤纹石', image: require('../assets/fu/chiwenshi.png') },
  { id: 'hongmanao', name: '红玛瑙', image: require('../assets/fu/hongmanao.png') },
];
