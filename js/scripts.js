document.addEventListener('DOMContentLoaded', function () {
  const chatBox = document.getElementById('chat-box');
  const chatMessage = document.getElementById('chat-message');
  const submitQueryButton = document.getElementById('submit-query');
  const resetQueryButton = document.getElementById('reset-query');
  const cardBody = document.querySelector('.card-body');
  const uploadButton = document.getElementById('submit-file-upload');

  function addSystemMessage(message) {
    const botMessageContainer = document.createElement('div');
    botMessageContainer.className = 'bot-message-container';
    const botMessage = document.createElement('div');
    botMessage.className = 'chat-message bot-message markdown-content';
    botMessage.innerHTML = marked.parse(message);
    botMessageContainer.appendChild(botMessage);
    chatBox.appendChild(botMessageContainer);
    cardBody.scrollTop = cardBody.scrollHeight;
  }

  async function submitQuery() {
    let message = chatMessage.value.trim();
    if (message === "") {
      message = "Give me a bullet point list of all jays in Oregon.";
    }

    // Display user message
    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user-message');
    userMessage.textContent = message;
    chatBox.appendChild(userMessage);
    cardBody.scrollTop = cardBody.scrollHeight;

    chatMessage.value = '';
    chatMessage.style.height = 'auto';

    try {
      submitQueryButton.disabled = true;
      const botMessageContainer = document.createElement('div');
      botMessageContainer.className = 'bot-message-container';
      const botMessage = document.createElement('div');
      botMessage.className = 'chat-message bot-message markdown-content';
      botMessage.innerHTML = `
        <div class="bot-text">
          <div class="typing-dots">
            <div></div><div></div><div></div>
          </div>
        </div>`;
      botMessageContainer.appendChild(botMessage);
      chatBox.appendChild(botMessageContainer);
      cardBody.scrollTop = cardBody.scrollHeight;

      const response = await fetch('http://localhost:3000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: message })
      });

      if (!response.ok) {
        addSystemMessage('⚠️ Network error occurred. Please try again.');
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        botMessage.querySelector('.bot-text').innerHTML = marked.parse(result, {
          breaks: true,
        });
        cardBody.scrollTop = cardBody.scrollHeight;
      }

    } catch (error) {
      console.error('Error:', error);
      addSystemMessage('❌ An error occurred while processing your request.');
    } finally {
      submitQueryButton.disabled = false;
    }
  }

  // Event listeners remain the same
  submitQueryButton.addEventListener('click', submitQuery);

  chatMessage.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitQuery();
    }
  });

  chatMessage.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  resetQueryButton.addEventListener('click', () => {
    chatMessage.value = '';
    chatMessage.style.height = 'auto';
    chatBox.innerHTML = '';
    addSystemMessage('💬 Chat history cleared. Start a new conversation!');
  });

  document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Show loading state
    uploadButton.disabled = true;
    uploadButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing files...';
    addSystemMessage('⏳ Processing files and creating stores...');


    const formData = new FormData();
    const files = document.getElementById('file-upload').files;

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        addSystemMessage(`⚠️ File ${file.name} exceeds 10MB limit`);
        return;
      }
      formData.append('files', file);
    });

    if (files.length > 5) {
      addSystemMessage('⚠️ Maximum 5 files allowed');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Upload failed');
      }

      const data = await response.json();
      if (data.success) {
        const fileNames = data.files.map(f => f.originalName).join(', ');
        addSystemMessage(`✅ Index created successfully!\n📚 Added documents: ${fileNames}`);
      }

    } catch (error) {
      addSystemMessage('❌ Error creating index: ' + error.message);
    } finally {
      uploadButton.disabled = false;
      uploadButton.innerHTML = 'Upload PDFs';
    }
  });
});