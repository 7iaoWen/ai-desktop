const { ipcRenderer } = require('electron');

// ===== DOM 元素 =====
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const characterSelect = document.getElementById('character-select');
const settingsBtn = document.getElementById('settings-btn');
const settingsOverlay = document.getElementById('settings-overlay');
const closeSettings = document.getElementById('close-settings');
const systemPrompt = document.getElementById('system-prompt');
const userName = document.getElementById('user-name');
const userPreference = document.getElementById('user-preference');
const saveSettingsBtn = document.getElementById('save-settings');
const resetSettingsBtn = document.getElementById('reset-settings');
const viewerStatus = document.getElementById('viewer-status');
const viewerToggle = document.getElementById('viewer-toggle');
const viewerInterval = document.getElementById('viewer-interval');
const viewerGame = document.getElementById('viewer-game');
const viewerStyle = document.getElementById('viewer-style');
const quitBtn = document.getElementById('quit-btn');

// ===== 角色库 =====
const CHARACTERS = {
    default: {
        name: '默认助手',
        system: '你是一个桌面AI助手，回答简洁友好，像朋友一样聊天。使用中文回复。不要使用任何 Emoji 或表情符号。'
    },
    cat: {
        name: '猫娘',
        system: '你是一只可爱的猫娘，说话带"喵~"，活泼俏皮。回答简短可爱，可以用颜文字，但不要使用 Emoji 表情符号。'
    },
    teacher: {
        name: '教师',
        system: '你是一位耐心的教师，回答详细、有条理，会用例子解释复杂概念。语气温和专业。不要使用任何 Emoji 或表情符号。'
    },
    poet: {
        name: '诗人',
        system: '你是一位浪漫的诗人，说话富有诗意，喜欢用比喻和优美的语言。回答充满想象力。不要使用任何 Emoji 或表情符号。'
    },
    hacker: {
        name: '黑客',
        system: '你是一位技术极客，说话简洁直接，喜欢用技术术语。回答精准、高效率。不要使用任何 Emoji 或表情符号。'
    }
};

// ===== 情绪关键词映射 =====
const EMOTION_KEYWORDS = {
    happy: ['开心', '高兴', '太好了', '棒', '好呀', '哈哈', '嘻嘻', '耶', '赞', '喜欢', '爱', '好', '不错', '厉害'],
    sad: ['难过', '伤心', '可惜', '唉', '呜呜', '遗憾', '失落', '难受', '哭了', '痛苦', '悲伤'],
    angry: ['生气', '烦', '讨厌', '气死', '无语', '过分', '恶心', '可恶', '滚', '垃圾'],
    confused: ['？', '什么', '不懂', '奇怪', '疑惑', '为啥', '怎么', '晕', '吗', '呢'],
    excited: ['哇', '太棒了', '牛逼', '刺激', '激动', '期待', '冲', '爽', '酷'],
    tired: ['累了', '困了', '疲惫', '不想', '算了', '随便', '歇了', '好累'],
    default: ['好的', '行', '嗯', 'OK', '明白', '知道', '了解', '收到']
};

