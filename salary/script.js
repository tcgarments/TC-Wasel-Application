const API_URL =
  "https://corsproxy.io/?" +
  encodeURIComponent(
    "https://script.google.com/macros/s/AKfycbyjFQmNJ1QDl-7PMRpkpuC4SCFBdL-TywrOoxBoG-P4BzM36nPXEEH7QxPTsFOwuLJd/exec"
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
  // ✅ التحقق من الحقول الأربعة
  if (!name || !nid || !code || !secretcode) {
    alert("من فضلك املأ الحقول الأربعة (الاسم، الكود، الرقم القومي، والرقم السري)");
    return;
  }
  showLoading();
  try {
    // ✅ إرسال الحقول الأربعة بما فيها الرقم السري
    const query = new URLSearchParams({
      name,
      nid,
      code,
      secretcode
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
    group.push(`
      <div class="row">
        <div class="cell-title">${escapeHtml(key)}</div>
        <div class="cell-value">${escapeHtml(value)}</div>
      </div>
    `);
    // كل 4 عناصر نعمل فاصل
    if ((i + 1) % 5 === 0 || i === entries.length - 1) {
      sectionsHtml += `
        <div class="section-block">
          ${group.join("")}
        </div>
      `;
      group = [];
    }
  });
  const header = `
    <div class="header-row">
    ❤️ دي تفاصيل مرتبك الشهر ده شوف الدنيا كده ❤️
    </div>`;
  const buttonsHtml = `
    
  `;
  const html = `
  <div class="container">
    <div class="salary-card fancy" id="salaryCard">
      ${header}
      <div class="auto-table">${sectionsHtml}</div>
      <center><h3>❤️❤️ مجهودكم مقدر . تواصلنا يفتح ابوابا لحلول افضل . نحن نستمع اليكم دائما ❤️❤️</h3></center>
    </div>
    ${buttonsHtml}
  </div>`;
  el("resultPanel").innerHTML = html;
  el("resultPanel").scrollIntoView({ behavior: "smooth" });
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
