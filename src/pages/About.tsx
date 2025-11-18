import { Box, Container, Stack, Typography } from "@mui/material";
import SectionHeading from "../components/SectionHeading";

export default function About() {
    return (
        <Container sx={{ py: { xs: 4, md: 6 }, maxWidth: 900 }}>
            <SectionHeading title="О сервисе" align="left" />
            <Box sx={{ mt: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Что такое LEXORA?
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            LEXORA — платформа для поиска профессиональных переводчиков с проверенными профилями и отзывами. Мы
                            помогаем заказчикам находить квалифицированных специалистов для любых задач: от перевода документов до
                            синхронного перевода на встречах.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Для заказчиков
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            На нашей платформе вы можете быстро найти переводчика, который соответствует вашим требованиям. Все
                            специалисты проходят верификацию и имеют подтвержденный опыт работы. Вы можете фильтровать переводчиков по
                            языковым парам, тематикам (медицина, финансы, IT и др.), ставке и опыту работы.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            После выбора переводчика вы можете обсудить детали проекта напрямую в чате, согласовать условия и начать
                            работу. Все заказы оформляются через платформу, что обеспечивает прозрачность и безопасность сделок.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Для переводчиков
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            LEXORA — это возможность найти интересные проекты, работать с проверенными заказчиками и развивать свой
                            профессиональный профиль. Создайте подробный профиль с указанием языковых пар, специализаций и опыта работы.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Получайте заказы от заказчиков, обсуждайте условия в чате и выполняйте работу. Накапливайте отзывы и
                            повышайте свой рейтинг, чтобы привлекать больше клиентов.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Безопасность и качество
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Все переводчики проходят проверку профиля и верификацию. Мы собираем отзывы от заказчиков, чтобы вы могли
                            оценить качество работы специалиста перед началом сотрудничества.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Платформа обеспечивает безопасность сделок и прозрачность взаимодействия между заказчиками и переводчиками.
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </Container>
    );
}

