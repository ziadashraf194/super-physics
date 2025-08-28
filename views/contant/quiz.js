// ------------------- Select Elements -------------------
let countSpan = document.querySelector(".count span");
let bullets = document.querySelector(".bullets");
let bulletsSpanContainer = document.querySelector(".bullets .spans");
let quizArea = document.querySelector(".quiz-area");
let answersArea = document.querySelector(".answers-area");
let submitButton = document.querySelector(".submit-button");
let resultsContainer = document.querySelector(".results");
let countdownElement = document.querySelector(".countdown");

// ------------------- Back Button -------------------
let backButton = document.createElement("button");
backButton.innerText = "رجوع";
backButton.className = "back-button";
backButton.style.display = "none";
submitButton.parentNode.insertBefore(backButton, submitButton.nextSibling);

// ------------------- User Info -------------------
const token = localStorage.getItem('token'); 

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

let userId = parseJwt(token)?.id;

// ------------------- Get Params -------------------
const params = new URLSearchParams(window.location.search);
const quizID = params.get("id");
const courseId = params.get("course");

// ------------------- Global Variables -------------------
let quizData = null;
let questionsObject = [];
let currentIndex = 0;
let userAnswers = {};
let countdownInterval;
let examDuration = 0;
let remainingTime = 0;

// ------------------- حفظ واسترجاع التقدم -------------------
function saveProgress() {
  localStorage.setItem("quizProgress", JSON.stringify({
    userAnswers,
    currentIndex,
    remainingTime,
    quizID,
    courseId,
    userId
  }));
}

function loadProgress() {
  let saved = localStorage.getItem("quizProgress");
  if (!saved) return false;

  let data = JSON.parse(saved);
  if (data.quizID === quizID && data.courseId === courseId && data.userId === userId) {
    userAnswers = data.userAnswers || {};
    remainingTime = data.remainingTime || examDuration;

    if (typeof data.currentIndex === "number") {
      currentIndex = data.currentIndex;
    }

    return true;
  }
  return false;
}

function clearProgress() {
  localStorage.removeItem("quizProgress");
}

// ------------------- تحديث ألوان البولت -------------------
function updateBulletsState() {
  const bulletsSpans = document.querySelectorAll(".bullets .spans span");
  bulletsSpans.forEach((span, index) => {
    span.classList.toggle("answered", !!userAnswers[index]);
  });
}

