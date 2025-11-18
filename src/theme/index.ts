import {alpha, createTheme, type ThemeOptions} from "@mui/material/styles";
import {BASE_BORDER_RADIUS, calculateBorderRadius} from "./utils";

const COLORS = {
    primary: "#FF4D2E",
    backgroundDefault: "#FFFFFF",
    backgroundPaper: "#FFFFFF",
    divider: "#E6E8EC",
    textPrimary: "#0F172A",
    textSecondary: "rgba(15,23,42,.64)",
} as const;

const palette: ThemeOptions["palette"] = {
    mode: "light",
    primary: { main: COLORS.primary },
    background: {
        default: COLORS.backgroundDefault,
        paper: COLORS.backgroundPaper,
    },
    divider: COLORS.divider,
    text: {
        primary: COLORS.textPrimary,
        secondary: COLORS.textSecondary,
    },
};

const shape: ThemeOptions["shape"] = {
    borderRadius: BASE_BORDER_RADIUS,
};

const typography: ThemeOptions["typography"] = {
    fontFamily: 'Inter, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, system-ui, -apple-system',
    h1: {
        fontWeight: 800,
        letterSpacing: -0.8,
        fontSize: "clamp(2rem, 4vw, 3.2rem)",
        lineHeight: 1.1,
    },
    h2: {
        fontWeight: 800,
        letterSpacing: -0.4,
        fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
    },
    button: {
        textTransform: "none",
        fontWeight: 700,
    },
};

const components: NonNullable<ThemeOptions["components"]> = {
    MuiCssBaseline: {
        styleOverrides: {
            body: {
                backgroundColor: COLORS.backgroundDefault,
            },
            html: {
                scrollBehavior: "smooth",
            },
        },
    },
    MuiPaper: {
        defaultProps: {
            elevation: 0,
        },
        styleOverrides: {
            root: {
                borderRadius: calculateBorderRadius(2),
                border: "1px solid",
                borderColor: COLORS.divider,
            },
        },
    },
    MuiLink: {
        defaultProps: {
            underline: "hover",
            color: "inherit",
        },
        styleOverrides: {
            root: {
                textDecoration: "none",
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                backgroundColor: COLORS.backgroundPaper,
                border: `1px solid ${COLORS.divider}`,
                boxShadow: "0 6px 18px rgba(10,11,13,.04)",
                borderRadius: calculateBorderRadius(2),
                transition: "transform .12s ease, box-shadow .12s ease, border-color .12s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 28px rgba(10,11,13,.08)",
                    borderColor: alpha(COLORS.primary, 0.25),
                },
            },
        },
    },
    MuiButton: {
        defaultProps: {
            disableElevation: true,
        },
        styleOverrides: {
            root: {
                borderRadius: calculateBorderRadius(1),
                height: 44,
                paddingInline: 16,
            },
            containedPrimary: {
                backgroundColor: COLORS.primary,
                ":hover": {
                    backgroundColor: "#E74628",
                },
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                borderRadius: calculateBorderRadius(999),
                border: `1px solid ${COLORS.divider}`,
                backgroundColor: COLORS.backgroundPaper,
            },
            colorPrimary: {
                backgroundColor: alpha(COLORS.primary, 0.10),
                borderColor: alpha(COLORS.primary, 0.2),
            },
        },
    },
    MuiAppBar: {
        defaultProps: {
            color: "default",
            elevation: 0,
        },
        styleOverrides: {
            colorDefault: {
                backdropFilter: "blur(8px)",
            },
        },
    },
};

export const themeOptions: ThemeOptions = {
    palette,
    shape,
    typography,
    components,
};

export default createTheme(themeOptions);
