/* Bills v1.0.9275 — script.js
   Features:
   - Searchable dropdowns for clients and products (inline phone/unit inputs)
   - Add missing client/product inline
   - Tax editor, tax-included toggle, discount %, other tax %, payment mode, paid/remaining
   - WhatsApp share: choose Text or Image (image rendered with html2canvas)
   - XLSX import and export (clients and inventory)
   - Real invoice file download (PDF-like HTML -> PNG, and CSV as fallback)
   - Edit Client / Edit Product dialogs
   - View Reports opens basic report card
*/

/* ---------- Sample Data ---------- */
let invoices = [
  {
    id: 'INV-001',
    client: 'Acme Corp',
    clientId: 'acme',
    clientPhone: '+91 9876543210',
    date: '2025-09-01',
    amount: 25000 * 1.18, // with tax
    status: 'paid',
    items: [{ description: 'Web Development', quantity: 1, rate: 25000, unit: 'service' }],
    discountPct: 0,
    otherTaxPct: 0,
    taxPct: 18,
    taxIncluded: false,
    paymentMode: 'UPI',
    amountPaid: 29500
  },
  {
    id: 'INV-002',
    client: 'Tech Solutions',
    clientId: 'tech',
    clientPhone: '+91 9876543211',
    date: '2025-08-28',
    amount: 18500 * 1.18,
    status: 'pending',
    items: [{ description: 'UI/UX Design', quantity: 1, rate: 18500, unit: 'service' }],
    discountPct: 0,
    otherTaxPct: 0,
    taxPct: 18,
    taxIncluded: false,
    paymentMode: 'Bank Transfer',
    amountPaid: 0
  },
  {
    id: 'INV-003',
    client: 'Digital Agency',
    clientId: 'digital',
    clientPhone: '+91 9876543212',
    date: '2025-08-25',
    amount: 32000 * 1.18,
    status: 'overdue',
    items: [{ description: 'Mobile App Development', quantity: 1, rate: 32000, unit: 'service' }],
    discountPct: 0,
    otherTaxPct: 0,
    taxPct: 18,
    taxIncluded: false,
    paymentMode: 'Cash',
    amountPaid: 0
  }
];

let products = [
  { id: 'PRD-001', name: 'Website Development Package', price: 25000, stock: 10, unit: 'service', category: 'Services' },
  { id: 'PRD-002', name: 'Mobile App Development', price: 45000, stock: 5, unit: 'service', category: 'Services' },
  { id: 'PRD-003', name: 'Logo Design', price: 5000, stock: 0, unit: 'pcs', category: 'Design' },
  { id: 'PRD-004', name: 'SEO Optimization', price: 12000, stock: 3, unit: 'service', category: 'Marketing' }
];

let clients = [
  { id: 'acme', name: 'Acme Corp', email: 'contact@acme.com', phone: '+91 9876543210', address: '123 Business Street, Mumbai' },
  { id: 'tech', name: 'Tech Solutions', email: 'info@techsolutions.com', phone: '+91 9876543211', address: '456 Tech Park, Bangalore' },
  { id: 'digital', name: 'Digital Agency', email: 'hello@digitalagency.com', phone: '+91 9876543212', address: '789 Digital Hub, Delhi' }
];

let businessSettings = {
  name: 'Your Business Name',
  email: 'business@example.com',
  phone: '+91 9876543210',
  gst: '29ABCDE1234F1Z5',
  website: 'www.yourbusiness.com',
  address: '123 Business Street, City, State 12345',
  logo: null,
  version: '1.0.9275'
};

let currentInvoiceId = null;

/* ---------- Utilities ---------- */
function formatCurrency(amount) {
  const val = isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(Math.round(val));
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}
function generateInvoiceId() {
  let n = 1;
  let id;
  do { id = `INV-${String(n).padStart(3, '0')}`; n++; } while (invoices.some(i => i.id === id));
  return id;
}
function generateClientId() {
  let n = 1; let id;
  do { id = `client-${String(n).padStart(3, '0')}`; n++; } while (clients.some(c => c.id === id));
  return id;
}
function generateProductId() {
  let n = 1; let id;
  do { id = `PRD-${String(n).padStart(3, '0')}`; n++; } while (products.some(p => p.id === id));
  return id;
}
function showToast(message, type = 'success') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  t.innerHTML = `<i class="fas ${icon} toast-icon"></i><span class="toast-message">${message}</span><button class="toast-close">&times;</button>`;
  c.appendChild(t);
  const close = () => t.remove();
  t.querySelector('.toast-close').addEventListener('click', close);
  setTimeout(close, 5000);
}
function showLoading() { document.getElementById('loadingSpinner').classList.add('active'); }
function hideLoading() { document.getElementById('loadingSpinner').classList.remove('active'); }

/* ---------- Navigation ---------- */
function initNavigation() {
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.content-section');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      link.classList.add('active');
      const id = link.dataset.section + '-section';
      document.getElementById(id)?.classList.add('active');
      loadSectionData(link.dataset.section);
    });
  });
}
function loadSectionData(section) {
  switch (section) {
    case 'dashboard': updateDashboardStats(); renderRecentInvoices(); break;
    case 'invoices': renderInvoicesTable(); break;
    case 'inventory': renderProductGrid(); break;
    case 'clients': renderClientGrid(); break;
    case 'settings': loadBusinessSettings(); break;
  }
}

