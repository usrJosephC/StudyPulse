import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type Props = {
  label: string;
  size?: number;
  ringColor?: string;
  backgroundColor?: string;
  textColor?: string;
};

export function Avatar({ label, size = 44, ringColor, backgroundColor = colors.secondary, textColor = '#FFFFFF' }: Props) {
  const initial = label.trim().charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderWidth: ringColor ? 3 : 0,
          borderColor: ringColor,
        },
      ]}
    >
      <Text style={[styles.label, { color: textColor, fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.headlineBold,
  },
});
