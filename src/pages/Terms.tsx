import { Box, Container, Stack, Typography } from "@mui/material";
import SectionHeading from "../components/SectionHeading";

export default function Terms() {
    return (
        <Container sx={{ py: { xs: 4, md: 6 }, maxWidth: 900 }}>
            <SectionHeading title="Пользовательское соглашение" align="left" />
            <Box sx={{ mt: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            1. Общие положения
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между администрацией
                            сервиса LEXORA (далее — «Сервис») и пользователем (далее — «Пользователь») при использовании Сервиса.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Используя Сервис, Пользователь соглашается с условиями настоящего Соглашения. Если Пользователь не
                            согласен с условиями Соглашения, он должен прекратить использование Сервиса.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            2. Предмет соглашения
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Сервис LEXORA предоставляет платформу для поиска и подбора профессиональных переводчиков. Сервис
                            позволяет заказчикам находить переводчиков, а переводчикам — находить проекты и заказы.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Сервис не является стороной в отношениях между заказчиком и переводчиком и не несет ответственности за
                            качество выполненных работ.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            3. Регистрация и учетная запись
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Для использования функционала Сервиса Пользователь должен пройти регистрацию, предоставив достоверную
                            информацию о себе.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Пользователь несет ответственность за сохранность своих учетных данных и за все действия, совершенные
                            под его учетной записью.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Администрация Сервиса вправе заблокировать или удалить учетную запись Пользователя в случае нарушения
                            условий настоящего Соглашения.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            4. Обязанности пользователей
                        </Typography>
                        <Typography variant="body1" color="text.secondary" component="div">
                            <Typography component="p" paragraph>
                                Пользователь обязуется:
                            </Typography>
                            <Box component="ul" sx={{ pl: 3, "& li": { mb: 1 } }}>
                                <li>Предоставлять достоверную информацию о себе</li>
                                <li>Не использовать Сервис в незаконных целях</li>
                                <li>Не нарушать права других пользователей</li>
                                <li>Соблюдать конфиденциальность информации других пользователей</li>
                                <li>Не распространять спам и вредоносное программное обеспечение</li>
                            </Box>
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            5. Интеллектуальная собственность
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Все материалы Сервиса, включая дизайн, тексты, графику, логотипы, являются объектами интеллектуальной
                            собственности и защищены законодательством об авторском праве.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Пользователь не вправе копировать, распространять или использовать материалы Сервиса без письменного
                            разрешения администрации.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            6. Ответственность
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Сервис предоставляется «как есть». Администрация не гарантирует бесперебойную работу Сервиса и не несет
                            ответственности за возможные сбои и ошибки.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Администрация не несет ответственности за качество услуг, предоставляемых переводчиками, и за
                            выполнение обязательств между заказчиком и переводчиком.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            7. Изменение условий соглашения
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Администрация вправе вносить изменения в настоящее Соглашение. Изменения вступают в силу с момента
                            публикации новой версии Соглашения на сайте. Продолжение использования Сервиса после внесения изменений
                            означает согласие Пользователя с новыми условиями.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            8. Контактная информация
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            По всем вопросам, связанным с настоящим Соглашением, Пользователь может обращаться по адресу:
                            support@lexora.ru
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Дата последнего обновления: {new Date().toLocaleDateString("ru-RU")}
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </Container>
    );
}

