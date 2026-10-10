import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';


interface ButtonProps extends TouchableOpacityProps{
    title:string
    variant?: 'primary' | 'secondary' | 'outline' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
}


export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    style,
    ...rest

})=>{
    const isButtonDisabled = disabled || isLoading

    return(
        <TouchableOpacity
            style={[
                styles.base,
                styles[`variant_${variant}` as keyof typeof styles] as ViewStyle,
                styles[`size_${size}` as keyof typeof styles] as ViewStyle,
                isButtonDisabled && styles.disabled,
                style as ViewStyle,
            ]}
            disabled={isButtonDisabled}
            activeOpacity={0.7}
            {...rest}>
            
            {isLoading ? (
                <ActivityIndicator
                color={variant === 'outline' || variant === 'secondary' ? '#2563EB' : '#FFFFFF'}
                />
            ) : (
                <Text
                style={[
                    styles.textBase,
                    styles[`text_${variant}` as keyof typeof styles] as TextStyle,
                    styles[`textSize_${size}` as keyof typeof styles] as TextStyle,
                ]}
                >
                {title}
                </Text>
            )}
            
        </TouchableOpacity>
    )
}



const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.5,
  },
  // Variants
  variant_primary: {
    backgroundColor: '#2563EB',
  },
  variant_secondary: {
    backgroundColor: '#E2E8F0',
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  variant_danger: {
    backgroundColor: '#DC2626',
  },
  // Sizes
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  // Text Styles
  textBase: {
    fontWeight: '600',
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#1E293B',
  },
  text_outline: {
    color: '#2563EB',
  },
  text_danger: {
    color: '#FFFFFF',
  },
  textSize_sm: {
    fontSize: 14,
  },
  textSize_md: {
    fontSize: 16,
  },
  textSize_lg: {
    fontSize: 18,
  },
})