// scriptsH.js

document.addEventListener('DOMContentLoaded', () => {
   renderHistory();
 });
 
 function getFinances() {
   let data = localStorage.getItem('finances');
   if (!data) return { monthlyIncome: 0, creditPurchases: [], oneTimePurchases: [] };
   try {
     const fin = JSON.parse(data);
     fin.creditPurchases = fin.creditPurchases || [];
     fin.oneTimePurchases = fin.oneTimePurchases || [];
     return fin;
   } catch (e) {
     console.error('Error parsing finances:', e);
     return { monthlyIncome: 0, creditPurchases: [], oneTimePurchases: [] };
   }
 }
 
 function renderHistory() {
   const { creditPurchases, oneTimePurchases } = getFinances();
   const container = document.getElementById('historyContainer');
   container.innerHTML = '';
 
   const grouped = {};
   const addToGroup = (purchase, type) => {
     const date = new Date(purchase.date);
     const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
     if (!grouped[key]) grouped[key] = [];
     grouped[key].push({ ...purchase, type });
   };
 
   creditPurchases.forEach(p => addToGroup(p, 'credit'));
   oneTimePurchases.forEach(p => addToGroup(p, 'oneTime'));
 
   const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
 
   months.forEach(monthKey => {
     const [year, month] = monthKey.split('-');
     const monthName = new Date(year, month-1).toLocaleString('default', { month: 'long', year: 'numeric' });
 
     const card = document.createElement('div');
     card.className = 'card mb-4';
     card.innerHTML = `
       <div class="card-header bg-secondary text-white">
         <h5 class="mb-0">${monthName}</h5>
       </div>
       <div class="card-body" id="body-${monthKey}"></div>
     `;
     container.appendChild(card);
 
     const body = card.querySelector(`#body-${monthKey}`);
     grouped[monthKey].forEach(item => {
       if (item.type === 'credit') {
         const monthlyAmount = (item.total / item.installments).toFixed(2);
         body.innerHTML += `
           <div class="mb-2">
             <span class="fw-bold">[Crédito]</span> ${item.name} - $${item.total.toFixed(2)} en ${item.installments} meses (Mensual: $${monthlyAmount})
           </div>
         `;
       } else {
         body.innerHTML += `
           <div class="mb-2">
             <span class="fw-bold">[Única]</span> ${item.name} - $${item.total.toFixed(2)} via ${item.paymentMethod === 'debito' ? item.cardName+' (Débito)' : 'Efectivo'}
           </div>
         `;
       }
     });
   });
 }
 