// ដាក់ URL ដែលបានពី Google Apps Script Deployment នៅទីនេះ
const API_URL = 'https://script.google.com/macros/s/AKfycbwkpIsLHGcw3y5bvEBjTTzKi_3voO0qcTY3cZSt58CpXRPoZRR2BkynESX9TqzUVBr_wQ/exec'; 

let dbData = [];
const nameInput = document.getElementById('nameInput');
const genderInput = document.getElementById('genderInput');
const linkInput = document.getElementById('linkInput');
const submitBtn = document.getElementById('submitBtn');
const statusText = document.getElementById('statusText');
const loader = document.getElementById('loader');

// 1. ទាញទិន្នន័យពេលបើកកម្មវិធី
window.addEventListener('load', async () => {
    try {
        const response = await fetch(`${API_URL}?action=read`);
        const data = await response.json();
        dbData = data;
        
        // បញ្ចូលឈ្មោះទៅក្នុង Datalist
        const datalist = document.getElementById('nameList');
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.n;
            datalist.appendChild(option);
        });

        loader.style.display = 'none';
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'មិនអាចភ្ជាប់ទៅកាន់ទិន្នន័យបានទេ', 'error');
    }
});

// 2. មុខងារ Smart Search & Autofill
nameInput.addEventListener('input', (e) => {
    const val = e.target.value;
    const found = dbData.find(person => person.n === val);

    if (found) {
        genderInput.value = found.g;
        
        if (found.hasLink) {
            // បើមាន Link ហើយ
            linkInput.disabled = true;
            linkInput.value = '';
            linkInput.placeholder = 'មានគណនីរួចរាល់ហើយ';
            submitBtn.disabled = true;
            statusText.textContent = 'ឈ្មោះនេះបានចុះឈ្មោះរួចហើយ!';
            statusText.className = 'text-error';
        } else {
            // បើមិនទាន់មាន Link
            linkInput.disabled = false;
            linkInput.placeholder = 'https://t.me/username';
            linkInput.focus();
            submitBtn.disabled = false;
            statusText.textContent = 'អាចបញ្ចូលទិន្នន័យបាន';
            statusText.className = 'text-success';
        }
    } else {
        genderInput.value = '';
        linkInput.disabled = true;
        submitBtn.disabled = true;
        statusText.textContent = '';
    }
});

// 3. មុខងារ Save ទៅកាន់ Google Sheet
document.getElementById('entryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value;
    const link = linkInput.value;

    if (!name || !link) return;

    loader.style.display = 'flex'; // បង្ហាញ Loading

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
                text: 'បានបញ្ចូល Link Telegram រួចរាល់',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Update Local Data ដើម្បីកុំឱ្យបញ្ចូលជាន់គ្នាទៀត
                const index = dbData.findIndex(p => p.n === name);
                if (index !== -1) dbData[index].hasLink = true;

                // Reset Form
                nameInput.value = '';
                genderInput.value = '';
                linkInput.value = '';
                linkInput.disabled = true;
                submitBtn.disabled = true;
                statusText.textContent = '';
            });
        } else {
            Swal.fire('បរាជ័យ', result.msg, 'error');
        }

    } catch (error) {
        loader.style.display = 'none';
        Swal.fire('Error', 'មានបញ្ហាក្នុងការរក្សាទុក', 'error');
    }
});