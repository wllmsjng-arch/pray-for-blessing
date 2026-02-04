import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Envelope } from '../hooks/useBlessingStore';
import { FU_THEMES } from '../data/fuThemes';
import { COLORS } from '../constants/colors';

interface Props {
  envelope: Envelope;
}

export default function ViewingState({ envelope }: Props) {
  // 通过 fuId 查找符主题，获取图片
  const fuTheme = FU_THEMES.find((t) => t.id === envelope.fuId);

  // 日期格式 YYYY/M/D（不补零，如 2026/2/2）
  const [y, m, d] = envelope.createdAt.split('-');
  const displayDate = `${y}/${parseInt(m)}/${parseInt(d)}`;

  return (
    <View style={styles.container}>
      {/* 主内容居中 */}
      <View style={styles.center}>
        {/* 符图片：静态展示，无凝现动画，无漂浮 */}
        {fuTheme && (
          <Image
            source={fuTheme.image as any}
            style={styles.fuImage}
            resizeMode="contain"
          />
        )}
        {/* 祝福句：直接显示，无淡入 */}
        <Text style={styles.blessingText}>{envelope.blessingText}</Text>
      </View>

      {/* 日期：页面下方，温灰色小字 */}
      <Text style={styles.date}>{displayDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fuImage: {
    width: 220,
    height: 220,
  },
  blessingText: {
    fontSize: 17,
    color: COLORS.blessing,
    fontWeight: '400',
    letterSpacing: 2,
    marginTop: 32,
  },
  date: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
    marginBottom: 40,
  },
});
