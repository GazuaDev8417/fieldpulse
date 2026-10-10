import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
  ...rest
}) => {
  return (
    <View
      style={[
        styles.card,
        styles[`variant_${variant}` as keyof typeof styles] as ViewStyle,
        style as ViewStyle,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  variant_elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  variant_outlined: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  variant_flat: {
    backgroundColor: '#F1F5F9',
  },
});