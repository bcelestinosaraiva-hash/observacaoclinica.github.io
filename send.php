<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $objetivo = $_POST['objetivo'];
    $mensagem = $_POST['mensagem'];

    $to = "observacaoclinic@gmail.com";
    $subject = "Mensagem do formulário: " . $objetivo;
    $body = "Email: $email\n\nMensagem:\n$mensagem";
    $headers = "From: $email";

    if (mail($to, $subject, $body, $headers)) {
        echo "Mensagem enviada com sucesso!";
    } else {
        echo "Erro ao enviar. Tente novamente.";
    }
}
?>
