/* UniBills v1.0.959X-Pro — script.js */

/* ---------- In-memory Data ---------- */
let invoices = [
  {
    id: 'INV-001',
    client: 'Acme Corp', clientId: 'client-001', clientPhone: '+91 9876543210',
    date: '2025-09-01',
    items: [{ description: 'Web Development', quantity: 1, rate: 25000, unit: 'service' }],
    discountMode: 'PERCENT', discountPercent: 0, discountAmount: 0,
    taxPct: 18, taxIncluded: false,
    paymentMode: 'UPI', amountPaid: 29500,
    amount: 29500, status: 'paid'
  },
  {
    id: 'INV-002',
    client: 'Tech Solutions', clientId: 'client-002', clientPhone: '+91 9876543211',
    date: '2025-08-28',
    items: [{ description: 'UI/UX Design', quantity: 1, rate: 18500, unit: 'service' }],
    discountMode: 'PERCENT', discountPercent: 0, discountAmount: 0,
    taxPct: 18, taxIncluded: false,
    paymentMode: 'Bank Transfer', amountPaid: 0,
    amount: 21830, status: 'pending'
  },
  {
    id: 'INV-003',
    client: 'Digital Agency', clientId: 'client-003', clientPhone: '+91 9876543212',
    date: '2025-08-25',
    items: [{ description: 'Mobile App Development', quantity: 1, rate: 32000, unit: 'service' }],
    discountMode: 'PERCENT', discountPercent: 0, discountAmount: 0,
    taxPct: 18, taxIncluded: false,
    paymentMode: 'Cash', amountPaid: 0,
    amount: 37760, status: 'overdue'
  }
];

let products = [
  { id: 'PRD-001', name: 'Website Development Package', price: 25000, stock: 10, unit: 'service', category: 'Services' },
  { id: 'PRD-002', name: 'Mobile App Development', price: 45000, stock: 5, unit: 'service', category: 'Services' },
  { id: 'PRD-003', name: 'Logo Design', price: 5000, stock: 0, unit: 'pcs', category: 'Design' },
  { id: 'PRD-004', name: 'SEO Optimization', price: 12000, stock: 3, unit: 'service', category: 'Marketing' }
];

let clients = [
  { id: 'client-001', name: 'Acme Corp', email: 'contact@acme.com', phone: '+91 9876543210', address: '123 Business Street, Mumbai' },
  { id: 'client-002', name: 'Tech Solutions', email: 'info@techsolutions.com', phone: '+91 9876543211', address: '456 Tech Park, Bangalore' },
  { id: 'client-003', name: 'Digital Agency', email: 'hello@digitalagency.com', phone: '+91 9876543212', address: '789 Digital Hub, Delhi' }
];

let businessSettings = {
  developer: 'UniBills Team',
  version: '1.0.959X-Pro',
  build: 'September, 2025',
  name: 'Your Business Name',
  email: 'business@example.com',
  phone: '+91 9876543210',
  gst: '29ABCDE1234F1Z5',
  website: 'www.yourbusiness.com',
  address: '123 Business Street, City, State 12345',
  logo: null
};

let currentInvoiceId = null;
let editingClientId = null;
let editingProductId = null;

/* ---------- Utils ---------- */
function formatCurrency(n){
  const v = isFinite(n)? n : 0;
  return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:0}).format(Math.round(v));
}
function formatDate(s){
  return new Date(s).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'});
}
function genId(prefix, list){
  let n=1, id;
  do { id = `${prefix}-${String(n).padStart(3,'0')}`; n++; } while(list.some(x=>x.id===id));
  return id;
}
function showToast(msg, type='success'){
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icon = type==='success'?'fa-check-circle': type==='error'?'fa-exclamation-circle':'fa-info-circle';
  t.innerHTML = `<i class="fas ${icon} toast-icon"></i><span class="toast-message">${msg}</span><button class="toast-close">&times;</button>`;
  c.appendChild(t);
  const close=()=> t.remove();
  t.querySelector('.toast-close').addEventListener('click', close);
  setTimeout(close, 5000);
}
function showLoading(){ document.getElementById('loadingSpinner').classList.add('active'); }
function hideLoading(){ document.getElementById('loadingSpinner').classList.remove('active'); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

/* ---------- Navigation + Routing between sections ---------- */
function initNavigation(){
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.content-section');
  links.forEach(link=>{
    link.addEventListener('click', e=>{
      e.preventDefault();
      const section = link.dataset.section;
      links.forEach(l=>l.classList.remove('active'));
      link.classList.add('active');
      sections.forEach(s=>s.classList.remove('active'));
      document.getElementById(`${section}-section`)?.classList.add('active');
      loadSection(section);
    });
  });
  // back buttons from details
  document.getElementById('backToClients')?.addEventListener('click', ()=> goToSection('clients'));
  document.getElementById('backToInventory')?.addEventListener('click', ()=> goToSection('inventory'));
}
function goToSection(section){
  document.querySelectorAll('.nav-link').forEach(n=>{
    if (n.dataset.section===section) n.classList.add('active'); else n.classList.remove('active');
  });
  document.querySelectorAll('.content-section').forEach(s=> s.classList.remove('active'));
  document.getElementById(`${section}-section`)?.classList.add('active');
  loadSection(section);
}
function loadSection(section){
  if (section==='dashboard'){ updateDashboardStats(); renderRecentInvoices(); }
  if (section==='invoices'){ renderInvoicesTable(); }
  if (section==='inventory'){ renderProductGrid(); updateInventoryStats(); }
  if (section==='clients'){ renderClientGrid(); }
  if (section==='reports'){ renderReports(); }
  if (section==='settings'){ loadBusinessSettings(); }
}

/* ---------- Dashboard ---------- */
function updateDashboardStats(){
  const totalRevenue = invoices.reduce((s,i)=> i.status==='paid'? s + (i.amount||0) : s, 0);
  const pendingAmt = invoices.reduce((s,i)=> i.status!=='paid'? s + (i.amount||0) - (i.amountPaid||0) : s, 0);
  const invCount = invoices.length;
  const units = products.reduce((s,p)=> s + (Number(p.stock)||0), 0);

  setText('#statRevenue', formatCurrency(totalRevenue));
  setText('#statPending', formatCurrency(Math.max(0,pendingAmt)));
  setText('#statInvoices', invCount);
  setText('#statStock', units);
}
function setText(sel, val){ const el = document.querySelector(sel); if (el) el.textContent = val; }
function renderRecentInvoices(){
  const wrap = document.querySelector('.invoice-list');
  if (!wrap) return;
  const recent = [...invoices].slice(-3).reverse();
  wrap.innerHTML = recent.length? recent.map(inv=>`
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
  `).join('') : `<div style="padding:20px;color:var(--muted)">No invoices yet</div>`;
}

/* ---------- Invoices list ---------- */
function renderInvoicesTable(){
  const tbody = document.getElementById('invoiceTableBody');
  if (!tbody) return;
  if (!invoices.length){
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--muted)">No invoices</td></tr>`;
    return;
  }
  tbody.innerHTML = invoices.map(inv=>{
    const remaining = Math.max(0,(inv.amount||0)-(inv.amountPaid||0));
    return `
      <tr>
        <td><strong>${inv.id}</strong></td>
        <td>${inv.client}</td>
        <td>${formatDate(inv.date)}</td>
        <td><strong>${formatCurrency(inv.amount)}</strong></td>
        <td><span class="invoice-status status-${inv.status}">${inv.status.toUpperCase()}</span></td>
        <td>${inv.paymentMode||'-'}</td>
        <td>${formatCurrency(inv.amountPaid||0)}</td>
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

/* Search/Filter in Invoices */
function initInvoiceSearch(){
  document.getElementById('invoiceSearch')?.addEventListener('input', filterInvoices);
  document.getElementById('invoiceFilter')?.addEventListener('change', filterInvoices);
}
function filterInvoices(){
  const term = (document.getElementById('invoiceSearch')?.value||'').toLowerCase();
  const status = document.getElementById('invoiceFilter')?.value || 'all';
  const tbody = document.getElementById('invoiceTableBody');
  const filtered = invoices.filter(inv=>{
    const text = inv.id.toLowerCase().includes(term) || inv.client.toLowerCase().includes(term) || String(inv.amount).includes(term);
    const st = status==='all' || inv.status===status;
    return text && st;
  });
  tbody.innerHTML = filtered.length? filtered.map(inv=>{
    const remaining = Math.max(0,(inv.amount||0)-(inv.amountPaid||0));
    return `
      <tr>
        <td><strong>${inv.id}</strong></td>
        <td>${inv.client}</td>
        <td>${formatDate(inv.date)}</td>
        <td><strong>${formatCurrency(inv.amount)}</strong></td>
        <td><span class="invoice-status status-${inv.status}">${inv.status.toUpperCase()}</span></td>
        <td>${inv.paymentMode||'-'}</td>
        <td>${formatCurrency(inv.amountPaid||0)}</td>
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
  }).join('') : `<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--muted)">No invoices found</td></tr>`;
}

