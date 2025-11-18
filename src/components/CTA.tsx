// src/components/CTA.tsx
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";

export default function CTA() {
  const nav = useNavigate();

  return (
    <Box
      component="section"
      sx={{
        mt: { md: 0 },
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg" disableGutters sx={{ py: { xs: 3, md: 4 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2, md: 3 }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          {/* Текст */}
          <Stack spacing={1} sx={{ maxWidth: 520 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1, textTransform: "uppercase" }}
            >
              Поиск переводчика
            </Typography>

            <Typography variant="h5" fontWeight={800}>
              Готовы найти переводчика под вашу задачу?
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Укажите направление, язык и дедлайн — сервис покажет переводчиков,
              которые подходят по опыту и ставке.
            </Typography>
          </Stack>

          {/* Кнопка */}
          <Stack
            spacing={0.75}
            alignItems={{ xs: "flex-start", md: "flex-end" }}
          >
            <Button
              onClick={() => nav("/search")}
              variant="contained"
              endIcon={
                <Box
                  className="cta-arrow"
                  sx={{ display: "inline-flex", transition: "transform .16s ease" }}
                >
                  <ArrowForwardRoundedIcon fontSize="small" />
                </Box>
              }
              sx={{
                height: 44,
                px: 3,
                fontWeight: 700,
                "&:hover .cta-arrow": {
                  transform: "translateX(3px)",
                },
              }}
            >
              Начать поиск
            </Button>

            <Typography variant="caption" color="text.secondary" textAlign={'center'} width={'100%'}>
              Без лишних действий
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
