const API = "http://127.0.0.1:8000";
let user = null;

document.addEventListener('DOMContentLoaded', () => fetchWHORSSAuth());

function openPopup(id) {
    document.getElementById(id).classList.remove('hidden');
    if(id === 'historyPopup') loadHistory();
    if(id === 'profilePopup') {
        document.getElementById('pName').innerText = user.name;
        document.getElementById('pBlood').value = user.profile.blood_group;
        document.getElementById('pAllergies').value = user.profile.allergies;
    }
}
function closePopup(id) { document.getElementById(id).classList.add('hidden'); }

async function handleLogin() {
    const res = await fetch(`${API}/login`, { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ email: lEmail.value, password: lPass.value }) 
    });
    if(res.ok) {
        const data = await res.json();
        document.getElementById('lifelineLoader').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('lifelineLoader').classList.add('hidden');
            setupApp(data);
        }, 2200);
    } else { alert("Login failed"); }
}
async function handleSignup() {
    const name = document.getElementById('sName').value;
    const email = document.getElementById('sEmail').value;
    const password = document.getElementById('sPass').value;
    const bloodGroup = document.getElementById('sBlood').value;
    const allergies = document.getElementById('sAllergies').value;

    if (!name || !email || !password) {
        alert("Please fill in all required fields.");
        return;
    }

    const payload = {
        name: name,
        email: email,
        password: password,
        blood_group: bloodGroup,
        allergies: allergies
    };

    try {
        const response = await fetch(`${API}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Registration Successful! Please login.");
            toggleAuth('login'); // Redirect to login tab
        } else {
            const errorData = await response.json();
            alert(`Signup failed: ${errorData.detail || "Unknown error"}`);
        }
    } catch (error) {
        console.error("Signup error:", error);
        alert("Could not connect to the server.");
    }
}
function setupApp(data) {
    user = data;
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    document.getElementById('appViews').classList.remove('hidden');
    document.getElementById('navName').innerText = user.name;
    fetchPubMedTrending();
}

async function loadHistory() {
    const res = await fetch(`${API}/history/${user.id}`);
    const history = await res.json();
    document.getElementById('historyContent').innerHTML = history.map(h => `
        <div class="p-6 bg-[#f8f9fa] rounded-3xl border border-[#dfe1e5]">
            <p class="text-[10px] font-black text-[#0b57d0] mb-2 uppercase">${h.time}</p>
            <p class="text-sm italic font-medium">"${h.query}"</p>
        </div>
    `).join('') || "<p class='text-center py-20 opacity-50'>No activity records found.</p>";
}

async function handleUpdateProfile() {
    const res = await fetch(`${API}/update-profile`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: user.id, blood_group: pBlood.value, allergies: pAllergies.value })
    });
    if(res.ok) {
        user.profile = { blood_group: pBlood.value, allergies: pAllergies.value };
        alert("Database Updated Successfully!");
    }
}

async function runTriage() {
    const res = await fetch(`${API}/triage`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ user_id: user.id, query: symptomText.value }) });
    const data = await res.json();
    const isHigh = data.risk_level.toLowerCase().includes('high');
    const box = document.getElementById('triageResult');
    box.classList.remove('hidden');
    box.className = `mt-10 p-10 rounded-[3rem] border-l-[15px] flex justify-between items-center ${isHigh ? 'bg-[#fce8e6] border-[#d32f2f]' : 'bg-[#e8f0fe] border-[#1a73e8]'}`;
    document.getElementById('riskTitle').innerText = data.risk_level.toUpperCase();
    document.getElementById('riskAdvice').innerText = data.advice;
    document.getElementById('resultActions').innerHTML = `
        <button onclick="loadDoctors()" class="bg-[#202124] text-white px-8 py-3 rounded-2xl font-black">CLINICS</button>
        <button onclick="openPopup('chatPopup')" class="bg-[#0b57d0] text-white px-8 py-3 rounded-2xl font-black">AI AGENT</button>
    `;
}

async function loadDoctors() {
    openPopup('doctorPopup');
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const res = await fetch(`${API}/doctors?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const doctors = await res.json();
        document.getElementById('doctorGrid').innerHTML = doctors.map(d => `
            <div class="bg-[#f8f9fa] p-8 rounded-[2.5rem] border border-[#dfe1e5] hover:border-[#0b57d0] transition-all">
                <h4 class="font-black text-lg">Dr. ${d.name}</h4>
                <p class="text-[#0b57d0] font-bold text-xs mb-4 uppercase">${d.specialty}</p>
                <a href="tel:${d.phone}" class="block text-center bg-[#0b57d0] text-white py-3 rounded-xl font-black text-xs">CALL NOW</a>
            </div>
        `).join('');
    });
}

