import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
} from 'react-native';


interface InputProps extends TextInputProps{
    label?: string
    error?: string
    helperText?: string
}


export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    style,
    ...rest
}) =>{
    return (
        <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
            style={[
            styles.input,
            error ? styles.inputError : null,
            style as TextStyle,
            ]}
            placeholderTextColor="#94A3B8"
            {...rest}
        />
        {error ? (
            <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
            <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
        </View>
    )
}



const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
})