<?php
require 'database.php';

header('Content-Type: application/json');

try {
    $db = Database::getInstance()->getConnection();
    // UPDATED: Select the new `expense_date` column and order by it
    $stmt = $db->query("SELECT id, description, amount, category, expense_date FROM expenses ORDER BY expense_date DESC");
    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($expenses);
} catch (PDOException $e) {
    // Return an empty array or an error object in case of failure
    echo json_encode(['error' => 'Could not fetch expenses: ' . $e->getMessage()]);
}