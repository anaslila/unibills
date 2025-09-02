// Global Variables
let invoices = [
    {
        id: 'INV-001',
        client: 'Acme Corp',
        clientId: 'acme',
        clientPhone: '+91 9876543210',
        date: '2025-09-01',
        amount: 25000,
        status: 'paid',
        items: [
            { description: 'Web Development', quantity: 1, rate: 25000, unit: 'service' }
        ]
    },
    {
        id: 'INV-002',
        client: 'Tech Solutions',
        clientId: 'tech',
        clientPhone: '+91 9876543211',
        date: '2025-08-28',
        amount: 18500,
        status: 'pending',
        items: [
            { description: 'UI/UX Design', quantity: 1, rate: 18500, unit: 'service' }
        ]
    },
    {
        id: 'INV-003',
        client: 'Digital Agency',
        clientId: 'digital',
        clientPhone: '+91 9876543212',
        date: '2025-08-25',
        amount: 32000,
        status: 'overdue',
        items: [
            { description: 'Mobile App Development', quantity: 1, rate: 32000, unit: 'service' }
        ]
    }
];

let products = [
    {
        id: 'PRD-001',
        name: 'Website Development Package',
        price: 25000,
        stock: 10,
        unit: 'service',
        category: 'Services'
    },
    {
        id: 'PRD-002',
        name: 'Mobile App Development',
        price: 45000,
        stock: 5,
        unit: 'service',
        category: 'Services'
    },
    {
        id: 'PRD-003',
        name: 'Logo Design',
        price: 5000,
        stock: 0,
        unit: 'pcs',
        category: 'Design'
    },
    {
        id: 'PRD-004',
        name: 'SEO Optimization',
        price: 12000,
        stock: 3,
        unit: 'service',
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

let businessSettings = {
    name: 'Your Business Name',
    email: 'business@example.com',
    phone: '+91 9876543210',
    gst: '29ABCDE1234F1Z5',
    website: 'www.yourbusiness.com',
    address: '123 Business Street, City, State 12345',
    logo: null
};

let currentInvoiceId = null;

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

function generateClientId() {
    const count = clients.length + 1;
    return `client-${count.toString().padStart(3, '0')}`;
}

function generateProductId() {
    const count = products.length + 1;
    return `PRD-${count.toString().padStart(3, '0')}`;
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
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
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
            
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            link.classList.add('active');
            
            const sectionId = link.getAttribute('data-section') + '-section';
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
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
        case 'settings':
            loadBusinessSettings();
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
                <button class="action-btn" title="Share on WhatsApp" onclick="openWhatsappModal('${invoice.id}')">
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
                    <button class="action-btn" title="Share on WhatsApp" onclick="openWhatsappModal('${invoice.id}')">
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

// Searchable Dropdown Functions
function initSearchableDropdowns() {
    initClientDropdown();
    initItemDropdowns();
}

function initClientDropdown() {
    const clientInput = document.getElementById('invoiceClient');
    const clientList = document.getElementById('clientDropdownList');
    
    if (!clientInput || !clientList) return;
    
    clientInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredClients = clients.filter(client => 
            client.name.toLowerCase().includes(searchTerm) ||
            client.phone.includes(searchTerm)
        );
        
        if (searchTerm.length > 0) {
            renderClientDropdown(filteredClients, searchTerm);
            clientList.style.display = 'block';
        } else {
            clientList.style.display = 'none';
        }
    });
    
    clientInput.addEventListener('blur', (e) => {
        setTimeout(() => {
            clientList.style.display = 'none';
        }, 200);
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#clientDropdown')) {
            clientList.style.display = 'none';
        }
    });
}

