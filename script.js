// 🔥 សំខាន់៖ ជំនួស URL នេះជាមួយនឹង Web App URL របស់អ្នក
const API_URL = 'https://script.google.com/macros/s/AKfycbwkpIsLHGcw3y5bvEBjTTzKi_3voO0qcTY3cZSt58CpXRPoZRR2BkynESX9TqzUVBr_wQ/exec'; 

let dbData = [];
const nameInput = document.getElementById('nameInput');
const suggestionsBox = document.getElementById('suggestions');
const genderInput = document.getElementById('genderInput');
const linkInput = document.getElementById('linkInput');
const submitBtn = document.getElementById('submitBtn');
const statusMsg = document.getElementById('statusMsg');
const loader = document.getElementById('loader');

// 1. Initial Load
window.addEventListener('load', async () => {
    try {
        const response = await fetch(`${API_URL}?action=read`);
        dbData = await response.json();
        loader.style.display = 'none';
    } catch (error) {
        console.error(error);
        loader.style.display = 'none';
        Swal.fire('Error', 'មិនអាចភ្ជាប់អ៊ីនធឺណិត ឬទាញទិន្នន័យបាន', 'error');
    }
});

// 2. Smart Search Logic
nameInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    suggestionsBox.innerHTML = '';
    
    if (val.length < 1) {
        suggestionsBox.classList.remove('show');
        resetForm();
        return;
    }

    // Filter names based on typing
    const matches = dbData.filter(p => p.n.toLowerCase().includes(val));

    if (matches.length > 0) {
        suggestionsBox.classList.add('show');
        matches.slice(0, 10).forEach(person => { // Show max 10 suggestions
            const li = document.createElement('li');
            // Highlight matching text (Optional logic, keep simple for now)
            li.innerHTML = `<span>${person.n}</span> <small style="color:#aaa">${person.g}</small>`;
            
            li.onclick = () => selectPerson(person);
            suggestionsBox.appendChild(li);
        });
    } else {
        suggestionsBox.classList.remove('show');
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!nameInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.classList.remove('show');
    }
});

// 3. Select Person Logic
function selectPerson(person) {
    nameInput.value = person.n;
    suggestionsBox.classList.remove('show');
    suggestionsBox.innerHTML = '';
    
    genderInput.value = person.g;

    if (person.hasLink) {
        // Block duplicate
        linkInput.disabled = true;
        linkInput.value = '';
        linkInput.placeholder = 'ឈ្មោះនេះមាន Telegram រួចហើយ';
        submitBtn.disabled = true;
        
        statusMsg.textContent = '❌ បានចុះឈ្មោះរួចរាល់ហើយ!';
        statusMsg.className = 'status-badge status-error';
    } else {
        // Allow Entry
        linkInput.disabled = false;
        linkInput.value = '';
        linkInput.placeholder = 'https://t.me/username';
        linkInput.focus();
        submitBtn.disabled = false;

        statusMsg.textContent = '✅ អាចបញ្ចូលទិន្នន័យបាន';
        statusMsg.className = 'status-badge status-success';
    }
}

function resetForm() {
    genderInput.value = '';
    linkInput.value = '';
    linkInput.disabled = true;
    submitBtn.disabled = true;
    statusMsg.style.display = 'none';
}

// 4. Submit Data
document.getElementById('entryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value;
    const link = linkInput.value;

    if (!name || !link) return;

    // Show Loader again
    loader.style.display = 'flex';
    loader.querySelector('span').textContent = 'កំពុងរក្សាទុក...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ name: name, link: link })
        });
        
        const result = await response.json();
        loader.style.display = 'none';

        if (result.success) {
            Swal.fire({
                title: 'ជោគជ័យ!',
                text: 'បានបញ្ចូលទិន្នន័យត្រឹមត្រូវ',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Update Local Data
            const index = dbData.findIndex(p => p.n === name);
            if(index !== -1) dbData[index].hasLink = true;

            // Reset UI
            nameInput.value = '';
            resetForm();
        } else {
            Swal.fire('បរាជ័យ', result.msg, 'error');
        }

    } catch (error) {
        loader.style.display = 'none';
        Swal.fire('Error', 'មានបញ្ហាក្នុងការរក្សាទុក', 'error');
    }
});
