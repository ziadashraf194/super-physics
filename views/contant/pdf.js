
    const params = new URLSearchParams(window.location.search);
    const pdfId = params.get("id");
    const courseId = params.get("course");
    const pdfTitle = document.getElementById("pdf-title");
    const pdfBox   = document.getElementById("pdf-box");
    const contant  = document.querySelector(".contant");
    const popText = document.querySelector(".modal-body")
    var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login/index.html";
    }

    
    function getDriveFileId(url) {
      const regex = /\/d\/([a-zA-Z0-9_-]{25,})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    }


    async function getContant(courseID, pdfId) {
      try {
        const response = await fetch(`${window.location.origin}/${courseID}/${pdfId}`, {
          method: "GET",
          headers: {
            "contant-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          popText.innerText=`${data.msg}`
         myModal.show();
          return;
        }

        if (pdfTitle) {
          pdfTitle.innerHTML = `${data.contant.title} <i class="fa-solid fa-file-pdf" style="color: #ffffff;"></i>`;
        }

        let fileId = getDriveFileId(data.contant.url);
        let iframeUrl;

        if (fileId) {
          
          iframeUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        } else {
          iframeUrl = `https://docs.google.com/gview?url=${encodeURIComponent(data.contant.url)}&embedded=true`;
        }

        pdfBox.innerHTML = `<iframe src="${iframeUrl}"  allow="autoplay"></iframe>`;
      } catch (error) {
        console.error("Error:", error);
        popText.innerText=`حدث خطاء`
         myModal.show();
         return
      }
    }

    getContant(courseId, pdfId);

    // ✅ جلب المحتوى (الدروس + المحتويات)
    fetch(`${window.location.origin}/courses/${courseId}/full`,{
      method: "GET",
      headers: {"Authorization": `Bearer ${token}`}
    })
      .then(response => {
        if(response.status === 401) {
          contant.innerHTML = `<button id="popup-subscribe-btn" class="btn btn-primary btn-lg btn-block" onclick="window.location.href='/login/index.html'">سجل الدخول لرؤية المحتوي </button>`;
        }
        if(!response.ok) throw new Error("حدث خطأ أثناء جلب البيانات");
        return response.json();
      })
      .then(data => {
        if(!data.lessons || data.lessons.length === 0) {
          contant.innerHTML = `<h1 style="color:#000"> استني المحتوي هينزل قريب</h1>`;
          return;
        }

        Sup().then(result => {
          contant.innerHTML = ""; // تفريغ

          data.lessons.forEach((lesson,index) => {
            const lessonId = `lesson-${index}`;
            contant.innerHTML += `
              <div class="lesson-block">
                <h3 class="lesson-title" onclick="toggleLesson('${lessonId}')">
                  📘 ${lesson.title}
                  <i class="fa-solid fa-chevron-down"></i>
                </h3>
                <div id="${lessonId}" class="lesson-content" style="display:none;"></div>
              </div>
            `;

            setTimeout(() => {
              const lessonContentDiv = document.getElementById(lessonId);
              lesson.contents.forEach(item => {
                let icon = item.type === "video" ? "fa-circle-play" :
                  item.type === "pdf" ? "fa-file-lines" :
                    item.type === "image" ? "fa-image" : "fa-question";

                if(result) {
                  lessonContentDiv.innerHTML += `
                    <div class="contant-div" onclick="window.location.href='/contant/${item.type}.html?course=${courseId}&id=${item._id}'">
                      <p><i class="fa-solid ${icon}" style="color:#0088ff;"></i> | ${item.title}</p>
                    </div>
                  `;
                } else {
                  lessonContentDiv.innerHTML += `
                    <div class="contant-div" onclick="openPopup()">
                      <p><i class="fa-solid ${icon}" style="color:#0088ff;"></i> | ${item.title}</p>
                    </div>
                  `;
                }
              });
            },100);
          });
        });
      })
      .catch(err => {
        contant.innerHTML = `<p style="color:red;">${err.message}</p>`;
      });

    // ✅ دالة فتح/غلق الدرس
    function toggleLesson(id) {
      const el = document.getElementById(id);
      el.style.display = (el.style.display === "none" ? "block" : "none");
    }


document.addEventListener("DOMContentLoaded", () => {
  const titles = document.querySelectorAll(".lesson-title");

  titles.forEach(title => {
    title.addEventListener("click", () => {
      const content = title.nextElementSibling;

      // التبديل بين الفتح والإغلاق
      content.classList.toggle("open");
    });
  });
});




