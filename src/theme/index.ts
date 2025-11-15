// ... твои импорты и палитра как было
import {alpha, createTheme, type PaletteOptions} from "@mui/material/styles";

const primary = "#FF4D2E";
const bg = "#fff";

const PALETTE: PaletteOptions = {
    mode: "light",
    primary: { main: primary },
    background: { default: bg, paper: "#FFFFFF" },
    divider: "#E6E8EC",
    text: { primary: "#0F172A", secondary: "rgba(15,23,42,.64)" },
}

export default createTheme({
    palette: PALETTE,
    shape: { borderRadius: 14 },
    typography: {
        fontFamily:
            'Inter, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, system-ui, -apple-system',
        h1: { fontWeight: 800, letterSpacing: -0.8, fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.1 },
        h2: { fontWeight: 800, letterSpacing: -0.4, fontSize: "clamp(1.6rem, 3vw, 2.2rem)" },
        button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
        MuiCssBaseline: { styleOverrides: { body: { backgroundColor: bg } } },

        MuiPaper: {
            defaultProps: {
                elevation: 0
            },
            styleOverrides: {
                root: {
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                }
            }
        },

        // ссылки без подчёркивания по умолчанию
        MuiLink: {
            defaultProps: { underline: "hover", color: "inherit" },
            styleOverrides: { root: { textDecoration: "none" } },
        },

        // карточки — белая подложка, граница и ховер-подъём
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: "#fff",
                    border: "1px solid #E6E8EC",
                    boxShadow: "0 6px 18px rgba(10,11,13,.04)",
                    borderRadius: 16,
                    transition: "transform .12s ease, box-shadow .12s ease, border-color .12s ease",
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 28px rgba(10,11,13,.08)",
                        borderColor: alpha(primary, 0.25),
                    },
                },
            },
        },

        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { borderRadius: 12, height: 44, paddingInline: 16 },
                containedPrimary: { backgroundColor: primary, ":hover": { backgroundColor: "#E74628" } },
            },
        },

        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 999, border: "1px solid #E6E8EC", backgroundColor: "#fff" },
                colorPrimary: { backgroundColor: alpha(primary, 0.10), borderColor: alpha(primary, 0.2) },
            },
        },

        MuiAppBar: {
            defaultProps: { color: "default", elevation: 0 },
            styleOverrides: {
                colorDefault: {
                    backdropFilter: "blur(8px)",
                },
            },
        },
    },
});