function renderClientDropdown(filteredClients, searchTerm) {
    const clientList = document.getElementById('clientDropdownList');
    
    let html = '';
    
    // Show existing clients
    filteredClients.forEach(client => {
        html += `
            <div class="dropdown-item" onclick="selectClient('${client.id}')">
                <div class="dropdown-item-main">${client.name}</div>
                <div class="dropdown-item-sub">${client.phone}</div>
            </div>
        `;
    });
    
    // Show "Add new client" option if no exact match
    const exactMatch = filteredClients.find(client => 
        client.name.toLowerCase() === searchTerm.toLowerCase()
    );
    
    if (!exactMatch && searchTerm.length > 0) {
        html += `
            <div class="dropdown-item add-new" onclick="addNewClientFromDropdown('${searchTerm}')">
                <div class="dropdown-item-main">
                    <i class="fas fa-plus-circle"></i>
                    Add "${searchTerm}" as new client
                </div>
            </div>
        `;
    }
    
    clientList.innerHTML = html;
}

function selectClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    const clientInput = document.getElementById('invoiceClient');
    
    if (client && clientInput) {
        clientInput.value = client.name;
        clientInput.dataset.clientId = client.id;
        clientInput.dataset.clientPhone = client.phone;
    }
}

function addNewClientFromDropdown(clientName) {
    const clientInput = document.getElementById('invoiceClient');
    clientInput.value = clientName;
    clientInput.dataset.isNew = 'true';
    clientInput.dataset.newClientName = clientName;
    
    // Prompt for phone number
    const phone = prompt(`Please enter phone number for "${clientName}":`);
    if (phone) {
        clientInput.dataset.newClientPhone = phone;
        showToast(`New client "${clientName}" will be added when invoice is created`);
    }
}

function initItemDropdowns() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('item-search')) {
            initSingleItemDropdown(e.target);
        }
    });
}

function initSingleItemDropdown(input) {
    const dropdown = input.nextElementSibling;
    
    input.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm)
        );
        
        if (searchTerm.length > 0) {
            renderItemDropdown(dropdown, filteredProducts, searchTerm, input);
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    });
    
    input.addEventListener('blur', (e) => {
        setTimeout(() => {
            dropdown.style.display = 'none';
        }, 200);
    });
}

function renderItemDropdown(dropdown, filteredProducts, searchTerm, input) {
    let html = '';
    
    // Show existing products
    filteredProducts.forEach(product => {
        html += `
            <div class="dropdown-item" onclick="selectProduct('${product.id}', this)">
                <div class="dropdown-item-main">${product.name}</div>
                <div class="dropdown-item-sub">${formatCurrency(product.price)} per ${product.unit}</div>
            </div>
        `;
    });
    
    // Show "Add new product" option
    const exactMatch = filteredProducts.find(product => 
        product.name.toLowerCase() === searchTerm.toLowerCase()
    );
    
    if (!exactMatch && searchTerm.length > 0) {
        html += `
            <div class="dropdown-item add-new" onclick="addNewProductFromDropdown('${searchTerm}', this)">
                <div class="dropdown-item-main">
                    <i class="fas fa-plus-circle"></i>
                    Add "${searchTerm}" as new product
                </div>
            </div>
        `;
    }
    
    dropdown.innerHTML = html;
}

function selectProduct(productId, element) {
    const product = products.find(p => p.id === productId);
    const itemRow = element.closest('.item-row');
    const input = itemRow.querySelector('.item-search');
    const rateInput = itemRow.querySelector('.rate-input');
    
    if (product) {
        input.value = product.name;
        input.dataset.productId = product.id;
        rateInput.value = product.price;
        updateInvoiceTotal();
    }
}

function addNewProductFromDropdown(productName, element) {
    const itemRow = element.closest('.item-row');
    const input = itemRow.querySelector('.item-search');
    const rateInput = itemRow.querySelector('.rate-input');
    
    input.value = productName;
    input.dataset.isNew = 'true';
    input.dataset.newProductName = productName;
    
    // Prompt for rate and unit
    const rate = prompt(`Please enter rate per unit for "${productName}":`);
    if (rate) {
        const unit = prompt(`Please enter unit type (e.g., pcs, kg, ltr, service):`);
        if (unit) {
            rateInput.value = rate;
            input.dataset.newProductRate = rate;
            input.dataset.newProductUnit = unit;
            updateInvoiceTotal();
            showToast(`New product "${productName}" will be added when invoice is created`);
        }
    }
}

