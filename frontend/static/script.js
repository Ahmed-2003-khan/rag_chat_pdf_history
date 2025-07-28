
const apiUrl = "http://127.0.0.1:8000";

function formatTimestamp(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(role, text, timestamp) {
  const messagesDiv = document.getElementById("messages");
  const isUser = role === "user";
  const avatarUrl = isUser
    ? "https://ui-avatars.com/api/?name=You&background=101415&color=1aff7c&size=40&bold=true"
    : "https://ui-avatars.com/api/?name=AI&background=1aff7c&color=101415&size=40&bold=true";
  const bubbleClass = isUser ? "user-message" : "assistant-message";
  const formattedText = isUser ? text : marked.parse(text);
  const time = timestamp || formatTimestamp(new Date());
  const messageHTML = `
    <div class="message ${bubbleClass}">
      <img src="${avatarUrl}" class="avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}" alt="${isUser ? 'User' : 'Assistant'}" />
      <div class="bubble">${formattedText}</div>
      <span class="timestamp">${time}</span>
    </div>
  `;
  messagesDiv.innerHTML += messageHTML;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Upload progress bar
const uploadForm = document.getElementById("uploadForm");
const uploadProgress = document.getElementById("uploadProgress");
const progressBar = document.getElementById("progressBar");
const uploadMessage = document.getElementById("uploadMessage");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const apiKey = document.getElementById("apiKey").value;
  const sessionId = document.getElementById("sessionId").value;
  const files = document.getElementById("pdfFile").files;
  const formData = new FormData();
  formData.append("session_id", sessionId);
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
  uploadProgress.style.display = "block";
  progressBar.style.width = "0%";
  uploadMessage.textContent = "";
  try {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiUrl}/upload/`, true);
    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        progressBar.style.width = percent + "%";
      }
    };
    xhr.onload = function () {
      uploadProgress.style.display = "none";
      if (xhr.status === 200) {
        uploadMessage.textContent = "Upload successful! Now you can ask questions.";
        uploadMessage.style.color = "#0077cc";
      } else {
        uploadMessage.textContent = "Upload failed. Please try again.";
        uploadMessage.style.color = "#d32f2f";
      }
    };
    xhr.onerror = function () {
      uploadProgress.style.display = "none";
      uploadMessage.textContent = "Upload failed. Please try again.";
      uploadMessage.style.color = "#d32f2f";
    };
    xhr.send(formData);
  } catch (err) {
    uploadProgress.style.display = "none";
    uploadMessage.textContent = "Upload failed. Please try again.";
    uploadMessage.style.color = "#d32f2f";
  }
});

// Chat logic
const askBtn = document.getElementById("askBtn");
const userInput = document.getElementById("userInput");
const typingIndicator = document.getElementById("typingIndicator");

askBtn.addEventListener("click", async () => {
  const apiKey = document.getElementById("apiKey").value;
  const sessionId = document.getElementById("sessionId").value;
  const input = userInput.value;
  if (!input.trim()) return;
  appendMessage("user", input);
  userInput.value = "";
  typingIndicator.style.display = "flex";
  try {
    const res = await fetch(`${apiUrl}/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groq_api_key: apiKey,
        session_id: sessionId,
        question: input,
      }),
    });
    const data = await res.json();
    typingIndicator.style.display = "none";
    appendMessage("assistant", data.answer);
  } catch (err) {
    typingIndicator.style.display = "none";
    appendMessage("assistant", "<span style='color:#d32f2f'>Error: Could not get a response. Please try again.</span>");
  }
});

userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    askBtn.click();
  }
});

// Dark mode toggle
const darkModeToggle = document.getElementById("darkModeToggle");
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "1" : "0");
});
// Default to dark mode
if (localStorage.getItem("darkMode") !== "0") {
  document.body.classList.add("dark-mode");
}
