
const githubJsonUrl = "https://raw.githubusercontent.com/tcrecruitment2025/tcprojects/main/policies.json";

fetch(githubJsonUrl)
  .then(response => {
    if (!response.ok) throw new Error("Network response was not ok " + response.statusText);
    return response.json();
  })
  .then(data => {
    const notifications = data.notifications;
    const container = document.getElementById("notifications");

    container.innerHTML = "";

    if (notifications && notifications.length > 0) {
      notifications.forEach(n => {
        const card = document.createElement("div");
        card.className = "notification-card";
        card.innerHTML = `
          <img src="${n.image}" alt="notification" class="notif-img">
          <h3>${n.title}</h3>
          <p>${n.message}</p>
          <small>${n.date}</small>
        `;
        container.appendChild(card);
      });

      // 🖼️ التعامل مع الصور
      const images = document.querySelectorAll(".notif-img");
      const imageDialog = document.getElementById("imageDialog");
      const dialogImage = document.getElementById("dialogImage");

      images.forEach(img => {
        img.addEventListener("click", () => {
          dialogImage.src = img.src;
          imageDialog.classList.add("active");
        });
      });

      // إغلاق الديالوج عند الضغط بالخارج
      imageDialog.addEventListener("click", (e) => {
        if (e.target === imageDialog) {
          imageDialog.classList.remove("active");
          dialogImage.classList.remove("zoomed");
        }
      });

      // عمل زووم عند الضغط على الصورة
      dialogImage.addEventListener("click", () => {
        dialogImage.classList.toggle("zoomed");
      });
    } else {
      const emptyCard = document.createElement("div");
      emptyCard.className = "notification-card";
      emptyCard.innerHTML = `
        <div style="font-size: 24px;">📭</div>
        <h3>لسه مفيش سياسات مكتوبة او متعدلة</h3>
        <p>تابعنا قريبًا علشان تشوف آخر التحديثات ❤️</p>
      `;
      container.appendChild(emptyCard);
    }
  })
  .catch(error => {
    console.error("Error loading notifications:", error);
    const container = document.getElementById("notifications");
    const errorCard = document.createElement("div");
    errorCard.className = "notification-card";
    errorCard.innerHTML = `
      <div style="font-size: 24px;">⚠️</div>
      <h3>حدث خطأ اثناء التحميل</h3>
      <p>من فضلك تأكد من اتصال الإنترنت وجرب تاني.</p>
    `;
    container.appendChild(errorCard);
  });