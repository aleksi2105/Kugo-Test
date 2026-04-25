<?php
// Разрешаем только POST-запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}
 
// Получаем и очищаем телефон
$phone = isset($_POST['phone']) ? trim(htmlspecialchars($_POST['phone'])) : '';
 
if (empty($phone)) {
    http_response_code(400);
    exit('Телефон не передан');
}
 
$to      = 'aleksi2105@yandex.ru';
$subject = '=?UTF-8?B?' . base64_encode('Новая заявка с сайта') . '?=';
$message = "Новая заявка с сайта\n\nТелефон: " . $phone . "\n";
$headers = implode("\r\n", [
    'From: no-reply@' . $_SERVER['HTTP_HOST'],
    'Reply-To: no-reply@' . $_SERVER['HTTP_HOST'],
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    'X-Mailer: PHP/' . phpversion(),
]);
 
// base64 для тела — гарантирует корректную кириллицу
$message = base64_encode($message);
 
if (mail($to, $subject, $message, $headers)) {
    http_response_code(200);
    echo 'ok';
} else {
    http_response_code(500);
    echo 'Ошибка отправки';
}