document.addEventListener("DOMContentLoaded", () => {
  // Main form and list elements
  const expenseForm = document.getElementById("expense-form");
  const expenseList = document.getElementById("expense-list");
  const totalExpenses = document.getElementById("total-expenses");
  const noExpensesMessage = document.getElementById("no-expenses");

  // Main form input fields
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("category");
  const dateInput = document.getElementById("date");

  // Filter and Sort controls
  const categoryFilter = document.getElementById("category-filter");
  const sortBy = document.getElementById("sort-by");

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

  // --- STATE VARIABLES ---
  let expenseChart = null;
  // Master list to hold all expenses fetched from the server
  let allExpenses = [];

  // --- FORM VALIDATION ---
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

  // --- EVENT LISTENERS ---

  // Listener for adding a new expense
  expenseForm.addEventListener("submit", async (e) => {
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
    const isDateValid = validateField(
      dateInput,
      dateError,
      "Date is required."
    );

    if (
      !isDescriptionValid ||
      !isAmountValid ||
      !isCategoryValid ||
      !isDateValid
    )
      return;

    const formData = new FormData(expenseForm);
    try {
      const response = await fetch("add_expense.php", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        expenseForm.reset();
        dateInput.valueAsDate = new Date();
        descriptionInput.classList.remove("border-red-500");
        amountInput.classList.remove("border-red-500");
        categoryInput.classList.remove("border-red-500");
        dateInput.classList.remove("border-red-500");
        fetchExpenses(); // Re-fetch all data
      } else {
        alert(result.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred.");
    }
  });

  // Combined listener for Edit and Delete buttons on the expense list
  expenseList.addEventListener("click", async (e) => {
    const target = e.target;

    // Handle Delete
    if (target.classList.contains("delete-btn")) {
      const id = target.dataset.id;
      if (confirm("Are you sure you want to delete this expense?")) {
        try {
          const response = await fetch("delete_expense.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${id}`,
          });
          const result = await response.json();
          if (result.success) {
            fetchExpenses(); // Re-fetch all data
          } else {
            alert(result.message || "Failed to delete expense.");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An unexpected error occurred while deleting.");
        }
      }
    }

    // Handle Edit
    if (target.classList.contains("edit-btn")) {
      const id = target.dataset.id;
      openEditModal(id);
    }
  });

  // Listeners for filter and sort dropdowns
  categoryFilter.addEventListener("change", applyFiltersAndSort);
  sortBy.addEventListener("change", applyFiltersAndSort);

  // Listeners to close the edit modal
  closeBtn.addEventListener("click", () => editModal.classList.remove("show"));
  window.addEventListener("click", (e) => {
    if (e.target == editModal) {
      editModal.classList.remove("show");
    }
  });

  // Listener for submitting the changes from the edit form
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(editForm);
    try {
      const response = await fetch("update_expense.php", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        editModal.classList.remove("show"); // Hide modal
        fetchExpenses(); // Re-fetch all data to show changes
      } else {
        alert(result.message || "Failed to update expense.");
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("An unexpected error occurred while updating.");
    }
  });

  // --- DATA PROCESSING AND RENDERING ---

  // Fetches all expense data from the server
  const fetchExpenses = async () => {
    try {
      const response = await fetch("get_expense.php");
      allExpenses = await response.json(); // Store data in the master list
      applyFiltersAndSort(); // Call the central function to process and render
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  // Central function to process and render data based on user controls
  function applyFiltersAndSort() {
    let processedExpenses = [...allExpenses];

    // 1. Apply Category Filter
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
      processedExpenses = processedExpenses.filter(
        (expense) => expense.category === selectedCategory
      );
    }

    // 2. Apply Sorting
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
        processedExpenses.sort((a, b) => a.amount - a.amount);
        break;
    }

    // 3. Render the processed data to the list and chart
    renderExpenses(processedExpenses);
    renderChart(processedExpenses);
  }

  // Opens and populates the edit modal with the correct expense data
  function openEditModal(id) {
    const expenseToEdit = allExpenses.find((expense) => expense.id == id);
    if (!expenseToEdit) return;

    // Populate the form fields in the modal
    editExpenseId.value = expenseToEdit.id;
    editDescriptionInput.value = expenseToEdit.description;
    editAmountInput.value = expenseToEdit.amount;
    editCategoryInput.value = expenseToEdit.category;
    editDateInput.value = expenseToEdit.expense_date;

    editModal.classList.add("show");
  }

  // Renders the list of expenses in the UI
  const renderExpenses = (expenses) => {
    expenseList.innerHTML = "";
    let currentTotal = 0;

    if (expenses.length === 0) {
      expenseList.innerHTML =
        '<p class="no-expenses-message">No expenses match your criteria.</p>';
    } else {
      expenses.forEach((expense) => {
        const item = document.createElement("div");
        item.className =
          "expense-item flex justify-between items-center p-4 border-b border-gray-200";
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
                <p class="font-bold text-lg text-red-500">-LKR ${parseFloat(
                  expense.amount
                ).toFixed(2)}</p>
                 <div class="expense-actions">
                    <button data-id="${
                      expense.id
                    }" class="edit-btn text-xs text-gray-400 hover:text-blue-600 transition-colors">Edit</button>
                    <button data-id="${
                      expense.id
                    }" class="delete-btn text-xs text-gray-400 hover:text-red-600 transition-colors">Delete</button>
                 </div>
            </div>
        `;
        expenseList.appendChild(item);
        currentTotal += parseFloat(expense.amount);
      });
    }
    totalExpenses.textContent = `LKR ${currentTotal.toFixed(2)}`;
  };

  // Renders the pie chart based on the provided expenses
  const renderChart = (expenses) => {
    const ctx = document.getElementById("expenseChart").getContext("2d");

    const categoryTotals = expenses.reduce((acc, expense) => {
      const { category, amount } = expense;
      if (!acc[category]) acc[category] = 0;
      acc[category] += parseFloat(amount);
      return acc;
    }, {});

    const chartLabels = Object.keys(categoryTotals);
    const chartData = Object.values(categoryTotals);

    if (expenseChart) expenseChart.destroy(); // Destroy old chart before drawing new one

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

  // --- UTILITY FUNCTION ---
  function escapeHTML(str) {
    return str.replace(
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

  // --- INITIAL LOAD ---
  fetchExpenses();
});
