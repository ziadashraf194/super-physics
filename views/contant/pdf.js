
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

    fetch(`${window.location.origin}/${courseId}/contant`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.status === 401) {
        contant.innerHTML = `
          <button id="popup-subscribe-btn" class="btn btn-primary btn-lg btn-block"
            onclick="window.location.href='/login/index.html'">
            سجل الدخول لرؤية المحتوي
          </button>
        `;
        return;
      }
      if (!response.ok) throw new Error("حدث خطأ أثناء جلب البيانات");
      return response.json();
    })
    .then(data => {
      const contantArray = data.contant;
      for (let item of contantArray) {
        if (!item.url) {
          item.url = `/home/Course.html?id=${courseId}`;
        }

        let icon = "fa-file";
        if (item.type === "video") {
          icon = "fa-circle-play";
        } else if (item.type === "pdf") {
          icon = "fa-file-lines";
        } else if (item.type === "image") {
          icon = "fa-image";
        }

        contant.innerHTML += `
          <div class="contant-div" onclick="window.location.href='/contant/${item.type}.html?course=${courseId}&id=${item._id}'">
            <p id="${item.type}">
              <i class="fa-solid ${icon} play-icon" style="color: #0088ff;"></i> | ${item.title}
            </p>
          </div>
        `;
      }
    })
    .catch(err => {
      console.error("خطأ:", err.message);
    });
