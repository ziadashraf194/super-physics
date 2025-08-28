const authToken = localStorage.getItem('token'); 

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('خطأ في فك التوكن:', e);
    return null;
  }
}

const userId = authToken ? parseJwt(authToken)?.id : null;


async function checkAdmin() {
  if (!userId) return false;

  try {
    const response = await fetch(`/api/verify/admin/${userId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
      }
    });

    let data;
    try {
      data = await response.json();
    } catch(e) {
      console.error("الرد ليس JSON:", await response.text());
      return false;
    }

    return response.ok && data.isAdmin === true;
  } catch (err) {
    console.error("فشل الاتصال بالسيرفر", err);
    return false;
  }
}

window.onload = async function () {
  // حقن الهيدر
  document.getElementById("header").innerHTML = `
    <link rel="stylesheet" href="/header/style.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="/home/home.html"><img class="Logo" src="/uploads/Logo.jpg" alt=""></a>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" href="/home/home.html">الرئيسية</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/home/allCourses.html">الكورسات</a>
            </li>
          </ul>
        </div>
        <div class="regist" id="regist">
          <a href="/register/index.html"><button type="button" class="btn btn-outline-primary">إنشاء حساب</button></a>
          <a href="/login/index.html"><button type="button" class="btn btn-outline-secondary">تسجيل الدخول</button></a>
        </div>
    </nav>
  `;

  // حقن الفوتر
  document.getElementById("footer").innerHTML = `
    <footer>
      <h4>Developed by <span>Ziad Ashraf</span> 
        <i class="fa-regular fa-heart fa-flip"></i>
      </h4>
    </footer>
    <!-- Loader -->
<div id="loader" class="loader-overlay" style="display: none;">
  <div class="spinner"></div>
</div>

<style>
  .loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  .spinner {
    border: 6px solid #f3f3f3;
    border-top: 6px solid #007bff;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>

<script>
  // دوال مساعدة
  function showLoader() {
    document.getElementById("loader").style.display = "flex";
  }
  function hideLoader() {
    document.getElementById("loader").style.display = "none";
  }

  // ✅ Override للـ fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    showLoader();
    try {
      const response = await originalFetch(...args);
      return response;
    } catch (err) {
      console.error("Fetch error:", err);
      throw err;
    } finally {
      hideLoader();
    }
  };
</script>

  `;

  const regist = document.getElementById("regist");

  if (authToken && userId) {
    const isAdmin = await checkAdmin();

    let buttonsHTML = '';
    if (isAdmin) {
      buttonsHTML += `<button type="button" class="btn btn-success" id="admin" onclick="window.location.href='/admin/admin.html'">لوحة التحكم</button> `;
    }

    buttonsHTML += `<button type="button" class="btn btn-outline-danger" onclick="logout()">تسجيل الخروج</button>`;
    regist.innerHTML = buttonsHTML;

  } else {
     regist.innerHTML = `
    <div class="btn-wrapper">
      <a href="/register/index.html"><button type="button" class="blue-btn">إنشاء حساب</button></a>
      <a href="/login/index.html"><button type="button" class="blue-btn">تسجيل الدخول</button></a>
    </div>
  `;
  }
};

function logout() {
  localStorage.removeItem("token");
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/login/index.html";
}
