/**
 * UniBills v1.0 Elite - Universal Invoice Management System
 * 
 * @author Anas Lila
 * @company AL Software
 * @version 1.0 Elite
 * @date September 02, 2025
 * @license Premium Software - All Rights Reserved
 */

'use strict';

class UniBillsCore {
    constructor() {
        // Core Configuration
        this.version = '1.0 Elite';
        this.developer = 'Anas Lila';
        this.company = 'AL Software';
        this.supportNumber = '+91 8879706046';
        
        // User State Management
        this.user = {
            isLoggedIn: false,
            email: null,
            name: null,
            isPremium: false,
            preferences: {
                theme: localStorage.getItem('unibills_theme') || 'apple',
                currency: 'INR',
                dateFormat: 'DD/MM/YYYY'
            }
        };

        // Application State
        this.state = {
            currentTab: 'pos',
            invoiceData: {},
            customers: this.loadFromStorage('customers', []),
            products: this.loadFromStorage('products', []),
            invoices: this.loadFromStorage('invoices', []),
            counters: this.loadFromStorage('counters', {
                INV: 1001, PROF: 2001, PROP: 3001, QUO: 4001
            })
        };

        // Premium Users Database
        this.premiumUsers = [
            { name: 'Anas Lila', email: 'anas.lila@example.com', password: 'admin123' },
            { name: 'Admin User', email: 'admin@unibills.com', password: 'admin123' },
            { name: 'Demo Premium', email: 'demo.premium@gmail.com', password: 'demo123' },
            { name: 'John Smith', email: 'john.smith@business.com', password: 'john2025' },
            { name: 'Sarah Wilson', email: 'sarah.wilson@company.in', password: 'sarah123' },
            { name: 'Anas', email: 'lilaanas6@gmail.com', password: 'anas123' }
        ];

        // Company Themes
        this.themes = {
            apple: {
                name: 'Apple Inc.',
                logo: 'https://cdn3.iconfinder.com/data/icons/social-media-logos-glyph/2048/5315_-_Apple-512.png',
                colors: { primary: '#007AFF', secondary: '#5856D6' }
            },
            google: {
                name: 'Google LLC',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                colors: { primary: '#4285F4', secondary: '#34A853' }
            },
            meta: {
                name: 'Meta Platforms',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png',
                colors: { primary: '#1877F2', secondary: '#42B883' }
            },
            amazon: {
                name: 'Amazon.com Inc.',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1280px-Amazon_logo.svg.png',
                colors: { primary: '#FF9900', secondary: '#146EB4' }
            },
            zomato: {
                name: 'Zomato Ltd.',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Zomato_Logo.svg/1200px-Zomato_Logo.svg.png',
                colors: { primary: '#E23744', secondary: '#FF7E8B' }
            }
        };

        // Initialize Application
        this.initialize();
    }

    /**
     * Initialize the application
     */
    initialize() {
        this.bindEvents();
        this.setupPWA();
        this.displayLoginScreen();
        this.initializeThemes();
        console.log(`UniBills ${this.version} initialized successfully`);
    }