/* ---------- Dashboard ---------- */
function updateDashboardStats() {
  const totalRevenue = invoices.reduce((s, inv) => inv.status === 'paid' ? s + inv.amount : s, 0);
  const pending = invoices.reduce((s, inv) => inv.status !== 'paid' ? s + inv.amount : s, 0);
  const count = invoices.length;
  const totalStockUnits = products.reduce((s, p) => s + (Number(p.stock) || 0), 0);
  const stats = document.querySelectorAll('.stat-number');
  if (stats[0]) stats[0].textContent = formatCurrency(totalRevenue);
  if (stats[1]) stats[1].textContent = count;
  if (stats[2]) stats[2].textContent = formatCurrency(pending);
  if (stats[3]) stats[3].textContent = totalStockUnits;
}
function renderRecentInvoices() {
  const wrap = document.querySelector('.invoice-list');
  if (!wrap) return;
  const recent = [...invoices].slice(-3).reverse();
  if (recent.length === 0) {
    wrap.innerHTML = `<div style="padding:20px; color:var(--muted-text)">No invoices yet</div>`;
    return;
  }
  wrap.innerHTML = recent.map(inv => `
    <div class="invoice-item">
      <div class="invoice-info">
        <h4 class="invoice-number">${inv.id}</h4>
        <p class="invoice-client">${inv.client}</p>
      </div>
      <div class="invoice-amount">${formatCurrency(inv.amount)}</div>
      <div class="invoice-status status-${inv.status}">${inv.status.toUpperCase()}</div>
      <div class="invoice-actions">
        <button class="action-btn" title="Share on WhatsApp" onclick="openWhatsappModal('${inv.id}')"><i class="fab fa-whatsapp"></i></button>
        <button class="action-btn" title="Download" onclick="downloadInvoice('${inv.id}')"><i class="fas fa-download"></i></button>
      </div>
    </div>
  `).join('');
}

