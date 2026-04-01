// script.js

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'savingsVaultState';
    const defaultState = {
        totalSaved: 0,
        goalAmount: 10000,
        transactions: [],
        milestones: [
            { id: 1, amount: 100, title: "First $100", icon: "🌱", unlocked: false },
            { id: 2, amount: 500, title: "$500 Saved", icon: "🚀", unlocked: false },
            { id: 3, amount: 1000, title: "$1K Club", icon: "🌟", unlocked: false },
            { id: 4, amount: 5000, title: "Halfway", icon: "🎯", unlocked: false },
            { id: 5, amount: 10000, title: "Goal Met", icon: "🏆", unlocked: false },
        ]
    };

    // Load from local storage or use default
    const savedState = localStorage.getItem(STORAGE_KEY);
    const state = savedState ? JSON.parse(savedState) : defaultState;

    // Helper to persist state
    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // DOM Elements
    const totalSavedEl = document.getElementById('total-saved');
    const goalTextEl = document.getElementById('goal-text');
    const progressBarEl = document.getElementById('progress-bar');
    const depositAmountInput = document.getElementById('deposit-amount');
    const depositBtn = document.getElementById('deposit-btn');
    const transactionListEl = document.getElementById('transaction-list');
    const badgesGridEl = document.getElementById('badges-grid');
    const connectWalletBtn = document.getElementById('connect-wallet-btn');

    // Initialization
    function init() {
        renderBadges();
        updateUI();
        renderTransactions();

        // Event Listeners
        depositBtn.addEventListener('click', handleDeposit);
        connectWalletBtn.addEventListener('click', () => {
            const isConnected = connectWalletBtn.classList.contains('connected');
            if (!isConnected) {
                connectWalletBtn.textContent = "0x4F...9A2C";
                connectWalletBtn.classList.add('connected');
                connectWalletBtn.classList.replace('btn-outline', 'btn-primary');
            } else {
                connectWalletBtn.textContent = "Connect Wallet";
                connectWalletBtn.classList.remove('connected');
                connectWalletBtn.classList.replace('btn-primary', 'btn-outline');
            }
        });
        
        depositAmountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleDeposit();
            }
        });
    }

    // Handles a new deposit
    function handleDeposit() {
        const amountStr = depositAmountInput.value;
        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        // Add to state
        state.totalSaved += amount;
        
        // Add transaction to history
        const tx = {
            id: Date.now(),
            amount: amount,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
        state.transactions.unshift(tx); // add to top
        
        // Check for newly unlocked milestones
        state.milestones.forEach(milestone => {
            if (!milestone.unlocked && state.totalSaved >= milestone.amount) {
                milestone.unlocked = true;
                triggerConfetti();
            }
        });

        // Clear input
        depositAmountInput.value = '';

        // Update UI components
        updateUI();
        renderTransactions();
        renderBadges(); // Refresh badges to show unlocked ones
        
        // Save to localStorage
        saveState();
    }

    // Updates main overview UI
    function updateUI() {
        // Format numbers with commas
        const formatNumber = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        
        totalSavedEl.textContent = formatNumber(state.totalSaved);
        goalTextEl.textContent = `$${formatNumber(state.totalSaved)} / $${formatNumber(state.goalAmount)}`;
        
        // Calculate progress percentage
        let progressPercent = (state.totalSaved / state.goalAmount) * 100;
        if (progressPercent > 100) progressPercent = 100;
        progressBarEl.style.width = `${progressPercent}%`;
    }

    // Renders the transaction history list
    function renderTransactions() {
        if (state.transactions.length === 0) return;
        
        transactionListEl.innerHTML = '';
        state.transactions.forEach(tx => {
            const li = document.createElement('li');
            li.className = 'transaction-item';
            li.innerHTML = `
                <div class="tx-info">
                    <span class="tx-title">Deposit</span>
                    <span class="tx-date">${tx.date}</span>
                </div>
                <div class="tx-amount">+$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            `;
            transactionListEl.appendChild(li);
        });
    }

    // Renders the milestone badges grid
    function renderBadges() {
        badgesGridEl.innerHTML = '';
        state.milestones.forEach(badge => {
            const div = document.createElement('div');
            div.className = `badge ${badge.unlocked ? 'unlocked' : ''}`;
            div.innerHTML = `
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-title">${badge.title}</div>
            `;
            badgesGridEl.appendChild(div);
        });
    }

    // Quick mockup of a confetti effect using vanilla JS
    function triggerConfetti() {
        for (let i = 0; i < 30; i++) {
            createConfettiParticle();
        }
    }

    function createConfettiParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '10px';
        particle.style.height = '10px';
        
        const colors = ['#00F0FF', '#7000FF', '#00E676', '#FFFFFF'];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = '-10px';
        particle.style.borderRadius = '50%';
        particle.style.zIndex = '9999';
        particle.style.pointerEvents = 'none';
        
        document.body.appendChild(particle);

        const duration = Math.random() * 3 + 2;
        
        particle.animate([
            { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 },
            { transform: `translate3d(${Math.random() * 200 - 100}px, 100vh, 0) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(.37,0,.63,1)',
            fill: 'forwards'
        });

        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }

    init();
});
