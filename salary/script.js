const API_URL =
  "https://corsproxy.io/?" +
  encodeURIComponent(
    "https://script.google.com/macros/s/AKfycbzvkYGZThNwJWnghtXlZhcySgQBUnIkTLdTBSiiYStsQUKeQWTuy4hp139gzgUe9XIZ/exec"
  );
const el = id => document.getElementById(id);
document.getElementById("btnSearch").addEventListener("click", checkData);
document.getElementById("btnClear").addEventListener("click", () => {
  el("name").value = "";
  el("nid").value = "";
  el("code").value = "";
  el("secretcode").value = "";
  el("resultPanel").innerHTML = "";
});
// تأكد من إضافة المكتبات التالية في صفحة HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
async function checkData() {
  const name = el("name").value.trim();
  const nid = el("nid").value.trim();
  const code = el("code").value.trim();
  const secretcode = el("secretcode").value.trim();
  const year = el("year").value.trim();
  const month = el("month").value.trim();
  // ✅ التحقق من الحقول الأربعة
  if (!name || !nid || !code || !secretcode || !year || !month) {
  alert("من فضلك املأ جميع الحقول (الاسم، الكود، الرقم القومي، الرقم السري، السنة، الشهر)");
  return;
}
  showLoading();
  try {
    // ✅ إرسال الحقول الأربعة بما فيها الرقم السري
    const query = new URLSearchParams({
  name,
  nid,
  code,
  secretcode,
  year,
  month
});
    const res = await fetch(`${API_URL}?${query.toString()}`);
    const json = await res.json();
    hideLoading();
    if (json.success) {
      renderResult(json.data);
    } else {
      el("resultPanel").innerHTML = `
        <div class="container"><div class="card">
          <p style="color:#c0392b">${json.message || "لم يتم العثور على بيانات"}</p>
        </div></div>`;
    }
  } catch (err) {
    hideLoading();
    console.error(err);
    el("resultPanel").innerHTML = `
      <div class="container"><div class="card">
        <p style="color:#c0392b">⚠️ فشل الاتصال بالخادم. تأكد من اتصال الإنترنت.</p>
      </div></div>`;
  }
}
// 🎨 عرض النتيجة بشكل جمالي ومقسم

function renderResult(d) {
  const entries = Object.entries(d);
  let sectionsHtml = "";
  let group = [];

  entries.forEach(([key, value], i) => {
    let displayValue = value;

    // إخفاء الرقم السري في العرض فقط
    if (key.trim() === "الرقم السري" ||
        key.trim() === "الرقم السرى" ||
        key.trim() === "الرقم السري" ||		
        key.trim() === "secretcode" || 
        key.toLowerCase().includes("secret")) {
      displayValue = "••••••"; // أو يمكنك عمل طول ديناميكي: "*".repeat(String(value).length)
    }

    group.push(
      <div class="row">
        <div class="cell-title">${escapeHtml(key)}</div>
        <div class="cell-value">${escapeHtml(displayValue)}</div>
      </div>
    );

    if ((i + 1) % 5 === 0 || i === entries.length - 1) {
      sectionsHtml += 
        <div class="section-block">
          ${group.join("")}
        </div>;
      group = [];
    }
  });

  // باقي الكود كما هو...
  const header = 
    <div class="header-row">
      💰 كشف استحقاقك الشهري يا وحش! 💰
    </div>;

  const buttonsHtml = 
    <div class="export-buttons">
      <button class="btn-export" onclick="exportToExcel()">📊 تحميل Excel</button>
    </div>
    <center><h3 style="margin:30px 0; opacity:0.9;">
      مجهودكم هو سر نجاحنا 🌟 تواصل معانا في أي وقت
    </h3></center>;

  const html = 
    <div class="container">
      <div class="salary-card fancy" id="salaryCard">
        ${header}
        <div class="auto-table">${sectionsHtml}</div>
        <center><h3>مجهودكم مقدر . تواصلنا يفتح ابوابا لحلول افضل . نحن نستمع اليكم دائما</h3></center>
        ${buttonsHtml}
      </div>
    </div>;

  el("resultPanel").innerHTML = html;
  el("resultPanel").scrollIntoView({ behavior: "smooth" });

  window.currentSalaryData = d; // القيمة الحقيقية محفوظة هنا للتصدير
}




function exportToImage() {
  html2canvas(document.getElementById('salaryCard')).then(canvas => {
    const link = document.createElement('a');
    link.download = 'salary.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}
function exportToPDF() {
  html2canvas(document.getElementById('salaryCard')).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save('salary.pdf');
  });
}
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );
}
function showLoading() {
  el("resultPanel").innerHTML =
    `<div class="container"><div class="card"><p>⏳ جاري البحث... يرجى الانتظار</p></div></div>`;
}
function hideLoading() {}

// متغير عالمي لحفظ البيانات
window.currentSalaryData = null;


async function exportToExcel() {
  if (!window.currentSalaryData) {
    alert("لا توجد بيانات لتصديرها!");
    return;
  }

  const data = window.currentSalaryData;
  const fileName = `كشف_استحقاق_${data["الاسم"] || "الموظف"}.xlsx`;

  // تحويل البيانات إلى صفوف
  const rows = Object.entries(data).map(([key, value]) => [key, value]);
  const headers = [["العنوان", "القيمة"]];
  const fullData = headers.concat(rows);

  const ws = XLSX.utils.aoa_to_sheet(fullData);
  ws['!cols'] = [{ wch: 25 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "كشف الاستحقاق");

  // تحويل إلى array buffer
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

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




// احتياطي: تحميل مباشر
function fallbackDownload(dataUri, fileName) {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

function showLoading(msg = "جاري المعالجة...") {
  document.body.style.cursor = "wait";
  el("resultPanel").innerHTML += `<div style="text-align:center; padding:20px; color:#0066cc;">${msg}</div>`;
}
function hideLoading() {
  document.body.style.cursor = "default";
}




