// Theme constants based on JSON Design System
// Dark Mode Minimalist with Vibrant Accents

export const colors = {
  // Light theme (for future use)
  light: {
    backgroundColor: "#FFFFFF",
    surfaceColor: "#F8F8F8",
    onSurfaceColor: "#1A1A1A",
  },

  // Dark theme (primary)
  dark: {
    backgroundColor: "#1A1A2E",
    surfaceColor: "#2C2C4A",
    onSurfaceColor: "#E0E0E0",
  },

  // Palette
  primary: {
    main: "#5B61F9",
    contrastText: "#FFFFFF",
  },

  secondary: {
    main: "#E85D7F",
    contrastText: "#FFFFFF",
  },

  success: {
    main: "#4CAF50",
    contrastText: "#FFFFFF",
  },

  warning: {
    main: "#FFC107",
    contrastText: "#000000",
  },

  error: {
    main: "#F44336",
    contrastText: "#FFFFFF",
  },

  // Chart colors
  chartColors: [
    "#5B61F9",
    "#E85D7F",
    "#4CAF50",
    "#FFC107",
    "#F44336",
    "#66C7F4",
  ],

  // Additional colors for better UX
  text: {
    primary: "#E0E0E0",
    secondary: "rgba(255, 255, 255, 0.6)",
    disabled: "rgba(255, 255, 255, 0.4)",
  },

  border: {
    primary: "rgba(255, 255, 255, 0.1)",
    secondary: "rgba(255, 255, 255, 0.05)",
  },

  overlay: "rgba(0, 0, 0, 0.5)",
};

export const typography = {
  fontFamily: "Inter",

  // Heading styles
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
  },

  h2: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
  },

  h3: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },

  // Body text
  body: {
    fontSize: 14,
    fontWeight: "normal",
    color: colors.text.primary,
  },

  // Caption text
  caption: {
    fontSize: 12,
    fontWeight: "normal",
    color: colors.text.secondary,
  },

  // Button text
  button: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "none",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  button: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};

// Component styles based on design system
export const componentStyles = {
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    backgroundColor: colors.dark.surfaceColor,
    ...shadows.card,
  },

  button: {
    primary: {
      borderRadius: borderRadius.xl,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.xl,
      backgroundColor: colors.primary.main,
      ...shadows.button,
    },

    secondary: {
      borderRadius: borderRadius.xl,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.xl,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.primary.main,
    },

    ghost: {
      borderRadius: borderRadius.xl,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.xl,
      backgroundColor: "transparent",
    },
  },

  input: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.dark.surfaceColor,
    borderWidth: 1,
    borderColor: colors.border.primary,
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },

  navigation: {
    backgroundColor: colors.dark.surfaceColor,
    iconSize: 24,
    activeIconColor: colors.primary.main,
    inactiveIconColor: colors.text.disabled,
  },

  toggleSwitch: {
    activeColor: colors.primary.main,
    inactiveColor: colors.border.primary,
  },
};
