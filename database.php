<?php
// This class provides a centralized way to get the database connection.
class Database
{
    private static $instance = null;
    private $pdo;
    private $pdo_string = 'sqlite:expenses.db';

    // The constructor is private to prevent direct creation of the object.
    private function __construct()
    {
        try {
            $this->pdo = new PDO($this->pdo_string);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->createTable();
        } catch (PDOException $e) {
            // In a real application, you would log this error.
            die("Database connection failed: " . $e->getMessage());
        }
    }

    // The singleton method provides the single instance of the database connection.
    public static function getInstance()
    {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    // Returns the PDO connection object.
    public function getConnection()
    {
        return $this->pdo;
    }

    // Creates the expenses table if it doesn't exist.
    private function createTable()
    {
        // ADDED: `expense_date` column to store the user-selected date.
        $query = "
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                expense_date TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ";
        try {
            $this->pdo->exec($query);
        } catch (PDOException $e) {
            die("Table creation failed: " . $e->getMessage());
        }
    }
}