/* ---------- Invoice Modal (Per-invoice Tax + Discount dual mode) ---------- */
function initInvoiceModal(){
  const modal = document.getElementById('invoiceModal');
  document.getElementById('createInvoiceBtn')?.addEventListener('click', ()=>openInvoiceModal());
  document.getElementById('newInvoiceBtn')?.addEventListener('click', ()=>openInvoiceModal());
  document.getElementById('quickInvoice')?.addEventListener('click', ()=>openInvoiceModal());
  document.getElementById('closeModal')?.addEventListener('click', closeInvoiceModal);
  document.getElementById('cancelModal')?.addEventListener('click', closeInvoiceModal);
  modal?.addEventListener('click', e=>{ if (e.target===modal) closeInvoiceModal(); });
  initInvoiceForm();
}
function openInvoiceModal(editId=null){
  resetInvoiceForm();
  if (editId) preloadInvoice(editId);
  document.getElementById('invoiceModal').classList.add('active');
  document.body.style.overflow='hidden';
}
function closeInvoiceModal(){
  document.getElementById('invoiceModal').classList.remove('active');
  document.body.style.overflow='auto';
}
function resetInvoiceForm(){
  const form = document.getElementById('invoiceForm');
  form.reset();
  document.getElementById('invoiceDate').value = new Date().toISOString().split('T');

  // keep one line
  const wrap = document.querySelector('.invoice-items');
  wrap.querySelectorAll('.item-row').forEach((r,i)=>{ if (i>0) r.remove(); });
  const row = wrap.querySelector('.item-row');
  row.querySelector('.item-search').value = '';
  row.querySelector('.quantity-input').value = '';
  row.querySelector('.unit-input').value = '';
  row.querySelector('.rate-input').value = '';
  row.querySelector('.item-total').textContent = formatCurrency(0);

  // client
  const cn = document.getElementById('invoiceClient'); const cp = document.getElementById('clientPhoneInput');
  cn.value=''; cp.value=''; delete cn.dataset.clientId;

  // invoice-specific tax + discount
  document.getElementById('discountMode').value='PERCENT';
  document.getElementById('discountInputPercent').value = 0;
  document.getElementById('discountInputAmount').value = 0;
  document.getElementById('invoiceTaxPct').value = 18;
  document.getElementById('invoiceTaxIncluded').checked = false;

  // totals
  setText('#subtotal', formatCurrency(0));
  setText('#tax', formatCurrency(0));
  setText('#total', formatCurrency(0));
  setText('#remainingAmount', formatCurrency(0));
  document.getElementById('amountPaidInput').value = 0;

  initClientDropdown();
  initItemDropdowns();
  wireSummaryInputs();
}
function preloadInvoice(id){
  const inv = invoices.find(i=>i.id===id); if (!inv) return;
  const name = document.getElementById('invoiceClient');
  const phone = document.getElementById('clientPhoneInput');
  name.value = inv.client; name.dataset.clientId = inv.clientId || '';
  phone.value = inv.clientPhone || '';
  document.getElementById('invoiceDate').value = inv.date;

  // items
  const wrap = document.querySelector('.invoice-items');
  wrap.querySelectorAll('.item-row').forEach((r,i)=>{ if (i>0) r.remove(); });
  const first = wrap.querySelector('.item-row');
  inv.items.forEach((it, idx)=>{
    let row = first;
    if (idx>0) row = addInvoiceItem(true);
    row.querySelector('.item-search').value = it.description;
    row.querySelector('.quantity-input').value = it.quantity;
    row.querySelector('.unit-input').value = it.unit || '';
    row.querySelector('.rate-input').value = it.rate;
  });

  // discount & tax
  document.getElementById('discountMode').value = inv.discountMode || 'PERCENT';
  document.getElementById('discountInputPercent').value = inv.discountPercent || 0;
  document.getElementById('discountInputAmount').value = inv.discountAmount || 0;
  document.getElementById('invoiceTaxPct').value = typeof inv.taxPct==='number'? inv.taxPct : 18;
  document.getElementById('invoiceTaxIncluded').checked = !!inv.taxIncluded;

  document.getElementById('paymentModeSelect').value = inv.paymentMode || 'Cash';
  document.getElementById('amountPaidInput').value = inv.amountPaid || 0;

  wireSummaryInputs();
  updateInvoiceTotal();
}
function initInvoiceForm(){
  document.getElementById('addItemBtn')?.addEventListener('click', ()=>addInvoiceItem());
  document.getElementById('invoiceForm')?.addEventListener('submit', handleInvoiceSubmit);
}
function addInvoiceItem(returnRow=false){
  const container = document.querySelector('.invoice-items');
  const shell = document.createElement('div');
  shell.className='item-row';
  shell.innerHTML = `
    <div class="searchable-dropdown item-dropdown" style="grid-column: span 5;">
      <div class="item-row-inline" style="display:grid;grid-template-columns:2.2fr 90px 110px 120px 100px 38px;gap:12px;align-items:center;">
        <input type="text" placeholder="Product/Service" class="form-input searchable-input item-search" autocomplete="off" required />
        <input type="number" placeholder="Qty" class="form-input quantity-input" min="1" required />
        <input type="text" placeholder="Unit (pcs/kg/ltr)" class="form-input unit-input" />
        <input type="number" placeholder="Rate" class="form-input rate-input" min="0" step="0.01" required />
        <span class="item-total">₹0</span>
        <button type="button" class="remove-item"><i class="fas fa-trash"></i></button>
      </div>
      <div class="dropdown-list item-dropdown-list"></div>
    </div>
  `;
  container.appendChild(shell);
  const qty = shell.querySelector('.quantity-input');
  const rate = shell.querySelector('.rate-input');
  qty.addEventListener('input', updateInvoiceTotal);
  rate.addEventListener('input', updateInvoiceTotal);
  shell.querySelector('.remove-item').addEventListener('click', ()=>{ shell.remove(); updateInvoiceTotal(); });
  initSingleItemDropdown(shell.querySelector('.item-search'));
  if (returnRow) return shell;
}
function wireSummaryInputs(){
  const ids = ['discountMode','discountInputPercent','discountInputAmount','invoiceTaxPct','invoiceTaxIncluded','amountPaidInput'];
  ids.forEach(id=>{
    const el = document.getElementById(id);
    if (!el) return;
    const evt = id==='invoiceTaxIncluded'? 'change' : 'input';
    el.addEventListener(evt, ()=>{
      if (id==='discountInputPercent') syncDiscountFromPercent();
      if (id==='discountInputAmount') syncDiscountFromAmount();
      if (id==='discountMode') enforceDiscountMode();
      updateInvoiceTotal();
    }, { passive:true });
  });
}
function syncDiscountFromPercent(){
  const percent = parseFloat(document.getElementById('discountInputPercent').value)||0;
  const { base } = computeBaseAndTaxPreview(); // base before tax
  const amt = Math.max(0, base * (percent/100));
  document.getElementById('discountInputAmount').value = round2(amt);
}
function syncDiscountFromAmount(){
  const amount = parseFloat(document.getElementById('discountInputAmount').value)||0;
  const { base } = computeBaseAndTaxPreview();
  const pct = base>0 ? (amount/base)*100 : 0;
  document.getElementById('discountInputPercent').value = round2(pct);
}
function enforceDiscountMode(){
  const mode = document.getElementById('discountMode').value;
  const p = document.getElementById('discountInputPercent');
  const a = document.getElementById('discountInputAmount');
  if (mode==='PERCENT'){ p.removeAttribute('disabled'); a.setAttribute('disabled','disabled'); }
  else { a.removeAttribute('disabled'); p.setAttribute('disabled','disabled'); }
}
function round2(n){ return Math.round((n + Number.EPSILON)*100)/100; }

