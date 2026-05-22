// --- إعدادات Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSy...", 
    authDomain: "porto-cafe.firebaseapp.com",
    databaseURL: "https://porto-cafe-default-rtdb.firebaseio.com",
    projectId: "porto-cafe",
    storageBucket: "porto-cafe.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// متغيرات عامة
let categories = [];
let menuData = [];
let usersList = [];
let cart = {};
let currentUserName = "";
let currentUserPhone = "";

// جلب البيانات من Firebase
db.ref('/').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        categories = data.categories || [];
        menuData = data.products || [];
        usersList = data.users_logs || [];
        renderClientCats();
        renderUsersTable();
    }
});

// --- نظام الدخول ---

// 1. دخول العميل
document.getElementById('login-form').onsubmit = function(e) {
    e.preventDefault();
    currentUserName = document.getElementById('user-name').value;
    currentUserPhone = document.getElementById('user-phone').value;

    if(currentUserPhone.length !== 11) return alert("الرقم غير صحيح!");

    // حفظ العميل في السجلات
    usersList.push({ name: currentUserName, phone: currentUserPhone, time: new Date().toLocaleString() });
    db.ref('users_logs').set(usersList);

    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('welcome-text').innerText = `أهلاً بك يا ${currentUserName} 🌿`;
};

// 2. التحكم في نوافذ الأدمن
function openAdminLogin() {
    document.getElementById('entry-screen').style.display = 'none';
    document.getElementById('admin-login-screen').style.display = 'flex';
}

function closeAdminLogin() {
    document.getElementById('admin-login-screen').style.display = 'none';
    document.getElementById('entry-screen').style.display = 'flex';
}

// 3. التحقق من بيانات الأدمن (الحماية)
function verifyAdmin() {
    const u = document.getElementById('admin-user').value;
    const ph = document.getElementById('admin-phone').value;
    const ps = document.getElementById('admin-pass').value;

    // البيانات الخاصة بك
    if(u === 'porto' && ph === '01068712168' && ps === 'His12365428') {
        document.getElementById('admin-login-screen').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        refreshAdminUI();
    } else {
        alert("خطأ: بيانات المسؤول غير صحيحة!");
    }
}

// 4. تسجيل خروج الأدمن
function adminLogout() {
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('entry-screen').style.display = 'flex';
    // تفريغ الحقول للأمان
    document.getElementById('admin-user').value = '';
    document.getElementById('admin-pass').value = '';
}

// --- وظائف الإدارة (الأدمن) ---

function saveAllToFirebase() {
    db.ref('categories').set(categories);
    db.ref('products').set(menuData).then(() => {
        alert("✅ تم الحفظ سحابياً بنجاح للجميع!");
    });
}

// (أكمل باقي الدوال: addProduct, addCategory, renderAdminMenu, move... بنفس المنطق السابق)

function refreshAdminUI() {
    renderAdminCats();
    renderAdminMenu();
    updateAdminCatSelect();
    renderUsersTable();
}

function renderUsersTable() {
    const body = document.getElementById('users-body');
    if(body) {
        body.innerHTML = usersList.map(u => `<tr><td>${u.name}</td><td>${u.phone}</td><td>${u.time}</td></tr>`).join('');
    }
}

// --- وظائف العميل (المنيو) ---

function sendToWhatsapp() {
    const addr = document.getElementById('user-address').value;
    if(!addr) return alert("أدخل العنوان");

    let orderText = ""; let total = 0;
    Object.keys(cart).forEach(id => {
        if(cart[id] > 0) {
            const it = menuData.find(m => m.id == id);
            orderText += `• ${it.name} (×${cart[id]}) = ${it.price * cart[id]} ج.م\n`;
            total += it.price * cart[id];
        }
    });

    const msg = `🌿 *فاتورة طلب من Porto Cafe* 🌿\n👤 *العميل:* ${currentUserName}\n📞 *الهاتف:* ${currentUserPhone}\n📍 *العنوان:* ${addr}\n\n*الطلبات:* \n${orderText}\n💰 *الإجمالي النهائي:* ${total} ج.م`;
    window.location.href = `https://api.whatsapp.com/send?phone=201068712168&text=${encodeURIComponent(msg)}`;
}