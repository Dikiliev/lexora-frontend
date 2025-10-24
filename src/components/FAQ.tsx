import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const QA = [
    { q: "Как выбрать переводчика?", a: "Задайте языковую пару, тематику и бюджет — система отфильтрует подходящих." },
    { q: "Как проверяется качество?", a: "Профили верифицируются тестами и отзывами. Отмечены значком “Проверен”." },
    { q: "Могу ли я опубликовать задачу?", a: "Да, создайте заказ — откликнутся подходящие специалисты." },
];

export default function FAQ() {
    return (
        <Stack spacing={1}>
            {QA.map((i) => (
                <Accordion key={i.q}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight={700}>{i.q}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography color="text.secondary">{i.a}</Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Stack>
    );
}
