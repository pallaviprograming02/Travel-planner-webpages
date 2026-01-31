// Data Storage
let tripData = {
    name: '',
    startDate: '',
    endDate: '',
    days: [],
    budget: {
        total: 0,
        expenses: []
    },
    packing: [],
    notes: ''
};

let selectedDay = null;

// Load data from localStorage on page load
window.onload = function() {
    loadData();
    renderDays();
    updateBudget();
    renderPackingList();
    loadNotes();
};

// Save data to localStorage
function saveData() {
    tripData.name = document.getElementById('tripName').value;
    tripData.startDate = document.getElementById('startDate').value;
    tripData.endDate = document.getElementById('endDate').value;
    tripData.notes = document.getElementById('tripNotes').value;
    localStorage.setItem('tripWiseData', JSON.stringify(tripData));
}

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('tripWiseData');
    if (saved) {
        tripData = JSON.parse(saved);
        document.getElementById('tripName').value = tripData.name || '';
        document.getElementById('startDate').value = tripData.startDate || '';
        document.getElementById('endDate').value = tripData.endDate || '';
        document.getElementById('totalBudget').value = tripData.budget.total || '';
        document.getElementById('tripNotes').value = tripData.notes || '';
    }
}

// Tab Switching
function switchTab(tab) {
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Remove active class from all tabs
    document.querySelectorAll('[id^="tab-"]').forEach(tabBtn => {
        tabBtn.classList.remove('tab-active');
        tabBtn.classList.add('hover:bg-gray-100');
    });

    // Show selected content and activate tab
    document.getElementById('content-' + tab).classList.remove('hidden');
    const activeTab = document.getElementById('tab-' + tab);
    activeTab.classList.add('tab-active');
    activeTab.classList.remove('hover:bg-gray-100');
}

// Day Management
function addDay() {
    const dayNumber = tripData.days.length + 1;
    tripData.days.push({
        number: dayNumber,
        title: `Day ${dayNumber}`,
        activities: []
    });
    saveData();
    renderDays();
}

function renderDays() {
    const daysList = document.getElementById('daysList');
    if (tripData.days.length === 0) {
        daysList.innerHTML = '<p class="text-gray-400 text-center py-4">No days added yet</p>';
        return;
    }

    daysList.innerHTML = tripData.days.map((day, index) => `
        <div onclick="selectDay(${index})" 
             class="day-card p-4 bg-white border-2 ${selectedDay === index ? 'border-cyan-500' : 'border-gray-200'} rounded-lg">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-gray-800">${day.title}</h3>
                    <p class="text-sm text-gray-500">${day.activities.length} activities</p>
                </div>
                <button onclick="deleteDay(${index}, event)" 
                        class="text-red-500 hover:text-red-700 text-xl">×</button>
            </div>
        </div>
    `).join('');
}

function selectDay(index) {
    selectedDay = index;
    document.getElementById('noDay').classList.add('hidden');
    document.getElementById('dayContent').classList.remove('hidden');
    document.getElementById('selectedDayTitle').textContent = tripData.days[index].title;
    renderDays();
    renderActivities();
}

function deleteDay(index, event) {
    event.stopPropagation();
    if (confirm('Delete this day?')) {
        tripData.days.splice(index, 1);
        // Renumber remaining days
        tripData.days.forEach((day, i) => {
            day.number = i + 1;
            day.title = `Day ${i + 1}`;
        });
        if (selectedDay === index) {
            selectedDay = null;
            document.getElementById('dayContent').classList.add('hidden');
            document.getElementById('noDay').classList.remove('hidden');
        }
        saveData();
        renderDays();
    }
}

// Activity Management
function showAddActivity() {
    document.getElementById('addActivityForm').classList.remove('hidden');
}

function hideAddActivity() {
    document.getElementById('addActivityForm').classList.add('hidden');
    clearActivityForm();
}

function clearActivityForm() {
    document.getElementById('activityTime').value = '';
    document.getElementById('activityTitle').value = '';
    document.getElementById('activityLocation').value = '';
    document.getElementById('activityNotes').value = '';
}

function saveActivity() {
    const time = document.getElementById('activityTime').value;
    const title = document.getElementById('activityTitle').value;
    const location = document.getElementById('activityLocation').value;
    const notes = document.getElementById('activityNotes').value;

    if (!title) {
        alert('Please enter activity title');
        return;
    }

    tripData.days[selectedDay].activities.push({
        time, title, location, notes
    });

    saveData();
    renderActivities();
    hideAddActivity();
}

function renderActivities() {
    const day = tripData.days[selectedDay];
    const activitiesList = document.getElementById('activitiesList');
    const noActivities = document.getElementById('noActivities');

    if (day.activities.length === 0) {
        activitiesList.innerHTML = '';
        noActivities.classList.remove('hidden');
        return;
    }

    noActivities.classList.add('hidden');
    activitiesList.innerHTML = day.activities.map((activity, index) => `
        <div class="activity-item p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-3">
                        ${activity.time ? `<span class="text-cyan-600 font-semibold">🕐 ${activity.time}</span>` : ''}
                        <h3 class="font-bold text-gray-800">${activity.title}</h3>
                    </div>
                    ${activity.location ? `<p class="text-sm text-gray-600 mt-1">📍 ${activity.location}</p>` : ''}
                    ${activity.notes ? `<p class="text-sm text-gray-500 mt-2">${activity.notes}</p>` : ''}
                </div>
                <button onclick="deleteActivity(${index})" 
                        class="delete-btn text-red-500 hover:text-red-700 ml-2 text-xl">×</button>
            </div>
        </div>
    `).join('');
}

