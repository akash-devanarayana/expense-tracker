<?php
require 'database.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
    $id = filter_var($_POST['id'], FILTER_VALIDATE_INT);

    if ($id === false) {
        $response['message'] = 'Invalid ID.';
        echo json_encode($response);
        exit;
    }

    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("DELETE FROM expenses WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                $response['success'] = true;
                $response['message'] = 'Expense deleted successfully.';
            } else {
                $response['message'] = 'Expense not found.';
            }
        } else {
            $response['message'] = 'Failed to delete expense.';
        }
    } catch (PDOException $e) {
        $response['message'] = 'Database error: ' . $e->getMessage();
    }
} else {
    $response['message'] = 'Invalid request.';
}

echo json_encode($response);
