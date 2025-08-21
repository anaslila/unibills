// Pinvoices v1.0 (Beta) - Complete JavaScript
// Developer: Anas Lila | Published By: AL Software

class PinvoicesApp {
    constructor() {
        this.currentUser = null;
        this.isPremium = false;
        this.customers = this.loadData('customers') || [];
        this.products = this.loadData('products') || [];
        this.invoices = this.loadData('invoices') || [];
        this.premiumUsers = this.loadData('premiumUsers') || [];
        
        this.init();
    }

    // Initialize App
    init() {
        this.updateLastUpdated();
        this.bindEvents();
        this.showLoginModal();
        
        // Register Service Worker for PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js');
        }
    }

    // Update last updated date
    updateLastUpdated() {
        const now = new Date();
        const formatted = this.formatIndianDate(now) + ' ' + this.formatIndianTime(now);
        const lastUpdatedEl = document.getElementById('last-updated');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = formatted;
        }
    }

    // Bind Event Listeners
    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Currency formatting on input
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('currency-input')) {
                this.formatCurrencyInput(e.target);
            }
        });

        // Add to home screen prompt
        this.setupPWAPrompt();
    }

    // Handle Login
    handleLogin() {
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        if (!email) return;

        this.currentUser = email;
        this.isPremium = this.premiumUsers.includes(email);

        // Hide login modal
        document.getElementById('login-modal').classList.add('hide');
        document.getElementById('login-modal').classList.remove('show');

        // Show main app
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'block';

        // Show premium status
        if (this.isPremium) {
            document.getElementById('premium-info').style.display = 'block';
            document.getElementById('nonpremium-info').style.display = 'none';
        } else {
            document.getElementById('premium-info').style.display = 'none';
            document.getElementById('nonpremium-info').style.display = 'block';
            
            // Setup WhatsApp link
            const whatsappBtn = document.getElementById('buy-premium-btn');
            const message = `I want to buy pinvoice premium ${email}`;
            whatsappBtn.href = `https://wa.me/918879706046?text=${encodeURIComponent(message)}`;
        }

        // Load user-specific data
        this.loadUserData();
        this.setupInvoiceForms();
        this.showUserLimitations();
    }

    // Handle Logout
    handleLogout() {
        this.currentUser = null;
        this.isPremium = false;
        
        // Hide main app
        document.getElementById('app-container').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';

        // Show login modal
        document.getElementById('login-modal').classList.remove('hide');
        document.getElementById('login-modal').classList.add('show');

        // Reset form
        document.getElementById('login-email').value = '';
        document.getElementById('premium-info').style.display = 'none';
        document.getElementById('nonpremium-info').style.display = 'none';
    }

    // Show Login Modal
    showLoginModal() {
        document.getElementById('login-modal').classList.remove('hide');
        document.getElementById('login-modal').classList.add('show');
    }

    // Switch Tabs
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hide');
            content.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.remove('hide');
            targetTab.classList.add('active');
        }

        // Premium check for restricted tabs
        if (!this.isPremium && ['professional', 'realestate', 'more'].includes(tabName)) {
            this.showUpgradePrompt(tabName);
        }
    }

    // Setup Invoice Forms
    setupInvoiceForms() {
        this.createPOSForm();
        this.createProfessionalForm();
        this.createRealEstateForm();
        this.createMoreForms();
    }

    // Create POS Invoice Form
    createPOSForm() {
        const posTab = document.getElementById('pos-tab');
        posTab.innerHTML = `
            <h2>POS Invoice</h2>
            <form class="invoice-form" id="pos-form">
                <div class="form-row">
                    <div class="input-group">
                        <label>Invoice Number</label>
                        <input type="text" id="pos-invoice-no" value="${this.generateInvoiceNumber()}" readonly>
                    </div>
                    <div class="input-group">
                        <label>Date</label>
                        <input type="text" id="pos-date" value="${this.formatIndianDate(new Date())}" readonly>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="input-group">
                        <label>Customer</label>
                        <div class="searchable-dropdown">
                            <input type="text" class="dropdown-input" id="pos-customer" placeholder="Search or add customer...">
                            <div class="dropdown-list" id="pos-customer-list"></div>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Mobile</label>
                        <input type="tel" id="pos-mobile" placeholder="Customer mobile">
                    </div>
                </div>

                <div class="items-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3>Items</h3>
                        <button type="button" class="add-item-btn" onclick="app.addItemRow('pos')">Add Item</button>
                    </div>
                    
                    <div class="table-container">
                        <table class="items-table" id="pos-items-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Rate (₹)</th>
                                    <th>Amount (₹)</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="pos-items-body">
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="totals-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span id="pos-subtotal">₹0.00</span>
                    </div>
                    <div class="total-row">
                        <span>Tax (18% GST):</span>
                        <span id="pos-tax">₹0.00</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Total:</span>
                        <span id="pos-total">₹0.00</span>
                    </div>
                </div>

                <div class="action-buttons">
                    <button type="button" class="action-btn preview-btn" onclick="app.previewInvoice('pos')">Preview</button>
                    <button type="button" class="action-btn save-btn" onclick="app.saveInvoice('pos')">Save</button>
                    <button type="button" class="action-btn print-btn" onclick="app.printInvoice('pos')">Print</button>
                </div>
            </form>
        `;

        this.addItemRow('pos');
        this.setupCustomerDropdown('pos');
    }

    // Create Professional Invoice Form
    createProfessionalForm() {
        const profTab = document.getElementById('professional-tab');
        if (!this.isPremium) {
            profTab.innerHTML = this.getUpgradePromptHTML('Professional Invoice');
            return;
        }

        profTab.innerHTML = `
            <h2>Professional Invoice</h2>
            <form class="invoice-form" id="professional-form">
                <div class="form-row">
                    <div class="input-group">
                        <label>Invoice Number</label>
                        <input type="text" id="prof-invoice-no" value="${this.generateInvoiceNumber('PROF')}" readonly>
                    </div>
                    <div class="input-group">
                        <label>Date</label>
                        <input type="text" id="prof-date" value="${this.formatIndianDate(new Date())}" readonly>
                    </div>
                </div>

                <div class="form-row">
                    <div class="input-group">
                        <label>Bill To</label>
                        <div class="searchable-dropdown">
                            <input type="text" class="dropdown-input" id="prof-customer" placeholder="Search or add customer...">
                            <div class="dropdown-list" id="prof-customer-list"></div>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>GST Number</label>
                        <input type="text" id="prof-gst" placeholder="Customer GST number">
                    </div>
                </div>

                <div class="form-row full-width">
                    <div class="input-group">
                        <label>Billing Address</label>
                        <textarea id="prof-address" rows="3" placeholder="Customer billing address"></textarea>
                    </div>
                </div>

                <div class="items-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3>Items/Services</h3>
                        <button type="button" class="add-item-btn" onclick="app.addItemRow('professional')">Add Item</button>
                    </div>
                    
                    <div class="table-container">
                        <table class="items-table" id="prof-items-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>HSN/SAC</th>
                                    <th>Qty</th>
                                    <th>Rate (₹)</th>
                                    <th>Amount (₹)</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="prof-items-body">
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="totals-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span id="prof-subtotal">₹0.00</span>
                    </div>
                    <div class="total-row">
                        <span>CGST (9%):</span>
                        <span id="prof-cgst">₹0.00</span>
                    </div>
                    <div class="total-row">
                        <span>SGST (9%):</span>
                        <span id="prof-sgst">₹0.00</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Total:</span>
                        <span id="prof-total">₹0.00</span>
                    </div>
                </div>

                <div class="action-buttons">
                    <button type="button" class="action-btn preview-btn" onclick="app.previewInvoice('professional')">Preview</button>
                    <button type="button" class="action-btn save-btn" onclick="app.saveInvoice('professional')">Save</button>
                    <button type="button" class="action-btn print-btn" onclick="app.printInvoice('professional')">Print</button>
                </div>
            </form>
        `;

        this.addItemRow('professional');
        this.setupCustomerDropdown('professional');
    }

    // Create Real Estate Invoice Form
    createRealEstateForm() {
        const realEstateTab = document.getElementById('realestate-tab');
        if (!this.isPremium) {
            realEstateTab.innerHTML = this.getUpgradePromptHTML('Real Estate Invoice');
            return;
        }

        realEstateTab.innerHTML = `
            <h2>Real Estate Invoice (Costsheet)</h2>
            <form class="invoice-form" id="realestate-form">
                <div class="form-row">
                    <div class="input-group">
                        <label>Property ID</label>
                        <input type="text" id="re-property-id" value="${this.generateInvoiceNumber('PROP')}" readonly>
                    </div>
                    <div class="input-group">
                        <label>Date</label>
                        <input type="text" id="re-date" value="${this.formatIndianDate(new Date())}" readonly>
                    </div>
                </div>

                <div class="form-row">
                    <div class="input-group">
                        <label>Client Name</label>
                        <div class="searchable-dropdown">
                            <input type="text" class="dropdown-input" id="re-customer" placeholder="Search or add client...">
                            <div class="dropdown-list" id="re-customer-list"></div>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Property Type</label>
                        <select id="re-property-type">
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Plot">Plot</option>
                            <option value="Villa">Villa</option>
                        </select>
                    </div>
                </div>

                <div class="form-row full-width">
                    <div class="input-group">
                        <label>Property Address</label>
                        <textarea id="re-address" rows="3" placeholder="Property address"></textarea>
                    </div>
                </div>

                <div class="items-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3>Cost Breakdown</h3>
                        <button type="button" class="add-item-btn" onclick="app.addItemRow('realestate')">Add Cost Item</button>
                    </div>
                    
                    <div class="table-container">
                        <table class="items-table" id="re-items-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Area/Unit</th>
                                    <th>Rate (₹)</th>
                                    <th>Amount (₹)</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="re-items-body">
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="totals-section">
                    <div class="total-row">
                        <span>Base Cost:</span>
                        <span id="re-subtotal">₹0.00</span>
                    </div>
                    <div class="total-row">
                        <span>Registration (2%):</span>
                        <span id="re-registration">₹0.00</span>
                    </div>
                    <div class="total-row">
                        <span>Stamp Duty (5%):</span>
                        <span id="re-stamp">₹0.00</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Total Cost:</span>
                        <span id="re-total">₹0.00</span>
                    </div>
                </div>

                <div class="action-buttons">
                    <button type="button" class="action-btn preview-btn" onclick="app.previewInvoice('realestate')">Preview</button>
                    <button type="button" class="action-btn save-btn" onclick="app.saveInvoice('realestate')">Save</button>
                    <button type="button" class="action-btn print-btn" onclick="app.printInvoice('realestate')">Print</button>
                </div>
            </form>
        `;

        this.addItemRow('realestate');
        this.setupCustomerDropdown('realestate');
    }

    // Create More Forms
    createMoreForms() {
        const moreTab = document.getElementById('more-tab');
        if (!this.isPremium) {
            moreTab.innerHTML = this.getUpgradePromptHTML('More Invoice Features');
            return;
        }

        moreTab.innerHTML = `
            <h2>More Invoice Features</h2>
            <div class="invoice-types-grid">
                <div class="invoice-type-card glassy" onclick="app.createQuotationForm()">
                    <h3>Quotation</h3>
                    <p>Create professional quotations for your clients</p>
                </div>
                <div class="invoice-type-card glassy" onclick="app.createEstimateForm()">
                    <h3>Estimate</h3>
                    <p>Generate detailed project estimates</p>
                </div>
                <div class="invoice-type-card glassy" onclick="app.createReceiptForm()">
                    <h3>Receipt</h3>
                    <p>Issue payment receipts and acknowledgments</p>
                </div>
                <div class="invoice-type-card glassy" onclick="app.createTaxInvoiceForm()">
                    <h3>Tax Invoice</h3>
                    <p>Comprehensive tax invoices with full compliance</p>
                </div>
            </div>
            <div id="more-form-container"></div>
        `;
    }

    // Add Item Row
    addItemRow(formType) {
        const maxItems = this.isPremium ? 50 : 3;
        const tbody = document.getElementById(`${formType}-items-body`) || 
                     document.getElementById(`${formType.substring(0, 4)}-items-body`);
        
        if (!tbody) return;

        const currentRows = tbody.children.length;
        if (currentRows >= maxItems) {
            this.showMessage(`${this.isPremium ? 'Maximum' : 'Free users can add only'} ${maxItems} items ${!this.isPremium ? '. Upgrade to Premium for unlimited items.' : '.'}`, 'error');
            return;
        }

        const row = document.createElement('tr');
        
        if (formType === 'pos') {
            row.innerHTML = `
                <td>
                    <div class="searchable-dropdown">
                        <input type="text" class="dropdown-input product-input" placeholder="Search product...">
                        <div class="dropdown-list"></div>
                    </div>
                </td>
                <td><input type="number" class="qty-input" value="1" min="1"></td>
                <td><input type="text" class="currency-input rate-input" placeholder="0.00"></td>
                <td><span class="amount-display">₹0.00</span></td>
                <td><button type="button" class="remove-item-btn" onclick="app.removeItemRow(this)">Remove</button></td>
            `;
        } else if (formType === 'professional') {
            row.innerHTML = `
                <td>
                    <div class="searchable-dropdown">
                        <input type="text" class="dropdown-input product-input" placeholder="Description...">
                        <div class="dropdown-list"></div>
                    </div>
                </td>
                <td><input type="text" class="hsn-input" placeholder="HSN/SAC"></td>
                <td><input type="number" class="qty-input" value="1" min="1"></td>
                <td><input type="text" class="currency-input rate-input" placeholder="0.00"></td>
                <td><span class="amount-display">₹0.00</span></td>
                <td><button type="button" class="remove-item-btn" onclick="app.removeItemRow(this)">Remove</button></td>
            `;
        } else if (formType === 'realestate') {
            row.innerHTML = `
                <td><input type="text" class="desc-input" placeholder="Cost description..."></td>
                <td><input type="text" class="unit-input" placeholder="Sq.ft/Unit"></td>
                <td><input type="text" class="currency-input rate-input" placeholder="0.00"></td>
                <td><span class="amount-display">₹0.00</span></td>
                <td><button type="button" class="remove-item-btn" onclick="app.removeItemRow(this)">Remove</button></td>
            `;
        }

        tbody.appendChild(row);
        this.bindItemRowEvents(row, formType);
        this.setupProductDropdown(row.querySelector('.product-input'), formType);
    }

    // Remove Item Row
    removeItemRow(button) {
        const row = button.closest('tr');
        const formType = this.getFormTypeFromRow(row);
        row.remove();
        this.calculateTotals(formType);
    }

    // Bind Item Row Events
    bindItemRowEvents(row, formType) {
        const qtyInput = row.querySelector('.qty-input');
        const rateInput = row.querySelector('.rate-input');
        const unitInput = row.querySelector('.unit-input');

        [qtyInput, rateInput, unitInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.calculateRowAmount(row, formType);
                    this.calculateTotals(formType);
                });
            }
        });
    }

    // Calculate Row Amount
    calculateRowAmount(row, formType) {
        const qtyInput = row.querySelector('.qty-input') || { value: 1 };
        const rateInput = row.querySelector('.rate-input');
        const unitInput = row.querySelector('.unit-input') || { value: 1 };
        const amountDisplay = row.querySelector('.amount-display');

        if (!rateInput || !amountDisplay) return;

        const qty = parseFloat(qtyInput.value) || 1;
        const rate = this.parseCurrency(rateInput.value) || 0;
        const unit = parseFloat(unitInput.value) || 1;

        let amount;
        if (formType === 'realestate') {
            amount = unit * rate;
        } else {
            amount = qty * rate;
        }

        amountDisplay.textContent = this.formatCurrency(amount);
    }

    // Calculate Totals
    calculateTotals(formType) {
        const prefix = formType === 'professional' ? 'prof' : 
                      formType === 'realestate' ? 're' : 'pos';
        
        const rows = document.querySelectorAll(`#${prefix}-items-body tr`);
        let subtotal = 0;

        rows.forEach(row => {
            const amountText = row.querySelector('.amount-display')?.textContent || '₹0.00';
            const amount = this.parseCurrency(amountText);
            subtotal += amount;
        });

        document.getElementById(`${prefix}-subtotal`).textContent = this.formatCurrency(subtotal);

        let tax = 0;
        let total = subtotal;

        if (formType === 'pos') {
            tax = subtotal * 0.18; // 18% GST
            document.getElementById(`${prefix}-tax`).textContent = this.formatCurrency(tax);
            total = subtotal + tax;
        } else if (formType === 'professional') {
            const cgst = subtotal * 0.09; // 9% CGST
            const sgst = subtotal * 0.09; // 9% SGST
            document.getElementById(`${prefix}-cgst`).textContent = this.formatCurrency(cgst);
            document.getElementById(`${prefix}-sgst`).textContent = this.formatCurrency(sgst);
            total = subtotal + cgst + sgst;
        } else if (formType === 'realestate') {
            const registration = subtotal * 0.02; // 2% Registration
            const stamp = subtotal * 0.05; // 5% Stamp Duty
            document.getElementById(`${prefix}-registration`).textContent = this.formatCurrency(registration);
            document.getElementById(`${prefix}-stamp`).textContent = this.formatCurrency(stamp);
            total = subtotal + registration + stamp;
        }

        document.getElementById(`${prefix}-total`).textContent = this.formatCurrency(total);
    }

    // Setup Customer Dropdown
    setupCustomerDropdown(formType) {
        const prefix = formType === 'professional' ? 'prof' : 
                      formType === 'realestate' ? 're' : 'pos';
        
        const input = document.getElementById(`${prefix}-customer`);
        const dropdown = document.getElementById(`${prefix}-customer-list`);
        
        if (!input || !dropdown) return;

        input.addEventListener('focus', () => {
            this.showCustomerDropdown(input, dropdown);
        });

        input.addEventListener('input', (e) => {
            this.filterCustomerDropdown(e.target.value, dropdown);
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // Show Customer Dropdown
    showCustomerDropdown(input, dropdown) {
        dropdown.innerHTML = '';
        
        // Add existing customers
        this.customers.forEach(customer => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = `${customer.name} - ${customer.mobile || ''}`;
            item.addEventListener('click', () => {
                input.value = customer.name;
                const mobileInput = input.closest('.form-row')?.querySelector('input[type="tel"]');
                if (mobileInput) mobileInput.value = customer.mobile || '';
                dropdown.classList.remove('show');
            });
            dropdown.appendChild(item);
        });

        // Add "Add New Customer" option
        const addNewItem = document.createElement('div');
        addNewItem.className = 'dropdown-item add-new-item';
        addNewItem.textContent = '+ Add New Customer';
        addNewItem.addEventListener('click', () => {
            this.showAddCustomerModal(input);
            dropdown.classList.remove('show');
        });
        dropdown.appendChild(addNewItem);

        dropdown.classList.add('show');
    }

    // Filter Customer Dropdown
    filterCustomerDropdown(searchTerm, dropdown) {
        const items = dropdown.querySelectorAll('.dropdown-item:not(.add-new-item)');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm.toLowerCase())) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Setup Product Dropdown
    setupProductDropdown(input, formType) {
        if (!input) return;

        const dropdown = input.nextElementSibling;
        
        input.addEventListener('focus', () => {
            this.showProductDropdown(input, dropdown, formType);
        });

        input.addEventListener('input', (e) => {
            this.filterProductDropdown(e.target.value, dropdown);
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // Show Product Dropdown
    showProductDropdown(input, dropdown, formType) {
        dropdown.innerHTML = '';
        
        // Add existing products
        this.products.forEach(product => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = `${product.name} - ₹${product.price}`;
            item.addEventListener('click', () => {
                input.value = product.name;
                const row = input.closest('tr');
                const rateInput = row.querySelector('.rate-input');
                if (rateInput) {
                    rateInput.value = this.formatCurrency(product.price);
                    this.formatCurrencyInput(rateInput);
                    this.calculateRowAmount(row, formType);
                    this.calculateTotals(formType);
                }
                dropdown.classList.remove('show');
            });
            dropdown.appendChild(item);
        });

        // Add "Add New Product" option
        const addNewItem = document.createElement('div');
        addNewItem.className = 'dropdown-item add-new-item';
        addNewItem.textContent = '+ Add New Product';
        addNewItem.addEventListener('click', () => {
            this.showAddProductModal(input);
            dropdown.classList.remove('show');
        });
        dropdown.appendChild(addNewItem);

        dropdown.classList.add('show');
    }

    // Filter Product Dropdown
    filterProductDropdown(searchTerm, dropdown) {
        const items = dropdown.querySelectorAll('.dropdown-item:not(.add-new-item)');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm.toLowerCase())) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Format Currency Input (Indian Format)
    formatCurrencyInput(input) {
        let value = input.value.replace(/[^\d.]/g, '');
        if (value) {
            const number = parseFloat(value);
            if (!isNaN(number)) {
                input.value = this.formatCurrency(number);
            }
        }
    }

    // Format Currency (Indian Format: #,##,##,##,##,###)
    formatCurrency(amount) {
        if (!amount || isNaN(amount)) return '₹0.00';
        
        const num = parseFloat(amount);
        const formatted = num.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return formatted;
    }

    // Parse Currency
    parseCurrency(currencyString) {
        if (!currencyString) return 0;
        return parseFloat(currencyString.replace(/[^\d.-]/g, '')) || 0;
    }

    // Format Indian Date (DD/MMM/YYYY)
    formatIndianDate(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    }

    // Format Indian Time (H:MM:SS AM/PM)
    formatIndianTime(date) {
        return date.toLocaleTimeString('en-IN', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    // Generate Invoice Number
    generateInvoiceNumber(prefix = 'INV') {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000);
        return `${prefix}-${year}${month}-${random}`;
    }

    // Show Add Customer Modal
    showAddCustomerModal(inputRef) {
        const modal = document.getElementById('add-customer-modal') || this.createAddCustomerModal();
        modal.classList.remove('hide');
        modal.inputRef = inputRef;
    }

    // Create Add Customer Modal
    createAddCustomerModal() {
        const modal = document.createElement('div');
        modal.id = 'add-customer-modal';
        modal.className = 'modal glassy hide';
        modal.innerHTML = `
            <form class="modal-form" id="customer-form">
                <h3>Add New Customer</h3>
                <div class="form-row">
                    <div class="input-group">
                        <label>Customer Name</label>
                        <input type="text" id="new-customer-name" required>
                    </div>
                    <div class="input-group">
                        <label>Mobile Number</label>
                        <input type="tel" id="new-customer-mobile">
                    </div>
                </div>
                <div class="form-row full-width">
                    <div class="input-group">
                        <label>Address</label>
                        <textarea id="new-customer-address" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button type="button" class="action-btn" onclick="app.closeModal('add-customer-modal')">Cancel</button>
                    <button type="submit" class="action-btn save-btn">Add Customer</button>
                </div>
            </form>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#customer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewCustomer();
        });

        return modal;
    }

    // Save New Customer
    saveNewCustomer() {
        const name = document.getElementById('new-customer-name').value.trim();
        const mobile = document.getElementById('new-customer-mobile').value.trim();
        const address = document.getElementById('new-customer-address').value.trim();

        if (!name) return;

        const customer = {
            id: Date.now(),
            name,
            mobile,
            address,
            createdAt: new Date().toISOString()
        };

        this.customers.push(customer);
        this.saveData('customers', this.customers);

        // Update input if reference exists
        const modal = document.getElementById('add-customer-modal');
        if (modal.inputRef) {
            modal.inputRef.value = name;
            const mobileInput = modal.inputRef.closest('.form-row')?.querySelector('input[type="tel"]');
            if (mobileInput) mobileInput.value = mobile;
        }

        this.closeModal('add-customer-modal');
        this.showMessage('Customer added successfully!', 'success');
    }

    // Show Add Product Modal
    showAddProductModal(inputRef) {
        const modal = document.getElementById('add-product-modal') || this.createAddProductModal();
        modal.classList.remove('hide');
        modal.inputRef = inputRef;
    }

    // Create Add Product Modal
    createAddProductModal() {
        const modal = document.createElement('div');
        modal.id = 'add-product-modal';
        modal.className = 'modal glassy hide';
        modal.innerHTML = `
            <form class="modal-form" id="product-form">
                <h3>Add New Product</h3>
                <div class="form-row">
                    <div class="input-group">
                        <label>Product Name</label>
                        <input type="text" id="new-product-name" required>
                    </div>
                    <div class="input-group">
                        <label>Price (₹)</label>
                        <input type="text" class="currency-input" id="new-product-price" required>
                    </div>
                </div>
                <div class="form-row full-width">
                    <div class="input-group">
                        <label>Description</label>
                        <textarea id="new-product-desc" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button type="button" class="action-btn" onclick="app.closeModal('add-product-modal')">Cancel</button>
                    <button type="submit" class="action-btn save-btn">Add Product</button>
                </div>
            </form>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewProduct();
        });

        return modal;
    }

    // Save New Product
    saveNewProduct() {
        const name = document.getElementById('new-product-name').value.trim();
        const price = this.parseCurrency(document.getElementById('new-product-price').value);
        const description = document.getElementById('new-product-desc').value.trim();

        if (!name || !price) return;

        const product = {
            id: Date.now(),
            name,
            price,
            description,
            createdAt: new Date().toISOString()
        };

        this.products.push(product);
        this.saveData('products', this.products);

        // Update input if reference exists
        const modal = document.getElementById('add-product-modal');
        if (modal.inputRef) {
            modal.inputRef.value = name;
            const row = modal.inputRef.closest('tr');
            const rateInput = row?.querySelector('.rate-input');
            if (rateInput) {
                rateInput.value = this.formatCurrency(price);
                const formType = this.getFormTypeFromRow(row);
                this.calculateRowAmount(row, formType);
                this.calculateTotals(formType);
            }
        }

        this.closeModal('add-product-modal');
        this.showMessage('Product added successfully!', 'success');
    }

    // Close Modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hide');
            modal.querySelectorAll('input, textarea').forEach(input => input.value = '');
        }
    }

    // Get Form Type from Row
    getFormTypeFromRow(row) {
        const table = row.closest('table');
        if (!table) return 'pos';
        
        if (table.id.includes('prof')) return 'professional';
        if (table.id.includes('re')) return 'realestate';
        return 'pos';
    }

    // Save Invoice
    saveInvoice(formType) {
        const invoiceData = this.collectInvoiceData(formType);
        if (!invoiceData) return;

        invoiceData.id = Date.now();
        invoiceData.createdAt = new Date().toISOString();
        invoiceData.userId = this.currentUser;

        this.invoices.push(invoiceData);
        this.saveData('invoices', this.invoices);

        this.showMessage('Invoice saved successfully!', 'success');
    }

    // Collect Invoice Data
    collectInvoiceData(formType) {
        const prefix = formType === 'professional' ? 'prof' : 
                      formType === 'realestate' ? 're' : 'pos';

        const data = {
            type: formType,
            invoiceNumber: document.getElementById(`${prefix}-invoice-no`)?.value || '',
            date: document.getElementById(`${prefix}-date`)?.value || '',
            customer: document.getElementById(`${prefix}-customer`)?.value || '',
            items: [],
            totals: {}
        };

        // Collect items
        const rows = document.querySelectorAll(`#${prefix}-items-body tr`);
        rows.forEach(row => {
            const item = {};
            
            if (formType === 'pos') {
                item.product = row.querySelector('.product-input')?.value || '';
                item.quantity = parseFloat(row.querySelector('.qty-input')?.value) || 0;
                item.rate = this.parseCurrency(row.querySelector('.rate-input')?.value);
                item.amount = this.parseCurrency(row.querySelector('.amount-display')?.textContent);
            } else if (formType === 'professional') {
                item.description = row.querySelector('.product-input')?.value || '';
                item.hsn = row.querySelector('.hsn-input')?.value || '';
                item.quantity = parseFloat(row.querySelector('.qty-input')?.value) || 0;
                item.rate = this.parseCurrency(row.querySelector('.rate-input')?.value);
                item.amount = this.parseCurrency(row.querySelector('.amount-display')?.textContent);
            } else if (formType === 'realestate') {
                item.description = row.querySelector('.desc-input')?.value || '';
                item.unit = row.querySelector('.unit-input')?.value || '';
                item.rate = this.parseCurrency(row.querySelector('.rate-input')?.value);
                item.amount = this.parseCurrency(row.querySelector('.amount-display')?.textContent);
            }

            if (item.amount > 0) {
                data.items.push(item);
            }
        });

        // Collect totals
        data.totals.subtotal = this.parseCurrency(document.getElementById(`${prefix}-subtotal`)?.textContent);
        data.totals.total = this.parseCurrency(document.getElementById(`${prefix}-total`)?.textContent);

        return data.items.length > 0 ? data : null;
    }

    // Preview Invoice
    previewInvoice(formType) {
        const invoiceData = this.collectInvoiceData(formType);
        if (!invoiceData) {
            this.showMessage('Please add items to preview invoice', 'error');
            return;
        }

        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(this.generateInvoiceHTML(invoiceData));
        previewWindow.document.close();
    }

    // Print Invoice
    printInvoice(formType) {
        const invoiceData = this.collectInvoiceData(formType);
        if (!invoiceData) {
            this.showMessage('Please add items to print invoice', 'error');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generateInvoiceHTML(invoiceData));
        printWindow.document.close();
        
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    }

    // Generate Invoice HTML
    generateInvoiceHTML(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${data.invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .invoice-details { margin-bottom: 20px; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .items-table th { background-color: #f5f5f5; }
                    .totals { text-align: right; margin-top: 20px; }
                    .total-row { margin: 5px 0; }
                    .grand-total { font-weight: bold; font-size: 18px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Pinvoices</h1>
                    <h2>${data.type.toUpperCase()} INVOICE</h2>
                </div>
                
                <div class="invoice-details">
                    <p><strong>Invoice No:</strong> ${data.invoiceNumber}</p>
                    <p><strong>Date:</strong> ${data.date}</p>
                    <p><strong>Customer:</strong> ${data.customer}</p>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            ${this.generateTableHeaders(data.type)}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => this.generateTableRow(item, data.type)).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">Subtotal: ${this.formatCurrency(data.totals.subtotal)}</div>
                    <div class="total-row grand-total">Total: ${this.formatCurrency(data.totals.total)}</div>
                </div>

                <div style="margin-top: 50px; text-align: center; color: #666;">
                    <p>Generated by Pinvoices v1.0 (Beta)</p>
                    <p>Developer: Anas Lila | Published By: AL Software</p>
                </div>
            </body>
            </html>
        `;
    }

    // Generate Table Headers
    generateTableHeaders(type) {
        if (type === 'pos') {
            return '<th>Product</th><th>Qty</th><th>Rate</th><th>Amount</th>';
        } else if (type === 'professional') {
            return '<th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Rate</th><th>Amount</th>';
        } else if (type === 'realestate') {
            return '<th>Description</th><th>Unit</th><th>Rate</th><th>Amount</th>';
        }
    }

    // Generate Table Row
    generateTableRow(item, type) {
        if (type === 'pos') {
            return `<tr><td>${item.product}</td><td>${item.quantity}</td><td>${this.formatCurrency(item.rate)}</td><td>${this.formatCurrency(item.amount)}</td></tr>`;
        } else if (type === 'professional') {
            return `<tr><td>${item.description}</td><td>${item.hsn}</td><td>${item.quantity}</td><td>${this.formatCurrency(item.rate)}</td><td>${this.formatCurrency(item.amount)}</td></tr>`;
        } else if (type === 'realestate') {
            return `<tr><td>${item.description}</td><td>${item.unit}</td><td>${this.formatCurrency(item.rate)}</td><td>${this.formatCurrency(item.amount)}</td></tr>`;
        }
    }

    // Show User Limitations
    showUserLimitations() {
        if (!this.isPremium) {
            const limitationBanner = document.createElement('div');
            limitationBanner.className = 'upgrade-prompt';
            limitationBanner.innerHTML = `
                <h3>Free User Limitations</h3>
                <p>• Only basic POS invoices available<br>• Maximum 3 items per invoice<br>• Limited features</p>
                <a href="https://wa.me/918879706046?text=I want to buy pinvoice premium ${this.currentUser}" target="_blank" class="whatsapp-link">Upgrade to Premium - ₹599 Lifetime</a>
            `;
            
            document.getElementById('pos-tab').insertBefore(limitationBanner, document.getElementById('pos-tab').firstChild.nextSibling);
        }
    }

    // Show Upgrade Prompt
    showUpgradePrompt(tabName) {
        const tab = document.getElementById(`${tabName}-tab`);
        if (tab && !this.isPremium) {
            tab.innerHTML = this.getUpgradePromptHTML(tabName);
        }
    }

    // Get Upgrade Prompt HTML
    getUpgradePromptHTML(featureName) {
        return `
            <div class="upgrade-prompt" style="height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <h2>🔒 Premium Feature</h2>
                <h3>${featureName}</h3>
                <p>This feature is available for Premium users only.</p>
                <p>Upgrade now to unlock all features including:</p>
                <ul style="text-align: left; margin: 20px 0;">
                    <li>Unlimited invoice types</li>
                    <li>Unlimited items per invoice</li>
                    <li>Customer & product database</li>
                    <li>Professional templates</li>
                    <li>Export & print options</li>
                </ul>
                <a href="https://wa.me/918879706046?text=I want to buy pinvoice premium ${this.currentUser}" target="_blank" class="whatsapp-link">Buy Premium - ₹599 Lifetime</a>
            </div>
        `;
    }

    // Show Message
    showMessage(text, type = 'success') {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Setup PWA Prompt
    setupPWAPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button for Android
            if (navigator.userAgent.includes('Android')) {
                this.showInstallPrompt(deferredPrompt);
            }
        });

        // iOS Add to Home Screen detection
        if (this.isIOS() && !this.isInStandaloneMode()) {
            this.showIOSPrompt();
        }
    }

    // Check if iOS
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    // Check if in standalone mode
    isInStandaloneMode() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    }

    // Show Install Prompt for Android
    showInstallPrompt(deferredPrompt) {
        const installBanner = document.createElement('div');
        installBanner.className = 'install-banner glassy';
        installBanner.innerHTML = `
            <span>Install Pinvoices app for better experience</span>
            <button class="install-btn">Install</button>
            <button class="close-btn">×</button>
        `;
        
        document.body.appendChild(installBanner);
        
        installBanner.querySelector('.install-btn').addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    installBanner.remove();
                }
            });
        });
        
        installBanner.querySelector('.close-btn').addEventListener('click', () => {
            installBanner.remove();
        });
    }

    // Show iOS Add to Home Prompt
    showIOSPrompt() {
        const iosPrompt = document.createElement('div');
        iosPrompt.className = 'ios-prompt glassy';
        iosPrompt.innerHTML = `
            <p>Add Pinvoices to your home screen:</p>
            <p>Tap <strong>Share</strong> → <strong>Add to Home Screen</strong></p>
            <button class="close-btn">Got it!</button>
        `;
        
        document.body.appendChild(iosPrompt);
        
        iosPrompt.querySelector('.close-btn').addEventListener('click', () => {
            iosPrompt.remove();
        });
    }

    // Load User Data
    loadUserData() {
        const userData = this.loadData(`user_${this.currentUser}`) || {};
        this.customers = userData.customers || this.customers;
        this.products = userData.products || this.products;
        this.invoices = userData.invoices || this.invoices;
    }

    // Save Data to localStorage
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }

    // Load Data from localStorage
    loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }
}

// Initialize App
const app = new PinvoicesApp();

// Make app globally available
window.app = app;

// Additional CSS for new elements
const additionalCSS = `
.install-banner {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    padding: 15px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 1001;
    font-size: 14px;
}

.install-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

.close-btn {
    background: rgba(255, 255, 255, 0.3);
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-size: 18px;
    color: #333;
}

.ios-prompt {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    padding: 20px;
    text-align: center;
    z-index: 1001;
}

.modal-form {
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(30px);
    border-radius: 20px;
    padding: 30px;
    width: 100%;
    max-width: 500px;
}

.modal-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
}

.invoice-types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.invoice-type-card {
    padding: 25px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
}

.invoice-type-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.invoice-type-card h3 {
    margin-bottom: 10px;
    color: #333;
}

.invoice-type-card p {
    color: #666;
    font-size: 14px;
}

@media (max-width: 768px) {
    .install-banner {
        left: 10px;
        right: 10px;
        bottom: 10px;
        font-size: 13px;
    }
    
    .ios-prompt {
        left: 10px;
        right: 10px;
        bottom: 10px;
    }
    
    .modal-form {
        padding: 20px;
    }
    
    .invoice-types-grid {
        grid-template-columns: 1fr;
    }
}
`;

// Add additional CSS to head
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);
