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
    fetch(`${window.location.origin}/${courseId}/contant`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.status === 401) {
    //    window.location.href = "/home/home.html"
    contant.innerHTML=` <button id="popup-subscribe-btn" class="btn btn-primary btn-lg btn-block"onclick="window.location.href='/login/index.html'">سجل الدخول لرؤية المحتوي </button>
    `
      }
      if (!response.ok) throw new Error("حدث خطأ أثناء جلب البيانات");
      return response.json();
    })
    .then(data => {
      const contentArray = data.contant;
      for (let item of contentArray) {
        if (item.url===undefined) {
           item.url=`/home/Course.html?id=${courseId}`

        } 
   

        
    if(item.type=="video"){
      icon="fa-circle-play"
    }else if (item.type=="pdf"){
       icon="fa-file-lines"
    }else {
       icon="fa-image"
    }

        contant.innerHTML += `
   <div class="contant-div 1" onclick="window.location.href='/contant/${item.type}.html?course=${courseId}&id=${item._id}'">
    <p id="${item.type}">
      <i class="fa-solid ${icon} play-icon" style="color: #0088ff;"></i> | ${item.title}</p>
  </div>
`;

      }
    })
    .catch(err => {
      console.error("خطأ:", err.message);
    });


    



    