import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";

const DOMAINS = [
  "Медицина",
  "Финансы",
  "Юриспруденция",
  "IT",
  "Маркетинг",
  "Техника",
  "Игры",
  "Наука",
];

const DomainsPanel = () => {
  const navigate = useNavigate();

  const handleNavigate = (domain: string) => {
    navigate({
      pathname: "/search",
      search: `?spec=${encodeURIComponent(domain.toLowerCase())}`,
    });
  };

  return (
    <Paper
      sx={{
        p: { xs: 2.5, md: 3 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={1.5}
      >
        <Stack spacing={0.5}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1, textTransform: "uppercase" }}
          >
            Тематики запросов
          </Typography>
          <Typography variant="h6">Подберите переводчика по профилю</Typography>
          <Typography variant="body2" color="text.secondary">
            Нажмите на тематику — сразу увидите переводчиков с нужным опытом.
          </Typography>
        </Stack>

        <Button
          variant="text"
          size="small"
          endIcon={<ArrowForwardRoundedIcon fontSize="small" />}
          onClick={() => navigate("/search")}
          sx={{
            mt: { xs: 0.5, md: 0 },
            alignSelf: { xs: "flex-start", md: "center" },
            textTransform: "none",
          }}
        >
          Открыть расширенный поиск
        </Button>
      </Stack>

      <Box
        sx={{
          mt: 0.5,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {DOMAINS.map((domain) => (
          <Chip
            key={domain}
            label={domain}
            onClick={() => handleNavigate(domain)}
            clickable
            sx={{
              borderRadius: 999,
              px: 1.2,
              height: 32,
              fontSize: 13,
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(255,77,46,0.04)",
              },
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default DomainsPanel;
