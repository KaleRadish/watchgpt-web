// WatchGPT frontend logic
(function () {
  const chatFormEl = document.getElementById('chat-form');
  const userInputEl = document.getElementById('user-input');
  const chatOutputEl = document.getElementById('chat');
  const newChatBtn = document.getElementById('new-chat');
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');

  let currentChatId = null;
  let chatHistory = [];

  function renderMath() {
    renderMathInElement(chatOutputEl, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\(', right: '\)', display: false },
        { left: '\[', right: '\]', display: true }
      ]
    });
  }

  function autoWrapFullMathLines(text) {
    return text.split('\n').map(line => {
      const trimmed = line.trim();
      if (/^[\d\s\w\^\*\(\)\+\-\/=\.]+$/.test(trimmed) && /[\^=\/]/.test(trimmed)) {
        return `$$${trimmed}$$`;
      }
      return line;
    }).join('\n');
  }

  function saveChat(userMsg, aiMsg) {
    let chats = JSON.parse(localStorage.getItem('chatSessions') || '{}');
    if (!currentChatId) {
      currentChatId = Date.now().toString();
      chats[currentChatId] = [];
    }
    chats[currentChatId].push({ user: userMsg, ai: aiMsg });
    localStorage.setItem('chatSessions', JSON.stringify(chats));
  }

  function loadChat(chatId) {
    chatOutputEl.innerHTML = '';
    currentChatId = chatId;
    chatHistory = [];
    const chats = JSON.parse(localStorage.getItem('chatSessions') || '{}');
    const history = chats[chatId] || [];
    history.forEach(entry => {
      const userDiv = document.createElement('div');
      userDiv.className = 'msg user';
      userDiv.textContent = `You: ${entry.user}`;
      chatOutputEl.appendChild(userDiv);

      const aiDiv = document.createElement('div');
      aiDiv.className = 'msg ai';
      aiDiv.innerHTML = entry.ai;
      chatOutputEl.appendChild(aiDiv);

      chatHistory.push({ role: 'user', content: entry.user });
      chatHistory.push({ role: 'assistant', content: entry.ai });
    });
    renderMath();
  }

  function populateMenu() {
    const chats = JSON.parse(localStorage.getItem('chatSessions') || '{}');
    menu.innerHTML = '<h3>Previous Chats</h3>';
    for (const id in chats) {
      const title = chats[id][0]?.user?.slice(0, 40) || 'Untitled';
      const item = document.createElement('div');
      item.className = 'chat-item';
      item.textContent = title;
      item.onclick = () => {
        menu.classList.remove('visible');
        loadChat(id);
      };
      menu.appendChild(item);
    }
    menu.classList.add('visible');
  }

  newChatBtn.onclick = () => {
    currentChatId = null;
    chatHistory = [];
    chatOutputEl.innerHTML = '';
    userInputEl.value = '';
    userInputEl.focus();
  };

  menuBtn.onclick = () => {
    if (menu.classList.contains('visible')) {
      menu.classList.remove('visible');
    } else {
      populateMenu();
    }
  };

  chatFormEl.onsubmit = async (e) => {
    e.preventDefault();
    const question = userInputEl.value.trim();
    if (!question) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';
    userMsg.textContent = `You: ${question}`;
    chatOutputEl.appendChild(userMsg);
    userInputEl.value = '';

    chatHistory.push({ role: 'user', content: question });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'If the user asks a math-related question, reply with clear step-by-step solutions using LaTeX formatting. Use $$ for equations.'
            },
            ...chatHistory
          ]
        })
      });

      const data = await res.json();
      let reply = data.choices?.[0]?.message?.content || 'No response';
      reply = autoWrapFullMathLines(reply);

      const aiMsg = document.createElement('div');
      aiMsg.className = 'msg ai';
      aiMsg.innerHTML = reply;
      chatOutputEl.appendChild(aiMsg);

      chatHistory.push({ role: 'assistant', content: reply });
      saveChat(question, reply);
      renderMath();
    } catch (err) {
      const errMsg = document.createElement('div');
      errMsg.className = 'msg ai';
      errMsg.textContent = 'Connection error: ' + err.message;
      chatOutputEl.appendChild(errMsg);
    }
  };

  const sessions = JSON.parse(localStorage.getItem('chatSessions') || '{}');
  const ids = Object.keys(sessions);
  if (ids.length) loadChat(ids[ids.length - 1]);
})();
