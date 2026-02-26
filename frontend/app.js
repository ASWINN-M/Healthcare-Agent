const API = "http://127.0.0.1:8000";
let user = null;

// Emergency Tips Data
const medicalTips = [
    "Stay Calm and Call for Help: Take a deep breath to think clearly, assess the situation, and immediately call emergency services (e.g., 108).",
    "Ensure Safety: Check for dangers like fire, electricity, or traffic before approaching the victim.",
    "Check Airway, Breathing, Circulation (ABC): Verify consciousness. If not breathing, start CPR immediately.",
    "Perform CPR: Push hard and fast (100–120 compressions per minute) in the center of the chest.",
    "Stop Severe Bleeding: Apply direct, firm pressure on the wound using a clean cloth or bandage.",
    "Manage Choking (Heimlich Maneuver): If a person cannot speak, perform abdominal thrusts.",
    "Heart Attack/Stroke: Keep them calm and seated; seek immediate professional help.",
    "Treat Burns Correctly: Run cool water over the burn for 10–20 minutes. Do not apply ice or ointments.",
    "Manage Fractures: Immobilize the area using a splint and avoid unnecessary movement.",
    "Control Shock: Keep the person warm, lying down, and provide constant reassurance."
];

document.addEventListener('DOMContentLoaded', () => {
    checkSession(); // Requirement: Persistent Session
    fetchWHORSSAuth();
    startTipRotation();
});

function checkSession() {
    const sessionData = JSON.parse(localStorage.getItem('agentic_session'));
    if (sessionData) {
        const now = new Date().getTime();
        // 15 minutes timeout logic
        if (now - sessionData.timestamp < 15 * 60 * 1000) {
            setupApp(sessionData.user);
        } else {
            logout();
        }
    }
}

async function handleLogin() {
    const email = document.getElementById('lEmail').value;
    const password = document.getElementById('lPass').value;
    const res = await fetch(`${API}/login`, { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ email: email, password: password }) 
    });
    if(res.ok) {
        const data = await res.json();
        // Save session locally
        localStorage.setItem('agentic_session', JSON.stringify({
            user: data,
            timestamp: new Date().getTime()
        }));
        triggerLoader(() => setupApp(data));
    } else { alert("Login failed"); }
}

