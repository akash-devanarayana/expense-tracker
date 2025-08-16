<?php
require 'database.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // UPDATED: Added 'date' to the validation check
    if (empty($_POST['description']) || empty($_POST['amount']) || empty($_POST['category']) || empty($_POST['date'])) {
        $response['message'] = 'All fields are required.';
        echo json_encode($response);
        exit;
    }

    if (!is_numeric($_POST['amount']) || $_POST['amount'] <= 0) {
        $response['message'] = 'Please enter a valid amount.';
        echo json_encode($response);
        exit;
    }

    $description = filter_var($_POST['description'], FILTER_SANITIZE_STRING);
    $amount = filter_var($_POST['amount'], FILTER_VALIDATE_FLOAT);
    $category = filter_var($_POST['category'], FILTER_SANITIZE_STRING);
    // ADDED: Sanitize the new date input
    $expense_date = filter_var($_POST['date'], FILTER_SANITIZE_STRING);


    try {
        $db = Database::getInstance()->getConnection();
        // UPDATED: SQL query to insert the new `expense_date` column
        $stmt = $db->prepare("INSERT INTO expenses (description, amount, category, expense_date) VALUES (:description, :amount, :category, :expense_date)");

        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':category', $category);
        // ADDED: Bind the new date parameter
        $stmt->bindParam(':expense_date', $expense_date);


        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Expense added successfully!';
        } else {
            $response['message'] = 'Failed to add expense.';
        }
    } catch (PDOException $e) {
        // In production, log the error instead of echoing it
        $response['message'] = 'Database error: ' . $e->getMessage();
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);