function computeBaseAndTaxPreview(){
  // subtotal from lines
  let subtotal = 0;
  document.querySelectorAll('.item-row').forEach(r=>{
    const q = parseFloat(r.querySelector('.quantity-input').value)||0;
    const rate = parseFloat(r.querySelector('.rate-input').value)||0;
    subtotal += q*rate;
  });
  const taxPct = parseFloat(document.getElementById('invoiceTaxPct').value)||0;
  const included = document.getElementById('invoiceTaxIncluded').checked;
  let base = subtotal, tax = 0;
  if (included){
    const f = 1 + (taxPct/100);
    const net = f? (subtotal / f) : subtotal; // extract base from inclusive [9]
    tax = subtotal - net; base = net;
  } else {
    tax = base * (taxPct/100);
  }
  return { subtotal, base, tax, taxPct, included };
}
function updateInvoiceTotal(){
  // update per-line totals
  let subtotal = 0;
  document.querySelectorAll('.item-row').forEach(r=>{
    const q = parseFloat(r.querySelector('.quantity-input').value)||0;
    const rate = parseFloat(r.querySelector('.rate-input').value)||0;
    const t = q*rate;
    r.querySelector('.item-total').textContent = formatCurrency(t);
    subtotal += t;
  });

  const { base, tax, taxPct, included } = computeBaseAndTaxPreview();

  // discount
  const mode = document.getElementById('discountMode').value;
  const discPct = parseFloat(document.getElementById('discountInputPercent').value)||0;
  const discAmt = parseFloat(document.getElementById('discountInputAmount').value)||0;

  const discountAmount = mode==='PERCENT' ? (base * (discPct/100)) : discAmt;
  const baseAfterDiscount = Math.max(0, base - discountAmount);

  // recompute tax only on base (if excluded), if included we keep extracted tax model simple
  let total = 0, taxDisplay = 0;
  if (included){
    // Inclusive price: total = (baseAfterDiscount + tax proportionally kept). For simplicity, reduce base only; tax will be displayed as extracted from original subtotal.
    const proportion = base>0 ? (baseAfterDiscount/base) : 0;
    const adjustedTax = tax * proportion;
    total = baseAfterDiscount + adjustedTax;
    taxDisplay = adjustedTax;
  } else {
    const taxRecalc = baseAfterDiscount * (taxPct/100);
    total = baseAfterDiscount + taxRecalc;
    taxDisplay = taxRecalc;
  }

  setText('#subtotal', formatCurrency(baseAfterDiscount));
  setText('#tax', formatCurrency(taxDisplay));
  setText('#total', formatCurrency(total));

  const paid = parseFloat(document.getElementById('amountPaidInput').value)||0;
  setText('#remainingAmount', formatCurrency(Math.max(0,total - paid)));
}
function handleInvoiceSubmit(e){
  e.preventDefault();
  showLoading();
  setTimeout(()=>{
    // client
    const nameEl = document.getElementById('invoiceClient');
    const phoneEl = document.getElementById('clientPhoneInput');
    let clientObj = null;
    if (nameEl.dataset.clientId){
      clientObj = clients.find(c=>c.id===nameEl.dataset.clientId);
      if (clientObj && phoneEl.value) clientObj.phone = phoneEl.value.trim();
    } else {
      const newId = genId('client', clients);
      clientObj = { id:newId, name: nameEl.value.trim(), phone: phoneEl.value.trim(), email:'', address:'' };
      clients.push(clientObj);
    }
    // items
    const items = [];
    document.querySelectorAll('.item-row').forEach(r=>{
      const desc = r.querySelector('.item-search').value.trim();
      const q = parseFloat(r.querySelector('.quantity-input').value)||0;
      const unit = (r.querySelector('.unit-input').value||'pcs').trim();
      const rate = parseFloat(r.querySelector('.rate-input').value)||0;
      if (!desc) return;
      // add product if new
      if (!products.find(p=>p.name.toLowerCase()===desc.toLowerCase())){
        products.push({ id: genId('PRD', products), name: desc, price: rate, stock: 0, unit, category: 'General' });
      }
      items.push({ description: desc, quantity: q, rate, unit });
    });

    // totals
    const { base } = computeBaseAndTaxPreview(); // from current inputs
    const mode = document.getElementById('discountMode').value;
    const discPct = parseFloat(document.getElementById('discountInputPercent').value)||0;
    const discAmt = parseFloat(document.getElementById('discountInputAmount').value)||0;
    const taxPct = parseFloat(document.getElementById('invoiceTaxPct').value)||0;
    const included = document.getElementById('invoiceTaxIncluded').checked;
    let discountAmount = mode==='PERCENT' ? (base*(discPct/100)) : discAmt;
    const baseAfterDiscount = Math.max(0, base - discountAmount);

    let total = 0;
    if (included){
      // total is discounted base + proportional tax (same approach as preview)
      const { tax } = computeBaseAndTaxPreview();
      const proportion = base>0 ? (baseAfterDiscount/base) : 0;
      total = baseAfterDiscount + (tax*proportion);
    } else {
      total = baseAfterDiscount + (baseAfterDiscount*(taxPct/100));
    }

    const paymentMode = document.getElementById('paymentModeSelect').value;
    const paid = parseFloat(document.getElementById('amountPaidInput').value)||0;

    const newInv = {
      id: genId('INV', invoices),
      client: clientObj.name, clientId: clientObj.id, clientPhone: clientObj.phone||'',
      date: document.getElementById('invoiceDate').value,
      items,
      discountMode: mode,
      discountPercent: mode==='PERCENT'? discPct : (base>0 ? (discountAmount/base)*100 : 0),
      discountAmount: mode==='AMOUNT'? discAmt : (base*(discPct/100)),
      taxPct, taxIncluded: included,
      paymentMode, amountPaid: paid,
      amount: total,
      status: paid >= total ? 'paid' : 'pending'
    };
    invoices.unshift(newInv);

    hideLoading(); closeInvoiceModal();
    showToast(`Invoice ${newInv.id} created successfully!`);
    updateDashboardStats(); renderRecentInvoices(); renderInvoicesTable();
    renderProductGrid(); renderClientGrid();
    saveAll();
  }, 300);
}

