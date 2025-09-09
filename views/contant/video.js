const params = new URLSearchParams(window.location.search);
const vedioId = params.get("id");
const courseId = params.get("course");
const popText = document.querySelector(".modal-body")
var myModal = new bootstrap.Modal(document.getElementById('exampleModal'));

const videoTitle = document.getElementById("video-title");

function getYouTubeVideoId(url) {
  const regex =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&?].*)?$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function getContant(courseID, vedioId) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
     window.location.href = "/home/home.html"
      return;
    }

    const response = await fetch(`${window.location.origin}/${courseID}/${vedioId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();


    if (!response.ok) {
        popText.innerText=`${ data.msg || "حدث خطأ"}`
         myModal.show();
      return;
    }

    const videoBox = document.getElementById("video-box");

    if (videoTitle) {
      videoTitle.innerHTML = `<i class="fa-solid fa-video" style="color: #ffffff;"></i>${data.contant.title} `;
    }

    videoBox.innerHTML = `
    <div class="div1"></div>
    <div class="div2"></div>
    <div class="div3"></div>
      <iframe 
        src="https://www.youtube.com/embed/${getYouTubeVideoId(data.contant.url)}" 
        title="YouTube video player" 
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    `;
  } catch (error) {
    console.error("Error:", error);
    alert("فشل الاتصال بالسيرفر");
  }
}

getContant(courseId, vedioId);



const contant = document.querySelector(".contant");
const token = localStorage.getItem("token");
    if (!token) {
     
      window.location.href = "/login/index.html"; 
 

    }





    // --- جلب محتوى الكورس ---
function Sup() {
      return fetch(`${window.location.origin}/subscribe/${courseId}/${userId}`)
        .then(res => res.json())
        .then(data => {
          if(data.msg) {
            subscribeBtn.innerText = "مشترك";
            subscribeBtn.style.backgroundColor = "green";
            return true;
          } else {
            subscribeBtn.innerText = "اشترك";
            subscribeBtn.onclick = openPopup;
            return false;
          }
        })
        .catch(() => false);
    }

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




