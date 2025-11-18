import { Box, Container, Stack, Typography } from "@mui/material";
import SectionHeading from "../components/SectionHeading";

export default function Privacy() {
    return (
        <Container sx={{ py: { xs: 4, md: 6 }, maxWidth: 900 }}>
            <SectionHeading title="Политика конфиденциальности" align="left" />
            <Box sx={{ mt: 4 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            1. Общие положения
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты
                            персональных данных пользователей сервиса LEXORA (далее — «Сервис»).
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Используя Сервис, Пользователь соглашается с условиями настоящей Политики и дает согласие на обработку
                            своих персональных данных в соответствии с условиями, изложенными ниже.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            2. Персональные данные, которые мы собираем
                        </Typography>
                        <Typography variant="body1" color="text.secondary" component="div">
                            <Typography component="p" paragraph>
                                При регистрации и использовании Сервиса мы собираем следующие данные:
                            </Typography>
                            <Box component="ul" sx={{ pl: 3, "& li": { mb: 1 } }}>
                                <li>Имя и фамилия</li>
                                <li>Адрес электронной почты</li>
                                <li>Номер телефона (при указании)</li>
                                <li>Информация о профиле (для переводчиков: языки, специализации, опыт работы)</li>
                                <li>Данные о взаимодействии с Сервисом (история поиска, сообщения в чатах)</li>
                                <li>Технические данные (IP-адрес, тип браузера, информация об устройстве)</li>
                            </Box>
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            3. Цели обработки персональных данных
                        </Typography>
                        <Typography variant="body1" color="text.secondary" component="div">
                            <Typography component="p" paragraph>
                                Персональные данные обрабатываются в следующих целях:
                            </Typography>
                            <Box component="ul" sx={{ pl: 3, "& li": { mb: 1 } }}>
                                <li>Предоставление доступа к функционалу Сервиса</li>
                                <li>Организация взаимодействия между заказчиками и переводчиками</li>
                                <li>Улучшение качества Сервиса и разработка новых функций</li>
                                <li>Отправка уведомлений и информационных сообщений</li>
                                <li>Обеспечение безопасности и предотвращение мошенничества</li>
                                <li>Соблюдение требований законодательства</li>
                            </Box>
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            4. Способы обработки персональных данных
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Обработка персональных данных осуществляется с использованием средств автоматизации и без использования
                            таких средств, включая сбор, запись, систематизацию, накопление, хранение, уточнение, извлечение,
                            использование, передачу, обезличивание, блокирование, удаление, уничтожение персональных данных.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Персональные данные хранятся в защищенных базах данных и обрабатываются в соответствии с требованиями
                            законодательства о защите персональных данных.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            5. Передача персональных данных третьим лицам
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Мы не передаем персональные данные третьим лицам, за исключением следующих случаев:
                        </Typography>
                        <Box component="ul" sx={{ pl: 3, "& li": { mb: 1 } }}>
                            <li>Пользователь дал согласие на такие действия</li>
                            <li>Передача необходима для предоставления услуг Сервиса (например, другим пользователям в рамках
                                взаимодействия)</li>
                            <li>Передача предусмотрена законодательством</li>
                            <li>Передача необходима для защиты прав и законных интересов Сервиса</li>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            6. Защита персональных данных
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Мы применяем технические и организационные меры для защиты персональных данных от неправомерного доступа,
                            уничтожения, изменения, блокирования, копирования, предоставления, распространения, а также от иных
                            неправомерных действий.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            К таким мерам относятся: шифрование данных, использование защищенных протоколов передачи данных,
                            ограничение доступа к персональным данным, регулярное обновление систем безопасности.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            7. Права пользователей
                        </Typography>
                        <Typography variant="body1" color="text.secondary" component="div">
                            <Typography component="p" paragraph>
                                Пользователь имеет право:
                            </Typography>
                            <Box component="ul" sx={{ pl: 3, "& li": { mb: 1 } }}>
                                <li>Получать информацию о своих персональных данных</li>
                                <li>Требовать уточнения, блокирования или уничтожения персональных данных</li>
                                <li>Отозвать согласие на обработку персональных данных</li>
                                <li>Обжаловать действия или бездействие администрации Сервиса</li>
                            </Box>
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            8. Cookies и аналогичные технологии
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Сервис использует cookies и аналогичные технологии для улучшения работы Сервиса, персонализации
                            контента и анализа использования Сервиса.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Пользователь может настроить свой браузер для отказа от cookies, однако это может ограничить
                            функциональность Сервиса.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            9. Изменение политики конфиденциальности
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Администрация вправе вносить изменения в настоящую Политику. Изменения вступают в силу с момента
                            публикации новой версии Политики на сайте. Рекомендуем периодически знакомиться с актуальной версией
                            Политики.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            10. Контактная информация
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            По всем вопросам, связанным с обработкой персональных данных, Пользователь может обращаться по адресу:
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

