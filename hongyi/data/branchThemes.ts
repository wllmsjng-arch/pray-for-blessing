import { ImageRequireSource } from 'react-native';

export interface BranchTheme {
  id: string;
  left: ImageRequireSource;
  right: ImageRequireSource;
  aspectLeft: number;   // 左图 height/width 比
  aspectRight: number;  // 右图 height/width 比
}

export const BRANCH_THEMES: BranchTheme[] = [
  {
    id: 'branch1',
    left: require('../assets/branches/branch1-left.png'),
    right: require('../assets/branches/branch1-right.png'),
    aspectLeft: 362 / 542,
    aspectRight: 1024 / 1536,
  },
  {
    id: 'branch2',
    left: require('../assets/branches/branch2-left.png'),
    right: require('../assets/branches/branch2-right.png'),
    aspectLeft: 547 / 455,
    aspectRight: 547 / 455,
  },
  {
    id: 'branch3',
    left: require('../assets/branches/branch3-left.png'),
    right: require('../assets/branches/branch3-right.png'),
    aspectLeft: 689 / 483,
    aspectRight: 689 / 483,
  },
  {
    id: 'branch4',
    left: require('../assets/branches/branch4-left.png'),
    right: require('../assets/branches/branch4-right.png'),
    aspectLeft: 539 / 572,
    aspectRight: 539 / 572,
  },
];
