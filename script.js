// Global Variables
let invoices = [
    {
        id: 'INV-001',
        client: 'Acme Corp',
        clientId: 'acme',
        date: '2025-09-01',
        amount: 25000,
        status: 'paid',
        items: [
            { description: 'Web Development', quantity: 1, rate: 25000 }
        ]
    },
    {
        id: 'INV-002',
        client: 'Tech Solutions',
        clientId: 'tech',
        date: '2025-08-28',
        amount: 18500,
        status: 'pending',
        items: [
            { description: 'UI/UX Design', quantity: 1, rate: 18500 }
        ]
    },
    {
        id: 'INV-003',
        client: 'Digital Agency',
        clientId: 'digital',
        date: '2025-08-25',
        amount: 32000,
        status: 'overdue',
        items: [
            { description: 'Mobile App Development', quantity: 1, rate: 32000 }
        ]
    }
];

let products = [
    {
        id: 'PRD-001',
        name: 'Website Development Package',
        price: 25000,
        stock: 10,
        category: 'Services'
    },
    {
        id: 'PRD-002',
        name: 'Mobile App Development',
        price: 45000,
        stock: 5,
        category: 'Services'
    },
    {
        id: 'PRD-003',
        name: 'Logo Design',
        price: 5000,
        stock: 0,
        category: 'Design'
    },
    {
        id: 'PRD-004',
        name: 'SEO Optimization',
        price: 12000,
        stock: 3,
        category: 'Marketing'
    }
];

let clients = [
    {
        id: 'acme',
        name: 'Acme Corp',
        email: 'contact@acme.com',
        phone: '+91 9876543210',
        address: '123 Business Street, Mumbai'
    },
    {
        id: 'tech',
        name: 'Tech Solutions',
        email: 'info@techsolutions.com',
        phone: '+91 9876543211',
        address: '456 Tech Park, Bangalore'
    },
    {
        id: 'digital',
        name: 'Digital Agency',
        email: 'hello@digitalagency.com',
        phone: '+91 9876543212',
        address: '789 Digital Hub, Delhi'
    }
];

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function generateInvoiceId() {
    const count = invoices.length + 1;
    return `INV-${count.toString().padStart(3, '0')}`;
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconClass = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${iconClass} toast-icon"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

function showLoading() {
    document.getElementById('loadingSpinner').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.remove('active');
}

// Navigation Functions
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding section
            const sectionId = link.getAttribute('data-section') + '-section';
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Load section-specific data
                loadSectionData(link.getAttribute('data-section'));
            }
        });
    });
}

function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            updateDashboardStats();
            renderRecentInvoices();
            break;
        case 'invoices':
            renderInvoicesTable();
            break;
        case 'inventory':
            renderProductGrid();
            break;
        case 'clients':
            renderClientGrid();
            break;
    }
}

// Dashboard Functions
function updateDashboardStats() {
    const totalRevenue = invoices.reduce((sum, invoice) => 
        invoice.status === 'paid' ? sum + invoice.amount : sum, 0);
    
    const pendingAmount = invoices.reduce((sum, invoice) => 
        invoice.status !== 'paid' ? sum + invoice.amount : sum, 0);
    
    const totalInvoices = invoices.length;
    const totalProducts = products.reduce((sum, product) => sum + product.stock, 0);
    
    // Update stat cards (simplified - in real app would animate)
    const stats = document.querySelectorAll('.stat-number');
    if (stats[0]) stats[0].textContent = formatCurrency(totalRevenue);
    if (stats[1]) stats[1].textContent = totalInvoices;
    if (stats[2]) stats[2].textContent = formatCurrency(pendingAmount);
    if (stats[3]) stats[3].textContent = totalProducts;
}

