document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "expense-tracker-items";

  // Main form and list elements
  const expenseForm = document.getElementById("expense-form");
  const expenseList = document.getElementById("expense-list");
  const totalExpenses = document.getElementById("total-expenses");

  // Main form input fields
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("category");
  const dateInput = document.getElementById("date");

  // Filter and Sort controls
  const categoryFilter = document.getElementById("category-filter");
  const sortBy = document.getElementById("sort-by");
  const searchExpense = document.getElementById("search-expense");

  const summaryCount = document.getElementById("summary-count");
  const summaryAverage = document.getElementById("summary-average");
  const summaryCategory = document.getElementById("summary-category");

  // Error message paragraphs for main form
  const descriptionError = document.getElementById("description-error");
  const amountError = document.getElementById("amount-error");
  const categoryError = document.getElementById("category-error");
  const dateError = document.getElementById("date-error");

  // Modal and Edit Form elements
  const editModal = document.getElementById("edit-modal");
  const closeBtn = document.querySelector(".close-btn");
  const editForm = document.getElementById("edit-expense-form");
  const editExpenseId = document.getElementById("edit-expense-id");

  // Edit form input fields
  const editDescriptionInput = document.getElementById("edit-description");
  const editAmountInput = document.getElementById("edit-amount");
  const editCategoryInput = document.getElementById("edit-category");
  const editDateInput = document.getElementById("edit-date");

  // Set default date for the main form to today
  dateInput.valueAsDate = new Date();

  let expenseChart = null;
  let allExpenses = loadExpenses();

  const validateField = (field, errorElement, message) => {
    if (!field.value.trim()) {
      errorElement.textContent = message;
      field.classList.add("border-red-500");
      return false;
    }
    errorElement.textContent = "";
    field.classList.remove("border-red-500");
    return true;
  };

  const validateAmount = () => {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
      amountError.textContent = "Please enter a valid amount.";
      amountInput.classList.add("border-red-500");
      return false;
    }
    amountError.textContent = "";
    amountInput.classList.remove("border-red-500");
    return true;
  };

  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const isDescriptionValid = validateField(
      descriptionInput,
      descriptionError,
      "Description is required."
    );
    const isAmountValid = validateAmount();
    const isCategoryValid = validateField(
      categoryInput,
      categoryError,
      "Please select a category."
    );
    const isDateValid = validateField(dateInput, dateError, "Date is required.");

    if (
      !isDescriptionValid ||
      !isAmountValid ||
      !isCategoryValid ||
      !isDateValid
    ) {
      return;
    }

    const newExpense = {
      id: String(Date.now()),
      description: descriptionInput.value.trim(),
      amount: parseFloat(amountInput.value),
      category: categoryInput.value,
      expense_date: dateInput.value,
    };

    allExpenses.unshift(newExpense);
    saveExpenses(allExpenses);

    expenseForm.reset();
    dateInput.valueAsDate = new Date();
    applyFiltersAndSort();
  });

  expenseList.addEventListener("click", (e) => {
    const target = e.target;

    if (target.classList.contains("delete-btn")) {
      const id = target.dataset.id;
      if (confirm("Are you sure you want to delete this expense?")) {
        allExpenses = allExpenses.filter((expense) => expense.id !== id);
        saveExpenses(allExpenses);
        applyFiltersAndSort();
      }
    }

    if (target.classList.contains("edit-btn")) {
      const id = target.dataset.id;
      openEditModal(id);
    }
  });

  categoryFilter.addEventListener("change", applyFiltersAndSort);
  sortBy.addEventListener("change", applyFiltersAndSort);
  searchExpense.addEventListener("input", applyFiltersAndSort);

  closeBtn.addEventListener("click", () => editModal.classList.remove("show"));
  window.addEventListener("click", (e) => {
    if (e.target === editModal) {
      editModal.classList.remove("show");
    }
  });

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = editExpenseId.value;
    const updatedExpense = {
      id,
      description: editDescriptionInput.value.trim(),
      amount: parseFloat(editAmountInput.value),
      category: editCategoryInput.value,
      expense_date: editDateInput.value,
    };

    allExpenses = allExpenses.map((expense) =>
      expense.id === id ? updatedExpense : expense
    );

    saveExpenses(allExpenses);
    editModal.classList.remove("show");
    applyFiltersAndSort();
  });

  function applyFiltersAndSort() {
    let processedExpenses = [...allExpenses];

    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
      processedExpenses = processedExpenses.filter(
        (expense) => expense.category === selectedCategory
      );
    }

    const searchValue = searchExpense.value.trim().toLowerCase();
    if (searchValue) {
      processedExpenses = processedExpenses.filter((expense) =>
        expense.description.toLowerCase().includes(searchValue)
      );
    }

    const sortValue = sortBy.value;
    switch (sortValue) {
      case "date-desc":
        processedExpenses.sort(
          (a, b) => new Date(b.expense_date) - new Date(a.expense_date)
        );
        break;
      case "date-asc":
        processedExpenses.sort(
          (a, b) => new Date(a.expense_date) - new Date(b.expense_date)
        );
        break;
      case "amount-desc":
        processedExpenses.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-asc":
        processedExpenses.sort((a, b) => a.amount - b.amount);
        break;
    }

    renderExpenses(processedExpenses);
    renderSummary(processedExpenses);
    renderChart(processedExpenses);
  }

  const renderSummary = (expenses) => {
    const count = expenses.length;
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const average = count ? total / count : 0;

    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) acc[category] = 0;
      acc[category] += expense.amount;
      return acc;
    }, {});

    let topCategory = "-";
    let topCategoryTotal = 0;
    for (const [category, amount] of Object.entries(categoryTotals)) {
      if (amount > topCategoryTotal) {
        topCategory = category;
        topCategoryTotal = amount;
      }
    }

    summaryCount.textContent = count;
    summaryAverage.textContent = `LKR ${average.toFixed(2)}`;
    summaryCategory.textContent =
      topCategory === "-"
        ? topCategory
        : `${topCategory} (LKR ${topCategoryTotal.toFixed(2)})`;
  };

  function openEditModal(id) {
    const expenseToEdit = allExpenses.find((expense) => expense.id === id);
    if (!expenseToEdit) return;

    editExpenseId.value = expenseToEdit.id;
    editDescriptionInput.value = expenseToEdit.description;
    editAmountInput.value = expenseToEdit.amount;
    editCategoryInput.value = expenseToEdit.category;
    editDateInput.value = expenseToEdit.expense_date;

    editModal.classList.add("show");
  }

  const renderExpenses = (expenses) => {
    expenseList.innerHTML = "";
    let currentTotal = 0;

    if (expenses.length === 0) {
      expenseList.innerHTML =
        '<p class="no-expenses-message">No expenses match your criteria.</p>';
    } else {
      expenses.forEach((expense) => {
        const item = document.createElement("div");
        item.className = "expense-item";
        item.innerHTML = `
            <div>
                <p class="font-semibold text-gray-800">${escapeHTML(
                  expense.description
                )}</p>
                <p class="text-sm text-gray-500">${escapeHTML(
                  expense.category
                )} - <span class="text-xs">${escapeHTML(
          expense.expense_date
        )}</span></p>
            </div>
            <div class="text-right">
                <p class="font-bold text-lg text-red-500">-LKR ${expense.amount.toFixed(
                  2
                )}</p>
                 <div class="expense-actions">
                    <button data-id="${expense.id}" class="edit-btn">Edit</button>
                    <button data-id="${expense.id}" class="delete-btn">Delete</button>
                 </div>
            </div>
        `;
        expenseList.appendChild(item);
        currentTotal += expense.amount;
      });
    }
    totalExpenses.textContent = `LKR ${currentTotal.toFixed(2)}`;
  };

  const renderChart = (expenses) => {
    const ctx = document.getElementById("expenseChart").getContext("2d");

    const categoryTotals = expenses.reduce((acc, expense) => {
      const { category, amount } = expense;
      if (!acc[category]) acc[category] = 0;
      acc[category] += amount;
      return acc;
    }, {});

    const chartLabels = Object.keys(categoryTotals);
    const chartData = Object.values(categoryTotals);

    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Expenses by Category",
            data: chartData,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Spending by Category" },
        },
      },
    });
  };

  function saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }

  function loadExpenses() {
    const rawExpenses = localStorage.getItem(STORAGE_KEY);
    if (!rawExpenses) return [];

    try {
      const parsedExpenses = JSON.parse(rawExpenses);
      return parsedExpenses.map((expense) => ({
        ...expense,
        amount: parseFloat(expense.amount),
      }));
    } catch {
      return [];
    }
  }

  function escapeHTML(str) {
    return String(str).replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        }[tag] || tag)
    );
  }

  applyFiltersAndSort();
});
