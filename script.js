function addItem() {
  const table = document.getElementById("itemsBody");
  const rowCount = table.rows.length + 1;
  const row = document.createElement("tr");
  row.innerHTML = `
    <td style="text-align: center">${rowCount}</td>
    <td contenteditable="true">Item <br><small contenteditable="true"></small></td>
    <td contenteditable="true" style="text-align: center">-</td>
    <td contenteditable="true" style="text-align: center">0.00 Gm.</td>
    <td contenteditable="true" style="text-align: center">0</td>
    <td contenteditable="true" style="text-align: center">3</td>
    <td style="text-align: center" class="total-cell editable">
      <span>0.00</span>
      <button class="edit-btn no-print" onclick="editTotal(this)">✎</button>
    </td>
    <td class="delete-cell no-print"><button onclick="deleteRow(this)">❌</button></td>
  `;
  table.appendChild(row);
  calculateTotals();
}

function deleteRow(button) {
  const row = button.closest("tr");
  row.remove();
  // Update serial numbers after deletion
  updateSerialNumbers();
  calculateTotals();
}

function updateSerialNumbers() {
  const rows = document.querySelectorAll("#itemsBody tr");
  rows.forEach((row, index) => {
    row.cells[0].textContent = index + 1;
  });
}

function calculateTotals() {
  let amountTotal = 0;
  let gstTotal = 0;

  document.querySelectorAll("#itemsBody tr").forEach((row) => {
    const amountCell = row.cells[4]; // Amount is now in column 4 (0-based index)
    const gstRateCell = row.cells[5]; // GST Rate is now in column 5
    const totalSpan = row.querySelector(".total-cell span");

    let amount = parseFloat(amountCell.innerText) || 0;
    const gstRate = parseFloat(gstRateCell.innerText) || 0;
    const gstAmount = (amount * gstRate) / 100;

    const isManual = totalSpan.getAttribute("data-manual") === "true";

    // If manually set, retain the value. If not, recalculate total.
    let total = isManual
      ? parseFloat(totalSpan.textContent) || amount + gstAmount
      : amount + gstAmount;

    if (!isManual) {
      totalSpan.textContent = total.toFixed(2);
    }

    amountTotal += amount;
    gstTotal += gstAmount;
  });

  const cgst = gstTotal / 2;
  const sgst = gstTotal / 2;

  const grossTotal = amountTotal + gstTotal;
  const roundedTotal = Math.round(grossTotal);
  const roundOffAmount = (roundedTotal - grossTotal).toFixed(2);

  const advance = parseFloat(
    document.getElementById("advancePayment")?.value || 0
  );
  const finalAmount = roundedTotal - advance;

  // DOM updates
  document.getElementById(
    "amountTotalFooter"
  ).textContent = `₹ ${amountTotal.toFixed(2)}`;
  document.getElementById(
    "grandTotalFooter"
  ).textContent = `₹ ${roundedTotal.toFixed(2)}`;
  document.getElementById("calcAmount").textContent = amountTotal.toFixed(2);
  document.getElementById("cgst").textContent = cgst.toFixed(2);
  document.getElementById("sgst").textContent = sgst.toFixed(2);
  document.getElementById("grandTotalDisplay").textContent =
    roundedTotal.toFixed(2);
  document.getElementById("roundOffDisplay").textContent = roundOffAmount;
  document.getElementById("finalAmount").textContent = finalAmount.toFixed(2);
  document.getElementById("amountInWords").textContent =
    numberToWords(roundedTotal).toUpperCase() + " ONLY";
}

function editTotal(btn) {
  const span = btn.parentElement.querySelector("span");
  const row = btn.closest("tr");
  const amountCell = row.cells[4]; // Amount is now in column 4
  const gstRate = parseFloat(row.cells[5].innerText) || 0; // GST Rate is now in column 5

  const newTotal = prompt("Enter new total:", span.textContent);
  if (!isNaN(newTotal) && newTotal !== null) {
    const total = parseFloat(newTotal);
    const amount = +(total / (1 + gstRate / 100)).toFixed(3);
    amountCell.innerText = amount;
    span.textContent = total.toFixed(2);
    span.setAttribute("data-manual", "true");
    calculateTotals();
  }
}

// Add this function to format the date
function getCurrentDate() {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const today = new Date();
  const day = today.getDate();
  const month = months[today.getMonth()];
  const year = today.getFullYear();
  return `${day} ${month} ${year}`;
}

function downloadPDF() {
  // Get customer name for filename
  const customerName = (
    document.querySelector('.billed-to-table input[type="text"]')?.value ||
    "invoice"
  ).replace(/[^a-zA-Z0-9]/g, "_");

  const element = document.getElementById("invoice");
  const opt = {
    margin: 0,
    filename: `${customerName}_estimate.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };
  html2pdf().set(opt).from(element).save();
}

function numberToWords(num) {
  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const b = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  function twoDigits(n) {
    return n < 20
      ? a[n]
      : b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
  }

  function threeDigits(n) {
    return n >= 100
      ? a[Math.floor(n / 100)] +
          " hundred " +
          (n % 100 !== 0 ? "and " + twoDigits(n % 100) : "")
      : twoDigits(n);
  }

  if (num === 0) return "zero";

  let result = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor(num % 1000);

  if (crore) result += threeDigits(crore) + " crore ";
  if (lakh) result += threeDigits(lakh) + " lakh ";
  if (thousand) result += threeDigits(thousand) + " thousand ";
  if (hundred) result += threeDigits(hundred);

  return result.trim();
}

document
  .getElementById("advancePayment")
  .addEventListener("input", calculateTotals);
document.getElementById("itemsBody").addEventListener("input", calculateTotals);

// Update the window.onload function to set the date
window.onload = function () {
  // Set current date in the date field - more specific selector
  const dateInputs = document.querySelectorAll(
    '.header-table input[type="text"]'
  );
  if (dateInputs.length >= 2) {
    // Date is the second input
    if (!dateInputs[1].value) {
      // Only set if empty
      dateInputs[1].value = getCurrentDate();
    }
  }

  calculateTotals();
  // Add one empty row by default when page loads
  addItem();
};
document.getElementById("itemsBody").addEventListener("input", (e) => {
  const cell = e.target.closest("td");
  const row = e.target.closest("tr");
  const cellIndex = Array.from(row.cells).indexOf(cell);

  if (cellIndex === 4) {
    // Amount is now in column 4
    const span = row.querySelector(".total-cell span");
    span.removeAttribute("data-manual");
  }

  calculateTotals();
});