function deleteActivity(index) {
    if (confirm('Delete this activity?')) {
        tripData.days[selectedDay].activities.splice(index, 1);
        saveData();
        renderActivities();
        renderDays();
    }
}

// Budget Management
function updateBudget() {
    const total = parseFloat(document.getElementById('totalBudget').value) || 0;
    tripData.budget.total = total;
    
    const spent = tripData.budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = total - spent;
    const percentage = total > 0 ? (spent / total) * 100 : 0;

    document.getElementById('spentAmount').textContent = '₹' + spent.toFixed(2);
    document.getElementById('remainingAmount').textContent = '₹' + remaining.toFixed(2);
    document.getElementById('budgetProgress').style.width = Math.min(percentage, 100) + '%';
    
    if (percentage > 100) {
        document.getElementById('budgetProgress').classList.add('bg-red-600');
        document.getElementById('remainingAmount').classList.remove('text-green-600');
        document.getElementById('remainingAmount').classList.add('text-red-600');
    } else {
        document.getElementById('budgetProgress').classList.remove('bg-red-600');
        document.getElementById('remainingAmount').classList.add('text-green-600');
        document.getElementById('remainingAmount').classList.remove('text-red-600');
    }

    saveData();
}

function addExpense() {
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);

    if (!description || !amount) {
        alert('Please fill in all fields');
        return;
    }

    tripData.budget.expenses.push({
        category,
        description,
        amount,
        date: new Date().toLocaleDateString()
    });

    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';

    saveData();
    updateBudget();
    renderExpenses();
}

function renderExpenses() {
    const expensesList = document.getElementById('expensesList');
    
    if (tripData.budget.expenses.length === 0) {
        expensesList.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <p class="text-4xl mb-2">💸</p>
                <p>No expenses added yet</p>
            </div>
        `;
        return;
    }

    expensesList.innerHTML = tripData.budget.expenses.map((expense, index) => `
        <div class="p-4 bg-white border border-gray-200 rounded-lg">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">${expense.category.split(' ')[0]}</span>
                        <span class="font-semibold text-gray-800">${expense.description}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${expense.date}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-cyan-600">₹${expense.amount.toFixed(2)}</p>
                    <button onclick="deleteExpense(${index})" 
                            class="text-red-500 hover:text-red-700 text-sm mt-1">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function deleteExpense(index) {
    if (confirm('Delete this expense?')) {
        tripData.budget.expenses.splice(index, 1);
        saveData();
        updateBudget();
        renderExpenses();
    }
}

// Packing List
function addPackingItem() {
    const item = document.getElementById('packingItem').value.trim();
    if (!item) return;

    tripData.packing.push({
        item,
        packed: false
    });

    document.getElementById('packingItem').value = '';
    saveData();
    renderPackingList();
}

function togglePacked(index) {
    tripData.packing[index].packed = !tripData.packing[index].packed;
    saveData();
    renderPackingList();
}

function deletePackingItem(index) {
    tripData.packing.splice(index, 1);
    saveData();
    renderPackingList();
}

function renderPackingList() {
    const packingList = document.getElementById('packingList');
    
    if (tripData.packing.length === 0) {
        packingList.innerHTML = '<p class="text-gray-400 text-center py-4">No items added yet</p>';
        return;
    }

    packingList.innerHTML = tripData.packing.map((item, index) => `
        <div class="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" ${item.packed ? 'checked' : ''} 
                   onchange="togglePacked(${index})" 
                   class="w-5 h-5 text-cyan-600">
            <span class="flex-1 ${item.packed ? 'checked-item' : ''}">${item.item}</span>
            <button onclick="deletePackingItem(${index})" 
                    class="text-red-500 hover:text-red-700">×</button>
        </div>
    `).join('');
}

function loadTemplate(type) {
    const templates = {
        beach: ['Swimsuit', 'Sunscreen', 'Beach towel', 'Sunglasses', 'Flip-flops', 'Hat', 'Beach bag', 'Waterproof phone case'],
        mountain: ['Hiking boots', 'Backpack', 'Water bottle', 'Warm jacket', 'First aid kit', 'Flashlight', 'Map/GPS', 'Snacks'],
        city: ['Comfortable shoes', 'Day bag', 'Camera', 'City map', 'Power bank', 'Umbrella', 'Water bottle', 'Travel guide'],
        business: ['Formal clothes', 'Laptop', 'Chargers', 'Documents', 'Business cards', 'Notebook', 'Pen', 'Briefcase']
    };

    const items = templates[type];
    items.forEach(item => {
        if (!tripData.packing.find(p => p.item === item)) {
            tripData.packing.push({ item, packed: false });
        }
    });

    saveData();
    renderPackingList();
}

// Notes
function saveNotes() {
    tripData.notes = document.getElementById('tripNotes').value;
    saveData();
    alert('Notes saved! ✓');
}

function loadNotes() {
    document.getElementById('tripNotes').value = tripData.notes || '';
}

// Auto-save trip details
document.getElementById('tripName').addEventListener('change', saveData);
document.getElementById('startDate').addEventListener('change', saveData);
document.getElementById('endDate').addEventListener('change', saveData);

// Initialize
renderExpenses();