function renderRecentInvoices() {
    const invoiceList = document.querySelector('.invoice-list');
    if (!invoiceList) return;
    
    const recentInvoices = invoices.slice(-3).reverse();
    
    invoiceList.innerHTML = recentInvoices.map(invoice => `
        <div class="invoice-item">
            <div class="invoice-info">
                <h4 class="invoice-number">${invoice.id}</h4>
                <p class="invoice-client">${invoice.client}</p>
            </div>
            <div class="invoice-amount">${formatCurrency(invoice.amount)}</div>
            <div class="invoice-status status-${invoice.status}">${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</div>
            <div class="invoice-actions">
                <button class="action-btn" title="Share on WhatsApp" onclick="shareOnWhatsApp('${invoice.id}')">
                    <i class="fab fa-whatsapp"></i>
                </button>
                <button class="action-btn" title="Download PDF" onclick="downloadInvoice('${invoice.id}')">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Invoice Functions
function renderInvoicesTable() {
    const tableBody = document.getElementById('invoiceTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = invoices.map(invoice => `
        <tr>
            <td><strong>${invoice.id}</strong></td>
            <td>${invoice.client}</td>
            <td>${formatDate(invoice.date)}</td>
            <td><strong>${formatCurrency(invoice.amount)}</strong></td>
            <td><span class="invoice-status status-${invoice.status}">${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span></td>
            <td>
                <div class="invoice-actions">
                    <button class="action-btn" title="Edit" onclick="editInvoice('${invoice.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" title="Share on WhatsApp" onclick="shareOnWhatsApp('${invoice.id}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="action-btn" title="Download PDF" onclick="downloadInvoice('${invoice.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="action-btn" title="Delete" onclick="deleteInvoice('${invoice.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function initInvoiceSearch() {
    const searchInput = document.getElementById('invoiceSearch');
    const filterSelect = document.getElementById('invoiceFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterInvoices);
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', filterInvoices);
    }
}

function filterInvoices() {
    const searchTerm = document.getElementById('invoiceSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('invoiceFilter')?.value || 'all';
    
    let filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.id.toLowerCase().includes(searchTerm) ||
                            invoice.client.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderFilteredInvoices(filteredInvoices);
}

function renderFilteredInvoices(filteredInvoices) {
    const tableBody = document.getElementById('invoiceTableBody');
    if (!tableBody) return;
    
    if (filteredInvoices.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                    No invoices found matching your criteria
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredInvoices.map(invoice => `
        <tr>
            <td><strong>${invoice.id}</strong></td>
            <td>${invoice.client}</td>
            <td>${formatDate(invoice.date)}</td>
            <td><strong>${formatCurrency(invoice.amount)}</strong></td>
            <td><span class="invoice-status status-${invoice.status}">${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span></td>
            <td>
                <div class="invoice-actions">
                    <button class="action-btn" title="Edit" onclick="editInvoice('${invoice.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" title="Share on WhatsApp" onclick="shareOnWhatsApp('${invoice.id}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="action-btn" title="Download PDF" onclick="downloadInvoice('${invoice.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="action-btn" title="Delete" onclick="deleteInvoice('${invoice.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Modal Functions
function initModal() {
    const modal = document.getElementById('invoiceModal');
    const openButtons = document.querySelectorAll('#createInvoiceBtn, #newInvoiceBtn, #quickInvoice');
    const closeButton = document.getElementById('closeModal');
    const cancelButton = document.getElementById('cancelModal');
    
    openButtons.forEach(button => {
        button.addEventListener('click', openInvoiceModal);
    });
    
    if (closeButton) closeButton.addEventListener('click', closeInvoiceModal);
    if (cancelButton) cancelButton.addEventListener('click', closeInvoiceModal);
    
    // Close modal when clicking outside
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeInvoiceModal();
        }
    });
    
    // Initialize form handlers
    initInvoiceForm();
}

function openInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set today's date
    const dateInput = document.getElementById('invoiceDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Reset form
    resetInvoiceForm();
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function resetInvoiceForm() {
    const form = document.getElementById('invoiceForm');
    if (form) form.reset();
    
    // Reset items to one row
    const itemsContainer = document.querySelector('.invoice-items');
    const firstItem = itemsContainer.querySelector('.item-row');
    const allItems = itemsContainer.querySelectorAll('.item-row');
    
    // Remove all items except the first one
    allItems.forEach((item, index) => {
        if (index > 0) {
            item.remove();
        }
    });
    
    // Clear first item
    if (firstItem) {
        firstItem.querySelectorAll('input').forEach(input => input.value = '');
        updateInvoiceTotal();
    }
}

// Invoice Form Functions
function initInvoiceForm() {
    const form = document.getElementById('invoiceForm');
    const addItemBtn = document.getElementById('addItemBtn');
    
    if (form) {
        form.addEventListener('submit', handleInvoiceSubmit);
    }
    
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addInvoiceItem);
    }
    
    // Initialize first item row
    initItemRow(document.querySelector('.item-row'));
}

function initItemRow(itemRow) {
    if (!itemRow) return;
    
    const quantityInput = itemRow.querySelector('.quantity-input');
    const rateInput = itemRow.querySelector('.rate-input');
    const removeBtn = itemRow.querySelector('.remove-item');
    
    if (quantityInput) quantityInput.addEventListener('input', updateInvoiceTotal);
    if (rateInput) rateInput.addEventListener('input', updateInvoiceTotal);
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            removeInvoiceItem(itemRow);
        });
    }
}

function addInvoiceItem() {
    const itemsContainer = document.querySelector('.invoice-items');
    const newItemRow = document.createElement('div');
    newItemRow.className = 'item-row';
    newItemRow.innerHTML = `
        <input type="text" placeholder="Item description" class="form-input" required>
        <input type="number" placeholder="Qty" class="form-input quantity-input" min="1" required>
        <input type="number" placeholder="Rate" class="form-input rate-input" min="0" step="0.01" required>
        <span class="item-total">₹0</span>
        <button type="button" class="remove-item">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    itemsContainer.appendChild(newItemRow);
    initItemRow(newItemRow);
}

function removeInvoiceItem(itemRow) {
    const itemsContainer = document.querySelector('.invoice-items');
    const allItems = itemsContainer.querySelectorAll('.item-row');
    
    if (allItems.length > 1) {
        itemRow.remove();
        updateInvoiceTotal();
    } else {
        showToast('At least one item is required', 'error');
    }
}

function updateInvoiceTotal() {
    const itemRows = document.querySelectorAll('.item-row');
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
        const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
        const itemTotal = quantity * rate;
        
        row.querySelector('.item-total').textContent = formatCurrency(itemTotal);
        subtotal += itemTotal;
    });
    
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('tax').textContent = formatCurrency(tax);
    document.getElementById('total').textContent = formatCurrency(total);
}

function handleInvoiceSubmit(e) {
    e.preventDefault();
    
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        const formData = new FormData(e.target);
        const clientId = formData.get('client') || document.getElementById('invoiceClient').value;
        const date = document.getElementById('invoiceDate').value;
        
        // Get client name
        const client = clients.find(c => c.id === clientId);
        
        // Get items data
        const itemRows = document.querySelectorAll('.item-row');
        const items = Array.from(itemRows).map(row => ({
            description: row.querySelector('input[type="text"]').value,
            quantity: parseFloat(row.querySelector('.quantity-input').value),
            rate: parseFloat(row.querySelector('.rate-input').value)
        }));
        
        // Calculate total
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        const total = subtotal * 1.18; // Including 18% tax
        
        // Create new invoice
        const newInvoice = {
            id: generateInvoiceId(),
            client: client ? client.name : 'Unknown Client',
            clientId: clientId,
            date: date,
            amount: total,
            status: 'pending',
            items: items
        };
        
        invoices.unshift(newInvoice);
        
        hideLoading();
        closeInvoiceModal();
        showToast(`Invoice ${newInvoice.id} created successfully!`);
        
        // Update displays
        updateDashboardStats();
        renderRecentInvoices();
        renderInvoicesTable();
        
    }, 1500);
}

// Product/Inventory Functions
function renderProductGrid() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    productGrid.innerHTML = products.map(product => {
        const stockStatus = product.stock === 0 ? 'out-of-stock' : 
                           product.stock <= 5 ? 'low-stock' : 'in-stock';
        const stockColor = product.stock === 0 ? 'var(--error-color)' : 
                          product.stock <= 5 ? 'var(--warning-color)' : 'var(--success-color)';
        
        return `
            <div class="product-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <h3 style="margin: 0; font-size: 16px; color: var(--body-color);">${product.name}</h3>
                    <span style="background: ${stockColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 500;">
                        ${product.stock} in stock
                    </span>
                </div>
                <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 8px;">${product.category}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 18px; font-weight: 600; color: var(--body-color);">${formatCurrency(product.price)}</span>
                    <div style="display: flex; gap: 8px;">
                        <button class="action-btn" onclick="editProduct('${product.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteProduct('${product.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Client Functions
function renderClientGrid() {
    const clientGrid = document.getElementById('clientGrid');
    if (!clientGrid) return;
    
    clientGrid.innerHTML = clients.map(client => `
        <div class="client-card">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 18px;">
                    ${client.name.charAt(0)}
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 16px; color: var(--body-color);">${client.name}</h3>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">${client.email}</p>
                </div>
            </div>
            <div style="margin-bottom: 12px;">
                <p style="margin: 4px 0; color: var(--text-secondary); font-size: 14px;">
                    <i class="fas fa-phone" style="width: 16px; margin-right: 8px;"></i>
                    ${client.phone}
                </p>
                <p style="margin: 4px 0; color: var(--text-secondary); font-size: 14px;">
                    <i class="fas fa-map-marker-alt" style="width: 16px; margin-right: 8px;"></i>
                    ${client.address}
                </p>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="action-btn" onclick="editClient('${client.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="createInvoiceForClient('${client.id}')" title="Create Invoice">
                    <i class="fas fa-file-invoice"></i>
                </button>
                <button class="action-btn" onclick="deleteClient('${client.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Action Functions
function shareOnWhatsApp(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showToast('Invoice not found', 'error');
        return;
    }
    
    const client = clients.find(c => c.id === invoice.clientId);
    const clientPhone = client ? client.phone.replace(/\D/g, '') : '';
    
    const message = `Hi ${invoice.client},%0A%0AYour invoice ${invoice.id} for ${formatCurrency(invoice.amount)} is ready.%0A%0ATotal Amount: ${formatCurrency(invoice.amount)}%0AStatus: ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}%0A%0AThank you for your business!`;
    
    const whatsappUrl = `https://wa.me/${clientPhone}?text=${message}`;
    
    showLoading();
    setTimeout(() => {
        hideLoading();
        window.open(whatsappUrl, '_blank');
        showToast('Opening WhatsApp...');
    }, 1000);
}

function downloadInvoice(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showToast('Invoice not found', 'error');
        return;
    }
    
    showLoading();
    
    // Simulate PDF generation
    setTimeout(() => {
        hideLoading();
        
        // In a real app, you would generate and download an actual PDF
        // For demo purposes, we'll just show a success message
        showToast(`Invoice ${invoice.id} downloaded successfully!`);
        
        // You could also trigger a fake download like this:
        // const element = document.createElement('a');
        // element.setAttribute('href', 'data:text/plain;charset=utf-8,Invoice Data Here');
        // element.setAttribute('download', `${invoice.id}.pdf`);
        // element.style.display = 'none';
        // document.body.appendChild(element);
        // element.click();
        // document.body.removeChild(element);
        
    }, 2000);
}

function editInvoice(invoiceId) {
    showToast('Edit invoice feature coming soon!', 'warning');
}

function deleteInvoice(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        const index = invoices.findIndex(inv => inv.id === invoiceId);
        if (index > -1) {
            invoices.splice(index, 1);
            showToast('Invoice deleted successfully!');
            updateDashboardStats();
            renderRecentInvoices();
            renderInvoicesTable();
        }
    }
}

function editProduct(productId) {
    showToast('Edit product feature coming soon!', 'warning');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const index = products.findIndex(prod => prod.id === productId);
        if (index > -1) {
            products.splice(index, 1);
            showToast('Product deleted successfully!');
            renderProductGrid();
            updateDashboardStats();
        }
    }
}

function editClient(clientId) {
    showToast('Edit client feature coming soon!', 'warning');
}

function deleteClient(clientId) {
    if (confirm('Are you sure you want to delete this client?')) {
        const index = clients.findIndex(client => client.id === clientId);
        if (index > -1) {
            clients.splice(index, 1);
            showToast('Client deleted successfully!');
            renderClientGrid();
        }
    }
}

function createInvoiceForClient(clientId) {
    const clientSelect = document.getElementById('invoiceClient');
    if (clientSelect) {
        clientSelect.value = clientId;
    }
    openInvoiceModal();
}

// Quick Action Functions
function initQuickActions() {
    const quickInvoiceBtn = document.getElementById('quickInvoice');
    const addClientBtn = document.getElementById('addClient');
    const addProductBtn = document.getElementById('addProduct');
    const viewReportsBtn = document.getElementById('viewReports');
    const addClientMainBtn = document.getElementById('addClientBtn');
    const addProductMainBtn = document.getElementById('addProductBtn');
    
    if (quickInvoiceBtn) quickInvoiceBtn.addEventListener('click', openInvoiceModal);
    if (addClientBtn) addClientBtn.addEventListener('click', () => showToast('Add client feature coming soon!', 'warning'));
    if (addProductBtn) addProductBtn.addEventListener('click', () => showToast('Add product feature coming soon!', 'warning'));
    if (viewReportsBtn) viewReportsBtn.addEventListener('click', () => showToast('Reports feature coming soon!', 'warning'));
    if (addClientMainBtn) addClientMainBtn.addEventListener('click', () => showToast('Add client feature coming soon!', 'warning'));
    if (addProductMainBtn) addProductMainBtn.addEventListener('click', () => showToast('Add product feature coming soon!', 'warning'));
}

// Search Functions
function initSearch() {
    const productSearch = document.getElementById('productSearch');
    const clientSearch = document.getElementById('clientSearch');
    
    if (productSearch) {
        productSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
            renderFilteredProducts(filteredProducts);
        });
    }
    
    if (clientSearch) {
        clientSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredClients = clients.filter(client =>
                client.name.toLowerCase().includes(searchTerm) ||
                client.email.toLowerCase().includes(searchTerm)
            );
            renderFilteredClients(filteredClients);
        });
    }
}

