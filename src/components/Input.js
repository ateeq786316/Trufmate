import React from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import {
  colors,
  typography,
  componentStyles,
  spacing,
} from "../constants/theme";

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  style = {},
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[componentStyles.input, error && styles.inputError, style]}
        placeholder={placeholder}
        placeholderTextColor={colors.text.disabled}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },

  label: {
    ...typography.body,
    marginBottom: spacing.sm,
    color: colors.text.primary,
    fontWeight: "500",
  },

  inputError: {
    borderColor: colors.error.main,
  },

  errorText: {
    ...typography.caption,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
});

export default Input;