/* ---------- Invoices List ---------- */
function renderInvoicesTable() {
  const tbody = document.getElementById('invoiceTableBody');
  if (!tbody) return;
  const rows = invoices.map(inv => {
    const remaining = Math.max(0, (Number(inv.amount) || 0) - (Number(inv.amountPaid) || 0));
    return `
      <tr>
        <td><strong>${inv.id}</strong></td>
        <td>${inv.client}</td>
        <td>${formatDate(inv.date)}</td>
        <td><strong>${formatCurrency(inv.amount)}</strong></td>
        <td><span class="invoice-status status-${inv.status}">${inv.status.toUpperCase()}</span></td>
        <td>${inv.paymentMode || '-'}</td>
        <td>${formatCurrency(inv.amountPaid || 0)}</td>
        <td>${formatCurrency(remaining)}</td>
        <td>
          <div class="invoice-actions">
            <button class="action-btn" title="Edit" onclick="editInvoice('${inv.id}')"><i class="fas fa-edit"></i></button>
            <button class="action-btn" title="Share on WhatsApp" onclick="openWhatsappModal('${inv.id}')"><i class="fab fa-whatsapp"></i></button>
            <button class="action-btn" title="Download" onclick="downloadInvoice('${inv.id}')"><i class="fas fa-download"></i></button>
            <button class="action-btn" title="Delete" onclick="deleteInvoice('${inv.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  tbody.innerHTML = rows || `<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--muted-text)">No invoices</td></tr>`;
}

/* ---------- Search / Filter in Invoices ---------- */
function initInvoiceSearchFilter() {
  document.getElementById('invoiceSearch')?.addEventListener('input', filterInvoices);
  document.getElementById('invoiceFilter')?.addEventListener('change', filterInvoices);
}
function filterInvoices() {
  const term = (document.getElementById('invoiceSearch')?.value || '').toLowerCase();
  const status = document.getElementById('invoiceFilter')?.value || 'all';
  const tbody = document.getElementById('invoiceTableBody');
  const filtered = invoices.filter(inv => {
    const matchText = inv.id.toLowerCase().includes(term) || inv.client.toLowerCase().includes(term);
    const matchStatus = status === 'all' || inv.status === status;
    return matchText && matchStatus;
  });
  if (!tbody) return;
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--muted-text)">No invoices found</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(inv => {
    const remaining = Math.max(0, (Number(inv.amount) || 0) - (Number(inv.amountPaid) || 0));
    return `
      <tr>
        <td><strong>${inv.id}</strong></td>
        <td>${inv.client}</td>
        <td>${formatDate(inv.date)}</td>
        <td><strong>${formatCurrency(inv.amount)}</strong></td>
        <td><span class="invoice-status status-${inv.status}">${inv.status.toUpperCase()}</span></td>
        <td>${inv.paymentMode || '-'}</td>
        <td>${formatCurrency(inv.amountPaid || 0)}</td>
        <td>${formatCurrency(remaining)}</td>
        <td>
          <div class="invoice-actions">
            <button class="action-btn" title="Edit" onclick="editInvoice('${inv.id}')"><i class="fas fa-edit"></i></button>
            <button class="action-btn" title="Share on WhatsApp" onclick="openWhatsappModal('${inv.id}')"><i class="fab fa-whatsapp"></i></button>
            <button class="action-btn" title="Download" onclick="downloadInvoice('${inv.id}')"><i class="fas fa-download"></i></button>
            <button class="action-btn" title="Delete" onclick="deleteInvoice('${inv.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* ---------- Modal: Create / Edit Invoice ---------- */
function initModal() {
  const modal = document.getElementById('invoiceModal');
  document.getElementById('createInvoiceBtn')?.addEventListener('click', () => openInvoiceModal());
  document.getElementById('newInvoiceBtn')?.addEventListener('click', () => openInvoiceModal());
  document.getElementById('quickInvoice')?.addEventListener('click', () => openInvoiceModal());
  document.getElementById('closeModal')?.addEventListener('click', closeInvoiceModal);
  document.getElementById('cancelModal')?.addEventListener('click', closeInvoiceModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeInvoiceModal(); });
  initInvoiceForm();
}
function openInvoiceModal(editId = null) {
  const modal = document.getElementById('invoiceModal');
  modal.classList.add('active'); document.body.style.overflow = 'hidden';
  document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
  resetInvoiceForm();
  if (editId) preloadInvoiceToForm(editId);
}
function closeInvoiceModal() {
  document.getElementById('invoiceModal').classList.remove('active');
  document.body.style.overflow = 'auto';
}
function resetInvoiceForm() {
  const form = document.getElementById('invoiceForm');
  form.reset();
  // keep phone input visible
  const itemsWrap = document.querySelector('.invoice-items');
  itemsWrap.querySelectorAll('.item-row').forEach((row, idx) => { if (idx > 0) row.remove(); });
  // clear data attributes
  const clientInput = document.getElementById('invoiceClient');
  clientInput.value = '';
  delete clientInput.dataset.clientId;
  delete clientInput.dataset.isNew;
  delete clientInput.dataset.newClientName;
  const phoneInput = document.getElementById('clientPhoneInput');
  phoneInput.value = '';
  // first row
  const first = itemsWrap.querySelector('.item-row');
  first.querySelector('.item-search').value = '';
  delete first.querySelector('.item-search').dataset.productId;
  delete first.querySelector('.item-search').dataset.isNew;
  first.querySelector('.quantity-input').value = '';
  first.querySelector('.rate-input').value = '';
  first.querySelector('.item-total').textContent = formatCurrency(0);
  // totals defaults
  document.getElementById('discountInput').value = 0;
  document.getElementById('otherTaxInput').value = 0;
  document.getElementById('paymentModeSelect').value = 'Cash';
  document.getElementById('amountPaidInput').value = 0;
  document.getElementById('subtotal').textContent = formatCurrency(0);
  document.getElementById('tax').textContent = formatCurrency(0);
  document.getElementById('total').textContent = formatCurrency(0);
}
function preloadInvoiceToForm(invId) {
  const inv = invoices.find(i => i.id === invId);
  if (!inv) return;
  const clientInput = document.getElementById('invoiceClient');
  const phoneInput = document.getElementById('clientPhoneInput');
  clientInput.value = inv.client;
  clientInput.dataset.clientId = inv.clientId || '';
  phoneInput.value = inv.clientPhone || '';
  document.getElementById('invoiceDate').value = inv.date;
  const itemsWrap = document.querySelector('.invoice-items');
  const first = itemsWrap.querySelector('.item-row');
  // clear first then fill
  first.querySelector('.item-search').value = '';
  first.querySelector('.quantity-input').value = '';
  first.querySelector('.rate-input').value = '';
  // remove others
  itemsWrap.querySelectorAll('.item-row').forEach((r, idx) => { if (idx > 0) r.remove(); });
  inv.items.forEach((it, idx) => {
    if (idx === 0) {
      first.querySelector('.item-search').value = it.description;
      first.querySelector('.quantity-input').value = it.quantity;
      first.querySelector('.rate-input').value = it.rate;
      first.querySelector('.item-total').textContent = formatCurrency(it.quantity * it.rate);
    } else {
      addInvoiceItem();
      const rows = itemsWrap.querySelectorAll('.item-row');
      const row = rows[rows.length - 1];
      row.querySelector('.item-search').value = it.description;
      row.querySelector('.quantity-input').value = it.quantity;
      row.querySelector('.rate-input').value = it.rate;
      row.querySelector('.item-total').textContent = formatCurrency(it.quantity * it.rate);
    }
  });
  document.getElementById('discountInput').value = inv.discountPct || 0;
  document.getElementById('otherTaxInput').value = inv.otherTaxPct || 0;
  document.getElementById('paymentModeSelect').value = inv.paymentMode || 'Cash';
  document.getElementById('amountPaidInput').value = inv.amountPaid || 0;
  document.getElementById('taxRateInput').value = typeof inv.taxPct === 'number' ? inv.taxPct : 18;
  document.getElementById('taxIncludedCheckbox').checked = !!inv.taxIncluded;
  updateInvoiceTotal();
}
function initInvoiceForm() {
  const form = document.getElementById('invoiceForm');
  document.getElementById('addItemBtn')?.addEventListener('click', addInvoiceItem);
  // totals reacts
  ['discountInput', 'otherTaxInput', 'amountPaidInput', 'taxRateInput', 'taxIncludedCheckbox'].forEach(id => {
    document.getElementById(id)?.addEventListener(id === 'taxIncludedCheckbox' ? 'change' : 'input', updateInvoiceTotal);
  });
  // searchable dropdowns
  initClientDropdown();
  initItemDropdowns();
  // submit
  form.addEventListener('submit', handleInvoiceSubmit);
}
function addInvoiceItem() {
  const wrap = document.querySelector('.invoice-items');
  const row = document.createElement('div');
  row.className = 'item-row';
  row.innerHTML = `
    <div class="searchable-dropdown item-dropdown">
      <input type="text" placeholder="Type to search or add item..." class="form-input searchable-input item-search" autocomplete="off" required>
      <input type="number" placeholder="Qty" class="form-input quantity-input" min="1" required>
      <input type="number" placeholder="Rate" class="form-input rate-input" min="0" step="0.01" required>
      <span class="item-total">₹0</span>
      <button type="button" class="remove-item"><i class="fas fa-trash"></i></button>
      <div class="dropdown-list item-dropdown-list"></div>
    </div>
  `;
  wrap.appendChild(row);
  const qty = row.querySelector('.quantity-input');
  const rate = row.querySelector('.rate-input');
  qty.addEventListener('input', updateInvoiceTotal);
  rate.addEventListener('input', updateInvoiceTotal);
  row.querySelector('.remove-item').addEventListener('click', () => { row.remove(); updateInvoiceTotal(); });
  initSingleItemDropdown(row.querySelector('.item-search'));
}
function updateInvoiceTotal() {
  const rows = document.querySelectorAll('.item-row');
  let subtotal = 0;
  rows.forEach(r => {
    const q = parseFloat(r.querySelector('.quantity-input').value) || 0;
    const rate = parseFloat(r.querySelector('.rate-input').value) || 0;
    const total = q * rate;
    r.querySelector('.item-total').textContent = formatCurrency(total);
    subtotal += total;
  });
  const taxPct = parseFloat(document.getElementById('taxRateInput')?.value) || 18;
  const taxIncluded = document.getElementById('taxIncludedCheckbox')?.checked || false;
  const discountPct = parseFloat(document.getElementById('discountInput').value) || 0;
  const otherTaxPct = parseFloat(document.getElementById('otherTaxInput').value) || 0;

  // Adjust for tax-included vs excluded
  let base = subtotal;
  let tax = 0;
  if (taxIncluded) {
    // subtotal includes tax; derive net
    const taxFactor = 1 + (taxPct / 100);
    const net = taxFactor > 0 ? subtotal / taxFactor : subtotal;
    tax = subtotal - net;
    base = net;
  } else {
    // subtotal is net; add tax
    tax = base * (taxPct / 100);
  }

  // Discounts apply to base (pre-tax), then compute other tax
  const discountAmt = base * (discountPct / 100);
  const baseAfterDiscount = Math.max(0, base - discountAmt);

  // tax was computed on base; keep as-is for excluded; if included, it’s embedded already
  let totalBeforeOther = taxIncluded ? baseAfterDiscount + tax : baseAfterDiscount + tax;

  // other tax on totalBeforeOther
  const otherTaxAmt = totalBeforeOther * (otherTaxPct / 100);
  const grandTotal = totalBeforeOther + otherTaxAmt;

  document.getElementById('subtotal').textContent = formatCurrency(base);
  document.getElementById('tax').textContent = formatCurrency(tax + otherTaxAmt);
  document.getElementById('total').textContent = formatCurrency(grandTotal);

  const amountPaid = parseFloat(document.getElementById('amountPaidInput').value) || 0;
  const remaining = Math.max(0, grandTotal - amountPaid);
  document.getElementById('remainingAmount').textContent = formatCurrency(remaining);
}
function handleInvoiceSubmit(e) {
  e.preventDefault();
  showLoading();
  setTimeout(() => {
    const clientInput = document.getElementById('invoiceClient');
    const phoneInput = document.getElementById('clientPhoneInput');
    const date = document.getElementById('invoiceDate').value;
    // client
    let client = null;
    if (clientInput.dataset.clientId) {
      client = clients.find(c => c.id === clientInput.dataset.clientId);
      if (client && phoneInput.value) client.phone = phoneInput.value;
    } else {
      // new
      const newId = generateClientId();
      client = { id: newId, name: clientInput.value.trim(), phone: phoneInput.value.trim(), email: '', address: '' };
      clients.push(client);
    }
    // items
    const items = [];
    document.querySelectorAll('.item-row').forEach(r => {
      const name = r.querySelector('.item-search').value.trim();
      const qty = parseFloat(r.querySelector('.quantity-input').value) || 0;
      const rate = parseFloat(r.querySelector('.rate-input').value) || 0;
      let unit = 'pcs';
      // link with products or add new product quickly
      const existing = products.find(p => p.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        unit = existing.unit || unit;
      } else if (name) {
        const unitGuess = 'pcs';
        products.push({ id: generateProductId(), name, price: rate, stock: 0, unit: unitGuess, category: 'General' });
        unit = unitGuess;
      }
      if (name) items.push({ description: name, quantity: qty, rate, unit });
    });

    const discountPct = parseFloat(document.getElementById('discountInput').value) || 0;
    const otherTaxPct = parseFloat(document.getElementById('otherTaxInput').value) || 0;
    const taxPct = parseFloat(document.getElementById('taxRateInput')?.value) || 18;
    const taxIncluded = document.getElementById('taxIncludedCheckbox')?.checked || false;
    const paymentMode = document.getElementById('paymentModeSelect').value;
    const amountPaid = parseFloat(document.getElementById('amountPaidInput').value) || 0;

    // compute total identical to UI
    const tmpSub = items.reduce((s, it) => s + (it.quantity * it.rate), 0);
    let base = tmpSub, tax = 0;
    if (taxIncluded) {
      const f = 1 + (taxPct / 100); const net = f ? tmpSub / f : tmpSub;
      tax = tmpSub - net; base = net;
    } else tax = base * (taxPct / 100);
    const discountAmt = base * (discountPct / 100);
    const baseAfterDiscount = Math.max(0, base - discountAmt);
    const totalBeforeOther = baseAfterDiscount + tax;
    const otherTaxAmt = totalBeforeOther * (otherTaxPct / 100);
    const total = totalBeforeOther + otherTaxAmt;

    const newInv = {
      id: generateInvoiceId(),
      client: client.name,
      clientId: client.id,
      clientPhone: client.phone || '',
      date,
      amount: total,
      status: (amountPaid >= total) ? 'paid' : (amountPaid > 0 ? 'pending' : 'pending'),
      items,
      discountPct, otherTaxPct, taxPct, taxIncluded,
      paymentMode, amountPaid
    };
    invoices.unshift(newInv);
    hideLoading(); closeInvoiceModal();
    showToast(`Invoice ${newInv.id} created successfully!`);
    updateDashboardStats(); renderRecentInvoices(); renderInvoicesTable();
    saveToLocalStorage();
  }, 600);
}

/* ---------- Searchable Dropdowns ---------- */
function initClientDropdown() {
  const input = document.getElementById('invoiceClient');
  const phone = document.getElementById('clientPhoneInput');
  const list = document.getElementById('clientDropdownList');
  if (!input || !list) return;

  input.addEventListener('input', () => {
    const term = input.value.toLowerCase().trim();
    if (!term) { list.style.display = 'none'; return; }
    const filtered = clients.filter(c => c.name.toLowerCase().includes(term) || (c.phone || '').includes(term));
    renderClientDropdown(filtered, term);
    list.style.display = 'block';
  });
  input.addEventListener('blur', () => setTimeout(() => list.style.display = 'none', 150));
  document.addEventListener('click', e => { if (!e.target.closest('#clientDropdown')) list.style.display = 'none'; });

  function renderClientDropdown(items, term) {
    const exact = items.find(c => c.name.toLowerCase() === term);
    const rows = items.map(c => `
      <div class="dropdown-item" tabindex="0" onclick="selectClient('${c.id}')">
        <div class="dropdown-item-main">${c.name}</div>
        <div class="dropdown-item-sub">${c.phone || 'No phone'}</div>
      </div>`).join('');
    const addRow = exact ? '' : `
      <div class="dropdown-item add-new" tabindex="0" onclick="addNewClientFromInput('${encodeURIComponent(term)}')">
        <div class="dropdown-item-main"><i class="fas fa-plus-circle"></i> Add "${escapeHtml(term)}" as new client</div>
      </div>`;
    list.innerHTML = rows + addRow;
  }

  window.selectClient = (id) => {
    const c = clients.find(x => x.id === id);
    if (!c) return;
    input.dataset.clientId = c.id;
    input.value = c.name;
    phone.value = c.phone || '';
  };
  window.addNewClientFromInput = (encTerm) => {
    const name = decodeURIComponent(encTerm);
    input.value = name;
    delete input.dataset.clientId;
    showToast(`Enter a contact number for "${name}"`, 'info');
  };
}
function initItemDropdowns() {
  document.querySelectorAll('.item-search').forEach(initSingleItemDropdown);
  document.addEventListener('click', e => {
    if (!e.target.classList.contains('item-search')) {
      document.querySelectorAll('.item-dropdown-list').forEach(d => d.style.display = 'none');
    }
  });
}
function initSingleItemDropdown(input) {
  const row = input.closest('.item-row');
  const dropdown = row.querySelector('.item-dropdown-list');
  const qty = row.querySelector('.quantity-input');
  const rate = row.querySelector('.rate-input');

  input.addEventListener('input', () => {
    const term = input.value.toLowerCase().trim();
    if (!term) { dropdown.style.display = 'none'; return; }
    const filtered = products.filter(p => p.name.toLowerCase().includes(term));
    render(term, filtered);
    dropdown.style.display = 'block';
  });
  input.addEventListener('blur', () => setTimeout(() => dropdown.style.display = 'none', 150));

  function render(term, list) {
    const exact = list.find(p => p.name.toLowerCase() === term);
    const rows = list.map(p => `
      <div class="dropdown-item" tabindex="0" onclick="selectProductFromDropdown('${p.id}', this)">
        <div class="dropdown-item-main">${p.name}</div>
        <div class="dropdown-item-sub">${formatCurrency(p.price)} per ${p.unit}</div>
      </div>`).join('');
    const addRow = exact ? '' : `
      <div class="dropdown-item add-new" tabindex="0" onclick="addNewProductInline('${encodeURIComponent(term)}', this)">
        <div class="dropdown-item-main"><i class="fas fa-plus-circle"></i> Add "${escapeHtml(term)}" as new product</div>
      </div>`;
    dropdown.innerHTML = rows + addRow;
  }

  window.selectProductFromDropdown = (id, el) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    input.value = p.name;
    rate.value = p.price;
    if (!qty.value) qty.value = 1;
    updateInvoiceTotal();
  };
  window.addNewProductInline = (encName, el) => {
    const name = decodeURIComponent(encName);
    input.value = name;
    if (!qty.value) qty.value = 1;
    // prompt-like inline: use rate field already visible
    showToast(`Enter rate/unit for "${name}" in the Rate field`, 'info');
    updateInvoiceTotal();
  };
}

/* ---------- Escape HTML helper ---------- */
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ---------- WhatsApp Share ---------- */
function openWhatsappModal(invoiceId) {
  currentInvoiceId = invoiceId;
  document.getElementById('whatsappModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeWhatsappModal() {
  document.getElementById('whatsappModal').classList.remove('active');
  document.body.style.overflow = 'auto';
  currentInvoiceId = null;
}
function shareInvoiceFormat(fmt) {
  if (!currentInvoiceId) return;
  const inv = invoices.find(i => i.id === currentInvoiceId);
  if (!inv) return showToast('Invoice not found', 'error');
  closeWhatsappModal();
  showLoading();
  if (fmt === 'text') {
    setTimeout(() => { shareInvoiceAsText(inv); hideLoading(); }, 400);
  } else {
    setTimeout(() => { shareInvoiceAsImage(inv); hideLoading(); }, 800);
  }
}
function shareInvoiceAsText(inv) {
  const client = clients.find(c => c.id === inv.clientId);
  const phone = (inv.clientPhone || (client?.phone) || '').replace(/\D/g, '');
  const itemsText = inv.items.map(it => `• ${it.description} — ${it.quantity} ${it.unit} × ${formatCurrency(it.rate)} = ${formatCurrency(it.quantity*it.rate)}`).join('%0A');
  const subtotal = inv.items.reduce((s, it) => s + it.quantity * it.rate, 0);
  const msg =
    `*${businessSettings.name}*%0A` +
    `📧 ${businessSettings.email}%0A` +
    `📞 ${businessSettings.phone}%0A` +
    `🏢 ${businessSettings.address}%0A` +
    `GST: ${businessSettings.gst}%0A%0A` +
    `*INVOICE ${inv.id}*%0A` +
    `Date: ${formatDate(inv.date)}%0A` +
    `Client: ${inv.client}%0A%0A` +
    `*ITEMS:*%0A${itemsText}%0A%0A` +
    `Subtotal: ${formatCurrency(subtotal)}%0A` +
    `Total: ${formatCurrency(inv.amount)}%0A` +
    `Paid: ${formatCurrency(inv.amountPaid || 0)}%0A` +
    `Remaining: ${formatCurrency(Math.max(0, inv.amount - (inv.amountPaid||0)))}%0A` +
    `Status: ${inv.status.toUpperCase()}%0A%0A` +
    `Thank you for your business!`;
  const url = `https://wa.me/${phone}?text=${msg}`;
  window.open(url, '_blank');
  showToast('Opening WhatsApp with text message...');
}
function shareInvoiceAsImage(inv) {
  // Build a clean, theme-agnostic invoice template (always light background)
  const node = createInvoiceImageTemplate(inv);
  document.body.appendChild(node);
  html2canvas(node, { backgroundColor: '#ffffff', scale: 2, useCORS: true }).then(canvas => {
    // Offer download of PNG; WhatsApp Web cannot receive blobs via URL, so instruct user to attach
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${inv.id}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      const client = clients.find(c => c.id === inv.clientId);
      const phone = (inv.clientPhone || (client?.phone) || '').replace(/\D/g, '');
      const msg = `Invoice ${inv.id} image downloaded. Please attach the image in WhatsApp chat.%0A%0A*${businessSettings.name}*%0A${businessSettings.phone}`;
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      showToast('Invoice image downloaded. Attach it in WhatsApp chat.');
      node.remove();
    }, 'image/png');
  }).catch(err => {
    console.error(err);
    showToast('Failed to generate image', 'error');
    node.remove();
  });
}
function createInvoiceImageTemplate(inv) {
  const subtotal = inv.items.reduce((s, it) => s + it.quantity * it.rate, 0);
  const client = clients.find(c => c.id === inv.clientId);
  const wrapper = document.createElement('div');
  wrapper.id = 'invoice-image-wrapper';
  wrapper.style.width = '800px';
  wrapper.style.padding = '40px';
  wrapper.style.background = '#ffffff';
  wrapper.style.color = '#202124';
  wrapper.style.fontFamily = "Product Sans, Arial, sans-serif";
  wrapper.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #4285F4;padding-bottom:16px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:12px;">
        ${businessSettings.logo ? `<img src="${businessSettings.logo}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;">` : ''}
        <div>
          <div style="font-size:26px;font-weight:800;color:#202124;">${businessSettings.name}</div>
          <div style="color:#5f6368;font-size:13px;">${businessSettings.email}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:24px;font-weight:800;color:#ea4335;">INVOICE</div>
        <div style="color:#5f6368;">${inv.id}</div>
      </div>
    </div>
    <div style="display:flex;gap:24px;margin-bottom:20px;">
      <div style="flex:1;">
        <div style="font-weight:700;color:#202124;margin-bottom:6px;">From</div>
        <div style="color:#5f6368;font-size:13px;line-height:1.6;">
          ${businessSettings.name}<br>${businessSettings.address}<br>${businessSettings.phone}<br>${businessSettings.email}<br>GST: ${businessSettings.gst}
        </div>
      </div>
      <div style="flex:1;text-align:right;">
        <div style="font-weight:700;color:#202124;margin-bottom:6px;">To</div>
        <div style="color:#5f6368;font-size:13px;line-height:1.6;">
          ${inv.client}<br>${client?.address || ''}<br>${inv.clientPhone || client?.phone || ''}
        </div>
      </div>
    </div>
    <div style="display:flex;gap:24px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
      <div><div style="color:#5f6368;font-size:12px;">Invoice Date</div><div style="font-weight:700;color:#202124;">${formatDate(inv.date)}</div></div>
      <div><div style="color:#5f6368;font-size:12px;">Status</div><div style="font-weight:800;color:${inv.status==='paid' ? '#34a853' : inv.status==='pending' ? '#fbbc05' : '#ea4335'}">${inv.status.toUpperCase()}</div></div>
      <div><div style="color:#5f6368;font-size:12px;">Payment</div><div style="font-weight:700;color:#202124;">${inv.paymentMode || '-'}</div></div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead><tr style="background:#4285F4;color:#fff;">
        <th style="text-align:left;padding:12px 10px;">Description</th>
        <th style="text-align:center;padding:12px 10px;">Qty</th>
        <th style="text-align:center;padding:12px 10px;">Unit</th>
        <th style="text-align:right;padding:12px 10px;">Rate</th>
        <th style="text-align:right;padding:12px 10px;">Amount</th>
      </tr></thead>
      <tbody>
        ${inv.items.map((it, i) => `
          <tr style="${i%2===0?'background:#f9f9f9;':''}">
            <td style="padding:10px;color:#202124;">${it.description}</td>
            <td style="padding:10px;text-align:center;color:#5f6368;">${it.quantity}</td>
            <td style="padding:10px;text-align:center;color:#5f6368;">${it.unit}</td>
            <td style="padding:10px;text-align:right;color:#5f6368;">${formatCurrency(it.rate)}</td>
            <td style="padding:10px;text-align:right;color:#202124;font-weight:700;">${formatCurrency(it.quantity*it.rate)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;margin-top:8px;">
      <div style="width:320px;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e0e0e0;"><span style="color:#5f6368;">Subtotal</span><strong style="color:#202124;">${formatCurrency(subtotal)}</strong></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e0e0e0;"><span style="color:#5f6368;">Total</span><strong style="color:#202124;">${formatCurrency(inv.amount)}</strong></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e0e0e0;"><span style="color:#5f6368;">Paid</span><strong style="color:#202124;">${formatCurrency(inv.amountPaid||0)}</strong></div>
        <div style="display:flex;justify-content:space-between;padding:10px;border-radius:6px;background:#4285F4;color:#fff;margin-top:8px;"><span style="font-weight:700;">Remaining</span><span style="font-weight:800;">${formatCurrency(Math.max(0, inv.amount-(inv.amountPaid||0)))}</span></div>
      </div>
    </div>
    <div style="text-align:center;color:#5f6368;font-size:12px;margin-top:24px;">Thank you for your business</div>
  `;
  return wrapper;
}

/* ---------- Download Invoice (real) ---------- */
function downloadInvoice(invId) {
  const inv = invoices.find(x => x.id === invId);
  if (!inv) return showToast('Invoice not found', 'error');
  // Try to generate an image (PNG) via html2canvas
  showLoading();
  const node = createInvoiceImageTemplate(inv);
  document.body.appendChild(node);
  html2canvas(node, { backgroundColor: '#ffffff', scale: 2, useCORS: true }).then(canvas => {
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${inv.id}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      hideLoading();
      node.remove();
      showToast(`Invoice ${inv.id} downloaded successfully!`);
    }, 'image/png');
  }).catch(err => {
    console.error(err);
    node.remove(); hideLoading();
    // Fallback CSV
    const rows = [
      ['Invoice', inv.id],
      ['Date', formatDate(inv.date)],
      ['Client', inv.client],
      ['Phone', inv.clientPhone || ''],
      [],
      ['Description', 'Qty', 'Unit', 'Rate', 'Amount'],
      ...inv.items.map(it => [it.description, it.quantity, it.unit, it.rate, it.quantity*it.rate])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${inv.id}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast(`Invoice ${inv.id} downloaded as CSV (image failed)`);
  });
}

/* ---------- Edit Invoice ---------- */
function editInvoice(invId) {
  openInvoiceModal(invId);
}

/* ---------- Delete ---------- */
function deleteInvoice(invId) {
  if (!confirm('Delete this invoice?')) return;
  invoices = invoices.filter(i => i.id !== invId);
  showToast('Invoice deleted');
  updateDashboardStats(); renderRecentInvoices(); renderInvoicesTable(); saveToLocalStorage();
}

/* ---------- Inventory ---------- */
function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  if (products.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted-text)">No products</div>`;
    return;
  }
  grid.innerHTML = products.map(p => {
    const color = p.stock === 0 ? 'var(--error)' : (p.stock <= 5 ? 'var(--warning)' : 'var(--success)');
    return `
      <div class="product-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <h3 style="margin:0;color:var(--body-text);font-weight:800;font-size:16px;">${p.name}</h3>
          <span style="background:${color};color:#fff;padding:2px 8px;border-radius:12px;font-size:10px;">${p.stock} ${p.unit}</span>
        </div>
        <div style="color:var(--muted-text);font-size:12px;margin-bottom:8px;">${p.category}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-weight:800;color:var(--body-text)">${formatCurrency(p.price)}/${p.unit}</div>
          <div style="display:flex;gap:8px;">
            <button class="action-btn" title="Edit Product" onclick="openEditProduct('${p.id}')"><i class="fas fa-edit"></i></button>
            <button class="action-btn" title="Delete Product" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* Edit Product (modal-less inline prompt) */
function openEditProduct(pid) {
  const p = products.find(x => x.id === pid);
  if (!p) return;
  const name = prompt('Product Name', p.name); if (name === null) return;
  const price = parseFloat(prompt('Rate per Unit', p.price)); if (isNaN(price)) return;
  const unit = prompt('Unit (e.g., pcs, kg, ltr, service)', p.unit) || p.unit;
  const stock = parseInt(prompt('Stock', p.stock)); if (isNaN(stock)) return;
  const category = prompt('Category', p.category) || p.category;
  p.name = name.trim(); p.price = price; p.unit = unit.trim(); p.stock = stock; p.category = category.trim();
  showToast('Product updated');
  renderProductGrid(); saveToLocalStorage();
}
function deleteProduct(pid) {
  if (!confirm('Delete this product?')) return;
  products = products.filter(p => p.id !== pid);
  showToast('Product deleted');
  renderProductGrid(); saveToLocalStorage();
}

/* ---------- Clients ---------- */
function renderClientGrid() {
  const grid = document.getElementById('clientGrid');
  if (!grid) return;
  if (clients.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted-text)">No clients</div>`;
    return;
  }
  grid.innerHTML = clients.map(c => `
    <div class="client-card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800">${(c.name||'?').charAt(0).toUpperCase()}</div>
        <div>
          <div style="font-weight:800;color:var(--body-text)">${c.name}</div>
          <div style="font-size:12px;color:var(--muted-text)">${c.email || 'No email'}</div>
        </div>
      </div>
      <div style="color:var(--muted-text);font-size:14px;margin-bottom:8px;"><i class="fas fa-phone" style="width:16px;margin-right:6px;color:var(--primary)"></i>${c.phone || '-'}</div>
      <div style="color:var(--muted-text);font-size:14px;margin-bottom:12px;"><i class="fas fa-map-marker-alt" style="width:16px;margin-right:6px;color:var(--primary)"></i>${c.address || '-'}</div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="action-btn" title="Edit Client" onclick="openEditClient('${c.id}')"><i class="fas fa-edit"></i></button>
        <button class="action-btn" title="Invoice" onclick="createInvoiceForClient('${c.id}')"><i class="fas fa-file-invoice"></i></button>
        <button class="action-btn" title="Delete" onclick="deleteClient('${c.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}
function openEditClient(cid) {
  const c = clients.find(x => x.id === cid);
  if (!c) return;
  const name = prompt('Client Name', c.name); if (name === null) return;
  const phone = prompt('Phone', c.phone || ''); if (phone === null) return;
  const email = prompt('Email', c.email || ''); if (email === null) return;
  const address = prompt('Address', c.address || ''); if (address === null) return;
  c.name = name.trim(); c.phone = phone.trim(); c.email = email.trim(); c.address = address.trim();
  showToast('Client updated');
  renderClientGrid(); saveToLocalStorage();
}
function deleteClient(cid) {
  if (!confirm('Delete this client?')) return;
  clients = clients.filter(c => c.id !== cid);
  showToast('Client deleted');
  renderClientGrid(); saveToLocalStorage();
}
function createInvoiceForClient(cid) {
  openInvoiceModal();
  const c = clients.find(x => x.id === cid);
  if (!c) return;
  const input = document.getElementById('invoiceClient');
  const phone = document.getElementById('clientPhoneInput');
  input.value = c.name; input.dataset.clientId = c.id;
  phone.value = c.phone || '';
}

/* ---------- Search across Inventory and Clients ---------- */
function initGlobalSearch() {
  document.getElementById('productSearch')?.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) || (p.category||'').toLowerCase().includes(term));
    const original = products; products = filtered; renderProductGrid(); products = original;
  });
  document.getElementById('clientSearch')?.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    const filtered = clients.filter(c => c.name.toLowerCase().includes(term) || (c.email||'').toLowerCase().includes(term) || (c.phone||'').includes(term));
    const original = clients; clients = filtered; renderClientGrid(); clients = original;
  });
}

/* ---------- Import / Export XLSX ---------- */
function initExcelImportExport() {
  const importClientsFile = document.getElementById('importClientsFile');
  importClientsFile?.addEventListener('change', handleClientsImport);
  const importInventoryFile = document.getElementById('importInventoryFile');
  importInventoryFile?.addEventListener('change', handleInventoryImport);
  document.getElementById('exportInventoryBtn')?.addEventListener('click', exportClientsAndInventory);
}
function handleClientsImport(e) {
  const file = e.target.files[0]; if (!file) return;
  showLoading();
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      let added = 0;
      data.forEach(r => {
        const name = r.Name || r.name || r.Client || r.client;
        if (!name) return;
        const exists = clients.find(c => c.name.toLowerCase() === String(name).toLowerCase());
        if (exists) return;
        clients.push({
          id: generateClientId(),
          name: String(name),
          email: r.Email || r.email || '',
          phone: r.Phone || r.phone || r.Contact || r.contact || '',
          address: r.Address || r.address || ''
        });
        added++;
      });
      showToast(`Imported ${added} clients`);
      renderClientGrid(); saveToLocalStorage(); hideLoading();
    } catch (err) { console.error(err); hideLoading(); showToast('Error importing clients', 'error'); }
  };
  reader.readAsBinaryString(file);
  e.target.value = '';
}
function handleInventoryImport(e) {
  const file = e.target.files[0]; if (!file) return;
  showLoading();
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      let added = 0;
      data.forEach(r => {
        const name = r.Name || r.name || r.Product || r.product;
        if (!name) return;
        const exists = products.find(p => p.name.toLowerCase() === String(name).toLowerCase());
        if (exists) return;
        products.push({
          id: generateProductId(),
          name: String(name),
          price: Number(r.Price || r.price || r.Rate || r.rate || 0),
          stock: Number(r.Stock || r.stock || r.Quantity || r.quantity || 0),
          unit: String(r.Unit || r.unit || 'pcs'),
          category: String(r.Category || r.category || 'General')
        });
        added++;
      });
      showToast(`Imported ${added} products`);
      renderProductGrid(); updateDashboardStats(); saveToLocalStorage(); hideLoading();
    } catch (err) { console.error(err); hideLoading(); showToast('Error importing products', 'error'); }
  };
  reader.readAsBinaryString(file);
  e.target.value = '';
}
function exportClientsAndInventory() {
  try {
    const wb = XLSX.utils.book_new();
    const clientsSheet = XLSX.utils.json_to_sheet(clients.map(c => ({
      ID: c.id, Name: c.name, Email: c.email, Phone: c.phone, Address: c.address
    })));
    XLSX.utils.book_append_sheet(wb, clientsSheet, 'Clients');
    const productsSheet = XLSX.utils.json_to_sheet(products.map(p => ({
      ID: p.id, Name: p.name, Price: p.price, Stock: p.stock, Unit: p.unit, Category: p.category
    })));
    XLSX.utils.book_append_sheet(wb, productsSheet, 'Inventory');
    XLSX.writeFile(wb, 'bills-export.xlsx', { compression: true });
    showToast('Exported clients & inventory to bills-export.xlsx');
  } catch (err) {
    console.error(err);
    showToast('Export failed', 'error');
  }
}

/* ---------- Settings ---------- */
function loadBusinessSettings() {
  document.getElementById('businessName').value = businessSettings.name;
  document.getElementById('businessEmail').value = businessSettings.email;
  document.getElementById('businessPhone').value = businessSettings.phone;
  document.getElementById('businessGST').value = businessSettings.gst;
  document.getElementById('businessWebsite').value = businessSettings.website;
  document.getElementById('businessAddress').value = businessSettings.address;
  const preview = document.getElementById('logoPreview');
  if (businessSettings.logo) preview.innerHTML = `<img src="${businessSettings.logo}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;">`;
  // version label lives in HTML
}
function initBusinessSettings() {
  document.getElementById('saveBusinessSettingsBtn')?.addEventListener('click', () => {
    businessSettings.name = document.getElementById('businessName').value.trim();
    businessSettings.email = document.getElementById('businessEmail').value.trim();
    businessSettings.phone = document.getElementById('businessPhone').value.trim();
    businessSettings.gst = document.getElementById('businessGST').value.trim();
    businessSettings.website = document.getElementById('businessWebsite').value.trim();
    businessSettings.address = document.getElementById('businessAddress').value.trim();
    saveToLocalStorage(); showToast('Business settings saved');
  });
  const logoInput = document.getElementById('businessLogo');
  logoInput?.addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      businessSettings.logo = ev.target.result;
      const preview = document.getElementById('logoPreview');
      preview.innerHTML = `<img src="${ev.target.result}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;">`;
      saveToLocalStorage(); showToast('Logo updated');
    };
    reader.readAsDataURL(f);
  });
  document.getElementById('themeSelector')?.addEventListener('change', e => {
    const v = e.target.value;
    if (v === 'Light') document.documentElement.style.colorScheme = 'light';
    else if (v === 'Dark') document.documentElement.style.colorScheme = 'dark';
    else document.documentElement.style.colorScheme = '';
  });
  document.getElementById('connectWhatsappBtn')?.addEventListener('click', () => showToast('WhatsApp number saved (browser share uses WhatsApp Web)'));
}

/* ---------- View Reports (basic) ---------- */
function initReportsButton() {
  document.getElementById('viewReports')?.addEventListener('click', () => {
    // open a simple report panel via toast or modal
    const paid = invoices.filter(i => i.status === 'paid').length;
    const overdue = invoices.filter(i => i.status === 'overdue').length;
    const total = invoices.length;
    showToast(`Reports: Total ${total}, Paid ${paid}, Overdue ${overdue}`, 'info');
  });
}

/* ---------- Local Storage ---------- */
function saveToLocalStorage() {
  localStorage.setItem('bills_invoices', JSON.stringify(invoices));
  localStorage.setItem('bills_products', JSON.stringify(products));
  localStorage.setItem('bills_clients', JSON.stringify(clients));
  localStorage.setItem('bills_settings', JSON.stringify(businessSettings));
}
function loadFromLocalStorage() {
  try {
    const a = localStorage.getItem('bills_invoices'); if (a) invoices = JSON.parse(a);
    const b = localStorage.getItem('bills_products'); if (b) products = JSON.parse(b);
    const c = localStorage.getItem('bills_clients'); if (c) clients = JSON.parse(c);
    const d = localStorage.getItem('bills_settings'); if (d) businessSettings = { ...businessSettings, ...JSON.parse(d) };
  } catch (e) { console.warn('Local storage parse error', e); }
}

/* ---------- Keyboard Shortcuts ---------- */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); openInvoiceModal(); }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
      document.body.style.overflow = 'auto';
    }
  });
}

/* ---------- App Init ---------- */
function initApp() {
  loadFromLocalStorage();
  initNavigation();
  initModal();
  initInvoiceSearchFilter();
  initGlobalSearch();
  initExcelImportExport();
  initBusinessSettings();
  initReportsButton();
  updateDashboardStats();
  renderRecentInvoices();
  saveToLocalStorage();
  setTimeout(() => showToast('Welcome to Bills v' + businessSettings.version, 'success'), 500);
}
document.addEventListener('DOMContentLoaded', initApp);

/* ---------- Expose minimal API ---------- */
window.BillsApp = {
  downloadInvoice,
  openWhatsappModal,
  shareInvoiceFormat,
  openEditClient,
  openEditProduct
};