function renderFilteredProducts(filteredProducts) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                No products found matching your search
            </div>
        `;
        return;
    }
    
    // Use existing renderProductGrid logic with filtered data
    const originalProducts = products;
    products = filteredProducts;
    renderProductGrid();
    products = originalProducts;
}

function renderFilteredClients(filteredClients) {
    const clientGrid = document.getElementById('clientGrid');
    if (!clientGrid) return;
    
    if (filteredClients.length === 0) {
        clientGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                No clients found matching your search
            </div>
        `;
        return;
    }
    
    // Use existing renderClientGrid logic with filtered data
    const originalClients = clients;
    clients = filteredClients;
    renderClientGrid();
    clients = originalClients;
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N for new invoice
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openInvoiceModal();
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('invoiceModal');
            if (modal.classList.contains('active')) {
                closeInvoiceModal();
            }
        }
    });
}

// Local Storage Functions
function saveToLocalStorage() {
    localStorage.setItem('bills_invoices', JSON.stringify(invoices));
    localStorage.setItem('bills_products', JSON.stringify(products));
    localStorage.setItem('bills_clients', JSON.stringify(clients));
}

function loadFromLocalStorage() {
    const savedInvoices = localStorage.getItem('bills_invoices');
    const savedProducts = localStorage.getItem('bills_products');
    const savedClients = localStorage.getItem('bills_clients');
    
    if (savedInvoices) {
        try {
            invoices = JSON.parse(savedInvoices);
        } catch (e) {
            console.error('Error loading invoices from localStorage:', e);
        }
    }
    
    if (savedProducts) {
        try {
            products = JSON.parse(savedProducts);
        } catch (e) {
            console.error('Error loading products from localStorage:', e);
        }
    }
    
    if (savedClients) {
        try {
            clients = JSON.parse(savedClients);
        } catch (e) {
            console.error('Error loading clients from localStorage:', e);
        }
    }
}

// Auto-save functionality
function setupAutoSave() {
    setInterval(() => {
        saveToLocalStorage();
    }, 30000); // Save every 30 seconds
    
    // Save before page unload
    window.addEventListener('beforeunload', saveToLocalStorage);
}

// Initialize Application
function initApp() {
    // Load data from localStorage first
    loadFromLocalStorage();
    
    // Initialize all components
    initNavigation();
    initModal();
    initInvoiceSearch();
    initQuickActions();
    initSearch();
    initKeyboardShortcuts();
    
    // Load initial dashboard data
    updateDashboardStats();
    renderRecentInvoices();
    
    // Setup auto-save
    setupAutoSave();
    
    // Show welcome message
    setTimeout(() => {
        showToast('Welcome to Bills! Your invoice management system is ready.', 'success');
    }, 1000);
    
    console.log('Bills application initialized successfully!');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions for potential use in other scripts
window.BillsApp = {
    invoices,
    products,
    clients,
    formatCurrency,
    formatDate,
    showToast,
    shareOnWhatsApp,
    downloadInvoice
};
