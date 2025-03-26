let finances = {
   monthlyIncome: 0,
   creditPurchases: [],
   oneTimePurchases: []
};

document.addEventListener('DOMContentLoaded', () => {
   loadData();
   document.getElementById('addCreditPurchase').addEventListener('click', addCreditPurchase);
   document.getElementById('addOneTimePurchase').addEventListener('click', addOneTimePurchase);
   document.getElementById('creditList').addEventListener('click', handleCreditActions);
   document.getElementById('oneTimeList').addEventListener('click', handleOneTimeActions);
});

function loadData() {
   const saved = localStorage.getItem('finances');
   if (saved) {
      finances = JSON.parse(saved);
      if (!finances.creditPurchases) finances.creditPurchases = [];
      if (!finances.oneTimePurchases) finances.oneTimePurchases = [];
   }
   finances.monthlyIncome = finances.monthlyIncome || 0;
   updateUI();
}

function updateIncome() {
   const newIncome = parseFloat(document.getElementById('newIncome').value);
   if (isNaN(newIncome) || newIncome <= 0) {
      alert('Ingresa un monto válido mayor a 0');
      return;
   }
   finances.monthlyIncome = newIncome;
   saveData();
   updateUI();

   // Cerrar el modal
   const modal = bootstrap.Modal.getInstance(document.getElementById('incomeModal'));
   modal.hide();
}

function saveData() {
   localStorage.setItem('finances', JSON.stringify(finances));
}

function addCreditPurchase() {
   const purchase = {
      name: document.getElementById('purchaseName').value,
      total: parseFloat(document.getElementById('purchaseAmount').value),
      installments: parseInt(document.getElementById('installments').value),
      paid: 0,
      paymentMethod: 'credito',
      cardName: document.getElementById('creditCardName').value,
      date: new Date()
   };

   if (!validatePurchase(purchase, true)) return;

   finances.creditPurchases.push(purchase);
   saveData();
   updateUI();
   clearCreditForm();
}

function addOneTimePurchase() {
   const paymentMethod = document.getElementById('oneTimePaymentMethod').value;
   const cardName = paymentMethod === 'debito' ?
      document.getElementById('oneTimeCardName').value : null;

   const purchase = {
      name: document.getElementById('oneTimeName').value,
      total: parseFloat(document.getElementById('oneTimeAmount').value),
      paymentMethod: paymentMethod,
      cardName: cardName,
      date: new Date()
   };

   if (!validatePurchase(purchase, false)) return;

   finances.oneTimePurchases.push(purchase);
   saveData();
   updateUI();
   clearOneTimeForm();
}

function validatePurchase(purchase, isCredit) {
   if (!purchase.name || isNaN(purchase.total) || purchase.total <= 0) {
      alert('Nombre y monto son requeridos');
      return false;
   }
   if (isCredit) {
      if (!purchase.cardName) {
         alert('Debes ingresar el nombre de la tarjeta de crédito');
         return false;
      }
      if (isNaN(purchase.installments) || purchase.installments < 1) {
         alert('Número de meses debe ser mayor a 0');
         return false;
      }
   } else {
      if (!purchase.paymentMethod) {
         alert('Selecciona un método de pago');
         return false;
      }
      if (purchase.paymentMethod === 'debito' && !purchase.cardName) {
         alert('Debes ingresar el nombre de la tarjeta de débito');
         return false;
      }
   }
   return true;
}

document.getElementById('oneTimePaymentMethod').addEventListener('change', function (e) {
   document.getElementById('oneTimeCardNameContainer').style.display =
      (e.target.value === 'debito') ? 'block' : 'none';
});

function clearCreditForm() {
   document.getElementById('purchaseName').value = '';
   document.getElementById('purchaseAmount').value = '';
   document.getElementById('installments').value = '';
}

function clearOneTimeForm() {
   document.getElementById('oneTimeName').value = '';
   document.getElementById('oneTimeAmount').value = '';
}

function calculateTotalExpenses() {
   const creditMonthly = (finances.creditPurchases || []).reduce((total, credit) => {
      return total + (credit.total / credit.installments);
   }, 0);

   const oneTimeTotal = (finances.oneTimePurchases || []).reduce((total, purchase) => {
      return total + (purchase.total || 0);
   }, 0);

   return creditMonthly + oneTimeTotal;
}

