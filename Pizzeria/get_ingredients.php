<?php
header("Content-Type: application/json; charset=utf-8");
require "conexion.php";

$sql = "SELECT id, name, price FROM ingredients WHERE available = 1";
$result = $conexion->query($sql);

$datos = [];

while ($fila = $result->fetch_assoc()) {
    $datos[] = $fila;
}

echo json_encode($datos);
?>
