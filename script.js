// UniBills v1.0 Elite - Complete JavaScript
// Developer: Anas Lila | Published By: AL Software
// Last Updated: 21/Aug/2025 4:07:00 PM IST

class UniBillsApp {
    constructor() {
        this.currentUser = null;
        this.currentUserName = null;
        this.isPremium = false;
        this.customers = this.loadData('customers') || [];
        this.products = this.loadData('products') || [];
        this.invoices = this.loadData('invoices') || [];
        this.premiumUsers = this.loadPremiumUsers();
        this.users = this.loadData('users') || {};
        
        this.init();
    }

    // Initialize App
    init() {
        this.updateLastUpdated();
        this.bindEvents();
        this.showLoginModal();
        this.setupPWAPrompt();
        
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
            // In a real implementation, this would be loaded from premium-users.json
            // For now, we'll use localStorage with fallback data
            const storedData = localStorage.getItem('premiumUsers');
            if (storedData) {
                return JSON.parse(storedData);
            }
            
            // Default premium users for testing
            const defaultPremiumUsers = {
                "premiumUsers": [
                    {
                        "name": "Anas Lila",
                        "email": "anas.lila@example.com",
                        "password": "admin123"
                    },
                    {
                        "name": "Admin User",
                        "email": "admin@unibills.com",
                        "password": "admin123"
                    },
                    {
                        "name": "Demo Premium",
                        "email": "demo.premium@gmail.com",
                        "password": "demo123"
                    }
                ]
            };
            
            localStorage.setItem('premiumUsers', JSON.stringify(defaultPremiumUsers));
            return defaultPremiumUsers;
        } catch (error) {
            console.error('Failed to load premium users:', error);
            return { premiumUsers: [] };
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

        // Currency formatting on input
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('currency-input')) {
                this.formatCurrencyInput(e.target);
            }
        });

        // Change password link in login
        const changePasswordLink = document.getElementById('change-password-link');
        if (changePasswordLink) {
            changePasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectToChangePassword('login');
            });
        }

        // Change password button in settings
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.redirectToChangePassword('settings');
            });
        }

        // Support button
        const supportBtn = document.getElementById('support-btn');
        if (supportBtn) {
            supportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectToSupport();
            });
        }
    }

    // Handle Login with enhanced validation
    handleLogin() {
        const name = document.getElementById('login-name').value.trim();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value.trim();

        if (!name || !email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        this.setLoginLoading(true);

        // Simulate loading delay for better UX
        setTimeout(() => {
            this.processLogin(name, email, password);
        }, 1000);
    }

    // Process Login Logic
    processLogin(name, email, password) {
        // Check if user exists in premium users
        const premiumUser = this.premiumUsers.premiumUsers.find(user => 
            user.email.toLowerCase() === email && user.password === password
        );

        if (premiumUser) {
            // Premium user login
            this.currentUser = email;
            this.currentUserName = premiumUser.name;
            this.isPremium = true;
            this.loginSuccess('premium');
        } else {
            // Check if it's a valid free user (any email with correct name)
            if (this.isValidUser(name, email, password)) {
                this.currentUser = email;
                this.currentUserName = name;
                this.isPremium = false;
                this.loginSuccess('free');
            } else {
                this.setLoginLoading(false);
                this.showMessage('Invalid credentials. Please check your name, email, and password.', 'error');
            }
        }
    }

    // Validate free user (simple validation)
    isValidUser(name, email, password) {
        // Basic validation for free users
        // In a real app, this would check against a user database
        return name.length >= 2 && this.isValidEmail(email) && password.length >= 6;
    }

    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Set Login Loading State
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

    // Login Success Handler
    loginSuccess(userType) {
        this.setLoginLoading(false);

        // Show celebration for premium users
        if (userType === 'premium') {
            this.showCelebration();
        }

        // Update UI
        this.updateUserInterface();

        // Hide login modal
        setTimeout(() => {
            document.getElementById('login-modal').classList.remove('show');
            document.getElementById('app-container').style.display = 'block';
            
            // Load user data and setup
            this.loadUserData();
            this.setupInvoiceForms();
            this.showUserLimitations();
            
            this.showMessage(`Welcome ${this.currentUserName}! ${this.isPremium ? '🎉 Premium access granted!' : 'You have free access.'}`, 'success');
        }, userType === 'premium' ? 2000 : 500);
    }

    // Update User Interface
    updateUserInterface() {
        // Update top bar
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

        // Update status cards
        if (this.isPremium) {
            document.getElementById('premium-info').style.display = 'flex';
            document.getElementById('free-info').style.display = 'none';
        } else {
            document.getElementById('premium-info').style.display = 'none';
            document.getElementById('free-info').style.display = 'flex';
            
            // Setup WhatsApp link for premium purchase
            const whatsappBtn = document.getElementById('buy-premium-btn');
            if (whatsappBtn) {
                const message = `I want to buy UniBills premium. Name: ${this.currentUserName}, Email: ${this.currentUser}, User Type: Free User, Request: BUY PREMIUM`;
                whatsappBtn.href = `https://wa.me/918879706046?text=${encodeURIComponent(message)}`;
            }
        }

        // Update settings
        this.updateSettingsInfo();
    }

    // Update Settings Information
    updateSettingsInfo() {
        const settingsName = document.getElementById('settings-user-name');
        const settingsEmail = document.getElementById('settings-user-email');
        const settingsType = document.getElementById('settings-user-type');

        if (settingsName) settingsName.textContent = this.currentUserName || '-';
        if (settingsEmail) settingsEmail.textContent = this.currentUser || '-';
        if (settingsType) settingsType.textContent = this.isPremium ? 'Premium Account' : 'Free Account';
    }

    // Show Celebration Effect
    showCelebration() {
        const container = document.getElementById('celebration-container');
        if (!container) return;

        // Create confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            container.appendChild(confetti);
        }

        // Clean up after animation
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }

    // Handle Logout
    handleLogout() {
        this.currentUser = null;
        this.currentUserName = null;
        this.isPremium = false;
        
        // Hide main app
        document.getElementById('app-container').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';

        // Show login modal
        document.getElementById('login-modal').classList.add('show');

        // Reset forms
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

    // Switch Tabs with Enhanced Logic
    switchTab(tabName) {
        // Premium check for restricted tabs
        if (!this.isPremium && ['professional', 'realestate', 'more'].includes(tabName)) {
            this.showUpgradePrompt(tabName);
            return;
        }

        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    // Setup Invoice Forms
    setupInvoiceForms() {
        this.createPOSForm();
        if (this.isPremium) {
            this.createProfessionalForm();
            this.createRealEstateForm();
            this.createMoreForms();
        }
    }

    // Create POS Invoice Form
    createPOSForm() {
        const posTab = document.getElementById('pos-tab');
        if (!posTab) return;

        const formHTML = `
            <div class="content-header">
                <h2>Point of Sale Invoice</h2>
                <p>Quick and easy invoice generation for retail transactions</p>
            </div>
            
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
                        <label>Customer Name</label>
                        <div class="searchable-dropdown">
                            <input type="text" class="dropdown-input" id="pos-customer" placeholder="Search or add customer...">
                            <div class="dropdown-list" id="pos-customer-list"></div>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Mobile Number</label>
                        <input type="tel" id="pos-mobile" placeholder="Customer mobile number">
                    </div>
                </div>

                <div class="items-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>Items</h3>
                        <button type="button" class="add-item-btn" onclick="app.addItemRow('pos')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                            Add Item
                        </button>
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
                    <button type="button" class="action-btn preview-btn" onclick="app.previewInvoice('pos')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        Preview
                    </button>
                    <button type="button" class="action-btn save-btn" onclick="app.saveInvoice('pos')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                        </svg>
                        Save
                    </button>
                    <button type="button" class="action-btn print-btn" onclick="app.printInvoice('pos')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                        </svg>
                        Print
                    </button>
                </div>
            </form>
        `;

        posTab.innerHTML = formHTML;
        this.addItemRow('pos');
        this.setupCustomerDropdown('pos');
    }

    // Create Professional Invoice Form
    createProfessionalForm() {
        const profTab = document.getElementById('professional-tab');
        if (!profTab) return;

        const formHTML = `
            <div class="content-header">
                <h2>Professional Invoice</h2>
                <p>GST compliant invoices for business transactions</p>
            </div>
            
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
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>Items/Services</h3>
                        <button type="button" class="add-item-btn" onclick="app.addItemRow('professional')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                            Add Item
                        </button>
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

        profTab.innerHTML = formHTML;
        this.addItemRow('professional');
        this.setupCustomerDropdown('professional');
    }

    // Create Real Estate Form
    createRealEstateForm() {
        const realEstateTab = document.getElementById('realestate-tab');
        if (!realEstateTab) return;

        const formHTML = `
            <div class="content-header">
                <h2>Real Estate Invoice</h2>
                <p>Comprehensive cost sheets for property transactions</p>
            </div>
            
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
                            <option value="Apartment">Apartment</option>
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
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>Cost Breakdown</h3>
                        <button type="button" class="add-item-btn" onclick="app.addItemRow('realestate')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                            Add Cost Item
                        </button>
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

        realEstateTab.innerHTML = formHTML;
        this.addItemRow('realestate');
        this.setupCustomerDropdown('realestate');
    }

    // Create More Forms
    createMoreForms() {
        const moreTab = document.getElementById('more-tab');
        if (!moreTab) return;

        const formHTML = `
            <div class="content-header">
                <h2>Additional Features</h2>
                <p>Extended invoice types and advanced functionality</p>
            </div>
            
            <div class="invoice-types-grid">
                <div class="invoice-type-card setting-card" onclick="app.createQuotationForm()">
                    <div class="setting-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                        </svg>
                    </div>
                    <div class="setting-content">
                        <h3>Quotation</h3>
                        <p>Create professional quotations for your clients with detailed pricing</p>
                    </div>
                </div>
                
                <div class="invoice-type-card setting-card" onclick="app.createEstimateForm()">
                    <div class="setting-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                    </div>
                    <div class="setting-content">
                        <h3>Estimate</h3>
                        <p>Generate detailed project estimates with timeline and costs</p>
                    </div>
                </div>
                
                <div class="invoice-type-card setting-card" onclick="app.createReceiptForm()">
                    <div class="setting-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z"/>
                        </svg>
                    </div>
                    <div class="setting-content">
                        <h3>Receipt</h3>
                        <p>Issue payment receipts and acknowledgments for transactions</p>
                    </div>
                </div>
                
                <div class="invoice-type-card setting-card" onclick="app.createTaxInvoiceForm()">
                    <div class="setting-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                        </svg>
                    </div>
                    <div class="setting-content">
                        <h3>Tax Invoice</h3>
                        <p>Comprehensive tax invoices with full GST compliance</p>
                    </div>
                </div>
            </div>
            <div id="more-form-container"></div>
        `;

        moreTab.innerHTML = formHTML;
    }

    // Add Item Row with Enhanced Logic
    addItemRow(formType) {
        const maxItems = this.isPremium ? 50 : 3;
        
        let tbody;
        if (formType === 'pos') {
            tbody = document.getElementById('pos-items-body');
        } else if (formType === 'professional') {
            tbody = document.getElementById('prof-items-body');
        } else if (formType === 'realestate') {
            tbody = document.getElementById('re-items-body');
        }
        
        if (!tbody) return;

        const currentRows = tbody.children.length;
        if (currentRows >= maxItems) {
            const message = this.isPremium 
                ? `Maximum ${maxItems} items allowed.`
                : `Free users can add only ${maxItems} items. Upgrade to Premium for unlimited items.`;
            this.showMessage(message, 'error');
            return;
        }

        const row = document.createElement('tr');
        
        if (formType === 'pos') {
            row.innerHTML = `
                <td>
                    <div class="searchable-dropdown">
                        <input type="text" class="dropdown-input product-input" placeholder="Search product..." autocomplete="off">
                        <div class="dropdown-list"></div>
                    </div>
                </td>
                <td><input type="number" class="qty-input" value="1" min="1" step="1"></td>
                <td><input type="text" class="currency-input rate-input" placeholder="0.00" autocomplete="off"></td>
                <td><span class="amount-display">₹0.00</span></td>
                <td><button type="button" class="remove-item-btn" onclick="app.removeItemRow(this)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Remove
                </button></td>
            `;
        } else if (formType === 'professional') {
            row.innerHTML = `
                <td>
                    <div class="searchable-dropdown">
                        <input type="text" class="dropdown-input product-input" placeholder="Description..." autocomplete="off">
                        <div class="dropdown-list"></div>
                    </div>
                </td>
                <td><input type="text" class="hsn-input" placeholder="HSN/SAC" autocomplete="off"></td>
                <td><input type="number" class="qty-input" value="1" min="1" step="1"></td>
                <td><input type="text" class="currency-input rate-input" placeholder="0.00" autocomplete="off"></td>
                <td><span class="amount-display">₹0.00</span></td>
                <td><button type="button" class="remove-item-btn" onclick="app.removeItemRow(this)">Remove</button></td>
            `;
        } else if (formType === 'realestate') {
            row.innerHTML = `
                <td><input type="text" class="desc-input" placeholder="Cost description..." autocomplete="off"></td>
                <td><input type="text" class="unit-input" placeholder="Sq.ft/Unit" autocomplete="off"></td>
                <td><input type="text" class="currency-input rate-input" placeholder="0.00" autocomplete="off"></td>
                <td><span class="amount-display">₹0.00</span></td>
                <td><button type="button" class="remove-item-btn" onclick="app.removeItemRow(this)">Remove</button></td>
            `;
        }

        tbody.appendChild(row);
        this.bindItemRowEvents(row, formType);
        
        // Setup product dropdown for searchable inputs
        const productInput = row.querySelector('.product-input');
        if (productInput) {
            this.setupProductDropdown(productInput, formType);
        }
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
                
                input.addEventListener('blur', () => {
                    if (input.classList.contains('currency-input')) {
                        this.formatCurrencyInput(input);
                    }
                });
            }
        });
    }

    // Calculate Row Amount
    calculateRowAmount(row, formType) {
        const qtyInput = row.querySelector('.qty-input');
        const rateInput = row.querySelector('.rate-input');
        const unitInput = row.querySelector('.unit-input');
        const amountDisplay = row.querySelector('.amount-display');

        if (!rateInput || !amountDisplay) return;

        const qty = parseFloat(qtyInput?.value) || 1;
        const rate = this.parseCurrency(rateInput.value) || 0;
        const unit = parseFloat(unitInput?.value) || 1;

        let amount;
        if (formType === 'realestate') {
            amount = unit * rate;
        } else {
            amount = qty * rate;
        }

        amountDisplay.textContent = this.formatCurrency(amount);
    }

    // Calculate Totals with Enhanced Logic
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

        const subtotalElement = document.getElementById(`${prefix}-subtotal`);
        if (subtotalElement) {
            subtotalElement.textContent = this.formatCurrency(subtotal);
        }

        let total = subtotal;

        if (formType === 'pos') {
            const tax = subtotal * 0.18; // 18% GST
            const taxElement = document.getElementById(`${prefix}-tax`);
            if (taxElement) {
                taxElement.textContent = this.formatCurrency(tax);
            }
            total = subtotal + tax;
        } else if (formType === 'professional') {
            const cgst = subtotal * 0.09; // 9% CGST
            const sgst = subtotal * 0.09; // 9% SGST
            const cgstElement = document.getElementById(`${prefix}-cgst`);
            const sgstElement = document.getElementById(`${prefix}-sgst`);
            if (cgstElement) cgstElement.textContent = this.formatCurrency(cgst);
            if (sgstElement) sgstElement.textContent = this.formatCurrency(sgst);
            total = subtotal + cgst + sgst;
        } else if (formType === 'realestate') {
            const registration = subtotal * 0.02; // 2% Registration
            const stamp = subtotal * 0.05; // 5% Stamp Duty
            const regElement = document.getElementById(`${prefix}-registration`);
            const stampElement = document.getElementById(`${prefix}-stamp`);
            if (regElement) regElement.textContent = this.formatCurrency(registration);
            if (stampElement) stampElement.textContent = this.formatCurrency(stamp);
            total = subtotal + registration + stamp;
        }

        const totalElement = document.getElementById(`${prefix}-total`);
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    }

    // Setup Customer Dropdown with Enhanced Functionality
    setupCustomerDropdown(formType) {
        const prefix = formType === 'professional' ? 'prof' : 
                      formType === 'realestate' ? 're' : 'pos';
        
        const input = document.getElementById(`${prefix}-customer`);
        const dropdown = document.getElementById(`${prefix}-customer-list`);
        
        if (!input || !dropdown) return;

        let debounceTimer;

        input.addEventListener('focus', () => {
            this.showCustomerDropdown(input, dropdown);
        });

        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.filterCustomerDropdown(e.target.value, dropdown);
            }, 300);
        });

        // Close dropdown when clicking outside
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
            item.innerHTML = `
                <strong>${customer.name}</strong>
                ${customer.mobile ? `<br><small>${customer.mobile}</small>` : ''}
            `;
            
            item.addEventListener('click', () => {
                input.value = customer.name;
                
                // Auto-fill mobile if available
                const mobileInput = input.closest('.form-row')?.querySelector('input[type="tel"]');
                if (mobileInput && customer.mobile) {
                    mobileInput.value = customer.mobile;
                }
                
                dropdown.classList.remove('show');
            });
            dropdown.appendChild(item);
        });

        // Add "Add New Customer" option
        const addNewItem = document.createElement('div');
        addNewItem.className = 'dropdown-item add-new-item';
        addNewItem.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add New Customer
        `;
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
        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'block' : 'none';
        });
        
        dropdown.classList.add('show');
    }

    // Setup Product Dropdown with Enhanced Search
    setupProductDropdown(input, formType) {
        if (!input) return;

        const dropdown = input.nextElementSibling;
        let debounceTimer;
        
        input.addEventListener('focus', () => {
            this.showProductDropdown(input, dropdown, formType);
        });

        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.filterProductDropdown(e.target.value, dropdown, formType);
            }, 300);
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
            item.innerHTML = `
                <strong>${product.name}</strong>
                <br><small>₹${product.price} ${product.description ? '- ' + product.description : ''}</small>
            `;
            
            item.addEventListener('click', () => {
                input.value = product.name;
                const row = input.closest('tr');
                const rateInput = row.querySelector('.rate-input');
                
                if (rateInput) {
                    rateInput.value = this.formatCurrency(product.price);
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
        addNewItem.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add New Product
        `;
        addNewItem.addEventListener('click', () => {
            this.showAddProductModal(input, formType);
            dropdown.classList.remove('show');
        });
        dropdown.appendChild(addNewItem);

        dropdown.classList.add('show');
    }

    // Filter Product Dropdown
    filterProductDropdown(searchTerm, dropdown, formType) {
        const items = dropdown.querySelectorAll('.dropdown-item:not(.add-new-item)');
        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'block' : 'none';
        });
        
        dropdown.classList.add('show');
    }

    // Format Currency Input (Enhanced Indian Format)
    formatCurrencyInput(input) {
        let value = input.value.replace(/[^\d.]/g, '');
        
        // Handle decimal places
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts[1];
        }
        
        if (value && !isNaN(parseFloat(value))) {
            const number = parseFloat(value);
            // Don't format while typing, only on blur
            if (document.activeElement !== input) {
                input.value = this.formatCurrency(number);
            }
        }
    }

    // Enhanced Currency Formatting (Indian Format: #,##,##,##,##,###)
    formatCurrency(amount) {
        if (!amount || isNaN(amount)) return '₹0.00';
        
        const num = parseFloat(amount);
        
        // Indian number formatting
        const formatted = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
        
        return formatted;
    }

    // Parse Currency
    parseCurrency(currencyString) {
        if (!currencyString) return 0;
        const cleaned = currencyString.replace(/[^\d.-]/g, '');
        return parseFloat(cleaned) || 0;
    }

    // Enhanced Indian Date Format (DD MMM, YYYY)
    formatIndianDate(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month}, ${year}`;
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
        const day = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000);
        return `${prefix}-${year}${month}${day}-${random}`;
    }

    // Redirect to Change Password
    redirectToChangePassword(source) {
        const userInfo = source === 'login' ? '' : `Name: ${this.currentUserName}, Email: ${this.currentUser}, User Type: ${this.isPremium ? 'Premium' : 'Free'}, Request: CHANGE PASSWORD`;
        const message = userInfo || 'I want to change my password';
        const whatsappUrl = `https://wa.me/918879706046?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    // Redirect to Support
    redirectToSupport() {
        const message = `Hello! I need support for UniBills. Name: ${this.currentUserName}, Email: ${this.currentUser}, User Type: ${this.isPremium ? 'Premium' : 'Free'}`;
        const whatsappUrl = `https://wa.me/918879706046?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    // Get Form Type from Row
    getFormTypeFromRow(row) {
        const table = row.closest('table');
        if (!table) return 'pos';
        
        if (table.id.includes('prof')) return 'professional';
        if (table.id.includes('re')) return 'realestate';
        return 'pos';
    }

    // Show User Limitations
    showUserLimitations() {
        if (!this.isPremium) {
            const posTab = document.getElementById('pos-tab');
            const existingPrompt = posTab.querySelector('.upgrade-prompt');
            
            if (!existingPrompt) {
                const limitationBanner = document.createElement('div');
                limitationBanner.className = 'upgrade-prompt';
                limitationBanner.innerHTML = `
                    <h3>🔒 Free User Limitations</h3>
                    <p>• Only POS invoices available<br>• Maximum 3 items per invoice<br>• Limited customer database</p>
                    <a href="https://wa.me/918879706046?text=${encodeURIComponent(`I want to buy UniBills premium. Name: ${this.currentUserName}, Email: ${this.currentUser}, User Type: Free User, Request: BUY PREMIUM`)}" target="_blank" class="upgrade-link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        Upgrade to Premium - ₹599 Lifetime
                    </a>
                `;
                
                const contentHeader = posTab.querySelector('.content-header');
                if (contentHeader) {
                    contentHeader.after(limitationBanner);
                }
            }
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
            <div class="upgrade-prompt" style="height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="font-size: 64px; margin-bottom: 20px;">🔒</div>
                <h2>Premium Feature</h2>
                <h3>${featureName.charAt(0).toUpperCase() + featureName.slice(1)} Invoice</h3>
                <p>This feature is available for Premium users only.</p>
                <p>Upgrade now to unlock all features including:</p>
                <ul style="text-align: left; margin: 20px 0; line-height: 1.8;">
                    <li>✅ Unlimited invoice types</li>
                    <li>✅ Unlimited items per invoice</li>
                    <li>✅ Advanced customer & product database</li>
                    <li>✅ Professional templates</li>
                    <li>✅ Export & print options</li>
                    <li>✅ Priority support</li>
                </ul>
                <a href="https://wa.me/918879706046?text=${encodeURIComponent(`I want to buy UniBills premium. Name: ${this.currentUserName || 'User'}, Email: ${this.currentUser || 'user@example.com'}, User Type: Free User, Request: BUY PREMIUM`)}" target="_blank" class="upgrade-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Buy Premium - ₹599 Lifetime
                </a>
            </div>
        `;
    }

    // Save Invoice (Enhanced)
    saveInvoice(formType) {
        const invoiceData = this.collectInvoiceData(formType);
        if (!invoiceData) {
            this.showMessage('Please add items to save invoice', 'error');
            return;
        }

        invoiceData.id = Date.now();
        invoiceData.createdAt = new Date().toISOString();
        invoiceData.userId = this.currentUser;

        this.invoices.push(invoiceData);
        this.saveData('invoices', this.invoices);

        this.showMessage(`${formType.toUpperCase()} invoice saved successfully!`, 'success');
    }

    // Preview Invoice (Enhanced)
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

    // Print Invoice (Enhanced)
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

    // Collect Invoice Data (Enhanced)
    collectInvoiceData(formType) {
        const prefix = formType === 'professional' ? 'prof' : 
                      formType === 'realestate' ? 're' : 'pos';

        const data = {
            type: formType,
            invoiceNumber: document.getElementById(`${prefix}-invoice-no`)?.value || '',
            date: document.getElementById(`${prefix}-date`)?.value || '',
            customer: document.getElementById(`${prefix}-customer`)?.value || '',
            items: [],
            totals: {},
            userInfo: {
                name: this.currentUserName,
                email: this.currentUser,
                isPremium: this.isPremium
            }
        };

        // Collect additional fields for professional invoices
        if (formType === 'professional') {
            data.gst = document.getElementById('prof-gst')?.value || '';
            data.address = document.getElementById('prof-address')?.value || '';
        }

        // Collect additional fields for real estate invoices
        if (formType === 'realestate') {
            data.propertyType = document.getElementById('re-property-type')?.value || '';
            data.propertyAddress = document.getElementById('re-address')?.value || '';
        }

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

        if (formType === 'pos') {
            data.totals.tax = this.parseCurrency(document.getElementById(`${prefix}-tax`)?.textContent);
        } else if (formType === 'professional') {
            data.totals.cgst = this.parseCurrency(document.getElementById(`${prefix}-cgst`)?.textContent);
            data.totals.sgst = this.parseCurrency(document.getElementById(`${prefix}-sgst`)?.textContent);
        } else if (formType === 'realestate') {
            data.totals.registration = this.parseCurrency(document.getElementById(`${prefix}-registration`)?.textContent);
            data.totals.stamp = this.parseCurrency(document.getElementById(`${prefix}-stamp`)?.textContent);
        }

        return data.items.length > 0 ? data : null;
    }

    // Generate Enhanced Invoice HTML
    generateInvoiceHTML(data) {
        const currentDate = this.formatIndianDate(new Date()) + ' ' + this.formatIndianTime(new Date());
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>UniBills - ${data.invoiceNumber}</title>
                <meta charset="UTF-8">
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        color: #333;
                        line-height: 1.6;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 40px; 
                        border-bottom: 3px solid #667eea;
                        padding-bottom: 20px;
                    }
                    .header h1 { 
                        color: #667eea; 
                        font-size: 36px; 
                        margin: 0; 
                        font-weight: 800;
                    }
                    .header h2 { 
                        color: #764ba2; 
                        font-size: 24px; 
                        margin: 10px 0 0 0; 
                        font-weight: 600;
                    }
                    .invoice-info { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 30px; 
                    }
                    .invoice-details, .customer-details { 
                        flex: 1; 
                        padding: 20px;
                        background: #f8f9fa;
                        border-radius: 10px;
                        margin: 0 10px;
                    }
                    .invoice-details h3, .customer-details h3 { 
                        color: #667eea; 
                        margin-top: 0; 
                        font-size: 18px;
                        border-bottom: 2px solid #667eea;
                        padding-bottom: 10px;
                    }
                    .items-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 30px 0; 
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .items-table th { 
                        background: linear-gradient(135deg, #667eea, #764ba2); 
                        color: white; 
                        padding: 15px; 
                        text-align: left; 
                        font-weight: 600;
                        text-transform: uppercase;
                        font-size: 12px;
                        letter-spacing: 0.5px;
                    }
                    .items-table td { 
                        border: 1px solid #ddd; 
                        padding: 12px 15px; 
                        font-size: 14px;
                    }
                    .items-table tbody tr:nth-child(even) { 
                        background: #f8f9fa; 
                    }
                    .items-table tbody tr:hover { 
                        background: #e3f2fd; 
                    }
                    .totals { 
                        margin-left: auto; 
                        width: 300px; 
                        margin-top: 30px; 
                        border: 2px solid #667eea;
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    .total-row { 
                        display: flex; 
                        justify-content: space-between; 
                        padding: 12px 20px;
                        border-bottom: 1px solid #eee;
                    }
                    .total-row:last-child { 
                        border-bottom: none; 
                    }
                    .grand-total { 
                        background: linear-gradient(135deg, #667eea, #764ba2); 
                        color: white; 
                        font-weight: 800; 
                        font-size: 18px; 
                    }
                    .footer { 
                        margin-top: 60px; 
                        text-align: center; 
                        color: #666; 
                        border-top: 2px solid #eee;
                        padding-top: 20px;
                        font-size: 14px;
                    }
                    .footer .brand { 
                        color: #667eea; 
                        font-weight: 600; 
                    }
                    .version-info {
                        background: #f0f0f0;
                        padding: 10px;
                        border-radius: 5px;
                        margin-top: 10px;
                        font-size: 12px;
                    }
                    @media print {
                        body { margin: 0; padding: 15px; }
                        .items-table { box-shadow: none; }
                        .invoice-details, .customer-details { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>UniBills</h1>
                    <h2>${data.type.toUpperCase()} ${data.type === 'realestate' ? 'COST SHEET' : 'INVOICE'}</h2>
                </div>
                
                <div class="invoice-info">
                    <div class="invoice-details">
                        <h3>Invoice Details</h3>
                        <p><strong>${data.type === 'realestate' ? 'Property ID:' : 'Invoice No:'}</strong> ${data.invoiceNumber}</p>
                        <p><strong>Date:</strong> ${data.date}</p>
                        <p><strong>Generated:</strong> ${currentDate}</p>
                        ${data.type === 'realestate' ? `<p><strong>Property Type:</strong> ${data.propertyType || 'N/A'}</p>` : ''}
                    </div>
                    <div class="customer-details">
                        <h3>${data.type === 'realestate' ? 'Client Information' : 'Customer Information'}</h3>
                        <p><strong>Name:</strong> ${data.customer}</p>
                        ${data.gst ? `<p><strong>GST Number:</strong> ${data.gst}</p>` : ''}
                        ${data.address ? `<p><strong>Address:</strong> ${data.address}</p>` : ''}
                        ${data.propertyAddress ? `<p><strong>Property Address:</strong> ${data.propertyAddress}</p>` : ''}
                    </div>
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
                    <div class="total-row">
                        <span>${data.type === 'realestate' ? 'Base Cost:' : 'Subtotal:'}</span>
                        <span><strong>${this.formatCurrency(data.totals.subtotal)}</strong></span>
                    </div>
                    ${this.generateTotalRows(data)}
                    <div class="total-row grand-total">
                        <span>TOTAL:</span>
                        <span><strong>${this.formatCurrency(data.totals.total)}</strong></span>
                    </div>
                </div>

                <div class="footer">
                    <div class="brand">Generated by UniBills v1.0 Elite</div>
                    <p>Universal Invoice Management System</p>
                    <div class="version-info">
                        <strong>Developer:</strong> Anas Lila | <strong>Published By:</strong> AL Software<br>
                        <strong>User:</strong> ${data.userInfo.name} (${data.userInfo.isPremium ? 'Premium' : 'Free'} Account)<br>
                        <strong>Support:</strong> +91 8879706046
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Generate Table Headers
    generateTableHeaders(type) {
        if (type === 'pos') {
            return '<th>Product</th><th>Qty</th><th>Rate (₹)</th><th>Amount (₹)</th>';
        } else if (type === 'professional') {
            return '<th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Rate (₹)</th><th>Amount (₹)</th>';
        } else if (type === 'realestate') {
            return '<th>Description</th><th>Area/Unit</th><th>Rate (₹)</th><th>Amount (₹)</th>';
        }
    }

    // Generate Table Row
    generateTableRow(item, type) {
        if (type === 'pos') {
            return `<tr><td>${item.product}</td><td>${item.quantity}</td><td>${this.formatCurrency(item.rate)}</td><td><strong>${this.formatCurrency(item.amount)}</strong></td></tr>`;
        } else if (type === 'professional') {
            return `<tr><td>${item.description}</td><td>${item.hsn}</td><td>${item.quantity}</td><td>${this.formatCurrency(item.rate)}</td><td><strong>${this.formatCurrency(item.amount)}</strong></td></tr>`;
        } else if (type === 'realestate') {
            return `<tr><td>${item.description}</td><td>${item.unit}</td><td>${this.formatCurrency(item.rate)}</td><td><strong>${this.formatCurrency(item.amount)}</strong></td></tr>`;
        }
    }

    // Generate Total Rows
    generateTotalRows(data) {
        if (data.type === 'pos') {
            return `<div class="total-row"><span>Tax (18% GST):</span><span>${this.formatCurrency(data.totals.tax)}</span></div>`;
        } else if (data.type === 'professional') {
            return `
                <div class="total-row"><span>CGST (9%):</span><span>${this.formatCurrency(data.totals.cgst)}</span></div>
                <div class="total-row"><span>SGST (9%):</span><span>${this.formatCurrency(data.totals.sgst)}</span></div>
            `;
        } else if (data.type === 'realestate') {
            return `
                <div class="total-row"><span>Registration (2%):</span><span>${this.formatCurrency(data.totals.registration)}</span></div>
                <div class="total-row"><span>Stamp Duty (5%):</span><span>${this.formatCurrency(data.totals.stamp)}</span></div>
            `;
        }
        return '';
    }

    // Show Message with Enhanced Styling
    showMessage(text, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const message = document.createElement('div');
        message.className = `message ${type}`;
        
        const icon = type === 'success' ? 
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' :
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
        
        message.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                ${icon}
                <span>${text}</span>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 4000);
    }

    // Setup PWA Prompt (Enhanced)
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
        installBanner.className = 'install-banner message success';
        installBanner.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 20px;
            right: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1001;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        `;
        
        installBanner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                <div>
                    <strong>Install UniBills</strong>
                    <br><small>Get the full app experience</small>
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="install-btn primary-btn" style="padding: 8px 16px; font-size: 14px;">Install</button>
                <button class="close-btn" style="background: rgba(255,255,255,0.3); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer;">×</button>
            </div>
        `;
        
        document.body.appendChild(installBanner);
        
        installBanner.querySelector('.install-btn').addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    installBanner.remove();
                    this.showMessage('UniBills installed successfully! 🎉', 'success');
                }
            });
        });
        
        installBanner.querySelector('.close-btn').addEventListener('click', () => {
            installBanner.remove();
        });

        // Auto hide after 10 seconds
        setTimeout(() => {
            if (installBanner.parentNode) {
                installBanner.remove();
            }
        }, 10000);
    }

    // Show iOS Add to Home Prompt
    showIOSPrompt() {
        const iosPrompt = document.createElement('div');
        iosPrompt.className = 'ios-prompt message success';
        iosPrompt.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 20px;
            right: 20px;
            text-align: center;
            z-index: 1001;
            padding: 25px;
            border-radius: 16px;
        `;
        
        iosPrompt.innerHTML = `
            <div style="margin-bottom: 15px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
                </svg>
            </div>
            <h3 style="margin: 10px 0;">Add to Home Screen</h3>
            <p>Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> to install UniBills</p>
            <button class="close-btn primary-btn" style="margin-top: 15px; padding: 10px 20px;">Got it!</button>
        `;
        
        document.body.appendChild(iosPrompt);
        
        iosPrompt.querySelector('.close-btn').addEventListener('click', () => {
            iosPrompt.remove();
        });

        // Auto hide after 8 seconds
        setTimeout(() => {
            if (iosPrompt.parentNode) {
                iosPrompt.remove();
            }
        }, 8000);
    }

    // Load User Data
    loadUserData() {
        const userData = this.loadData(`user_${this.currentUser}`) || {};
        if (userData.customers) this.customers = userData.customers;
        if (userData.products) this.products = userData.products;
        if (userData.invoices) this.invoices = userData.invoices;
    }

    // Save Data to localStorage
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            // Also save user-specific data
            if (this.currentUser) {
                const userData = {
                    customers: this.customers,
                    products: this.products,
                    invoices: this.invoices
                };
                localStorage.setItem(`user_${this.currentUser}`, JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Failed to save data:', error);
            this.showMessage('Failed to save data. Storage may be full.', 'error');
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

    // Create additional form methods (placeholders)
    createQuotationForm() {
        this.showMessage('Quotation feature coming soon!', 'success');
    }

    createEstimateForm() {
        this.showMessage('Estimate feature coming soon!', 'success');
    }

    createReceiptForm() {
        this.showMessage('Receipt feature coming soon!', 'success');
    }

    createTaxInvoiceForm() {
        this.showMessage('Tax Invoice feature coming soon!', 'success');
    }

    // Show Add Customer Modal (placeholder)
    showAddCustomerModal(inputRef) {
        // Implementation would create and show a modal for adding customers
        this.showMessage('Customer management feature coming soon!', 'success');
    }

    // Show Add Product Modal (placeholder)
    showAddProductModal(inputRef, formType) {
        // Implementation would create and show a modal for adding products
        this.showMessage('Product management feature coming soon!', 'success');
    }
}

// Initialize App
const app = new UniBillsApp();

// Make app globally available
window.app = app;

// Additional initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('UniBills v1.0 Elite loaded successfully');
});

// Handle app visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && app.currentUser) {
        app.updateLastUpdated();
    }
});

// Handle window resize for responsive features
window.addEventListener('resize', () => {
    // Handle responsive layout changes if needed
});

console.log('🎉 UniBills v1.0 Elite - Complete JavaScript loaded successfully!');
console.log('Developer: Anas Lila | Published By: AL Software');