    /**
     * Load data from localStorage with error handling
     */
    loadFromStorage(key, defaultValue) {
        try {
            const stored = localStorage.getItem(`unibills_${key}`);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Save data to localStorage with error handling
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(`unibills_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            this.showNotification('Storage error occurred', 'error');
            return false;
        }
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Authentication Events
        this.bindElement('#login-form', 'submit', this.handleLogin.bind(this));
        this.bindElement('#logout-btn', 'click', this.handleLogout.bind(this));

        // Navigation Events
        this.bindElements('.nav-tab', 'click', this.handleTabSwitch.bind(this));

        // Theme Selection Events
        this.bindElements('.theme-option', 'click', this.handleThemeSelection.bind(this));

        // Invoice Events
        this.bindElements('.add-item-btn', 'click', this.addInvoiceItem.bind(this));
        this.bindElement('#pos-preview', 'click', this.previewInvoice.bind(this));
        this.bindElement('#pos-save', 'click', this.saveInvoice.bind(this));
        this.bindElement('#pos-print', 'click', this.printInvoice.bind(this));

        // Dynamic calculation events
        document.addEventListener('input', this.handleInputChange.bind(this));
        document.addEventListener('click', this.handleDynamicClicks.bind(this));

        // Support and upgrade events
        this.bindElements('.upgrade-link', 'click', this.handleUpgrade.bind(this));
        this.bindElement('#support-btn', 'click', this.handleSupport.bind(this));
        this.bindElement('#change-password-btn', 'click', this.handlePasswordChange.bind(this));
    }

    /**
     * Utility function to bind single element
     */
    bindElement(selector, event, handler) {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    /**
     * Utility function to bind multiple elements
     */
    bindElements(selector, event, handler) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener(event, handler);
        });
    }

    /**
     * Handle user login
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = this.getFormData('#login-form');
        const { name, email, password } = formData;

        // Validation
        if (!this.validateLoginForm(name, email, password)) return;

        // Show loading
        this.setLoginLoading(true);

        try {
            // Simulate API call delay
            await this.delay(1000);

            const isPremium = this.authenticateUser(email.toLowerCase(), password);
            
            if (isPremium !== null) {
                this.user = {
                    isLoggedIn: true,
                    email: email.toLowerCase(),
                    name: name,
                    isPremium: isPremium
                };

                this.onLoginSuccess(isPremium);
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setLoginLoading(false);
        }
    }

    /**
     * Validate login form
     */
    validateLoginForm(name, email, password) {
        if (!name || name.length < 2) {
            this.showNotification('Please enter a valid name', 'error');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }
        
        if (!password || password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Authenticate user
     */
    authenticateUser(email, password) {
        const premiumUser = this.premiumUsers.find(user => 
            user.email.toLowerCase() === email && user.password === password
        );
        
        if (premiumUser) {
            return true; // Premium user
        }
        
        // Allow any valid email/password combo as free user
        if (this.isValidEmail(email) && password.length >= 6) {
            return false; // Free user
        }
        
        return null; // Invalid
    }

    /**
     * Handle successful login
     */
    onLoginSuccess(isPremium) {
        if (isPremium) {
            this.showCelebration();
        }

        this.updateUserInterface();
        this.hideLoginModal();
        this.showMainApp();
        this.initializeInvoiceForm();
        
        const userType = isPremium ? 'Premium' : 'Free';
        this.showNotification(`Welcome ${this.user.name}! You have ${userType} access.`, 'success');
    }

    /**
     * Handle user logout
     */
    handleLogout() {
        this.user = {
            isLoggedIn: false,
            email: null,
            name: null,
            isPremium: false
        };

        this.hideMainApp();
        this.showLoginModal();
        this.resetForms();
        this.showNotification('Logged out successfully', 'success');
    }

    /**
     * Handle tab switching
     */
    handleTabSwitch(event) {
        const tabName = event.currentTarget.dataset.tab;
        
        if (!this.user.isPremium && ['professional', 'realestate', 'more'].includes(tabName)) {
            this.showUpgradePrompt(tabName);
            return;
        }

        this.switchTab(tabName);
    }

    /**
     * Switch to specified tab
     */
    switchTab(tabName) {
        // Remove active class from all tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Activate selected tab
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-tab`);

        if (activeTab && activeContent) {
            activeTab.classList.add('active');
            activeContent.classList.add('active');
            this.state.currentTab = tabName;
        }
    }

    /**
     * Handle theme selection
     */
    handleThemeSelection(event) {
        const theme = event.currentTarget.dataset.theme;
        this.selectTheme(theme);
    }

    /**
     * Select and apply theme
     */
    selectTheme(themeName) {
        this.user.preferences.theme = themeName;
        this.saveToStorage('theme', themeName);

        // Update UI
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });

        const selectedTheme = document.querySelector(`[data-theme="${themeName}"]`);
        if (selectedTheme) {
            selectedTheme.classList.add('active');
        }

