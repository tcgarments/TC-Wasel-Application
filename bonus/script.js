const API_URL =
  "https://corsproxy.io/?" +
  encodeURIComponent(
    "https://script.google.com/macros/s/AKfycbwzP_6SS3EZYYB4QC09_U5YLJ_DkaD1-X0JpsmyveAzX7aO2GbYfRLX9eA1y8ffvqLq/exec"
  );

const el = id => document.getElementById(id);
let currentCode = null;
let currentSheetType = null;

// =========================
// تحميل البيانات الأساسية عند فتح الصفحة
// =========================
window.addEventListener("DOMContentLoaded", () => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith("basic_"));
  if (keys.length > 0) {
    const lastKey = keys[keys.length - 1];
    const data = JSON.parse(localStorage.getItem(lastKey));
    if (data) {
      el("name").value = data.name;
      el("nid").value = data.nid;
      el("code").value = data.code;
      el("email").value = data.email;
      el("sheetType").value = data.sheetType || "";
      currentCode = data.code;
      currentSheetType = data.sheetType;
    }
  }
});

// =========================
// حفظ واسترجاع البيانات الأساسية
// =========================
function saveBasicFields() {
  const data = {
    name: el("name").value.trim(),
    nid: el("nid").value.trim(),
    code: el("code").value.trim(),
    email: el("email").value.trim(),
    sheetType: el("sheetType").value.trim()
  };
  if (data.code) {
    localStorage.setItem("basic_" + data.code, JSON.stringify(data));
  }
}

function loadBasicFields(code) {
  const data = localStorage.getItem("basic_" + code);
  if (data) {
    const obj = JSON.parse(data);
    el("name").value = obj.name;
    el("nid").value = obj.nid;
    el("code").value = obj.code;
    el("email").value = obj.email;
    el("sheetType").value = obj.sheetType || "";
  }
}

["name", "nid", "code", "email", "sheetType"].forEach(id => {
  el(id).addEventListener("input", saveBasicFields);
  el(id).addEventListener("change", saveBasicFields);
});

// =========================
// حفظ واسترجاع الجدول محليًا
// =========================
function saveLocalTable(updates) {
  if (currentCode && currentSheetType) {
    localStorage.setItem("local_" + currentCode + "_" + currentSheetType, JSON.stringify(updates));
  }
}

function loadLocalTable() {
  if (!currentCode || !currentSheetType) return null;
  const data = localStorage.getItem("local_" + currentCode + "_" + currentSheetType);
  return data ? JSON.parse(data) : null;
}

// =========================
// البحث والمسح
// =========================
document.getElementById("btnSearch").addEventListener("click", checkData);
document.getElementById("btnClear").addEventListener("click", () => {
  ["name", "nid", "code", "email", "sheetType"].forEach(i => (el(i).value = ""));
  el("resultPanel").innerHTML = "";
});

// =========================
// التحقق من البيانات
// =========================
async function checkData() {
  const name = el("name").value.trim();
  const nid = el("nid").value.trim();
  const code = el("code").value.trim();
  const email = el("email").value.trim();
  const sheetType = el("sheetType").value.trim();

  if (!name || !nid || !code || !email || !sheetType) {
    alert("من فضلك املأ كل الحقول (الاسم، الرقم القومي، الكود، نوع الشيت، البريد الإلكتروني).");
    return;
  }

  showLoading();

  try {
    const res = await fetch(
      `${API_URL}?code=${encodeURIComponent(code)}&name=${encodeURIComponent(
        name
      )}&nid=${encodeURIComponent(nid)}&email=${encodeURIComponent(email)}&sheetType=${encodeURIComponent(sheetType)}`
    );
    const json = await res.json();
    hideLoading();

    if (json.success) {
      currentCode = code;
      currentSheetType = sheetType;
      loadBasicFields(currentCode);
      renderTable(json.data);
    } else {
      el("resultPanel").innerHTML = `
        <div class="container"><div class="card">
          <p style="color:#c0392b">${json.message || "لم يتم العثور على بيانات"}</p>
        </div></div>`;
    }
  } catch (err) {
    hideLoading();
    el("resultPanel").innerHTML = `
      <div class="container"><div class="card">
        <p style="color:#c0392b">فشل الاتصال بالخادم. تأكد من اتصال الإنترنت.</p>
      </div></div>`;
  }
}

// =========================
// عرض الجدول + زر Excel
// =========================
function renderTable(data) {
  const headers = data.headers;
  const rows = data.sheetData.slice(1); // الصفوف المفلترة
  const totalCols = headers.length;

  let table = `
  <div class="table-wrapper" dir="ltr">
    <table id="editTable" dir="ltr" class="excel-like">
      <thead>
        <tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map(r => {
            const fullRow = Array.from({ length: totalCols }, (_, i) => r[i] ?? "");
            return `<tr>${fullRow
              .map(
                (c, i) =>
                  `<td contenteditable="${i === 3 ? "true" : "false"}" 
                       class="${i === 3 ? "editable" : "locked"}">${escapeHtml(c)}</td>`
              )
              .join("")}</tr>`;
          })
          .join("")}
      </tbody>
    </table>
  </div>
  <div class="btn-container">
    <button class="btn save" onclick="saveChanges()">💾 حفظ التعديلات</button>
    <button class="btn load" onclick="loadLocalData()">📂 تحميل النسخة المحلية</button>
	<button class="btn excel" onclick="exportToExcel()">✌️ تحميل Excel</button>
  </div>`;

  el("resultPanel").innerHTML = `
    <div class="salary-card fancy">
      <div class="header-row" style="text-align:center; padding:20px; background:linear-gradient(90deg,#8b0000,#b22222); border-radius:18px; margin-bottom:25px; font-size:1.6rem; color:white; box-shadow:0 10px 30px rgba(139,0,0,0.4);">
  البونص نزل يا معلم  
  <br><span style="font-size:1.1rem; opacity:0.9;">اكتب الحافز في العمود الرابع واضغط "حفظ التعديلات"</span>
</div>
      ${table}
    </div>`;

  const tableEl = document.getElementById("editTable");
  tableEl.addEventListener("input", () => {
    const updates = [...tableEl.querySelectorAll("tbody tr")].map(tr =>
      [...tr.querySelectorAll("td")].map(td => td.textContent.trim())
    );
    saveLocalTable(updates);
  });
}

