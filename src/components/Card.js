import React from "react";
import { View } from "react-native";
import { componentStyles } from "../constants/theme";

const Card = ({ children, style = {}, ...props }) => {
  return (
    <View style={[componentStyles.card, style]} {...props}>
      {children}
    </View>
  );
};

export default Card;
