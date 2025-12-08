<?php
// place_order.php
header('Content-Type: application/json; charset=utf-8');

$DB_HOST = '127.0.0.1';
$DB_NAME = 'pizzeria';
$DB_USER = 'root';
$DB_PASS = '';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'JSON inválido']);
    exit;
}

$name = trim($input['customer_name'] ?? '');
$phone = trim($input['customer_phone'] ?? '');
$ingredientIds = $input['ingredients'] ?? [];
$totalCents = intval($input['total_cents'] ?? 0);

if ($name === '' || $phone === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos del cliente']);
    exit;
}

if (!is_array($ingredientIds)) $ingredientIds = [];

try {
    $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $pdo->beginTransaction();

    // Inserta pedido (total en euros)
    $totalEuros = $totalCents / 100.0;
    $stmt = $pdo->prepare("INSERT INTO orders (customer_name, customer_phone, total) VALUES (?, ?, ?)");
    $stmt->execute([$name, $phone, $totalEuros]);
    $orderId = $pdo->lastInsertId();

    // Inserta items con precio actual (por seguridad, recuperar precio desde ingredients)
    if (count($ingredientIds) > 0) {
        $in = str_repeat('?,', count($ingredientIds) - 1) . '?';
        $stmt2 = $pdo->prepare("SELECT id, price FROM ingredients WHERE id IN ($in)");
        $stmt2->execute($ingredientIds);
        $rows = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        $stmtInsertItem = $pdo->prepare("INSERT INTO order_items (order_id, ingredient_id, price) VALUES (?, ?, ?)");
        foreach ($rows as $r) {
            $stmtInsertItem->execute([$orderId, $r['id'], $r['price']]);
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'order_id' => $orderId]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al guardar: ' . $e->getMessage()]);
}