// ===== 情绪对应的表情包文件名 =====
const EMOTION_EMOJIS = {
    happy: [
        'miku_happy_1.webp',
        'miku_happy_2.webp',
        'miku_happy_3.webp',
        'miku_happy_4.webp',
        'miku_happy_5.webp',
        'miku_happy_6.webp',
        'miku_happy_7.webp',
        'miku_happy_8.webp',
        'miku_happy_9.webp',
        'miku_happy_10.webp',
        'miku_happy_11.webp',
        'miku_happy_12.webp',
        'miku_happy_13.webp',
        'miku_happy_14.webp'
    ],
    sad: [
        'miku_sad_1.webp',
        'miku_sad_2.webp',
        'miku_sad_4.webp',
        'miku_sad_5.webp',
        'miku_sad_6.webp',
        'miku_sad_7.webp',
        'miku_sad_8.webp',
        'miku_sad_9.webp',
        'miku_sad_10.webp',
        'miku_sad_11.webp',
        'miku_sad_12.webp',
        'miku_sad_13.webp',
        'miku_sad_14.webp'
    ],
    angry: [
        'miku_angry_1.webp',
        'miku_angry_2.webp',
        'miku_angry_3.webp',
        'miku_angry_4.webp',
        'miku_angry_5.webp',
        'miku_angry_6.webp',
        'miku_angry_7.webp',
        'miku_angry_8.webp',
        'miku_angry_9.webp',
        'miku_angry_10.webp'
    ],
    confused: [
        'miku_confused_1.webp',
        'miku_confused_2.webp',
        'miku_confused_3.webp',
        'miku_confused_4.webp',
        'miku_confused_5.webp',
        'miku_confused_6.webp',
        'miku_confused_7.webp',
        'miku_confused_8.webp'
    ],
    excited: [
        'miku_excited_1.webp',
        'miku_excited_2.webp',
        'miku_excited_3.webp',
        'miku_excited_4.webp',
        'miku_excited_5.webp',
        'miku_excited_6.webp',
        'miku_excited_7.webp',
        'miku_excited_8.webp'
    ],
    tired: [
        'miku_tired_1.webp',
        'miku_tired_2.webp',
        'miku_tired_3.webp',
        'miku_tired_4.webp',
        'miku_tired_5.webp'
    ],
    default: [
        'miku_default_1.webp',
        'miku_default_2.webp',
        'miku_default_3.webp',
        'miku_default_4.webp',
        'miku_default_5.webp',
        'miku_default_6.webp',
        'miku_default_7.webp',
        'miku_default_8.webp',
        'miku_default_9.webp',
        'miku_default_10.webp',
        'miku_default_11.webp',
        'miku_default_12.webp',
        'miku_default_13.webp',
        'miku_default_14.webp'
    ]
};

// ===== 判断情绪 =====
function detectEmotion(text) {
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                return emotion;
            }
        }
    }
    return 'default';
}