        this.showNotification(`Theme changed to ${this.themes[themeName]?.name || themeName}`, 'success');
    }

    /**
     * Initialize themes
     */
    initializeThemes() {
        const savedTheme = this.user.preferences.theme;
        if (savedTheme) {
            this.selectTheme(savedTheme);
        }
    }

    /**
     * Add invoice item
     */
    addInvoiceItem(event) {
        const type = this.state.currentTab;
        
        // Check free user limitations
        if (!this.user.isPremium && type === 'pos') {
            const currentItems = document.querySelectorAll('#pos-items-tbody tr').length;
            if (currentItems >= 3) {
                this.showFreeLimitation();
                return;
            }
        }

        const tbody = document.getElementById(`${type}-items-tbody`);
        if (!tbody) return;

        const row = this.createInvoiceItemRow();
        tbody.appendChild(row);

        // Focus on first input
        const firstInput = row.querySelector('input');
        if (firstInput) firstInput.focus();
    }

    /**
     * Create invoice item row
     */
    createInvoiceItemRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="text" 
                       placeholder="Enter product or service" 
                       class="item-product" 
                       required>
            </td>
            <td>
                <input type="number" 
                       placeholder="1" 
                       class="item-quantity" 
                       min="1" 
                       value="1" 
                       required>
            </td>
            <td>
                <input type="number" 
                       placeholder="0.00" 
                       class="item-rate currency-input" 
                       step="0.01" 
                       min="0"
                       required>
            </td>
            <td>
                <input type="number" 
                       placeholder="0.00" 
                       class="item-amount currency-input" 
                       step="0.01" 
                       readonly 
                       tabindex="-1">
            </td>
            <td>
                <button type="button" 
                        class="remove-item-btn" 
                        title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        return row;
    }

    /**
     * Handle input changes
     */
    handleInputChange(event) {
        const target = event.target;
        
        // Calculate item amounts
        if (target.classList.contains('item-quantity') || target.classList.contains('item-rate')) {
            this.calculateItemAmount(target);
        }

        // Format currency inputs
        if (target.classList.contains('currency-input') && !target.readOnly) {
            this.formatCurrencyInput(target);
        }

        // Update totals when items change
        if (target.closest('.items-table')) {
            this.updateInvoiceTotals();
        }
    }

    /**
     * Handle dynamic clicks
     */
    handleDynamicClicks(event) {
        const target = event.target.closest('button');
        if (!target) return;

        // Remove item buttons
        if (target.classList.contains('remove-item-btn')) {
            this.removeInvoiceItem(target);
        }

        // Modal close buttons
        if (target.classList.contains('close-modal')) {
            this.closeModal(target);
        }
    }

    /**
     * Calculate item amount
     */
    calculateItemAmount(input) {
        const row = input.closest('tr');
        if (!row) return;

        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const amountInput = row.querySelector('.item-amount');
        
        const amount = quantity * rate;
        amountInput.value = amount.toFixed(2);
    }

    /**
     * Update invoice totals
     */
    updateInvoiceTotals() {
        const type = this.state.currentTab;
        const tbody = document.getElementById(`${type}-items-tbody`);
        
        if (!tbody) return;

        let subtotal = 0;
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const amount = parseFloat(row.querySelector('.item-amount').value) || 0;
            subtotal += amount;
        });

        const gstRate = 0.18;
        const gst = subtotal * gstRate;
        const total = subtotal + gst;

        // Update display
        this.updateTotalDisplay(`${type}-subtotal`, subtotal);
        this.updateTotalDisplay(`${type}-tax`, gst);
        this.updateTotalDisplay(`${type}-total`, total);
    }

    /**
     * Update total display
     */
    updateTotalDisplay(elementId, amount) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = this.formatCurrency(amount);
        }
    }

    /**
     * Remove invoice item
     */
    removeInvoiceItem(button) {
        const row = button.closest('tr');
        const tbody = row.closest('tbody');
        
        row.remove();
        this.updateInvoiceTotals();

        // Ensure at least one item row exists
        if (tbody.children.length === 0) {
            this.addInvoiceItem({ target: { closest: () => null } });
        }

        // Hide free limitation if items reduced
        if (!this.user.isPremium && tbody.children.length < 3) {
            this.hideFreeLimitation();
        }
    }

    /**
     * Preview invoice
     */
    previewInvoice() {
        const invoiceData = this.collectInvoiceData();
        
        if (!this.validateInvoiceData(invoiceData)) {
            return;
        }

        this.generatePreview(invoiceData);
        this.showModal('#invoice-preview-modal');
    }

    /**
     * Save invoice
     */
    saveInvoice() {
        const invoiceData = this.collectInvoiceData();
        
        if (!this.validateInvoiceData(invoiceData)) {
            return;
        }

        // Add metadata
        invoiceData.id = this.generateInvoiceId();
        invoiceData.createdAt = new Date().toISOString();
        invoiceData.status = 'saved';
        invoiceData.theme = this.user.preferences.theme;

        // Save to storage
        this.state.invoices.push(invoiceData);
        this.saveToStorage('invoices', this.state.invoices);

        this.showNotification('Invoice saved successfully!', 'success');
        this.resetInvoiceForm();
    }

    /**
     * Print invoice
     */
    printInvoice() {
        window.print();
    }

    /**
     * Collect invoice data from form
     */
    collectInvoiceData() {
        const type = this.state.currentTab;
        
        const data = {
            type: type,
            invoiceNumber: this.getValue(`${type}-invoice-number`),
            date: this.getValue(`${type}-date`),
            customer: this.getValue(`${type}-customer`),
            mobile: this.getValue(`${type}-mobile`),
            email: this.getValue(`${type}-email`),
            items: [],
            totals: {}
        };

        // Collect items
        const tbody = document.getElementById(`${type}-items-tbody`);
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const product = row.querySelector('.item-product').value.trim();
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const rate = parseFloat(row.querySelector('.item-rate').value) || 0;

            if (product && quantity > 0 && rate >= 0) {
                data.items.push({
                    product,
                    quantity,
                    rate,
                    amount: quantity * rate
                });
            }
        });

        // Calculate totals
        const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
        const gst = subtotal * 0.18;
        const total = subtotal + gst;

        data.totals = { subtotal, gst, total };

        return data;
    }

    /**
     * Validate invoice data
     */
    validateInvoiceData(data) {
        if (!data.customer.trim()) {
            this.showNotification('Please enter customer name', 'error');
            return false;
        }

        if (!data.date) {
            this.showNotification('Please select invoice date', 'error');
            return false;
        }

        if (data.items.length === 0) {
            this.showNotification('Please add at least one item', 'error');
            return false;
        }

        if (data.totals.total <= 0) {
            this.showNotification('Invoice total must be greater than zero', 'error');
            return false;
        }

        return true;
    }

    /**
     * Generate preview
     */
    generatePreview(data) {
        const theme = this.themes[this.user.preferences.theme];
        const previewContent = document.getElementById('invoice-preview-content');
        
        if (!previewContent) return;

        previewContent.innerHTML = this.createInvoiceHTML(data, theme);
    }

    /**
     * Create invoice HTML
     */
    createInvoiceHTML(data, theme) {
        return `
            <div class="invoice-document">
                <header class="invoice-header">
                    <div class="company-section">
                        <img src="${theme.logo}" alt="${theme.name}" class="company-logo">
                        <div>
                            <h1>${theme.name}</h1>
                            <p class="invoice-type">INVOICE</p>
                        </div>
                    </div>
                    <div class="invoice-details">
                        <div><strong>Invoice #:</strong> ${data.invoiceNumber}</div>
                        <div><strong>Date:</strong> ${this.formatDate(data.date)}</div>
                        <div><strong>Generated:</strong> ${this.formatDate(new Date())}</div>
                    </div>
                </header>

                <section class="customer-section">
                    <h3>Bill To:</h3>
                    <div class="customer-info">
                        <div class="customer-name">${data.customer}</div>
                        ${data.mobile ? `<div>Mobile: ${data.mobile}</div>` : ''}
                        ${data.email ? `<div>Email: ${data.email}</div>` : ''}
                    </div>
                </section>

                <section class="items-section">
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Description</th>
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
                </section>

                <section class="totals-section">
                    <div class="totals-table">
                        <div class="total-row">
                            <span>Subtotal:</span>
                            <span>${this.formatCurrency(data.totals.subtotal)}</span>
                        </div>
                        <div class="total-row">
                            <span>GST (18%):</span>
                            <span>${this.formatCurrency(data.totals.gst)}</span>
                        </div>
                        <div class="total-row final-total">
                            <span>Total Amount:</span>
                            <span>${this.formatCurrency(data.totals.total)}</span>
                        </div>
                    </div>
                </section>

                <footer class="invoice-footer">
                    <p>Generated by <strong>UniBills ${this.version}</strong></p>
                    <p>Thank you for your business!</p>
                </footer>
            </div>
        `;
    }

    /**
     * Show upgrade prompt for premium features
     */
    showUpgradePrompt(feature) {
        const featureNames = {
            professional: 'Professional Invoices',
            realestate: 'Real Estate Cost Sheets',
            more: 'Additional Invoice Types'
        };

        this.showNotification(
            `${featureNames[feature]} require Premium access. Please upgrade to continue.`,
            'error'
        );
    }

    /**
     * Show free user limitations
     */
    showFreeLimitation() {
        const limitation = document.getElementById('pos-free-limitation');
        if (limitation) {
            limitation.style.display = 'block';
        }
        this.showNotification('Free users can add maximum 3 items per invoice', 'error');
    }

    /**
     * Hide free user limitations
     */
    hideFreeLimitation() {
        const limitation = document.getElementById('pos-free-limitation');
        if (limitation) {
            limitation.style.display = 'none';
        }
    }

    /**
     * Handle upgrade requests
     */
    handleUpgrade(event) {
        event.preventDefault();
        const message = `I want to buy UniBills Premium. Name: ${this.user.name || 'User'}, Email: ${this.user.email || 'Not provided'}, Current Plan: Free, Request: UPGRADE TO PREMIUM`;
        this.openWhatsApp(message);
    }

    /**
     * Handle support requests
     */
    handleSupport(event) {
        event.preventDefault();
        const message = `Hello! I need support for UniBills. Name: ${this.user.name || 'User'}, Email: ${this.user.email || 'Not provided'}, Plan: ${this.user.isPremium ? 'Premium' : 'Free'}, Issue: General Support`;
        this.openWhatsApp(message);
    }

    /**
     * Handle password change
     */
    handlePasswordChange(event) {
        event.preventDefault();
        const message = `I want to change my password. Name: ${this.user.name}, Email: ${this.user.email}, Plan: ${this.user.isPremium ? 'Premium' : 'Free'}, Request: PASSWORD CHANGE`;
        this.openWhatsApp(message);
    }

    /**
     * Open WhatsApp with message
     */
    openWhatsApp(message) {
        const url = `https://wa.me/${this.supportNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // =======================
    // UTILITY FUNCTIONS
    // =======================

    /**
     * Show celebration animation for premium users
     */
    showCelebration() {
        const container = document.getElementById('celebration-container');
        if (!container) return;

        // Create confetti particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background: ${['#667eea', '#764ba2', '#f093fb', '#f5576c'][i % 4]};
                    left: ${Math.random() * 100}vw;
                    animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
                `;
                container.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 5000);
            }, i * 50);
        }
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'success') {
        const container = document.getElementById('message-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `message ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Update user interface elements
     */
    updateUserInterface() {
        // Update user info in header
        const userInfo = document.getElementById('user-info');
        const userName = userInfo?.querySelector('.user-name');
        const userType = userInfo?.querySelector('.user-type');

        if (userName) userName.textContent = this.user.name;
        if (userType) {
            userType.textContent = this.user.isPremium ? 'Premium' : 'Free';
            userType.className = `user-type ${this.user.isPremium ? 'premium' : 'free'}`;
        }
        
        if (userInfo) userInfo.style.display = 'flex';

        // Update settings page
        this.updateSettingsDisplay();

        // Show/hide premium features
        this.togglePremiumFeatures();
    }

    /**
     * Update settings display
     */
    updateSettingsDisplay() {
        const elements = {
            'settings-user-name': this.user.name || '-',
            'settings-user-email': this.user.email || '-',
            'settings-user-type': this.user.isPremium ? 'Premium Account' : 'Free Account'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Update last updated time
        const lastUpdated = document.getElementById('last-updated');
        if (lastUpdated) {
            lastUpdated.textContent = this.formatDateTime(new Date());
        }
    }

    /**
     * Toggle premium features visibility
     */
    togglePremiumFeatures() {
        const premiumInfo = document.getElementById('premium-info');
        const freeInfo = document.getElementById('free-info');

        if (this.user.isPremium) {
            if (premiumInfo) premiumInfo.style.display = 'flex';
            if (freeInfo) freeInfo.style.display = 'none';
        } else {
            if (premiumInfo) premiumInfo.style.display = 'none';
            if (freeInfo) freeInfo.style.display = 'flex';

            // Setup upgrade link
            const upgradeBtn = document.getElementById('buy-premium-btn');
            if (upgradeBtn) {
                const message = `I want to buy UniBills Premium. Name: ${this.user.name}, Email: ${this.user.email}, Current Plan: Free`;
                upgradeBtn.href = `https://wa.me/${this.supportNumber}?text=${encodeURIComponent(message)}`;
            }
        }
    }

    /**
     * Initialize invoice form
     */
    initializeInvoiceForm() {
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => input.value = today);

        // Generate invoice number
        this.generateInvoiceNumber();

        // Add initial item row
        this.addInvoiceItem({ target: { closest: () => null } });
    }

    /**
     * Generate unique invoice number
     */
    generateInvoiceNumber() {
        const type = this.state.currentTab.toUpperCase();
        const counter = this.state.counters[type] || 1001;
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const number = `${type}-${date}-${String(counter).padStart(4, '0')}`;

        const input = document.getElementById(`${this.state.currentTab}-invoice-number`);
        if (input) input.value = number;

        // Increment counter
        this.state.counters[type] = counter + 1;
        this.saveToStorage('counters', this.state.counters);
    }

    /**
     * Generate unique invoice ID
     */
    generateInvoiceId() {
        return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Reset invoice form
     */
    resetInvoiceForm() {
        const type = this.state.currentTab;
        
        // Clear form fields
        ['customer', 'mobile', 'email'].forEach(field => {
            const input = document.getElementById(`${type}-${field}`);
            if (input) input.value = '';
        });

        // Clear items table
        const tbody = document.getElementById(`${type}-items-tbody`);
        if (tbody) tbody.innerHTML = '';

        // Reset form
        this.initializeInvoiceForm();
    }

    /**
     * Reset all forms
     */
    resetForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => form.reset());
    }

    /**
     * UI State Management
     */
    setLoginLoading(loading) {
        const button = document.querySelector('.login-btn');
        const btnText = button?.querySelector('.btn-text');
        const btnLoader = button?.querySelector('.btn-loader');

        if (loading) {
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'block';
            if (button) button.disabled = true;
        } else {
            if (btnText) btnText.style.display = 'block';
            if (btnLoader) btnLoader.style.display = 'none';
            if (button) button.disabled = false;
        }
    }

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) modal.classList.add('show');
    }

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) modal.classList.remove('show');
    }

    showMainApp() {
        const app = document.getElementById('app-container');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (app) app.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'flex';
    }

    hideMainApp() {
        const app = document.getElementById('app-container');
        if (app) app.style.display = 'none';
    }

    showModal(selector) {
        const modal = document.querySelector(selector);
        if (modal) modal.classList.add('show');
    }

    closeModal(button) {
        const modal = button.closest('.modal');
        if (modal) modal.classList.remove('show');
    }

    /**
     * Utility Functions
     */
    getFormData(formSelector) {
        const form = document.querySelector(formSelector);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        // Get all form inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name || input.id) {
                const key = input.name || input.id.replace(/^.*-/, '');
                data[key] = input.value;
            }
        });

        return data;
    }

    getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    setValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatCurrencyInput(input) {
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
            input.value = value.toFixed(2);
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Setup PWA functionality
     */
    setupPWA() {
        // PWA install prompt handling
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            const installPrompt = document.getElementById('pwa-install-prompt');
            if (installPrompt) installPrompt.style.display = 'flex';
        });

        // Install button
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        this.showNotification('UniBills installed successfully!', 'success');
                    }
                    
                    deferredPrompt = null;
                    const installPrompt = document.getElementById('pwa-install-prompt');
                    if (installPrompt) installPrompt.style.display = 'none';
                }
            });
        }

        // Dismiss button
        const dismissBtn = document.getElementById('pwa-dismiss-btn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                const installPrompt = document.getElementById('pwa-install-prompt');
                if (installPrompt) installPrompt.style.display = 'none';
            });
        }
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1500);

    // Initialize UniBills
    window.UniBills = new UniBillsCore();
    console.log('UniBills v1.0 Elite initialized successfully by AL Software');
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniBillsCore;
}