async function sendChat() {
    const q = chatInput.value; if(!q) return;
    const box = document.getElementById('chatMessages');
    box.innerHTML += `<div class="flex justify-end"><div class="bg-[#0b57d0] text-white p-5 rounded-[2rem] rounded-tr-none max-w-[80%] font-bold shadow-lg">${q}</div></div>`;
    chatInput.value = '';
    const res = await fetch(`${API}/chat`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ user_id: user.id, query: q }) });
    const data = await res.json();
    const parts = data.response.split('\n\n');
    box.innerHTML += `
        <div class="space-y-4">
            <div class="pubmed-box"><p class="text-[10px] font-black text-[#1e8e3e] mb-2 uppercase">Verified Literature</p>${parts[0]}</div>
            <div class="ai-box"><p class="text-[10px] font-black text-[#1a73e8] mb-2 uppercase">Clinical Insight</p><ul>${parts.slice(1).join('\n\n').split('\n').filter(p => p.trim()).map(p => `<li>${p.replace(/^[•\-\d.]+\s*/, '')}</li>`).join('')}</ul></div>
        </div>`;
    box.scrollTop = box.scrollHeight;
}

async function fetchWHORSSAuth() {
    const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.who.int/rss-feeds/news-english.xml");
    const data = await res.json();
    const container = document.getElementById('whoRssAuth');
    let i = 0;
    const render = (idx) => {
        const item = data.items[idx];
        container.innerHTML = `<div class="p-10 bg-white rounded-[3rem] border border-[#dfe1e5] shadow-sm animate-in zoom-in duration-500">
            <span class="text-[10px] font-black text-[#0b57d0] uppercase tracking-widest">${new Date(item.pubDate).toLocaleDateString()}</span>
            <h4 class="font-bold text-[#1f1f1f] mt-4 text-xl leading-tight">${item.title}</h4>
            <p class="text-[#444746] mt-4 text-sm line-clamp-3">${item.description.replace(/<[^>]*>?/gm, '')}</p>
        </div>`;
    };
    render(0); setInterval(() => { i = (i + 1) % 5; render(i); }, 6000);
}

// function fetchPubMedTrending() {
//     const trending = [{title: "Oncology Protocols", cat: "Oncology"}, {title: "Neuro-Sync AI Diagnostics", cat: "Neurology"}, {title: "mRNA Vaccine Efficacy", cat: "Immunology"}];
//     document.getElementById('pubmedGrid').innerHTML = trending.map(item => `<div class="p-8 rounded-[2.5rem] border border-[#dfe1e5] hover:border-[#0b57d0] transition-all bg-white">
//         <span class="text-[#0b57d0] font-black text-[10px] uppercase">${item.cat} • Trending</span>
//         <h4 class="font-black text-[#1f1f1f] mt-2 text-lg leading-tight">${item.title}</h4>
//     </div>`).join('');
// }

// app.js

async function fetchPubMedTrending() {
    const pubmedGrid = document.getElementById('pubmedGrid');
    
    // NCBI E-Utilities URL to search for trending articles
    // We use a proxy to handle potential CORS issues from the browser
    const RSS_URL = "https://pubmed.ncbi.nlm.nih.gov/rss/search/1-y7vG_M3Z_Y8X_V9_S0gS/"; 
    const PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";

    try {
        const res = await fetch(PROXY + encodeURIComponent(RSS_URL));
        const data = await res.json();

        if (data.status === 'ok') {
            // Mapping the top 3 trending articles from the live feed
            pubmedGrid.innerHTML = data.items.slice(0, 3).map(item => `
                <div class="p-6 rounded-3xl border border-[#dfe1e5] hover:border-[#0b57d0] transition-all bg-white shadow-sm flex flex-col h-full">
                    <span class="text-[#0b57d0] font-black text-[10px] uppercase tracking-widest">
                        TRENDING • ${new Date(item.pubDate).toLocaleDateString()}
                    </span>
                    <h4 class="font-black text-[#1f1f1f] mt-2 text-lg leading-tight line-clamp-3">
                        ${item.title}
                    </h4>
                    <p class="text-[#444746] mt-4 text-sm italic line-clamp-2">
                        ${item.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                    </p>
                    <div class="mt-auto pt-4">
                        <a href="${item.link}" target="_blank" class="text-xs font-black text-[#0b57d0] uppercase hover:underline">
                            Read Abstract <i class="fa-solid fa-external-link ml-1"></i>
                        </a>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error("PubMed Fetch Error:", e);
        pubmedGrid.innerHTML = `<p class="text-center text-slate-400 py-10 text-sm">Unable to reach PubMed servers. Showing cached trends.</p>`;
    }
}

function toggleAuth(mode) {
    const isLogin = mode === 'login';
    document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
    document.getElementById('signupForm').classList.toggle('hidden', isLogin);
    document.getElementById('tabLogin').className = isLogin ? 'flex-1 py-3 rounded-xl font-bold bg-white shadow-sm' : 'flex-1 py-3 rounded-xl font-bold text-[#444746]';
    document.getElementById('tabSignup').className = !isLogin ? 'flex-1 py-3 rounded-xl font-bold bg-white shadow-sm' : 'flex-1 py-3 rounded-xl font-bold text-[#444746]';
}