// UniBills v1.0 Elite - Complete JavaScript
// Developer: Anas Lila | Published By: AL Software
// Last Updated: 02/Sep/2025 12:44:00 PM IST

class UniBillsApp {
    constructor() {
        this.currentUser = null;
        this.currentUserName = null;
        this.isPremium = false;
        this.selectedTheme = localStorage.getItem('selectedTheme') || 'apple';
        this.customers = this.loadData('customers') || [];
        this.products = this.loadData('products') || [];
        this.invoices = this.loadData('invoices') || [];
        this.premiumUsers = this.loadPremiumUsers();
        this.users = this.loadData('users') || {};
        this.invoiceCounter = this.loadData('invoiceCounter') || { INV: 0, PROF: 0, PROP: 0, QUO: 0, EST: 0, REC: 0, TAX: 0 };
        this.init();
    }

    // Initialize App
    init() {
        this.updateLastUpdated();
        this.bindEvents();
        this.showLoginModal();
        this.setupPWAPrompt();
        this.initializeThemeSelector();
        this.setupInvoiceForms();
        
        // Register Service Worker for PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered successfully');
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed');
                });
        }
    }

    // Load Premium Users
    loadPremiumUsers() {
        try {
            const storedData = localStorage.getItem('premiumUsers');
            if (storedData) {
                return JSON.parse(storedData);
            }
            
            // Default premium users from your existing data
            const defaultPremiumUsers = {
                "premiumUsers": [
                    { "name": "Anas Lila", "email": "anas.lila@example.com", "password": "admin123" },
                    { "name": "Admin User", "email": "admin@unibills.com", "password": "admin123" },
                    { "name": "Demo Premium", "email": "demo.premium@gmail.com", "password": "demo123" },
                    { "name": "John Smith", "email": "john.smith@business.com", "password": "john2025" },
                    { "name": "Sarah Wilson", "email": "sarah.wilson@company.in", "password": "sarah123" },
                    { "name": "Anas", "email": "lilaanas6@gmail.com", "password": "anas123" }
                ]
            };
            
            localStorage.setItem('premiumUsers', JSON.stringify(defaultPremiumUsers));
            return defaultPremiumUsers;
        } catch (error) {
            console.error('Failed to load premium users:', error);
            return { premiumUsers: [] };
        }
    }

    // Load/Save Data
    loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return null;
        }
    }

    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
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

    // Format Indian Date
    formatIndianDate(date) {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-IN', options);
    }

    // Format Indian Time
    formatIndianTime(date) {
        return date.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
        });
    }

    // Format Indian Currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    // Bind Event Listeners
    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Tab switching
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // Theme selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-option')) {
                const themeOption = e.target.closest('.theme-option');
                const theme = themeOption.dataset.theme;
                this.selectTheme(theme);
            }
        });

        // Currency formatting
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('currency-input')) {
                this.formatCurrencyInput(e.target);
            }
        });

        // Change password links
        const changePasswordLink = document.getElementById('change-password-link');
        if (changePasswordLink) {
            changePasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectToChangePassword('login');
            });
        }

        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.redirectToChangePassword('settings');
            });
        }

        // Support buttons
        const supportBtn = document.getElementById('support-btn');
        if (supportBtn) {
            supportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectToSupport();
            });
        }

        // Premium upgrade links
        document.addEventListener('click', (e) => {
            if (e.target.closest('.upgrade-link') || e.target.id.includes('upgrade-link')) {
                e.preventDefault();
                this.redirectToUpgrade();
            }
        });

        // Invoice form events
        this.bindInvoiceEvents();
    }

    // Bind Invoice Events
    bindInvoiceEvents() {
        // Add item buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-item-btn')) {
                const type = this.getCurrentInvoiceType();
                this.addInvoiceItem(type);
            }
        });

        // Remove item buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-item-btn')) {
                const row = e.target.closest('tr');
                if (row) {
                    row.remove();
                    this.updateTotals();
                }
            }
        });

        // Invoice action buttons
        document.addEventListener('click', (e) => {
            const btnId = e.target.id || e.target.closest('button')?.id;
            
            if (btnId && btnId.includes('preview')) {
                this.previewInvoice();
            } else if (btnId && btnId.includes('save')) {
                this.saveInvoice();
            } else if (btnId && btnId.includes('print')) {
                this.printInvoice();
            }
        });

        // Auto-calculate totals
        document.addEventListener('input', (e) => {
            if (e.target.closest('.items-table')) {
                this.updateTotals();
            }
        });

        // Customer dropdown
        this.setupCustomerDropdown();
    }

    // Initialize Theme Selector
    initializeThemeSelector() {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            if (option.dataset.theme === this.selectedTheme) {
                option.classList.add('active');
            }
        });
    }

    // Select Theme
    selectTheme(theme) {
        this.selectedTheme = theme;
        localStorage.setItem('selectedTheme', theme);
        
        // Update UI
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        
        const selectedOption = document.querySelector(`[data-theme="${theme}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }

        this.showMessage(`Theme changed to ${theme.charAt(0).toUpperCase() + theme.slice(1)}`, 'success');
    }

    // Handle Login
    handleLogin() {
        const name = document.getElementById('login-name').value.trim();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value.trim();

        if (!name || !email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        this.setLoginLoading(true);

        setTimeout(() => {
            this.processLogin(name, email, password);
        }, 1000);
    }

    // Process Login
    processLogin(name, email, password) {
        const premiumUser = this.premiumUsers.premiumUsers.find(user => 
            user.email.toLowerCase() === email && user.password === password
        );

        if (premiumUser) {
            this.currentUser = email;
            this.currentUserName = premiumUser.name;
            this.isPremium = true;
            this.loginSuccess('premium');
        } else if (this.isValidUser(name, email, password)) {
            this.currentUser = email;
            this.currentUserName = name;
            this.isPremium = false;
            this.loginSuccess('free');
        } else {
            this.setLoginLoading(false);
            this.showMessage('Invalid credentials. Please check your details.', 'error');
        }
    }

    // Validate User
    isValidUser(name, email, password) {
        return name.length >= 2 && this.isValidEmail(email) && password.length >= 6;
    }

    // Email Validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Set Login Loading
    setLoginLoading(loading) {
        const btnText = document.querySelector('.btn-text');
        const btnLoader = document.querySelector('.btn-loader');
        const loginBtn = document.querySelector('.login-btn');

        if (loading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';
            loginBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            loginBtn.disabled = false;
        }
    }

    // Login Success
    loginSuccess(userType) {
        this.setLoginLoading(false);

        if (userType === 'premium') {
            this.showCelebration();
        }

        this.updateUserInterface();

        setTimeout(() => {
            document.getElementById('login-modal').classList.remove('show');
            document.getElementById('app-container').style.display = 'block';
            
            this.loadUserData();
            this.setupInvoiceForms();
            this.showUserLimitations();
            
            this.showMessage(`Welcome ${this.currentUserName}! ${this.isPremium ? '🎉 Premium access granted!' : 'You have free access.'}`, 'success');
        }, userType === 'premium' ? 2000 : 500);
    }

    // Update User Interface
    updateUserInterface() {
        const userInfo = document.getElementById('user-info');
        const userName = userInfo.querySelector('.user-name');
        const userType = userInfo.querySelector('.user-type');
        const logoutBtn = document.getElementById('logout-btn');

        if (userInfo && userName && userType) {
            userName.textContent = this.currentUserName;
            userType.textContent = this.isPremium ? 'Premium' : 'Free';
            userType.className = `user-type ${this.isPremium ? 'premium' : 'free'}`;
            userInfo.style.display = 'flex';
        }

        if (logoutBtn) {
            logoutBtn.style.display = 'flex';
        }

        if (this.isPremium) {
            document.getElementById('premium-info').style.display = 'flex';
            document.getElementById('free-info').style.display = 'none';
        } else {
            document.getElementById('premium-info').style.display = 'none';
            document.getElementById('free-info').style.display = 'flex';
            
            const whatsappBtn = document.getElementById('buy-premium-btn');
            if (whatsappBtn) {
                const message = `I want to buy UniBills premium. Name: ${this.currentUserName}, Email: ${this.currentUser}, User Type: Free User, Request: BUY PREMIUM`;
                whatsappBtn.href = `https://wa.me/918879706046?text=${encodeURIComponent(message)}`;
            }
        }

        this.updateSettingsInfo();
    }

    // Update Settings Info
    updateSettingsInfo() {
        const settingsName = document.getElementById('settings-user-name');
        const settingsEmail = document.getElementById('settings-user-email');
        const settingsType = document.getElementById('settings-user-type');

        if (settingsName) settingsName.textContent = this.currentUserName || '-';
        if (settingsEmail) settingsEmail.textContent = this.currentUser || '-';
        if (settingsType) settingsType.textContent = this.isPremium ? 'Premium Account' : 'Free Account';
    }

    // Show Celebration
    showCelebration() {
        const container = document.getElementById('celebration-container');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            container.appendChild(confetti);
        }

        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }

    // Handle Logout
    handleLogout() {
        this.currentUser = null;
        this.currentUserName = null;
        this.isPremium = false;

        document.getElementById('app-container').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('login-modal').classList.add('show');
        document.getElementById('login-form').reset();
        document.getElementById('premium-info').style.display = 'none';
        document.getElementById('free-info').style.display = 'none';

        this.showMessage('Logged out successfully', 'success');
    }

    // Show Login Modal
    showLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.add('show');
        }
    }

    // Switch Tabs
    switchTab(tabName) {
        if (!this.isPremium && ['professional', 'realestate', 'more'].includes(tabName)) {
            this.showUpgradePrompt(tabName);
            return;
        }

        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    // Show Upgrade Prompt
    showUpgradePrompt(feature) {
        const featureNames = {
            'professional': 'Professional Invoices',
            'realestate': 'Real Estate Cost Sheets',
            'more': 'Additional Invoice Types'
        };

        this.showMessage(`${featureNames[feature]} require Premium access. Please upgrade to continue.`, 'error');
    }

    // Setup Invoice Forms
    setupInvoiceForms() {
        this.createPOSForm();
        if (this.isPremium) {
            this.createProfessionalForm();
            this.createRealEstateForm();
            this.createMoreForms();
        }
        this.setupDateInputs();
        this.generateInvoiceNumbers();
    }

    // Setup Date Inputs
    setupDateInputs() {
        const dateInputs = document.querySelectorAll('input[type="date"]');
        const today = new Date().toISOString().split('T')[0];
        dateInputs.forEach(input => {
            input.value = today;
        });
    }

    // Generate Invoice Numbers
    generateInvoiceNumbers() {
        const posInput = document.getElementById('pos-invoice-number');
        if (posInput) {
            this.invoiceCounter.INV++;
            posInput.value = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.invoiceCounter.INV).padStart(3, '0')}`;
            this.saveData('invoiceCounter', this.invoiceCounter);
        }
    }

    // Create POS Form
    createPOSForm() {
        // POS form is already in HTML, just add functionality
        this.addInvoiceItem('pos'); // Add default item
    }

    // Create Professional Form
    createProfessionalForm() {
        // Add professional form if premium
        const professionalTab = document.getElementById('professional-tab');
        const premiumBlock = document.getElementById('professional-premium-block');
        if (premiumBlock) {
            premiumBlock.style.display = 'none';
        }
        // Add professional form HTML here if needed
    }

    // Create Real Estate Form
    createRealEstateForm() {
        // Add real estate form if premium
        const realEstateTab = document.getElementById('realestate-tab');
        const premiumBlock = document.getElementById('realestate-premium-block');
        if (premiumBlock) {
            premiumBlock.style.display = 'none';
        }
        // Add real estate form HTML here if needed
    }

    // Create More Forms
    createMoreForms() {
        // Add additional forms if premium
        const moreTab = document.getElementById('more-tab');
        const premiumBlock = document.getElementById('more-premium-block');
        if (premiumBlock) {
            premiumBlock.style.display = 'none';
        }
    }

    // Get Current Invoice Type
    getCurrentInvoiceType() {
        const activeTab = document.querySelector('.nav-tab.active');
        return activeTab ? activeTab.dataset.tab : 'pos';
    }

    // Add Invoice Item
    addInvoiceItem(type) {
        const tbody = document.getElementById(`${type}-items-tbody`);
        if (!tbody) return;

        // Check free user limitations
        if (!this.isPremium && type === 'pos') {
            const currentItems = tbody.querySelectorAll('tr').length;
            if (currentItems >= 3) {
                document.getElementById('pos-free-limitation').style.display = 'block';
                this.showMessage('Free users can add maximum 3 items. Upgrade to Premium for unlimited items!', 'error');
                return;
            }
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="text" placeholder="Product/Service name" class="item-product" required>
            </td>
            <td>
                <input type="number" placeholder="1" class="item-quantity" min="1" value="1" required>
            </td>
            <td>
                <input type="number" placeholder="0.00" class="item-rate currency-input" step="0.01" required>
            </td>
            <td>
                <input type="number" placeholder="0.00" class="item-amount currency-input" step="0.01" readonly>
            </td>
            <td>
                <button type="button" class="remove-item-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);

        // Add event listeners for calculation
        const quantityInput = row.querySelector('.item-quantity');
        const rateInput = row.querySelector('.item-rate');
        const amountInput = row.querySelector('.item-amount');

        const calculateAmount = () => {
            const quantity = parseFloat(quantityInput.value) || 0;
            const rate = parseFloat(rateInput.value) || 0;
            const amount = quantity * rate;
            amountInput.value = amount.toFixed(2);
            this.updateTotals();
        };

        quantityInput.addEventListener('input', calculateAmount);
        rateInput.addEventListener('input', calculateAmount);
    }

    // Update Totals
    updateTotals() {
        const type = this.getCurrentInvoiceType();
        const tbody = document.getElementById(`${type}-items-tbody`);
        if (!tbody) return;

        let subtotal = 0;
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const amountInput = row.querySelector('.item-amount');
            if (amountInput) {
                subtotal += parseFloat(amountInput.value) || 0;
            }
        });

        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + tax;

        // Update display
        const subtotalEl = document.getElementById(`${type}-subtotal`);
        const taxEl = document.getElementById(`${type}-tax`);
        const totalEl = document.getElementById(`${type}-total`);

        if (subtotalEl) subtotalEl.textContent = this.formatCurrency(subtotal);
        if (taxEl) taxEl.textContent = this.formatCurrency(tax);
        if (totalEl) totalEl.textContent = this.formatCurrency(total);
    }

    // Setup Customer Dropdown
    setupCustomerDropdown() {
        const customerInput = document.getElementById('pos-customer');
        const customerList = document.getElementById('pos-customer-list');
        
        if (!customerInput || !customerList) return;

        customerInput.addEventListener('focus', () => {
            this.showCustomerDropdown();
        });

        customerInput.addEventListener('input', (e) => {
            this.filterCustomers(e.target.value);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.searchable-dropdown')) {
                customerList.classList.remove('show');
            }
        });
    }

    // Show Customer Dropdown
    showCustomerDropdown() {
        const customerList = document.getElementById('pos-customer-list');
        if (!customerList) return;

        customerList.innerHTML = '';
        
        // Add existing customers
        this.customers.slice(0, 5).forEach(customer => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = customer.name;
            item.addEventListener('click', () => {
                this.selectCustomer(customer);
            });
            customerList.appendChild(item);
        });

        // Add "Add New" option
        const addNew = document.createElement('div');
        addNew.className = 'dropdown-item add-new-item';
        addNew.innerHTML = '<i class="fas fa-plus"></i> Add New Customer';
        addNew.addEventListener('click', () => {
            this.addNewCustomer();
        });
        customerList.appendChild(addNew);

        customerList.classList.add('show');
    }

    // Filter Customers
    filterCustomers(query) {
        const customerList = document.getElementById('pos-customer-list');
        if (!customerList) return;

        const filtered = this.customers.filter(customer => 
            customer.name.toLowerCase().includes(query.toLowerCase())
        );

        customerList.innerHTML = '';
        
        filtered.slice(0, 5).forEach(customer => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = customer.name;
            item.addEventListener('click', () => {
                this.selectCustomer(customer);
            });
            customerList.appendChild(item);
        });

        if (filtered.length === 0 || query) {
            const addNew = document.createElement('div');
            addNew.className = 'dropdown-item add-new-item';
            addNew.innerHTML = `<i class="fas fa-plus"></i> Add "${query || 'New Customer'}"`;
            addNew.addEventListener('click', () => {
                this.addNewCustomer(query);
            });
            customerList.appendChild(addNew);
        }
    }

    // Select Customer
    selectCustomer(customer) {
        document.getElementById('pos-customer').value = customer.name;
        document.getElementById('pos-mobile').value = customer.mobile || '';
        document.getElementById('pos-email').value = customer.email || '';
        document.getElementById('pos-customer-list').classList.remove('show');
    }

    // Add New Customer
    addNewCustomer(name = '') {
        const customerName = name || document.getElementById('pos-customer').value;
        if (!customerName) return;

        const newCustomer = {
            id: Date.now(),
            name: customerName,
            mobile: '',
            email: '',
            createdAt: new Date().toISOString()
        };

        this.customers.push(newCustomer);
        this.saveData('customers', this.customers);
        this.selectCustomer(newCustomer);
        
        this.showMessage(`Customer "${customerName}" added successfully!`, 'success');
    }

    // Load User Data
    loadUserData() {
        // Load user-specific data if exists
        const userData = this.loadData(`user_${this.currentUser}`);
        if (userData) {
            this.customers = userData.customers || [];
            this.products = userData.products || [];
            this.invoices = userData.invoices || [];
        }
    }

    // Show User Limitations
    showUserLimitations() {
        if (!this.isPremium) {
            const limitation = document.getElementById('pos-free-limitation');
            if (limitation) {
                limitation.style.display = 'none'; // Hide initially
            }
        }
    }

    // Format Currency Input
    formatCurrencyInput(input) {
        let value = input.value.replace(/[^\d.]/g, '');
        if (value) {
            input.value = parseFloat(value).toFixed(2);
        }
    }

    // Preview Invoice
    previewInvoice() {
        const type = this.getCurrentInvoiceType();
        const invoiceData = this.collectInvoiceData(type);
        
        if (!invoiceData) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        this.generateInvoicePreview(invoiceData);
        document.getElementById('invoice-preview-modal').classList.add('show');
    }

    // Collect Invoice Data
    collectInvoiceData(type) {
        const data = {
            type: type,
            theme: this.selectedTheme,
            invoiceNumber: document.getElementById(`${type}-invoice-number`).value,
            date: document.getElementById(`${type}-date`).value,
            customer: document.getElementById(`${type}-customer`).value,
            customerMobile: document.getElementById(`${type}-mobile`).value,
            customerEmail: document.getElementById(`${type}-email`).value,
            items: [],
            totals: {}
        };

        // Validate required fields
        if (!data.customer || !data.date) {
            return null;
        }

        // Collect items
        const tbody = document.getElementById(`${type}-items-tbody`);
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const product = row.querySelector('.item-product').value;
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
            const amount = quantity * rate;

            if (product && quantity && rate) {
                data.items.push({
                    product,
                    quantity,
                    rate,
                    amount
                });
            }
        });

        if (data.items.length === 0) {
            return null;
        }

        // Calculate totals
        const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
        const tax = subtotal * 0.18;
        const total = subtotal + tax;

        data.totals = { subtotal, tax, total };

        return data;
    }

    // Generate Invoice Preview
    generateInvoicePreview(data) {
        const previewContent = document.getElementById('invoice-preview-content');
        const themeData = this.getThemeData(data.theme);
        
        previewContent.innerHTML = `
            <div class="invoice-preview ${data.theme}-theme">
                <div class="invoice-header">
                    <div class="company-info">
                        <img src="${themeData.logo}" alt="${themeData.name}" class="company-logo">
                        <div class="company-details">
                            <h1>${themeData.name}</h1>
                            <p>${themeData.tagline}</p>
                        </div>
                    </div>
                    <div class="invoice-info">
                        <h2>INVOICE</h2>
                        <p><strong>Invoice No:</strong> ${data.invoiceNumber}</p>
                        <p><strong>Date:</strong> ${this.formatIndianDate(new Date(data.date))}</p>
                    </div>
                </div>
                
                <div class="customer-info">
                    <h3>Bill To:</h3>
                    <p><strong>${data.customer}</strong></p>
                    ${data.customerMobile ? `<p>Mobile: ${data.customerMobile}</p>` : ''}
                    ${data.customerEmail ? `<p>Email: ${data.customerEmail}</p>` : ''}
                </div>
                
                <table class="invoice-items">
                    <thead>
                        <tr>
                            <th>Item/Service</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td>${item.product}</td>
                                <td>${item.quantity}</td>
                                <td>${this.formatCurrency(item.rate)}</td>
                                <td>${this.formatCurrency(item.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="invoice-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${this.formatCurrency(data.totals.subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>GST (18%):</span>
                        <span>${this.formatCurrency(data.totals.tax)}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Total Amount:</span>
                        <span>${this.formatCurrency(data.totals.total)}</span>
                    </div>
                </div>
                
                <div class="invoice-footer">
                    <p><strong>Generated by UniBills v1.0 Elite</strong></p>
                    <p>Thank you for your business!</p>
                </div>
            </div>
        `;

        // Close preview modal
        const closeBtn = document.getElementById('close-preview');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('invoice-preview-modal').classList.remove('show');
            });
        }
    }

    // Get Theme Data
    getThemeData(theme) {
        const themes = {
            apple: {
                name: 'Apple Inc.',
                tagline: 'Think Different',
                logo: 'https://cdn3.iconfinder.com/data/icons/social-media-logos-glyph/2048/5315_-_Apple-512.png'
            },
            google: {
                name: 'Google LLC',
                tagline: 'Organize the world\'s information',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png'
            },
            meta: {
                name: 'Meta Platforms',
                tagline: 'Connecting the world',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png'
            },
            amazon: {
                name: 'Amazon.com Inc.',
                tagline: 'Earth\'s Most Customer-Centric Company',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1280px-Amazon_logo.svg.png'
            },
            zomato: {
                name: 'Zomato Ltd.',
                tagline: 'Better food for more people',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Zomato_Logo.svg/1200px-Zomato_Logo.svg.png'
            }
        };

        return themes[theme] || themes.apple;
    }

    // Save Invoice
    saveInvoice() {
        const type = this.getCurrentInvoiceType();
        const invoiceData = this.collectInvoiceData(type);
        
        if (!invoiceData) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        invoiceData.id = Date.now();
        invoiceData.createdAt = new Date().toISOString();
        invoiceData.status = 'draft';

        this.invoices.push(invoiceData);
        this.saveData('invoices', this.invoices);
        this.saveData(`user_${this.currentUser}`, {
            customers: this.customers,
            products: this.products,
            invoices: this.invoices
        });

        this.showMessage('Invoice saved successfully!', 'success');
        this.clearInvoiceForm(type);
    }

    // Clear Invoice Form
    clearInvoiceForm(type) {
        document.getElementById(`${type}-customer`).value = '';
        document.getElementById(`${type}-mobile`).value = '';
        document.getElementById(`${type}-email`).value = '';
        
        const tbody = document.getElementById(`${type}-items-tbody`);
        tbody.innerHTML = '';
        
        this.addInvoiceItem(type);
        this.generateInvoiceNumbers();
        this.updateTotals();
    }

    // Print Invoice
    printInvoice() {
        window.print();
    }

    // Redirect Functions
    redirectToChangePassword(source) {
        const message = `I want to change my password. Name: ${this.currentUserName}, Email: ${this.currentUser}, User Type: ${this.isPremium ? 'Premium' : 'Free'}, Request: CHANGE PASSWORD`;
        window.open(`https://wa.me/918879706046?text=${encodeURIComponent(message)}`, '_blank');
    }

    redirectToSupport() {
        const message = `Hello! I need support for UniBills. Name: ${this.currentUserName}, Email: ${this.currentUser}, User Type: ${this.isPremium ? 'Premium' : 'Free'}, Issue: General Support Request`;
        window.open(`https://wa.me/918879706046?text=${encodeURIComponent(message)}`, '_blank');
    }

    redirectToUpgrade() {
        const message = `I want to buy UniBills premium. Name: ${this.currentUserName || 'User'}, Email: ${this.currentUser || 'Not logged in'}, User Type: Free User, Request: BUY PREMIUM`;
        window.open(`https://wa.me/918879706046?text=${encodeURIComponent(message)}`, '_blank');
    }

    // Show Message
    showMessage(text, type = 'success') {
        const container = document.getElementById('message-container') || document.body;
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        container.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    // PWA Setup
    setupPWAPrompt() {
        // PWA installation prompt is handled in HTML
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.unibillsApp = new UniBillsApp();
});

// Additional CSS for invoice preview
const invoiceStyles = `
<style>
.invoice-preview {
    background: white;
    padding: 40px;
    color: #333;
    line-height: 1.6;
    font-family: Arial, sans-serif;
}

.invoice-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    border-bottom: 2px solid #eee;
    padding-bottom: 20px;
}

.company-info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.company-logo {
    width: 80px;
    height: 80px;
    object-fit: contain;
}

.company-details h1 {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 5px;
}

.company-details p {
    font-size: 14px;
    color: #666;
}

.invoice-info {
    text-align: right;
}

.invoice-info h2 {
    font-size: 32px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
}

.customer-info {
    margin-bottom: 30px;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
}

.customer-info h3 {
    margin-bottom: 15px;
    font-size: 18px;
    font-weight: bold;
}

.invoice-items {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
}

.invoice-items th,
.invoice-items td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.invoice-items th {
    background: #f5f5f5;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 12px;
}

.invoice-items td:last-child,
.invoice-items th:last-child {
    text-align: right;
}

.invoice-totals {
    margin-left: auto;
    width: 300px;
}

.total-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.total-row.grand-total {
    font-size: 18px;
    font-weight: bold;
    border-top: 2px solid #333;
    border-bottom: 2px solid #333;
    margin-top: 10px;
    padding-top: 15px;
}

.invoice-footer {
    margin-top: 40px;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #eee;
    color: #666;
}

@media print {
    .invoice-preview {
        margin: 0;
        padding: 20px;
    }
}
</style>
`;

// Inject invoice styles
document.head.insertAdjacentHTML('beforeend', invoiceStyles);