/* ---------- Searchable Dropdowns ---------- */
function initClientDropdown(){
  const input = document.getElementById('invoiceClient');
  const phone = document.getElementById('clientPhoneInput');
  const list = document.getElementById('clientDropdownList');
  if (!input || !list) return;

  input.addEventListener('input', ()=>{
    const term = input.value.toLowerCase().trim();
    if (!term){ list.style.display='none'; return; }
    const filtered = clients.filter(c=> c.name.toLowerCase().includes(term) || (c.phone||'').includes(term));
    render(filtered, term);
    list.style.display='block';
  });
  input.addEventListener('blur', ()=> setTimeout(()=> list.style.display='none', 120));
  document.addEventListener('click', e=>{ if (!e.target.closest('#clientDropdown')) list.style.display='none'; });

  function render(arr, term){
    const exact = arr.find(c=> c.name.toLowerCase()===term);
    const rows = arr.map(c=>`
      <div class="dropdown-item" tabindex="0" onclick="selectClient('${c.id}')">
        <div class="dropdown-item-main">${escapeHtml(c.name)}</div>
        <div class="dropdown-item-sub">${escapeHtml(c.phone||'No phone')}</div>
      </div>
    `).join('');
    const addRow = exact? '' : `
      <div class="dropdown-item add-new" tabindex="0" onclick="addNewClientFromTerm('${encodeURIComponent(term)}')">
        <div class="dropdown-item-main"><i class="fas fa-plus-circle"></i> Add "${escapeHtml(term)}" as new client</div>
      </div>`;
    list.innerHTML = rows + addRow;
  }

  window.selectClient = (id)=>{
    const c = clients.find(x=>x.id===id); if (!c) return;
    input.dataset.clientId = c.id; input.value = c.name; phone.value = c.phone || '';
  };
  window.addNewClientFromTerm = (enc)=>{
    const name = decodeURIComponent(enc);
    delete input.dataset.clientId;
    input.value = name; phone.focus();
    showToast(`Enter a contact number for "${name}"`, 'info');
  };
}
function initItemDropdowns(){
  document.querySelectorAll('.item-search').forEach(initSingleItemDropdown);
  document.addEventListener('click', e=>{
    if (!e.target.classList.contains('item-search')){
      document.querySelectorAll('.item-dropdown-list').forEach(d=> d.style.display='none');
    }
  });
}
function initSingleItemDropdown(input){
  const row = input.closest('.item-row');
  const dropdown = row.querySelector('.item-dropdown-list');
  const qty = row.querySelector('.quantity-input');
  const rate = row.querySelector('.rate-input');
  const unit = row.querySelector('.unit-input');

  input.addEventListener('input', ()=>{
    const term = input.value.toLowerCase().trim();
    if (!term){ dropdown.style.display='none'; return; }
    const filtered = products.filter(p=> p.name.toLowerCase().includes(term));
    render(term, filtered);
    dropdown.style.display='block';
  });
  input.addEventListener('blur', ()=> setTimeout(()=> dropdown.style.display='none', 120));

  function render(term, list){
    const exact = list.find(p=> p.name.toLowerCase()===term);
    const rows = list.map(p=>`
      <div class="dropdown-item" tabindex="0" onclick="selectProductLine('${p.id}', this)">
        <div class="dropdown-item-main">${escapeHtml(p.name)}</div>
        <div class="dropdown-item-sub">${formatCurrency(p.price)} per ${escapeHtml(p.unit)}</div>
      </div>
    `).join('');
    const addRow = exact ? '' : `
      <div class="dropdown-item add-new" tabindex="0" onclick="addNewProductLine('${encodeURIComponent(term)}', this)">
        <div class="dropdown-item-main"><i class="fas fa-plus-circle"></i> Add "${escapeHtml(term)}" as new product</div>
      </div>`;
    dropdown.innerHTML = rows + addRow;
  }

  window.selectProductLine = (id, el)=>{
    const p = products.find(x=>x.id===id); if (!p) return;
    input.value = p.name; if (!qty.value) qty.value = 1;
    rate.value = p.price; unit.value = p.unit || 'pcs';
    updateInvoiceTotal();
  };
  window.addNewProductLine = (enc, el)=>{
    const name = decodeURIComponent(enc);
    input.value = name; if (!qty.value) qty.value = 1;
    if (!unit.value) unit.value = 'pcs';
    showToast(`Enter unit and rate for "${name}"`, 'info');
    updateInvoiceTotal();
  };
}

