// script.js — النسخة الجمالية الكاملة (مع جملة مصرية في الهيدر)
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
  el("resultPanel").innerHTML = "";
});

async function checkData() {
  const name = el("name").value.trim();
  const nid = el("nid").value.trim();
  const code = el("code").value.trim();

  if (!name || !nid || !code) {
    alert("من فضلك املأ الحقول الثلاثة (الاسم، الرقم القومي، الكود)");
    return;
  }

  showLoading();

  try {
    const res = await fetch(
      `${API_URL}?name=${encodeURIComponent(name)}&nid=${encodeURIComponent(
        nid
      )}&code=${encodeURIComponent(code)}`
    );
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
    if ((i + 1) % 4 === 0 || i === entries.length - 1) {
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
      دي تفاصيل مرتبك الشهر ده, شوف الدنيا كده 💰
    </div>`;

  const html = `
  <div class="container">
    <div class="salary-card fancy" id="salaryCard">
      ${header}
      <div class="auto-table">${sectionsHtml}</div>
    </div>
	<center><h3>مجهودكم مقدر . تواصلنا يفتح ابوابا لحلول افضل . نحن نستمع اليكم دائما</h3></center>
  </div>`;

  el("resultPanel").innerHTML = html;
  el("resultPanel").scrollIntoView({ behavior: "smooth" });
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
