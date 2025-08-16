<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense Tracker</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>

    <div class="container">
        <header>
            <h1>Expense Tracker</h1>
            <p>A simple way to manage your finances.</p>
        </header>

        <main class="main-content">
            <div class="form-section">
                <div class="form-container">
                    <h2>Add New Expense</h2>
                    <form id="expense-form" novalidate>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <input type="text" id="description" name="description" required>
                            <p id="description-error" class="error-message"></p>
                        </div>
                        <div class="form-group">
                            <label for="amount">Amount (LKR)</label>
                            <input type="number" id="amount" name="amount" required min="0.01" step="0.01">
                            <p id="amount-error" class="error-message"></p>
                        </div>
                        <div class="form-group">
                            <label for="category">Category</label>
                            <select id="category" name="category" required>
                                <option value="">Select a category</option>
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Other">Other</option>
                            </select>
                            <p id="category-error" class="error-message"></p>
                        </div>
                        <div class="form-group">
                            <label for="date">Date of Expense</label>
                            <input type="date" id="date" name="date" required>
                            <p id="date-error" class="error-message"></p>
                        </div>
                        <button type="submit" class="submit-btn">
                            Add Expense
                        </button>
                    </form>
                </div>
            </div>

            <div class="expenses-section">
                <div class="expenses-container">
                    <div class="expenses-header">
                        <h2>Your Expenses</h2>
                        <div class="total-expenses-container">
                            <p class="total-label">Total</p>
                            <p id="total-expenses" class="total-amount">LKR 0.00</p>
                        </div>
                    </div>

                    <div class="filter-controls">
                        <div class="form-group">
                            <label for="category-filter">Filter by Category</label>
                            <select id="category-filter">
                                <option value="">All Categories</option>
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="sort-by">Sort by</label>
                            <select id="sort-by">
                                <option value="date-desc">Date (Newest First)</option>
                                <option value="date-asc">Date (Oldest First)</option>
                                <option value="amount-desc">Amount (High to Low)</option>
                                <option value="amount-asc">Amount (Low to High)</option>
                            </select>
                        </div>
                    </div>

                    <div id="expense-list">
                        <p id="no-expenses" class="no-expenses-message">No expenses added yet.</p>
                    </div>
                </div>
            </div>

            <div class="chart-section">
                <div class="chart-container">
                    <h2>Expense Breakdown</h2>
                    <canvas id="expenseChart"></canvas>
                </div>
            </div>
        </main>
    </div>

    <div id="edit-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Edit Expense</h2>
            <form id="edit-expense-form" novalidate>
                <input type="hidden" id="edit-expense-id" name="id">

                <div class="form-group">
                    <label for="edit-description">Description</label>
                    <input type="text" id="edit-description" name="description" required>
                    <p id="edit-description-error" class="error-message"></p>
                </div>
                <div class="form-group">
                    <label for="edit-amount">Amount (LKR)</label>
                    <input type="number" id="edit-amount" name="amount" required min="0.01" step="0.01">
                    <p id="edit-amount-error" class="error-message"></p>
                </div>
                <div class="form-group">
                    <label for="edit-category">Category</label>
                    <select id="edit-category" name="category" required>
                        <option value="">Select a category</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                    </select>
                    <p id="edit-category-error" class="error-message"></p>
                </div>
                <div class="form-group">
                    <label for="edit-date">Date of Expense</label>
                    <input type="date" id="edit-date" name="date" required>
                    <p id="edit-date-error" class="error-message"></p>
                </div>
                <button type="submit" class="submit-btn">
                    Save Changes
                </button>
            </form>
        </div>
    </div>

    <script src="script.js"></script>
</body>

</html>