// ------------------- Fetch Questions -------------------
async function getQuestions() {
  try {
    if (!token) {
      window.location.href = "/login/index.html";
      return;
    }

    const response = await fetch(`/${courseId}/${quizID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Error fetching quiz:", text);
      alert("حدث خطأ أثناء جلب الكويز");
      return;
    }

    quizData = await response.json();
    examDuration = quizData.contant.exam_duration * 60;
    questionsObject = quizData.contant.questions;
    const qCount = questionsObject.length;


    createBullets(qCount);

    if (loadProgress()) {
      if (typeof currentIndex !== "number" || currentIndex >= qCount) {
        currentIndex = 0;
      }

      if (remainingTime <= 0) {
        showResults(qCount);
        return;
      }

      updateBulletsState();
      renderQuestion(currentIndex);
      submitButton.onclick = handleSubmit;
      clearInterval(countdownInterval);
      countdown(remainingTime, qCount);

    } else {
      currentIndex = 0; // ابدأ بالسؤال الأول إذا لا يوجد تقدم
      updateBulletsState();
      renderQuestion(currentIndex);
      submitButton.onclick = handleSubmit;
      clearInterval(countdownInterval);
      countdown(examDuration, qCount);
    }

  } catch (error) {
    console.error("Error:", error);
    alert("فشل الاتصال بالسيرفر");
  }
}

getQuestions();

// ------------------- Create Bullets -------------------
function createBullets(num) {
  countSpan.innerHTML = num;
  bulletsSpanContainer.innerHTML = "";

  for (let i = 0; i < num; i++) {
    const theBullet = document.createElement("span");
    theBullet.innerText = `${i + 1}`;
    theBullet.dataset.index = i;
    if (i === currentIndex) theBullet.className = "on";

    theBullet.addEventListener("click", function () {
      saveCurrentAnswer();
      currentIndex = parseInt(this.dataset.index);
      renderQuestion(currentIndex);
    });

    bulletsSpanContainer.appendChild(theBullet);
  }
}

function handleBackButtonVisibility() {
  backButton.style.display = currentIndex === 0 ? "none" : "inline-block";
}

// ------------------- Render Question -------------------
function renderQuestion(index) {
  quizArea.innerHTML = "";
  answersArea.innerHTML = "";

  const questionObj = questionsObject[index];
  addQuestionData(questionObj, questionsObject.length);
  handleBullets();

  const savedAnswer = userAnswers[index];
  if (savedAnswer) {
    const inputs = document.getElementsByName("question");
    inputs.forEach((input) => {
      if (input.dataset.answer === savedAnswer) input.checked = true;
    });
  }

  const answers = document.getElementsByName("question");
  answers.forEach(input => input.addEventListener("change", saveCurrentAnswer));

  handleBackButtonVisibility();
}

// ------------------- Add Question and Answers -------------------
function addQuestionData(obj, count) {
  if (currentIndex < count) {
    const questionImg = document.createElement("img");
    questionImg.src = obj["title"];
    questionImg.alt = "Question Image";
    questionImg.className = "question-img";
    quizArea.appendChild(questionImg);

    for (let i = 1; i <= 4; i++) {
      const mainDiv = document.createElement("div");
      mainDiv.className = "answer";

      const radioInput = document.createElement("input");
      radioInput.name = "question";
      radioInput.type = "radio";
      radioInput.id = `answer_${i}`;
      radioInput.dataset.answer = `answer_${i}`;

      const theLabel = document.createElement("label");
      theLabel.htmlFor = `answer_${i}`;
      theLabel.appendChild(document.createTextNode(obj[`answer_${i}`]));

      mainDiv.appendChild(radioInput);
      mainDiv.appendChild(theLabel);
      answersArea.appendChild(mainDiv);
    }
  }
}

// ------------------- Save Answer -------------------
function saveCurrentAnswer() {
  const answers = document.getElementsByName("question");
  let answered = false;

  for (let i = 0; i < answers.length; i++) {
    if (answers[i].checked) {
      userAnswers[currentIndex] = answers[i].dataset.answer;
      answered = true;
    }
  }

  const bulletsSpans = document.querySelectorAll(".bullets .spans span");
  if (bulletsSpans[currentIndex]) {
    bulletsSpans[currentIndex].classList.toggle("answered", answered);
  }

  saveProgress();
}

// ------------------- Submit Button -------------------
function handleSubmit() {
  const qCount = questionsObject.length;
  saveCurrentAnswer();

  currentIndex++;

  if (currentIndex < qCount) {
    renderQuestion(currentIndex);
  } else {
    showResults(qCount);
  }
}

// ------------------- Back Button -------------------
backButton.onclick = function () {
  if (currentIndex > 0) {
    saveCurrentAnswer();
    currentIndex--;
    renderQuestion(currentIndex);
  }
  handleBackButtonVisibility();
};

// ------------------- Highlight Bullets -------------------
function handleBullets() {
  const bulletsSpans = document.querySelectorAll(".bullets .spans span");
  bulletsSpans.forEach((span, index) => {
    span.classList.toggle("on", index === currentIndex);
  });
}

// ------------------- Countdown -------------------
function countdown(duration, count) {
  remainingTime = duration;
  if (currentIndex < count) {
    countdownInterval = setInterval(function () {
      let minutes = parseInt(remainingTime / 60);
      let seconds = parseInt(remainingTime % 60);

      minutes = minutes < 10 ? `0${minutes}` : minutes;
      seconds = seconds < 10 ? `0${seconds}` : seconds;

      countdownElement.innerHTML = `${minutes}:${seconds}`;

      saveProgress();

      if (--remainingTime < 0) {
        clearInterval(countdownInterval);
        saveCurrentAnswer();
        showResults(count);
      }
    }, 1000);
  }
}

// ------------------- Show Results -------------------
async function showResults(count) {
  quizArea.remove();
  answersArea.remove();
  submitButton.remove();
  backButton.remove();
  bullets.remove();

  try {
    const questionsObject = quizData.contant.questions;
    let totalScore = 0;
    let results = [];

    // حساب النتائج قبل مسح الإجابات
    questionsObject.forEach((q, index) => {
      const correctAnswer = q.right_answer;
      const userAnswer = userAnswers[index] || null;
      if (userAnswer === correctAnswer) totalScore++;
      results.push({
        question: q.title,
        answers: q.answers,
        correctAnswer,
        userAnswer,
        isCorrect: userAnswer === correctAnswer
      });
    });

    // عرض النتيجة
    let theResults = (totalScore === count) ? `<span class="perfect">ممتاز</span>, ${totalScore} من ${count}`
                   : (totalScore >= count/2) ? `<span class="good">ناجح</span>, ${totalScore} من ${count}`
                   : `<span class="bad">راسب</span>, ${totalScore} من ${count}`;

    resultsContainer.innerHTML = `<h2>${quizData.contant.title}</h2>` + theResults;

    // إرسال النتائج للسيرفر
    const response = await fetch(`/result?=${quizID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        studentId: userId,
        courseId,
        quizID,
        results,
        score: totalScore
      })
    });
    await response.json();

    // ✅ بعد عرض النتائج، نجعل الإجابات غير مجابة للمرة القادمة
    userAnswers = {};
    saveProgress();

  } catch (error) {
    console.error("Error showing results:", error);
    resultsContainer.innerHTML = `<span class="bad">خطأ في عرض النتيجة</span>`;
  }
}