// ===== 获取随机表情包 =====
function getRandomEmoji(emotion) {
    const emojis = EMOTION_EMOJIS[emotion] || EMOTION_EMOJIS.default;
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// ===== 状态 =====
let currentCharacter = 'default';
let userConfig = { name: '', preference: '' };
let viewerConfig = { interval: 15, game: '游戏', style: 'random' };
let history = [];
let viewerTimer = null;
let isViewerActive = false;
let lastSongId = null; // 用于记录上一首歌的ID，避免重复触发

// ===== 构建 system prompt =====
function buildSystemPrompt(charKey) {
    const char = CHARACTERS[charKey];
    let prompt = char.system;
    if (userConfig.name || userConfig.preference) {
        prompt += '\n\n【用户信息】';
        if (userConfig.name) prompt += '\n- 用户的名字是：' + userConfig.name;
        if (userConfig.preference) prompt += '\n- 用户的偏好：' + userConfig.preference;
        prompt += '\n请根据这些信息调整你的回答。';
    }
    return prompt;
}

// ===== 添加消息（AI消息随机带表情包） =====
function addMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = 'message ' + (isUser ? 'user-msg' : 'ai-msg');

    if (!isUser) {
        const shouldShowEmoji = Math.random() < 0.7;
        
        if (shouldShowEmoji) {
            const emotion = detectEmotion(text);
            const emojiFileName = getRandomEmoji(emotion);
            const imgPath = 'images/emojis/' + emojiFileName;

            const textNode = document.createTextNode(text + ' ');
            div.appendChild(textNode);

            const img = document.createElement('img');
            img.src = imgPath;
            img.alt = '表情包';
            img.style.cssText = 'width: 60px; height: 60px; vertical-align: middle; border-radius: 6px;';
            img.onerror = function() {
                this.style.display = 'none';
            };
            div.appendChild(img);
        } else {
            div.textContent = text;
        }
    } else {
        div.textContent = text;
    }

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ===== 显示/隐藏思考中 =====
function showThinking() {
    const div = document.createElement('div');
    div.className = 'message ai-msg';
    div.textContent = '⋯';
    div.id = 'thinking';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function removeThinking() {
    const el = document.getElementById('thinking');
    if (el) el.remove();
}

// ===== 初始化角色 =====
function initCharacter(charKey) {
    currentCharacter = charKey;
    const systemContent = buildSystemPrompt(charKey);
    history = [{ role: 'system', content: systemContent }];
    messagesEl.innerHTML = '';
    characterSelect.value = charKey;
}

// ===== 调用 API =====
async function callDeepSeek(messages, isViewer = false) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error('API密钥未设置');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            stream: false,
            max_tokens: isViewer ? 150 : 512,
            temperature: isViewer ? 1.0 : 0.9
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error('API错误 (' + response.status + '): ' + err);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

// ===== 发送消息（用户主动） =====
async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';

    addMessage(text, true);
    history.push({ role: 'user', content: text });
    showThinking();

    try {
        const reply = await callDeepSeek(history, false);
        removeThinking();
        addMessage(reply, false);
        history.push({ role: 'assistant', content: reply });
        if (history.length > 20) {
            history = [history[0]].concat(history.slice(-10));
        }
    } catch (error) {
        removeThinking();
        addMessage('⚠️ ' + error.message, false);
        console.error(error);
    }
}

// ===== 获取网易云音乐信息并生成评论 =====
async function getMusicComment() {
    try {
        const songInfo = await ipcRenderer.invoke('get-current-song');
        if (!songInfo) {
            return null;
        }

        // 检查是否切歌了
        if (songInfo.id === lastSongId) {
            return null; // 没切歌，不重复触发
        }
        lastSongId = songInfo.id;

        // 构建提示词
        let prompt = `你正在听《${songInfo.name}》- ${songInfo.artist}`;
        
        if (songInfo.lyrics) {
            // 截取歌词的前几句
            const lyricLines = songInfo.lyrics.split('\n').filter(line => line.trim() && !line.includes('[ti:') && !line.includes('[ar:'));
            const sampleLyrics = lyricLines.slice(0, 4).join('\n');
            prompt += `\n\n歌词片段：\n${sampleLyrics}`;
        }
        
        if (songInfo.comments && songInfo.comments.length > 0) {
            prompt += `\n\n热门评论：\n${songInfo.comments.join('\n')}`;
        }

        prompt += `\n\n根据这首歌的信息，用一句话简短评论或吐槽，不超过20个字。风格${viewerConfig.style === 'random' ? '随机' : viewerConfig.style}。`;

        const messages = [
            { role: 'system', content: '你是一个音乐听众，会对听到的歌随口发表评论。语言自然，像真人说话。' },
            { role: 'user', content: prompt }
        ];

        const reply = await callDeepSeek(messages, true);
        return reply.length > 25 ? reply.slice(0, 25) + '…' : reply;

    } catch (error) {
        console.error('获取音乐评论错误:', error);
        return null;
    }
}

// ===== 碎碎念：生成游戏评论或音乐评论 =====
async function viewerComment() {
    if (!isViewerActive) return;

    // 50% 概率检查音乐，50% 概率继续游戏评论
    const shouldCheckMusic = Math.random() < 0.5;
    
    if (shouldCheckMusic) {
        const musicReply = await getMusicComment();
        if (musicReply) {
            addMessage('🎵 ' + musicReply, false);
            return;
        }
    }

    // 如果没有音乐或者音乐没触发，走原来的游戏评论逻辑
    try {
        const gameName = viewerConfig.game || '游戏';
        
        let style = viewerConfig.style || 'random';
        if (style === 'random') {
            const styles = ['吐槽向', '鼓励向', '迷惑向', '玩梗向', '观众向'];
            style = styles[Math.floor(Math.random() * styles.length)];
        }

        const styleMap = {
            '吐槽向': '用犀利毒舌的方式评论这局游戏，要搞笑',
            '鼓励向': '用朋友间调侃的方式加油打气，要温暖',
            '迷惑向': '假装看不懂但强行分析一波，要幽默',
            '玩梗向': '用游戏圈流行的梗来吐槽，要接地气',
            '观众向': '像直播间弹幕一样随口说一句，要自然'
        };

        const styleDesc = styleMap[style] || styleMap['观众向'];
        const prompt = `你正在看朋友玩《${gameName}》。${styleDesc}。说一句话，不超过15个字，要像朋友在旁边随口说的。不要重复之前的话。`;

        const messages = [
            { role: 'system', content: '你是一个游戏观众，会随口说一些有趣的游戏评论。语言自然，像真人说话。每次说的内容都不一样。' },
            { role: 'user', content: prompt }
        ];

        const reply = await callDeepSeek(messages, true);
        const finalReply = reply.length > 25 ? reply.slice(0, 25) + '…' : reply;
        addMessage('🎮 ' + finalReply, false);

    } catch (error) {
        console.error('碎碎念错误:', error);
        const fallbacks = [
            '这波操作，我上我也行！',
            '稳住，我们能赢！',
            '对面是不是在演我？',
            '这游戏有毒，但我爱玩！',
            '队友呢？队友呢？队友呢？',
            '打完这把就睡！',
            '我怀疑你在秀，但我没有证据',
            '这个版本到底谁在赢啊？',
            '操作有点下饭啊兄弟',
            '这波不亏，对面交技能了'
        ];
        const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        addMessage('🎮 ' + fallback, false);
    }
}

// ===== 切换观众模式 =====
function toggleViewer() {
    isViewerActive = !isViewerActive;

    if (isViewerActive) {
        const interval = parseInt(viewerInterval.value) || 15;
        viewerStatus.textContent = '👀 理理我';
        viewerStatus.classList.add('active');
        viewerToggle.classList.add('active');
        lastSongId = null; // 重置歌曲ID，以便检测新歌
        addMessage('🎮 碎碎念模式已开启！我会偶尔吐槽你的游戏和音乐', false);

        if (viewerTimer) clearInterval(viewerTimer);
        viewerTimer = setInterval(viewerComment, interval * 1000);
        setTimeout(viewerComment, 1000);

    } else {
        viewerStatus.textContent = '👀 哼~';
        viewerStatus.classList.remove('active');
        viewerToggle.classList.remove('active');
        if (viewerTimer) {
            clearInterval(viewerTimer);
            viewerTimer = null;
        }
        addMessage('🎮 那我闭嘴咯~', false);
    }
}

// ===== 设置面板 =====
function openSettings() {
    const char = CHARACTERS[currentCharacter];
    systemPrompt.value = char.system;
    userName.value = userConfig.name || '';
    userPreference.value = userConfig.preference || '';
    viewerInterval.value = viewerConfig.interval || 15;
    viewerGame.value = viewerConfig.game || '游戏';
    viewerStyle.value = viewerConfig.style || 'random';
    
    const overlay = document.getElementById('settings-overlay');
    overlay.style.display = 'flex';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0, 0, 0, 0.5)';
    overlay.style.backdropFilter = 'blur(8px)';
    overlay.style.webkitBackdropFilter = 'blur(8px)';
    overlay.style.zIndex = '999';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.borderRadius = '0';
    overlay.style.overflow = 'hidden';
}