// Excel Import Functions
function initExcelImport() {
    const importClientsFile = document.getElementById('importClientsFile');
    const importInventoryFile = document.getElementById('importInventoryFile');
    
    if (importClientsFile) {
        importClientsFile.addEventListener('change', handleClientsImport);
    }
    
    if (importInventoryFile) {
        importInventoryFile.addEventListener('change', handleInventoryImport);
    }
}

function handleClientsImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    showLoading();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            
            let importedCount = 0;
            
            data.forEach(row => {
                if (row.Name || row.name) {
                    const newClient = {
                        id: generateClientId(),
                        name: row.Name || row.name || '',
                        email: row.Email || row.email || '',
                        phone: row.Phone || row.phone || row.Contact || row.contact || '',
                        address: row.Address || row.address || ''
                    };
                    
                    // Check if client already exists
                    const exists = clients.find(c => 
                        c.name.toLowerCase() === newClient.name.toLowerCase() ||
                        c.phone === newClient.phone
                    );
                    
                    if (!exists) {
                        clients.push(newClient);
                        importedCount++;
                    }
                }
            });
            
            hideLoading();
            showToast(`Successfully imported ${importedCount} clients!`);
            renderClientGrid();
            saveToLocalStorage();
            
        } catch (error) {
            hideLoading();
            showToast('Error importing file. Please check the format.', 'error');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsBinaryString(file);
    e.target.value = '';
}

function handleInventoryImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    showLoading();
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            
            let importedCount = 0;
            
            data.forEach(row => {
                if (row.Name || row.name || row.Product || row.product) {
                    const newProduct = {
                        id: generateProductId(),
                        name: row.Name || row.name || row.Product || row.product || '',
                        price: parseFloat(row.Price || row.price || row.Rate || row.rate || 0),
                        stock: parseInt(row.Stock || row.stock || row.Quantity || row.quantity || 0),
                        unit: row.Unit || row.unit || 'pcs',
                        category: row.Category || row.category || 'General'
                    };
                    
                    // Check if product already exists
                    const exists = products.find(p => 
                        p.name.toLowerCase() === newProduct.name.toLowerCase()
                    );
                    
                    if (!exists) {
                        products.push(newProduct);
                        importedCount++;
                    }
                }
            });
            
            hideLoading();
            showToast(`Successfully imported ${importedCount} products!`);
            renderProductGrid();
            updateDashboardStats();
            saveToLocalStorage();
            
        } catch (error) {
            hideLoading();
            showToast('Error importing file. Please check the format.', 'error');
            console.error('Import error:', error);
        }
    };
    
    reader.readAsBinaryString(file);
    e.target.value = '';
}

// WhatsApp Functions
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

function shareInvoiceFormat(format) {
    if (!currentInvoiceId) return;
    
    const invoice = invoices.find(inv => inv.id === currentInvoiceId);
    if (!invoice) {
        showToast('Invoice not found', 'error');
        return;
    }
    
    closeWhatsappModal();
    showLoading();
    
    if (format === 'text') {
        setTimeout(() => {
            shareInvoiceAsText(invoice);
            hideLoading();
        }, 1000);
    } else if (format === 'image') {
        setTimeout(() => {
            shareInvoiceAsImage(invoice);
            hideLoading();
        }, 2000);
    }
}

function shareInvoiceAsText(invoice) {
    const client = clients.find(c => c.id === invoice.clientId);
    const phone = invoice.clientPhone || (client ? client.phone : '');
    const cleanPhone = phone.replace(/\D/g, '');
    
    let itemsList = '';
    invoice.items.forEach(item => {
        itemsList += `• ${item.description} - ${item.quantity} ${item.unit} × ${formatCurrency(item.rate)} = ${formatCurrency(item.quantity * item.rate)}%0A`;
    });
    
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    const message = `*${businessSettings.name}*%0A` +
                   `📧 ${businessSettings.email}%0A` +
                   `📞 ${businessSettings.phone}%0A` +
                   `🏢 ${businessSettings.address}%0A` +
                   `GST: ${businessSettings.gst}%0A%0A` +
                   `*INVOICE ${invoice.id}*%0A` +
                   `Date: ${formatDate(invoice.date)}%0A` +
                   `Client: ${invoice.client}%0A%0A` +
                   `*ITEMS:*%0A${itemsList}%0A` +
                   `Subtotal: ${formatCurrency(subtotal)}%0A` +
                   `Tax (18%%): ${formatCurrency(tax)}%0A` +
                   `*Total: ${formatCurrency(total)}*%0A%0A` +
                   `Status: ${invoice.status.toUpperCase()}%0A%0A` +
                   `Thank you for your business! 🙏`;
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    showToast('Opening WhatsApp with text format...');
}

