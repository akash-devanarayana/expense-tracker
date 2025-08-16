<?php
require 'database.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Basic server-side validation including the expense ID
    if (empty($_POST['id']) || empty($_POST['description']) || empty($_POST['amount']) || empty($_POST['category']) || empty($_POST['date'])) {
        $response['message'] = 'All fields are required.';
        echo json_encode($response);
        exit;
    }

    if (!is_numeric($_POST['amount']) || $_POST['amount'] <= 0) {
        $response['message'] = 'Please enter a valid amount.';
        echo json_encode($response);
        exit;
    }

    // Sanitize and validate all inputs
    $id = filter_var($_POST['id'], FILTER_VALIDATE_INT);
    $description = filter_var($_POST['description'], FILTER_SANITIZE_STRING);
    $amount = filter_var($_POST['amount'], FILTER_VALIDATE_FLOAT);
    $category = filter_var($_POST['category'], FILTER_SANITIZE_STRING);
    $expense_date = filter_var($_POST['date'], FILTER_SANITIZE_STRING);

    if ($id === false) {
        $response['message'] = 'Invalid Expense ID.';
        echo json_encode($response);
        exit;
    }

    try {
        $db = Database::getInstance()->getConnection();
        // The SQL UPDATE statement
        $stmt = $db->prepare(
            "UPDATE expenses SET description = :description, amount = :amount, category = :category, expense_date = :expense_date WHERE id = :id"
        );

        // Bind all parameters
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':expense_date', $expense_date);

        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Expense updated successfully!';
        } else {
            $response['message'] = 'Failed to update expense.';
        }
    } catch (PDOException $e) {
        $response['message'] = 'Database error: ' . $e->getMessage();
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