function closeSettingsPanel() {
    const overlay = document.getElementById('settings-overlay');
    overlay.style.display = 'none';
}

function saveSettings() {
    userConfig.name = userName.value.trim();
    userConfig.preference = userPreference.value.trim();
    const char = CHARACTERS[currentCharacter];
    char.system = systemPrompt.value.trim() || char.system;

    viewerConfig.interval = parseInt(viewerInterval.value) || 15;
    viewerConfig.game = viewerGame.value.trim() || '游戏';
    viewerConfig.style = viewerStyle.value || 'random';

    initCharacter(currentCharacter);
    closeSettingsPanel();
    addMessage('✅ 设定已保存！', false);

    if (isViewerActive) {
        if (viewerTimer) clearInterval(viewerTimer);
        viewerTimer = setInterval(viewerComment, viewerConfig.interval * 1000);
    }
}

function resetSettings() {
    const defaultChar = CHARACTERS[currentCharacter];
    systemPrompt.value = defaultChar.system;
    userName.value = '';
    userPreference.value = '';
    viewerInterval.value = '15';
    viewerGame.value = '游戏';
    viewerStyle.value = 'random';
}

// ===== 事件绑定 =====
sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
});

characterSelect.addEventListener('change', function(e) {
    initCharacter(e.target.value);
});

viewerToggle.addEventListener('click', toggleViewer);

settingsBtn.addEventListener('click', openSettings);
closeSettings.addEventListener('click', closeSettingsPanel);
settingsOverlay.addEventListener('click', function(e) {
    if (e.target === settingsOverlay) closeSettingsPanel();
});
saveSettingsBtn.addEventListener('click', saveSettings);
resetSettingsBtn.addEventListener('click', resetSettings);

if (quitBtn) {
    quitBtn.addEventListener('click', () => {
        ipcRenderer.send('quit-app');
    });
}

// ===== 启动 =====
initCharacter('default');
inputEl.focus();