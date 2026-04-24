<?php
if ($_POST) {
    $to = 'aleksi2105@yandex.ru';
    $subject = 'Новая заявка';
    $message .= "Телефон: " . htmlspecialchars($_POST['phone']) . "\n";
    $headers = "From: no-reply@your-site.com\r\n";
    mail($to, $subject, $message);
     if (mail($to, $subject, $message, $headers)) {
        echo 'Заявка отправлена! Спасибо.';
    } else {
        echo 'Ошибка отправки. Попробуйте позже.';
    }
}
?>