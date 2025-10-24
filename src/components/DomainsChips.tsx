import { observer } from "mobx-react-lite";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { DOMAINS } from "../utils/constants";
import { filterStore } from "../stores/filterStore";

const DomainsChips = observer(() => {
    return (
        <Stack spacing={1.5}>
            <Typography variant="overline" color="text.secondary">Популярные домены</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {DOMAINS.map((d) => (
                    <Chip
                        key={d}
                        label={d}
                        onClick={() => filterStore.toggleCategory(d)}
                        color={filterStore.categories.includes(d) ? "primary" : "default"}
                        sx={{ borderRadius: 999 }}
                    />
                ))}
            </Box>
        </Stack>
    );
});

export default DomainsChips;