function updateUI() {
   document.getElementById('incomeAmount').textContent = `${finances.monthlyIncome.toLocaleString()}`;

   const totalExpenses = calculateTotalExpenses();
   document.getElementById('totalExpenses').textContent = totalExpenses.toFixed(2);

   const progress = (totalExpenses / finances.monthlyIncome) * 100;
   const progressBar = document.getElementById('progressBar');
   progressBar.style.width = `${progress}%`;
   progressBar.textContent = `${progress.toFixed(1)}%`;

   const remaining = finances.monthlyIncome - totalExpenses;
   document.getElementById('remainingMoney').textContent = remaining.toFixed(2);

   renderCreditList();
   renderOneTimeList();
}

function renderCreditList() {
   creditList.innerHTML = finances.creditPurchases.map((credit, index) => `
       <div class="card credit-card shadow-sm mb-3">
           <div class="card-body">
               <div class="d-flex justify-content-between align-items-center mb-2">
                   <h5 class="card-title mb-0">${credit.name}</h5>
                   <div class="d-flex align-items-center gap-2">
                       <span class="method-badge credito-badge">
                           ${credit.cardName} (Crédito)
                       </span>
                       <button class="btn btn-sm btn-danger" data-index="${index}" data-type="credit">×</button>
                   </div>
               </div>
               
               <div class="d-flex justify-content-between mb-2">
                   <span>Pagos:</span>
                   <span>${credit.paid}/${credit.installments}</span>
               </div>
               
               <div class="d-flex justify-content-between mb-2">
                   <span>Mensual:</span>
                   <span>$${(credit.total / credit.installments).toFixed(2)}</span>
               </div>
               
               <div class="progress payment-progress mb-2">
                   <div class="progress-bar" 
                        style="width: ${(credit.paid / credit.installments) * 100}%">
                   </div>
               </div>
               
               <button data-index="${index}" 
                       class="btn btn-sm ${credit.paid < credit.installments ? 'btn-primary' : 'btn-success'} w-100 pay-button">
                   ${credit.paid < credit.installments ? 'Marcar pago' : 'Completado'}
               </button>
           </div>
       </div>
   `).join('');
}

function renderOneTimeList() {
   oneTimeList.innerHTML = finances.oneTimePurchases.map((purchase, index) => `
       <div class="card one-time-card shadow-sm mb-3">
           <div class="card-body">
               <div class="d-flex justify-content-between align-items-center">
                   <div>
                       <h5 class="card-title mb-1">${purchase.name}</h5>
                       <span class="method-badge ${purchase.paymentMethod === 'debito' ? 
                           'debito-badge' : 'efectivo-badge'}">
                           ${purchase.paymentMethod === 'debito' ? 
                            `${purchase.cardName} (Débito)` : 'Efectivo'}
                       </span>
                   </div>
                   <button class="btn btn-sm btn-danger" data-index="${index}" data-type="oneTime">×</button>
               </div>
               <span class="fw-bold">$${purchase.total.toFixed(2)}</span>
           </div>
       </div>
   `).join('');
}

function handleCreditActions(event) {
   if (event.target.classList.contains('pay-button')) {
      const index = event.target.dataset.index;
      payInstallment(index);
   }
   if (event.target.classList.contains('btn-danger')) {
      const index = event.target.dataset.index;
      deletePurchase(index, 'credit');
   }
}

function handleOneTimeActions(event) {
   if (event.target.classList.contains('btn-danger')) {
      const index = event.target.dataset.index;
      deletePurchase(index, 'oneTime');
   }
}

function payInstallment(index) {
   if (finances.creditPurchases[index].paid < finances.creditPurchases[index].installments) {
      finances.creditPurchases[index].paid++;
      saveData();
      updateUI();
   }
}

function deletePurchase(index, type) {
   if (type === 'credit') {
      finances.creditPurchases.splice(index, 1);
   } else {
      finances.oneTimePurchases.splice(index, 1);
   }
   saveData();
   updateUI();
}