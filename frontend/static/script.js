// script.js
const apiUrl = "http://127.0.0.1:8000";

// Upload PDF
const uploadForm = document.getElementById("uploadForm");
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

  try {
    const res = await fetch(`${apiUrl}/upload/`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert("Upload successful! Now you can ask questions.");
  } catch (error) {
    alert("Upload failed.");
    console.error(error);
  }
});

// Chat
const askBtn = document.getElementById("askBtn");
askBtn.addEventListener("click", async () => {
  const apiKey = document.getElementById("apiKey").value;
  const sessionId = document.getElementById("sessionId").value;
  const input = document.getElementById("userInput").value;
  const messagesDiv = document.getElementById("messages");

  if (!input.trim()) return;

  messagesDiv.innerHTML += `<div class="message"><span class="user">You:</span> ${input}</div>`;

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
    messagesDiv.innerHTML += `<div class="message"><span class="assistant">Assistant:</span> ${data.answer}</div>`;
    document.getElementById("userInput").value = "";
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (error) {
    messagesDiv.innerHTML += `<div class="message error">Error: ${error.message}</div>`;
  }
});
