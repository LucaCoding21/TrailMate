import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

interface ProgressDotsProps {
  activeIndex: number;
  total: number;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
  activeIndex,
  total,
}) => {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${activeIndex + 1} of ${total}`}
      accessibilityValue={{
        min: 0,
        max: total - 1,
        now: activeIndex,
      }}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: spacing.xs,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    backgroundColor: colors.border,
  },
}); 