// =========================
// تصدير الجدول إلى Excel (مع فحص العمود الرابع)
// =========================

async function exportToExcel() {
  const table = document.getElementById("editTable");
  if (!table) {
    alert("لا يوجد جدول لتصديره!");
    return;
  }

  const rows = [...table.querySelectorAll("tbody tr")].map(tr =>
    [...tr.querySelectorAll("td")].map(td => td.textContent.trim())
  );

  const emptyFourthColumn = rows.some(row => !row[3] || row[3] === "");
  if (emptyFourthColumn) {
    alert("لا يمكن تصدير الملف!\nيوجد صفوف في العمود الرابع (الحافز) فارغة.\nيرجى ملء جميع الخانات أولاً.");
    return;
  }

  const headers = [...table.querySelectorAll("thead th")].map(th => th.textContent.trim());
  const fullData = [headers, ...rows];

  const ws = XLSX.utils.aoa_to_sheet(fullData);
  const colWidths = headers.map((_, i) => {
    const maxLength = Math.max(
      headers[i]?.length || 0,
      ...rows.map(row => row[i]?.length || 0)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "البونص");

  // تحويل إلى array buffer (للرفع الصحيح)
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `بونص_${currentCode}_${currentSheetType}.xlsx`;

  // رفع على tmpfiles.org
  const formData = new FormData();
  formData.append('file', blob, fileName);

  showLoading("جاري رفع الملف...");
  try {
    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    const downloadUrl = result.data.url.replace('/download', '');  // الرابط الكامل
    hideLoading();

    if (downloadUrl) {
      openExternalLink(downloadUrl);
      //alert("تم رفع الملف!\nافتح المتصفح → اضغط 'تحميل'\nالملف: " + fileName);
		alert("تم رفع الملف بنجاح\nهتلاقي زر Download اضغط عليه مرتين الملف ده هيتحمل\n"+fileName);
    } else {
      throw new Error("فشل الرفع");
    }
  } catch (err) {
    hideLoading();
    alert("فشل الرفع. تأكد من الإنترنت أو جرب مرة أخرى.");
  }
}



// دالة احتياطية للمشاركة
function fallbackShare(dataUri, fileName) {
  // إنشاء رابط تحميل مؤقت
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // إظهار رسالة
  alert("تم إنشاء الملف!\nاختر 'حفظ' أو 'مشاركة' من النافذة التي ستظهر.\nالملف: " + fileName);
}

// تحويل Base64 إلى Blob
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}



// =========================
// تحميل النسخة المحلية يدويًا
// =========================
function loadLocalData() {
  const localData = loadLocalTable();
  if (localData) {
    populateTable(localData);
    alert("✅ تم تحميل النسخة المحلية بنجاح");
  } else {
    alert("❌ لا توجد نسخة محلية محفوظة لهذا المستخدم والشيت.");
  }
}

// =========================
// ملء الجدول من الب68يانات المحلية
// =========================
function populateTable(updates) {
  const tableEl = document.getElementById("editTable");
  if (!tableEl) return;
  const tbody = tableEl.querySelector("tbody");
  tbody.querySelectorAll("tr").forEach((tr, i) => {
    tr.querySelectorAll("td").forEach((td, j) => {
      if (updates[i] && updates[i][j] !== undefined) td.textContent = updates[i][j];
    });
  });
}

// =========================
// حفظ التعديلات على السيرفر + تخزين محلي
// =========================
async function saveChanges() {
  const table = document.getElementById("editTable");
  if (!table) return;

  const updates = [...table.querySelectorAll("tbody tr")].map(tr =>
    [...tr.querySelectorAll("td")].map(td => td.textContent.trim())
  );

  saveLocalTable(updates);

  showLoading("جاري حفظ التعديلات...");
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheetType: currentSheetType, updates, code: currentCode })
    });

    const text = await res.text();
    const json = JSON.parse(text.includes("{") ? text : "{}");

    const success = json.success === true;
    el("resultPanel").innerHTML = `<div class="card">
      <p style="color:${success ? "green" : "green"}">
        ${json.message || (success ? "تم الحفظ بنجاح (محليًا وسيرفر)" : "تم الحفظ بنجاح (محليًا وسيرفر)")}
      </p>
    </div>`;
    hideLoading();
  } catch (err) {
    hideLoading();
    el("resultPanel").innerHTML = `<div class="card"><p style="color:red">فشل الاتصال - تم حفظ نسخة محلية فقط</p></div>`;
  }
}

// =========================
// دوال مساعدة
// =========================
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function showLoading(msg = "جاري التحقق من البيانات...") {
  el("resultPanel").innerHTML = `<div class="container"><div class="card"><p>${msg}</p></div></div>`;
}
function hideLoading() {}

// إذا ما كنتش حاططها من قبل
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}


function showLoading(msg = "جاري المعالجة...") {
  document.body.style.cursor = "wait";
  el("resultPanel").innerHTML += `<div style="text-align:center; padding:20px; color:#0066cc;">${msg}</div>`;
}
function hideLoading() {
  document.body.style.cursor = "default";
}