async function handleSignup() {
    const payload = {
        name: document.getElementById('sName').value,
        email: document.getElementById('sEmail').value,
        password: document.getElementById('sPass').value,
        blood_group: document.getElementById('sBlood').value,
        allergies: document.getElementById('sAllergies').value
    };
    try {
        const response = await fetch(`${API}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            alert("Registration Successful!");
            toggleAuth('login');
        }
    } catch (error) { console.error("Signup error:", error); }
}

function triggerLoader(callback) {
    document.getElementById('lifelineLoader').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('lifelineLoader').classList.add('hidden');
        callback();
    }, 2000);
}

function startTipRotation() {
    let currentTip = 0;
    const tipEl = document.getElementById('tipText');
    if (!tipEl) return;
    setInterval(() => {
        tipEl.style.opacity = 0;
        setTimeout(() => {
            currentTip = (currentTip + 1) % medicalTips.length;
            tipEl.innerText = medicalTips[currentTip];
            tipEl.style.opacity = 1;
        }, 500);
    }, 8000);
}

async function runTriage() {
    const symptomText = document.getElementById('symptomText').value;
    if (!symptomText) return;
    const res = await fetch(`${API}/triage`, { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ user_id: user.id, query: symptomText }) 
    });
    const data = await res.json();
    document.getElementById('emergencyTips').classList.add('hidden'); // Hide tips on results
    const box = document.getElementById('triageResult');
    box.classList.remove('hidden');
    const isHigh = data.risk_level.toLowerCase().includes('high');
    box.className = `mt-8 p-8 rounded-[2rem] border-l-[15px] flex justify-between items-center ${isHigh ? 'bg-[#fce8e6] border-[#d32f2f]' : 'bg-[#e8f0fe] border-[#1a73e8]'}`;
    document.getElementById('riskTitle').innerHTML = `<span class="text-[10px] block opacity-50 uppercase tracking-widest">Clinical Risk Analysis:</span> ${data.risk_level.toUpperCase()}`;
    document.getElementById('riskAdvice').innerText = data.advice;
    document.getElementById('resultActions').innerHTML = `<button onclick="loadDoctors()" class="bg-[#202124] text-white px-8 py-3 rounded-xl font-black">CLINICS</button><button onclick="openPopup('chatPopup')" class="bg-[#0b57d0] text-white px-8 py-3 rounded-xl font-black">AI AGENT</button>`;
}

async function sendChat() {
    const q = chatInput.value; if(!q) return;
    const box = document.getElementById('chatMessages');
    box.innerHTML += `<div class="flex justify-end"><div class="bg-[#0b57d0] text-white p-4 rounded-2xl shadow-sm">${q}</div></div>`;
    const loadId = "load_" + Date.now();
    // Center-aligned Loading with Cyclic Dots
    box.innerHTML += `<div id="${loadId}" class="flex justify-center w-full py-6"><div class="bg-white border border-[#dfe1e5] px-6 py-3 rounded-full text-sm font-medium text-[#444746] flex items-center gap-2 shadow-sm">Gathering resources from PubMed MCP server<span class="cyclic-dots"></span></div></div>`;
    chatInput.value = ''; box.scrollTop = box.scrollHeight;
    const res = await fetch(`${API}/chat`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ user_id: user.id, query: q }) });
    const data = await res.json();
    document.getElementById(loadId).remove();
    const parts = data.response.split('\n\n');
    box.innerHTML += `<div class="space-y-4"><div class="pubmed-box"><b>VERIFIED LITERATURE:</b> ${parts[0]}</div><div class="ai-box"><b>CLINICAL INSIGHT:</b> <ul>${parts.slice(1).join('\n\n').split('\n').filter(p => p.trim()).map(p => `<li>• ${p.replace(/^[•\-\d.]+\s*/, '')}</li>`).join('')}</ul></div></div>`;
    box.scrollTop = box.scrollHeight;
}

async function fetchPubMedTrending() {
    const pubmedGrid = document.getElementById('pubmedGrid');
    const PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";
    const RSS_URL = "https://pubmed.ncbi.nlm.nih.gov/rss/search/1-y7vG_M3Z_Y8X_V9_S0gS/"; 
    try {
        const res = await fetch(PROXY + encodeURIComponent(RSS_URL));
        const data = await res.json();
        pubmedGrid.innerHTML = data.items.slice(0, 3).map(item => `
            <div class="p-6 bg-white rounded-3xl border border-[#dfe1e5] hover:border-[#0b57d0] transition-all flex flex-col h-full shadow-sm">
                <span class="text-[#0b57d0] font-black text-[10px] uppercase mb-2">TRENDING RESEARCH</span>
                <h4 class="font-bold text-sm line-clamp-2">${item.title}</h4>
                <a href="${item.link}" target="_blank" class="text-[10px] font-black text-[#0b57d0] uppercase mt-auto pt-4 hover:underline">Read Abstract</a>
            </div>`).join('');
    } catch (e) { console.warn("PubMed Sync Error."); }
}
async function fetchWHORSSAuth() {
    try {
        const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.who.int/rss-feeds/news-english.xml");
        const data = await res.json();
        const container = document.getElementById('whoRssAuth');
        let i = 0;
        const render = (idx) => {
            const item = data.items[idx];
            container.innerHTML = `<div class="p-10 bg-white rounded-[3.5rem] border border-[#dfe1e5] shadow-sm animate-in zoom-in duration-500">
                <span class="text-[10px] font-black text-[#0b57d0] uppercase tracking-widest">${new Date(item.pubDate).toLocaleDateString()}</span>
                <h4 class="font-bold text-[#1f1f1f] mt-4 text-xl leading-tight">${item.title}</h4>
                <p class="text-[#444746] mt-4 text-sm line-clamp-3">${item.description.replace(/<[^>]*>?/gm, '')}</p>
            </div>`;
        };
        render(0); 
        setInterval(() => { i = (i + 1) % 5; render(i); }, 6000);
    } catch(e) { console.warn("WHO RSS Load error."); }
}
function setupApp(data) {
    user = data;
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    document.getElementById('appViews').classList.remove('hidden');
    document.getElementById('navName').innerText = user.name;
    fetchPubMedTrending();
}

function logout() { localStorage.removeItem('agentic_session'); location.reload(); }
function openPopup(id) { 
    document.getElementById(id).classList.remove('hidden'); 
    if(id === 'historyPopup') loadHistory();
}
function closePopup(id) { document.getElementById(id).classList.add('hidden'); }
function toggleAuth(mode) {
    const isLogin = mode === 'login';
    document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
    document.getElementById('signupForm').classList.toggle('hidden', isLogin);
}