/* ---------- WhatsApp Share ---------- */
let sharingInvoiceId = null;
function openWhatsappModal(id){ sharingInvoiceId=id; document.getElementById('whatsappModal').classList.add('active'); document.body.style.overflow='hidden'; }
function closeWhatsappModal(){ sharingInvoiceId=null; document.getElementById('whatsappModal').classList.remove('active'); document.body.style.overflow='auto'; }
function shareInvoiceFormat(fmt){
  if (!sharingInvoiceId) return;
  const inv = invoices.find(i=>i.id===sharingInvoiceId); if (!inv) return showToast('Invoice not found','error');
  closeWhatsappModal();
  showLoading();
  if (fmt==='text'){ setTimeout(()=>{ shareText(inv); hideLoading(); }, 300); }
  else { setTimeout(()=>{ shareImage(inv); hideLoading(); }, 700); }
}
function shareText(inv){
  const client = clients.find(c=>c.id===inv.clientId);
  const phone = (inv.clientPhone || client?.phone || '').replace(/\D/g,'');
  const items = inv.items.map(it=>`• ${it.description} — ${it.quantity} ${it.unit} × ${formatCurrency(it.rate)} = ${formatCurrency(it.quantity*it.rate)}`).join('\n');
  const subtotal = inv.items.reduce((s,it)=> s + (it.quantity*it.rate), 0);
  const remaining = Math.max(0,(inv.amount||0)-(inv.amountPaid||0));
  const msg = `*${businessSettings.name}*\n📧 ${businessSettings.email}\n📞 ${businessSettings.phone}\n🏢 ${businessSettings.address}\nGST: ${businessSettings.gst}\n\n*INVOICE ${inv.id}*\nDate: ${formatDate(inv.date)}\nClient: ${inv.client}\n\n*ITEMS:*\n${items}\n\nSubtotal: ${formatCurrency(subtotal)}\nTotal: ${formatCurrency(inv.amount)}\nPaid: ${formatCurrency(inv.amountPaid||0)}\nRemaining: ${formatCurrency(remaining)}\nStatus: ${inv.status.toUpperCase()}\n\nThank you for your business!`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`; // URL encode WhatsApp text [9]
  window.open(url,'_blank');
  showToast('Opening WhatsApp…');
}
function shareImage(inv){
  const node = buildInvoiceImage(inv);
  document.body.appendChild(node);
  html2canvas(node,{backgroundColor:'#ffffff',scale:2,useCORS:true}).then(canvas=>{
    canvas.toBlob(blob=>{
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`${inv.id}.png`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=> URL.revokeObjectURL(url), 5000);
      const cl = clients.find(c=>c.id===inv.clientId);
      const phone = (inv.clientPhone || cl?.phone || '').replace(/\D/g,'');
      const note = encodeURIComponent(`Invoice ${inv.id} image downloaded. Please attach in WhatsApp chat.\n\n${businessSettings.name}\n${businessSettings.phone}`);
      window.open(`https://wa.me/${phone}?text=${note}`,'_blank');
      showToast('Invoice image downloaded. Attach in WhatsApp.');
      node.remove();
    }, 'image/png');
  }).catch(err=>{ console.error(err); node.remove(); showToast('Failed to generate image','error'); });
}
function buildInvoiceImage(inv){
  const subtotal = inv.items.reduce((s,it)=> s + (it.quantity*it.rate), 0);
  const remaining = Math.max(0,(inv.amount||0)-(inv.amountPaid||0));
  const client = clients.find(c=>c.id===inv.clientId);
  const wrap = document.createElement('div');
  wrap.className='invoice-template';
  wrap.style.width='800px'; wrap.style.padding='40px';
  wrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #4285F4;padding-bottom:16px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:12px;">
        ${businessSettings.logo? `<img src="${businessSettings.logo}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;">` : ''}
        <div>
          <div style="font-size:26px;font-weight:800;color:#202124">${escapeHtml(businessSettings.name)}</div>
          <div style="color:#5f6368;font-size:13px;">${escapeHtml(businessSettings.email)}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:24px;font-weight:900;color:#ea4335;">INVOICE</div>
        <div style="color:#5f6368">${escapeHtml(inv.id)}</div>
      </div>
    </div>
    <div style="display:flex;gap:24px;margin-bottom:16px;">
      <div style="flex:1;">
        <div style="font-weight:800;color:#202124;margin-bottom:6px;">From</div>
        <div style="color:#5f6368;font-size:13px;line-height:1.6;">
          ${escapeHtml(businessSettings.name)}<br>${escapeHtml(businessSettings.address)}<br>${escapeHtml(businessSettings.phone)}<br>${escapeHtml(businessSettings.email)}<br>GST: ${escapeHtml(businessSettings.gst)}
        </div>
      </div>
      <div style="flex:1;text-align:right;">
        <div style="font-weight:800;color:#202124;margin-bottom:6px;">To</div>
        <div style="color:#5f6368;font-size:13px;line-height:1.6;">
          ${escapeHtml(inv.client)}<br>${escapeHtml(client?.address||'')}<br>${escapeHtml(inv.clientPhone || client?.phone || '')}
        </div>
      </div>
    </div>
    <div style="display:flex;gap:24px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;padding:12px 14px;margin-bottom:12px;">
      <div><div style="color:#5f6368;font-size:12px;">Invoice Date</div><div style="font-weight:800;color:#202124">${formatDate(inv.date)}</div></div>
      <div><div style="color:#5f6368;font-size:12px;">Status</div><div style="font-weight:900;color:${inv.status==='paid'?'#34a853':inv.status==='pending'?'#fbbc05':'#ea4335'}">${inv.status.toUpperCase()}</div></div>
      <div><div style="color:#5f6368;font-size:12px;">Payment</div><div style="font-weight:700;color:#202124">${escapeHtml(inv.paymentMode||'-')}</div></div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
      <thead><tr style="background:#4285F4;color:#fff;">
        <th style="text-align:left;padding:10px;">Description</th>
        <th style="text-align:center;padding:10px;">Qty</th>
        <th style="text-align:center;padding:10px;">Unit</th>
        <th style="text-align:right;padding:10px;">Rate</th>
        <th style="text-align:right;padding:10px;">Amount</th>
      </tr></thead>
      <tbody>
        ${inv.items.map((it,i)=>`
          <tr style="${i%2===0?'background:#f9f9f9;':''}">
            <td style="padding:10px;color:#202124">${escapeHtml(it.description)}</td>
            <td style="padding:10px;text-align:center;color:#5f6368">${it.quantity}</td>
            <td style="padding:10px;text-align:center;color:#5f6368">${escapeHtml(it.unit)}</td>
            <td style="padding:10px;text-align:right;color:#5f6368">${formatCurrency(it.rate)}</td>
            <td style="padding:10px;text-align:right;font-weight:800;color:#202124">${formatCurrency(it.quantity*it.rate)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;">
      <div style="width:320px;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e0e0e0;"><span style="color:#5f6368">Subtotal</span><strong style="color:#202124">${formatCurrency(subtotal)}</strong></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e0e0e0;"><span style="color:#5f6368">Total</span><strong style="color:#202124">${formatCurrency(inv.amount)}</strong></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e0e0e0;"><span style="color:#5f6368">Paid</span><strong style="color:#202124">${formatCurrency(inv.amountPaid||0)}</strong></div>
        <div style="display:flex;justify-content:space-between;padding:10px;border-radius:6px;background:#4285F4;color:#fff;margin-top:8px;"><span style="font-weight:700;">Remaining</span><span style="font-weight:900;">${formatCurrency(remaining)}</span></div>
      </div>
    </div>
    <div style="text-align:center;color:#5f6368;font-size:12px;margin-top:16px;">Thank you for your business</div>
  `;
  return wrap;
}

/* ---------- Download Invoice ---------- */
function downloadInvoice(id){
  const inv = invoices.find(i=>i.id===id);
  if (!inv) return showToast('Invoice not found','error');
  showLoading();
  const node = buildInvoiceImage(inv);
  document.body.appendChild(node);
  html2canvas(node,{backgroundColor:'#ffffff',scale:2,useCORS:true}).then(canvas=>{
    canvas.toBlob(blob=>{
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`${inv.id}.png`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=> URL.revokeObjectURL(url), 5000);
      hideLoading(); node.remove();
      showToast(`Invoice ${inv.id} downloaded successfully!`);
    }, 'image/png');
  }).catch(err=>{
    console.error(err); node.remove(); hideLoading();
    // Fallback CSV
    const rows = [
      ['Invoice', inv.id], ['Date', formatDate(inv.date)], ['Client', inv.client], ['Phone', inv.clientPhone||''], [],
      ['Description','Qty','Unit','Rate','Amount'],
      ...inv.items.map(it=>[it.description,it.quantity,it.unit,it.rate,(it.quantity*it.rate)])
    ];
    const csv = rows.map(r=> r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`${inv.id}.csv`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=> URL.revokeObjectURL(url), 5000);
    showToast(`Invoice ${inv.id} downloaded as CSV`);
  });
}

/* ---------- Edit/Delete Invoice ---------- */
function editInvoice(id){ openInvoiceModal(id); }
function deleteInvoice(id){
  if (!confirm('Delete this invoice?')) return;
  invoices = invoices.filter(i=>i.id!==id);
  showToast('Invoice deleted');
  renderInvoicesTable(); renderRecentInvoices(); updateDashboardStats(); saveAll();
}

/* ---------- Inventory ---------- */
function renderProductGrid(){
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  if (!products.length){
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted)">No products</div>`;
    return;
  }
  grid.innerHTML = products.map(p=>{
    const color = p.stock===0?'var(--error)': (p.stock<=5?'var(--warning)':'var(--success)');
    return `
      <div class="product-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <h3 style="margin:0;color:var(--text);font-weight:900;font-size:16px;">${escapeHtml(p.name)}</h3>
          <span style="background:${color};color:#fff;padding:2px 8px;border-radius:12px;font-size:10px">${p.stock} ${escapeHtml(p.unit)}</span>
        </div>
        <div style="color:var(--muted);font-size:12px;margin-bottom:8px;">${escapeHtml(p.category)}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-weight:900;color:var(--text)">${formatCurrency(p.price)}/${escapeHtml(p.unit)}</div>
          <div style="display:flex;gap:8px;">
            <button class="action-btn" title="Open Details" onclick="openProductDetails('${p.id}')"><i class="fas fa-edit"></i></button>
            <button class="action-btn" title="Delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
function updateInventoryStats(){
  const units = products.reduce((s,p)=> s + (Number(p.stock)||0), 0);
  const low = products.filter(p=> (p.stock||0)<=5 && (p.stock||0)>0).length;
  const out = products.filter(p=> (p.stock||0)===0).length;
  setText('#stockUnits', units);
  setText('#lowStock', low);
  setText('#outStock', out);
}
function openProductDetails(id){
  const p = products.find(x=>x.id===id); if (!p) return;
  editingProductId = id;
  goToSection('inventory-details');
  document.getElementById('pd_name').value = p.name;
  document.getElementById('pd_category').value = p.category || '';
  document.getElementById('pd_unit').value = p.unit || '';
  document.getElementById('pd_price').value = p.price || 0;
  document.getElementById('pd_stock').value = p.stock || 0;
}
function deleteProduct(id){
  if (!confirm('Delete this product?')) return;
  products = products.filter(p=>p.id!==id);
  showToast('Product deleted'); renderProductGrid(); updateInventoryStats(); saveAll();
}

/* Inventory search */
function initInventorySearch(){
  document.getElementById('productSearch')?.addEventListener('input', e=>{
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p=> p.name.toLowerCase().includes(term) || (p.category||'').toLowerCase().includes(term) || (p.unit||'').toLowerCase().includes(term));
    const orig = products; products = filtered; renderProductGrid(); products = orig;
  });
}

/* Import/Export Inventory */
function initInventoryIO(){
  document.getElementById('importInventoryFile')?.addEventListener('change', handleInventoryImport);
  document.getElementById('exportInventoryBtn')?.addEventListener('click', exportInventoryXLSX);
}
function handleInventoryImport(e){
  const file = e.target.files; if (!file) return;
  showLoading();
  const reader = new FileReader();
  reader.onload = ev=>{
    try{
      const wb = XLSX.read(ev.target.result,{type:'binary'});
      const ws = wb.Sheets[wb.SheetNames];
      const data = XLSX.utils.sheet_to_json(ws);
      let added=0;
      data.forEach(r=>{
        const name = r.Name || r.name || r.Product || r.product;
        if (!name) return;
        if (products.find(p=>p.name.toLowerCase()===String(name).toLowerCase())) return;
        products.push({
          id: genId('PRD', products),
          name: String(name),
          price: Number(r.Price||r.price||r.Rate||r.rate||0),
          stock: Number(r.Stock||r.stock||r.Quantity||r.quantity||0),
          unit: String(r.Unit||r.unit||'pcs'),
          category: String(r.Category||r.category||'General')
        });
        added++;
      });
      hideLoading(); showToast(`Imported ${added} products`);
      renderProductGrid(); updateInventoryStats(); saveAll();
    }catch(err){ console.error(err); hideLoading(); showToast('Error importing inventory','error'); }
  };
  reader.readAsBinaryString(file);
  e.target.value='';
}
function exportInventoryXLSX(){
  try{
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(products.map(p=>({ ID:p.id, Name:p.name, Price:p.price, Stock:p.stock, Unit:p.unit, Category:p.category })));
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'inventory-export.xlsx', { compression:true });
    showToast('Exported inventory to inventory-export.xlsx');
  }catch(err){ console.error(err); showToast('Export failed','error'); }
}

/* ---------- Clients ---------- */
function renderClientGrid(){
  const grid = document.getElementById('clientGrid');
  if (!grid) return;
  if (!clients.length){
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted)">No clients</div>`;
    return;
  }
  grid.innerHTML = clients.map(c=>`
    <div class="client-card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900">${escapeHtml((c.name||'?').charAt(0).toUpperCase())}</div>
        <div>
          <div style="font-weight:900;color:var(--text)">${escapeHtml(c.name)}</div>
          <div style="font-size:12px;color:var(--muted)">${escapeHtml(c.email||'No email')}</div>
        </div>
      </div>
      <div style="color:var(--muted);font-size:14px;margin-bottom:8px;"><i class="fas fa-phone" style="width:16px;margin-right:6px;color:var(--primary)"></i>${escapeHtml(c.phone||'-')}</div>
      <div style="color:var(--muted);font-size:14px;margin-bottom:12px;"><i class="fas fa-map-marker-alt" style="width:16px;margin-right:6px;color:var(--primary)"></i>${escapeHtml(c.address||'-')}</div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="action-btn" title="Open Details" onclick="openClientDetails('${c.id}')"><i class="fas fa-edit"></i></button>
        <button class="action-btn" title="Invoice" onclick="createInvoiceForClient('${c.id}')"><i class="fas fa-file-invoice"></i></button>
        <button class="action-btn" title="Delete" onclick="deleteClient('${c.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}
function openClientDetails(id){
  const c = clients.find(x=>x.id===id); if (!c) return;
  editingClientId = id;
  goToSection('client-details');
  document.getElementById('cd_name').value = c.name || '';
  document.getElementById('cd_phone').value = c.phone || '';
  document.getElementById('cd_email').value = c.email || '';
  document.getElementById('cd_address').value = c.address || '';
}
function deleteClient(id){
  if (!confirm('Delete this client?')) return;
  clients = clients.filter(c=>c.id!==id);
  showToast('Client deleted'); renderClientGrid(); saveAll();
}
function createInvoiceForClient(id){
  const c = clients.find(x=>x.id===id);
  openInvoiceModal();
  if (!c) return;
  const name = document.getElementById('invoiceClient');
  const phone = document.getElementById('clientPhoneInput');
  name.value = c.name; name.dataset.clientId = c.id; phone.value = c.phone||'';
}

/* Client search */
function initClientSearch(){
  document.getElementById('clientSearch')?.addEventListener('input', e=>{
    const term = e.target.value.toLowerCase();
    const filtered = clients.filter(c=> c.name.toLowerCase().includes(term) || (c.email||'').toLowerCase().includes(term) || (c.phone||'').includes(term));
    const orig = clients; clients = filtered; renderClientGrid(); clients = orig;
  });
}

/* Import/Export Clients */
function initClientsIO(){
  document.getElementById('importClientsFile')?.addEventListener('change', handleClientsImport);
  document.getElementById('exportClientsBtn')?.addEventListener('click', exportClientsXLSX);
}
function handleClientsImport(e){
  const file = e.target.files; if (!file) return;
  showLoading();
  const reader = new FileReader();
  reader.onload = ev=>{
    try{
      const wb = XLSX.read(ev.target.result,{type:'binary'});
      const ws = wb.Sheets[wb.SheetNames];
      const data = XLSX.utils.sheet_to_json(ws);
      let added=0;
      data.forEach(r=>{
        const name = r.Name || r.name || r.Client || r.client;
        if (!name) return;
        if (clients.find(c=>c.name.toLowerCase()===String(name).toLowerCase())) return;
        clients.push({
          id: genId('client', clients),
          name: String(name),
          email: r.Email||r.email||'',
          phone: r.Phone||r.phone||r.Contact||r.contact||'',
          address: r.Address||r.address||''
        });
        added++;
      });
      hideLoading(); showToast(`Imported ${added} clients`);
      renderClientGrid(); saveAll();
    }catch(err){ console.error(err); hideLoading(); showToast('Error importing clients','error'); }
  };
  reader.readAsBinaryString(file);
  e.target.value='';
}
function exportClientsXLSX(){
  try{
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(clients.map(c=>({ ID:c.id, Name:c.name, Email:c.email, Phone:c.phone, Address:c.address })));
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, 'clients-export.xlsx', { compression:true });
    showToast('Exported clients to clients-export.xlsx');
  }catch(err){ console.error(err); showToast('Export failed','error'); }
}

/* ---------- Client & Product Details Save ---------- */
function initDetailForms(){
  document.getElementById('clientDetailsForm')?.addEventListener('submit', e=>{
    e.preventDefault();
    if (!editingClientId) return goToSection('clients');
    const c = clients.find(x=>x.id===editingClientId); if (!c) return;
    c.name = document.getElementById('cd_name').value.trim();
    c.phone = document.getElementById('cd_phone').value.trim();
    c.email = document.getElementById('cd_email').value.trim();
    c.address = document.getElementById('cd_address').value.trim();
    showToast('Client saved'); saveAll(); renderClientGrid(); goToSection('clients');
    editingClientId = null;
  });
  document.getElementById('productDetailsForm')?.addEventListener('submit', e=>{
    e.preventDefault();
    if (!editingProductId) return goToSection('inventory');
    const p = products.find(x=>x.id===editingProductId); if (!p) return;
    p.name = document.getElementById('pd_name').value.trim();
    p.category = document.getElementById('pd_category').value.trim();
    p.unit = document.getElementById('pd_unit').value.trim() || 'pcs';
    p.price = parseFloat(document.getElementById('pd_price').value)||0;
    p.stock = parseInt(document.getElementById('pd_stock').value)||0;
    showToast('Product saved'); saveAll(); renderProductGrid(); updateInventoryStats(); goToSection('inventory');
    editingProductId = null;
  });
}

/* ---------- Reports (full page) ---------- */
function renderReports(){
  const revenue = invoices.reduce((s,i)=> s + (i.amount||0), 0);
  const pending = invoices.reduce((s,i)=> s + Math.max(0,(i.amount||0)-(i.amountPaid||0)), 0);
  const count = invoices.length;
  const paid = invoices.filter(i=>i.status==='paid').length;
  const pendCount = invoices.filter(i=>i.status==='pending').length;
  const overdue = invoices.filter(i=>i.status==='overdue').length;

  setText('#repRevenue', formatCurrency(revenue));
  setText('#repPending', formatCurrency(pending));
  setText('#repCount', count);
  setText('#repPaid', paid);
  setText('#repPendCount', pendCount);
  setText('#repOverdue', overdue);
}

/* ---------- Settings ---------- */
function loadBusinessSettings(){
  document.getElementById('businessName').value = businessSettings.name;
  document.getElementById('businessEmail').value = businessSettings.email;
  document.getElementById('businessPhone').value = businessSettings.phone;
  document.getElementById('businessGST').value = businessSettings.gst;
  document.getElementById('businessWebsite').value = businessSettings.website;
  document.getElementById('businessAddress').value = businessSettings.address;
  if (businessSettings.logo){
    document.getElementById('logoPreview').innerHTML = `<img src="${businessSettings.logo}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;">`;
  }
}
function initSettings(){
  document.getElementById('saveBusinessSettingsBtn')?.addEventListener('click', ()=>{
    businessSettings.name = document.getElementById('businessName').value.trim();
    businessSettings.email = document.getElementById('businessEmail').value.trim();
    businessSettings.phone = document.getElementById('businessPhone').value.trim();
    businessSettings.gst = document.getElementById('businessGST').value.trim();
    businessSettings.website = document.getElementById('businessWebsite').value.trim();
    businessSettings.address = document.getElementById('businessAddress').value.trim();
    saveAll(); showToast('Settings saved');
  });
  document.getElementById('businessLogo')?.addEventListener('change', e=>{
    const f = e.target.files; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      businessSettings.logo = ev.target.result;
      document.getElementById('logoPreview').innerHTML = `<img src="${ev.target.result}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;">`;
      saveAll(); showToast('Logo updated');
    };
    reader.readAsDataURL(f);
  });
}

/* ---------- Quick Actions ---------- */
function initQuickActions(){
  document.getElementById('viewReports')?.addEventListener('click', ()=> goToSection('reports'));
  // two disabled buttons left as-is per requirement
}

/* ---------- Storage ---------- */
function saveAll(){
  localStorage.setItem('ub_invoices', JSON.stringify(invoices));
  localStorage.setItem('ub_products', JSON.stringify(products));
  localStorage.setItem('ub_clients', JSON.stringify(clients));
  localStorage.setItem('ub_settings', JSON.stringify(businessSettings));
}
function loadAll(){
  try{
    const a = localStorage.getItem('ub_invoices'); if (a) invoices = JSON.parse(a);
    const b = localStorage.getItem('ub_products'); if (b) products = JSON.parse(b);
    const c = localStorage.getItem('ub_clients'); if (c) clients = JSON.parse(c);
    const d = localStorage.getItem('ub_settings'); if (d) businessSettings = { ...businessSettings, ...JSON.parse(d) };
  }catch(e){ console.warn('Storage parse error', e); }
}

/* ---------- Keyboard ---------- */
function initHotkeys(){
  document.addEventListener('keydown', e=>{
    if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='n'){ e.preventDefault(); openInvoiceModal(); }
    if (e.key==='Escape'){ document.querySelectorAll('.modal.active').forEach(m=>m.classList.remove('active')); document.body.style.overflow='auto'; }
  });
}

/* ---------- Init ---------- */
function initApp(){
  loadAll();
  initNavigation();
  initInvoiceModal();
  initInvoiceSearch();
  initInventorySearch();
  initClientSearch();
  initInventoryIO();
  initClientsIO();
  initSettings();
  initDetailForms();
  initQuickActions();
  initHotkeys();

  updateDashboardStats();
  renderRecentInvoices();
  renderProductGrid();
  updateInventoryStats();
  renderClientGrid();
  renderReports();

  // Welcome toast (correct version/build)
  setTimeout(()=>{
    showToast(`Welcome to UniBills — Version ${businessSettings.version} (Build ${businessSettings.build})`, 'success');
  }, 500);
}

document.addEventListener('DOMContentLoaded', initApp);

/* expose minimal api */
window.BillsApp = { openWhatsappModal, shareInvoiceFormat, downloadInvoice, openClientDetails, openProductDetails };
