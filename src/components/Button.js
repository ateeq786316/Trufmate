import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { colors, typography, componentStyles } from "../constants/theme";

const Button = ({
  title,
  onPress,
  variant = "primary", // primary, secondary, ghost
  disabled = false,
  loading = false,
  style = {},
  textStyle = {},
  ...props
}) => {
  const getButtonStyle = () => {
    let baseStyle = componentStyles.button[variant];

    if (disabled) {
      baseStyle = {
        ...baseStyle,
        opacity: 0.5,
      };
    }

    return [baseStyle, style];
  };

  const getTextStyle = () => {
    let color = colors.primary.contrastText;

    if (variant === "secondary") {
      color = colors.primary.main;
    } else if (variant === "ghost") {
      color = colors.text.primary;
    }

    return [
      {
        ...typography.button,
        color,
        textAlign: "center",
      },
      textStyle,
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "secondary"
              ? colors.primary.main
              : colors.primary.contrastText
          }
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