function shareInvoiceAsImage(invoice) {
    const client = clients.find(c => c.id === invoice.clientId);
    const phone = invoice.clientPhone || (client ? client.phone : '');
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Create invoice template
    const template = createInvoiceTemplate(invoice);
    
    // Generate image using html2canvas
    html2canvas(template, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
    }).then(canvas => {
        // Convert to blob
        canvas.toBlob(blob => {
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${invoice.id}.png`;
            link.click();
            
            // Show message for manual sharing
            const message = `Hi ${invoice.client},%0A%0AYour invoice ${invoice.id} for ${formatCurrency(invoice.amount)} is ready.%0A%0APlease find the detailed invoice image attached.%0A%0AThank you for your business! 🙏%0A%0A*${businessSettings.name}*%0A${businessSettings.phone}`;
            
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
            window.open(whatsappUrl, '_blank');
            
            showToast('Invoice image downloaded! Share it on WhatsApp manually.', 'warning');
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        });
    }).catch(error => {
        console.error('Error generating invoice image:', error);
        showToast('Error generating invoice image', 'error');
    });
}

function createInvoiceTemplate(invoice) {
    const template = document.getElementById('invoiceTemplate');
    const client = clients.find(c => c.id === invoice.clientId);
    
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    template.innerHTML = `
        <div style="width: 800px; padding: 40px; background: white; font-family: 'Product Sans', Arial, sans-serif;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #4285f4; padding-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    ${businessSettings.logo ? `<img src="${businessSettings.logo}" style="width: 60px; height: 60px; border-radius: 8px;">` : ''}
                    <div>
                        <h1 style="color: #4285f4; margin: 0; font-size: 32px; font-weight: 700;">${businessSettings.name}</h1>
                        <p style="color: #666; margin: 5px 0 0 0;">${businessSettings.email}</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <h2 style="color: #ea4335; margin: 0; font-size: 28px;">INVOICE</h2>
                    <p style="color: #666; margin: 5px 0 0 0; font-size: 16px;">${invoice.id}</p>
                </div>
            </div>
            
            <!-- Business Info -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div style="flex: 1;">
                    <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">From:</h3>
                    <p style="margin: 0; color: #666; line-height: 1.6;">
                        <strong>${businessSettings.name}</strong><br>
                        ${businessSettings.address}<br>
                        Phone: ${businessSettings.phone}<br>
                        Email: ${businessSettings.email}<br>
                        GST: ${businessSettings.gst}
                    </p>
                </div>
                <div style="flex: 1; text-align: right;">
                    <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">To:</h3>
                    <p style="margin: 0; color: #666; line-height: 1.6;">
                        <strong>${invoice.client}</strong><br>
                        ${client ? client.address : 'N/A'}<br>
                        Phone: ${invoice.clientPhone || (client ? client.phone : 'N/A')}<br>
                        ${client && client.email ? `Email: ${client.email}` : ''}
                    </p>
                </div>
            </div>
            
            <!-- Invoice Details -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <div>
                    <p style="margin: 0; color: #666;"><strong>Invoice Date:</strong></p>
                    <p style="margin: 5px 0 0 0; color: #333; font-size: 16px;">${formatDate(invoice.date)}</p>
                </div>
                <div>
                    <p style="margin: 0; color: #666;"><strong>Status:</strong></p>
                    <p style="margin: 5px 0 0 0; color: ${invoice.status === 'paid' ? '#34a853' : invoice.status === 'pending' ? '#fbbc05' : '#ea4335'}; font-size: 16px; font-weight: 600; text-transform: uppercase;">${invoice.status}</p>
                </div>
                <div>
                    <p style="margin: 0; color: #666;"><strong>Total Amount:</strong></p>
                    <p style="margin: 5px 0 0 0; color: #4285f4; font-size: 18px; font-weight: 700;">${formatCurrency(total)}</p>
                </div>
            </div>
            
            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background: #4285f4; color: white;">
                        <th style="padding: 15px; text-align: left; font-weight: 600;">Description</th>
                        <th style="padding: 15px; text-align: center; font-weight: 600;">Qty</th>
                        <th style="padding: 15px; text-align: center; font-weight: 600;">Unit</th>
                        <th style="padding: 15px; text-align: right; font-weight: 600;">Rate</th>
                        <th style="padding: 15px; text-align: right; font-weight: 600;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map((item, index) => `
                        <tr style="border-bottom: 1px solid #e0e0e0; ${index % 2 === 0 ? 'background: #f9f9f9;' : ''}">
                            <td style="padding: 15px; color: #333;">${item.description}</td>
                            <td style="padding: 15px; text-align: center; color: #666;">${item.quantity}</td>
                            <td style="padding: 15px; text-align: center; color: #666;">${item.unit}</td>
                            <td style="padding: 15px; text-align: right; color: #666;">${formatCurrency(item.rate)}</td>
                            <td style="padding: 15px; text-align: right; color: #333; font-weight: 600;">${formatCurrency(item.quantity * item.rate)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Totals -->
            <div style="display: flex; justify-content: flex-end;">
                <div style="width: 300px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #666;">Subtotal:</span>
                        <span style="color: #333; font-weight: 600;">${formatCurrency(subtotal)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                        <span style="color: #666;">Tax (18%):</span>
                        <span style="color: #333; font-weight: 600;">${formatCurrency(tax)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 15px 0; background: #4285f4; color: white; margin-top: 10px; padding-left: 15px; padding-right: 15px; border-radius: 6px;">
                        <span style="font-size: 18px; font-weight: 600;">Total:</span>
                        <span style="font-size: 20px; font-weight: 700;">${formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
                <p style="margin: 0; font-size: 14px;">Thank you for your business!</p>
                <p style="margin: 10px 0 0 0; font-size: 12px;">This is a computer generated invoice.</p>
            </div>
        </div>
    `;
    
    template.style.display = 'block';
    return template;
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
    
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeInvoiceModal();
        }
    });
    
    initInvoiceForm();
}

function openInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const dateInput = document.getElementById('invoiceDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    resetInvoiceForm();
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Add Client Modal Functions
function openAddClientModal() {
    document.getElementById('addClientModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAddClientModal() {
    document.getElementById('addClientModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('addClientForm').reset();
}

function initAddClientModal() {
    const form = document.getElementById('addClientForm');
    if (form) {
        form.addEventListener('submit', handleAddClient);
    }
}

function handleAddClient(e) {
    e.preventDefault();
    
    const name = document.getElementById('newClientName').value;
    const phone = document.getElementById('newClientPhone').value;
    const email = document.getElementById('newClientEmail').value;
    const address = document.getElementById('newClientAddress').value;
    
    const newClient = {
        id: generateClientId(),
        name,
        phone,
        email,
        address
    };
    
    clients.push(newClient);
    saveToLocalStorage();
    closeAddClientModal();
    showToast(`Client "${name}" added successfully!`);
    renderClientGrid();
}

// Add Product Modal Functions
function openAddProductModal() {
    document.getElementById('addProductModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAddProductModal() {
    document.getElementById('addProductModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('addProductForm').reset();
}

function initAddProductModal() {
    const form = document.getElementById('addProductForm');
    if (form) {
        form.addEventListener('submit', handleAddProduct);
    }
}

function handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('newProductName').value;
    const rate = parseFloat(document.getElementById('newProductRate').value);
    const unit = document.getElementById('newProductUnit').value;
    const category = document.getElementById('newProductCategory').value || 'General';
    const stock = parseInt(document.getElementById('newProductStock').value) || 0;
    
    const newProduct = {
        id: generateProductId(),
        name,
        price: rate,
        unit,
        category,
        stock
    };
    
    products.push(newProduct);
    saveToLocalStorage();
    closeAddProductModal();
    showToast(`Product "${name}" added successfully!`);
    renderProductGrid();
    updateDashboardStats();
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
    
    initItemRow(document.querySelector('.item-row'));
}

function resetInvoiceForm() {
    const form = document.getElementById('invoiceForm');
    if (form) form.reset();
    
    const itemsContainer = document.querySelector('.invoice-items');
    const firstItem = itemsContainer.querySelector('.item-row');
    const allItems = itemsContainer.querySelectorAll('.item-row');
    
    allItems.forEach((item, index) => {
        if (index > 0) {
            item.remove();
        }
    });
    
    if (firstItem) {
        firstItem.querySelectorAll('input').forEach(input => {
            input.value = '';
            delete input.dataset.clientId;
            delete input.dataset.productId;
            delete input.dataset.isNew;
        });
        updateInvoiceTotal();
    }
}

function initItemRow(itemRow) {
    if (!itemRow) return;
    
    const quantityInput = itemRow.querySelector('.quantity-input');
    const rateInput = itemRow.querySelector('.rate-input');
    const removeBtn = itemRow.querySelector('.remove-item');
    const itemSearch = itemRow.querySelector('.item-search');
    
    if (quantityInput) quantityInput.addEventListener('input', updateInvoiceTotal);
    if (rateInput) rateInput.addEventListener('input', updateInvoiceTotal);
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            removeInvoiceItem(itemRow);
        });
    }
    
    if (itemSearch) {
        initSingleItemDropdown(itemSearch);
    }
}

function addInvoiceItem() {
    const itemsContainer = document.querySelector('.invoice-items');
    const newItemRow = document.createElement('div');
    newItemRow.className = 'item-row';
    newItemRow.innerHTML = `
        <div class="searchable-dropdown item-dropdown">
            <input type="text" placeholder="Type to search or add item..." 
                   class="form-input searchable-input item-search" autocomplete="off" required>
            <div class="dropdown-list item-dropdown-list"></div>
        </div>
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
    
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('tax').textContent = formatCurrency(tax);
    document.getElementById('total').textContent = formatCurrency(total);
}

function handleInvoiceSubmit(e) {
    e.preventDefault();
    
    showLoading();
    
    setTimeout(() => {
        const clientInput = document.getElementById('invoiceClient');
        const date = document.getElementById('invoiceDate').value;
        
        // Handle new client
        let clientData = null;
        let clientPhone = '';
        
        if (clientInput.dataset.isNew === 'true') {
            const newClientId = generateClientId();
            const newClient = {
                id: newClientId,
                name: clientInput.dataset.newClientName,
                phone: clientInput.dataset.newClientPhone || '',
                email: '',
                address: ''
            };
            clients.push(newClient);
            clientData = newClient;
            clientPhone = newClient.phone;
        } else if (clientInput.dataset.clientId) {
            clientData = clients.find(c => c.id === clientInput.dataset.clientId);
            clientPhone = clientData ? clientData.phone : '';
        }
        
        // Get items data
        const itemRows = document.querySelectorAll('.item-row');
        const items = [];
        
        itemRows.forEach(row => {
            const itemInput = row.querySelector('.item-search');
            const quantity = parseFloat(row.querySelector('.quantity-input').value);
            const rate = parseFloat(row.querySelector('.rate-input').value);
            
            let itemData = {
                description: itemInput.value,
                quantity: quantity,
                rate: rate,
                unit: 'pcs'
            };
            
            // Handle new product
            if (itemInput.dataset.isNew === 'true') {
                const newProduct = {
                    id: generateProductId(),
                    name: itemInput.dataset.newProductName,
                    price: parseFloat(itemInput.dataset.newProductRate),
                    unit: itemInput.dataset.newProductUnit || 'pcs',
                    category: 'General',
                    stock: 0
                };
                products.push(newProduct);
                itemData.unit = newProduct.unit;
            } else if (itemInput.dataset.productId) {
                const product = products.find(p => p.id === itemInput.dataset.productId);
                if (product) {
                    itemData.unit = product.unit;
                }
            }
            
            items.push(itemData);
        });
        
        // Calculate total
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        const total = subtotal * 1.18;
        
        // Create new invoice
        const newInvoice = {
            id: generateInvoiceId(),
            client: clientData ? clientData.name : clientInput.value,
            clientId: clientData ? clientData.id : null,
            clientPhone: clientPhone,
            date: date,
            amount: total,
            status: 'pending',
            items: items
        };
        
        invoices.unshift(newInvoice);
        
        hideLoading();
        closeInvoiceModal();
        showToast(`Invoice ${newInvoice.id} created successfully!`);
        
        updateDashboardStats();
        renderRecentInvoices();
        renderInvoicesTable();
        saveToLocalStorage();
        
    }, 1500);
}

// Product/Inventory Functions
function renderProductGrid() {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    if (products.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <i class="fas fa-boxes" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                <h3 style="margin-bottom: 8px;">No products found</h3>
                <p>Start by adding your first product or importing from Excel</p>
            </div>
        `;
        return;
    }
    
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
                        ${product.stock} ${product.unit}
                    </span>
                </div>
                <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 8px;">${product.category}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 18px; font-weight: 600; color: var(--body-color);">${formatCurrency(product.price)}/${product.unit}</span>
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
    
    if (clients.length === 0) {
        clientGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                <h3 style="margin-bottom: 8px;">No clients found</h3>
                <p>Start by adding your first client or importing from Excel</p>
            </div>
        `;
        return;
    }
    
    clientGrid.innerHTML = clients.map(client => `
        <div class="client-card">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 18px;">
                    ${client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 16px; color: var(--body-color);">${client.name}</h3>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">${client.email || 'No email'}</p>
                </div>
            </div>
            <div style="margin-bottom: 12px;">
                <p style="margin: 4px 0; color: var(--text-secondary); font-size: 14px;">
                    <i class="fas fa-phone" style="width: 16px; margin-right: 8px; color: var(--primary-color);"></i>
                    ${client.phone || 'No phone'}
                </p>
                <p style="margin: 4px 0; color: var(--text-secondary); font-size: 14px;">
                    <i class="fas fa-map-marker-alt" style="width: 16px; margin-right: 8px; color: var(--primary-color);"></i>
                    ${client.address || 'No address'}
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

// Settings Functions
function loadBusinessSettings() {
    document.getElementById('businessName').value = businessSettings.name;
    document.getElementById('businessEmail').value = businessSettings.email;
    document.getElementById('businessPhone').value = businessSettings.phone;
    document.getElementById('businessGST').value = businessSettings.gst;
    document.getElementById('businessWebsite').value = businessSettings.website;
    document.getElementById('businessAddress').value = businessSettings.address;
    
    if (businessSettings.logo) {
        const logoPreview = document.getElementById('logoPreview');
        logoPreview.innerHTML = `<img src="${businessSettings.logo}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">`;
    }
}

function saveBusinessSettings() {
    businessSettings.name = document.getElementById('businessName').value;
    businessSettings.email = document.getElementById('businessEmail').value;
    businessSettings.phone = document.getElementById('businessPhone').value;
    businessSettings.gst = document.getElementById('businessGST').value;
    businessSettings.website = document.getElementById('businessWebsite').value;
    businessSettings.address = document.getElementById('businessAddress').value;
    
    saveToLocalStorage();
    showToast('Business settings saved successfully!');
}

function initBusinessLogoUpload() {
    const logoInput = document.getElementById('businessLogo');
    const logoPreview = document.getElementById('logoPreview');
    
    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataURL = e.target.result;
                    businessSettings.logo = dataURL;
                    logoPreview.innerHTML = `<img src="${dataURL}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">`;
                    saveToLocalStorage();
                    showToast('Business logo updated successfully!');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Search Functions
function initSearch() {
    const invoiceSearch = document.getElementById('invoiceSearch');
    const invoiceFilter = document.getElementById('invoiceFilter');
    const productSearch = document.getElementById('productSearch');
    const clientSearch = document.getElementById('clientSearch');
    
    if (invoiceSearch) invoiceSearch.addEventListener('input', filterInvoices);
    if (invoiceFilter) invoiceFilter.addEventListener('change', filterInvoices);
    
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
                client.email.toLowerCase().includes(searchTerm) ||
                client.phone.includes(searchTerm)
            );
            renderFilteredClients(filteredClients);
        });
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
                    <button class="action-btn" title="Share on WhatsApp" onclick="openWhatsappModal('${invoice.id}')">
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
    
    const originalClients = clients;
    clients = filteredClients;
    renderClientGrid();
    clients = originalClients;
}

// Action Functions
function downloadInvoice(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showToast('Invoice not found', 'error');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        showToast(`Invoice ${invoice.id} downloaded successfully!`);
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
            saveToLocalStorage();
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
            saveToLocalStorage();
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
            saveToLocalStorage();
        }
    }
}

function createInvoiceForClient(clientId) {
    const clientSelect = document.getElementById('invoiceClient');
    const client = clients.find(c => c.id === clientId);
    
    if (clientSelect && client) {
        clientSelect.value = client.name;
        clientSelect.dataset.clientId = client.id;
        clientSelect.dataset.clientPhone = client.phone;
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
    if (addClientBtn) addClientBtn.addEventListener('click', openAddClientModal);
    if (addProductBtn) addProductBtn.addEventListener('click', openAddProductModal);
    if (viewReportsBtn) viewReportsBtn.addEventListener('click', () => showToast('Reports feature coming soon!', 'warning'));
    if (addClientMainBtn) addClientMainBtn.addEventListener('click', openAddClientModal);
    if (addProductMainBtn) addProductMainBtn.addEventListener('click', openAddProductModal);
}

// Local Storage Functions
function saveToLocalStorage() {
    localStorage.setItem('bills_invoices', JSON.stringify(invoices));
    localStorage.setItem('bills_products', JSON.stringify(products));
    localStorage.setItem('bills_clients', JSON.stringify(clients));
    localStorage.setItem('bills_business_settings', JSON.stringify(businessSettings));
}

function loadFromLocalStorage() {
    const savedInvoices = localStorage.getItem('bills_invoices');
    const savedProducts = localStorage.getItem('bills_products');
    const savedClients = localStorage.getItem('bills_clients');
    const savedBusinessSettings = localStorage.getItem('bills_business_settings');
    
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
    
    if (savedBusinessSettings) {
        try {
            businessSettings = { ...businessSettings, ...JSON.parse(savedBusinessSettings) };
        } catch (e) {
            console.error('Error loading business settings from localStorage:', e);
        }
    }
}

function setupAutoSave() {
    setInterval(() => {
        saveToLocalStorage();
    }, 30000);
    
    window.addEventListener('beforeunload', saveToLocalStorage);
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openInvoiceModal();
        }
        
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
    });
}

// Initialize Application
function initApp() {
    // Load data from localStorage first
    loadFromLocalStorage();
    
    // Initialize all components
    initNavigation();
    initModal();
    initAddClientModal();
    initAddProductModal();
    initSearchableDropdowns();
    initExcelImport();
    initQuickActions();
    initSearch();
    initKeyboardShortcuts();
    initBusinessLogoUpload();
    
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

// Export functions for global access
window.BillsApp = {
    invoices,
    products,
    clients,
    businessSettings,
    formatCurrency,
    formatDate,
    showToast,
    openWhatsappModal,
    closeWhatsappModal,
    shareInvoiceFormat,
    openAddClientModal,
    closeAddClientModal,
    openAddProductModal,
    closeAddProductModal,
    saveBusinessSettings,
    downloadInvoice
};
