import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../utils/api";
import type { SpecializationOption } from "../pages/translator-settings/types";

const DomainsPanel = () => {
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    request<{ results?: SpecializationOption[] } | SpecializationOption[]>("/specializations/")
      .then((response) => {
        if (!isMounted) return;
        const list = Array.isArray(response) ? response : response.results ?? [];
        setSpecializations(list);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setSpecializations([]);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (specializationId: number) => {
    navigate({
      pathname: "/search",
      search: `?spec=${specializationId}`,
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
        {!loading && specializations.map((spec) => (
          <Chip
            key={spec.id}
            label={spec.title}
            onClick={() => handleNavigate(spec.id)}
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
