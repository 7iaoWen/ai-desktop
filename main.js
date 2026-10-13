const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

let win;
const configPath = path.join(app.getPath('userData'), 'window-config.json');

// 读取保存的位置
function loadWindowPosition() {
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(data);
            return config;
        }
    } catch (e) {
        console.log('读取配置失败，使用默认位置');
    }
    return null;
}

// 保存窗口位置
function saveWindowPosition() {
    if (win && !win.isDestroyed()) {
        const [x, y] = win.getPosition();
        const config = { x, y };
        try {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        } catch (e) {
            console.log('保存配置失败:', e);
        }
    }
}

function createWindow() {
    const savedPosition = loadWindowPosition();
    
    win = new BrowserWindow({
        width: 420,
        height: 380,
        x: savedPosition ? savedPosition.x : undefined,
        y: savedPosition ? savedPosition.y : undefined,
        transparent: true,
        backgroundColor: '#00000000',
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
    win.setBackgroundColor('#00000000');

    win.on('moved', () => {
        saveWindowPosition();
    });

    win.on('close', () => {
        saveWindowPosition();
    });

    globalShortcut.register('CommandOrControl+Shift+Space', () => {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
            win.focus();
        }
    });
}

app.whenReady().then(createWindow);

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    saveWindowPosition();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ===== 退出功能 =====
ipcMain.on('quit-app', () => {
    app.quit();
});

// ===== 网易云音乐读取功能 =====

// 网易云音乐本地数据路径
function getNeteaseHistoryPath() {
    const username = os.userInfo().username;
    return `C:\\Users\\${username}\\AppData\\Local\\Netease\\CloudMusic\\webdata\\file\\history`;
}

// 读取当前播放的歌曲信息
function getCurrentSong() {
    try {
        const historyPath = getNeteaseHistoryPath();
        if (!fs.existsSync(historyPath)) {
            return null;
        }

        const data = fs.readFileSync(historyPath, 'utf8');
        const json = JSON.parse(data);
        
        if (json && json.length > 0) {
            const song = json[0];
            return {
                id: song.id,
                name: song.name,
                artist: song.artists ? song.artists.map(a => a.name).join(', ') : '未知歌手',
                album: song.album ? song.album.name : '未知专辑'
            };
        }
        return null;
    } catch (error) {
        console.log('读取网易云音乐信息失败:', error.message);
        return null;
    }
}

// 获取歌词（通过网易云API）
async function getLyrics(songId) {
    try {
        const response = await fetch(`https://api.netease.com/api/song/lyric?id=${songId}&lv=1`);
        const data = await response.json();
        if (data.lrc) {
            return data.lrc.lyric;
        }
        return null;
    } catch (error) {
        console.log('获取歌词失败:', error.message);
        return null;
    }
}

// 获取热门评论（通过网易云API）
async function getHotComments(songId) {
    try {
        const response = await fetch(`https://api.netease.com/api/comment/music?id=${songId}&limit=5`);
        const data = await response.json();
        if (data.hotComments && data.hotComments.length > 0) {
            return data.hotComments.map(c => c.content).slice(0, 3);
        }
        return null;
    } catch (error) {
        console.log('获取评论失败:', error.message);
        return null;
    }
}

// IPC 接口：获取当前歌曲信息（含歌词和评论）
ipcMain.handle('get-current-song', async () => {
    const song = getCurrentSong();
    if (!song) return null;
    
    // 获取歌词和评论
    const lyrics = await getLyrics(song.id);
    const comments = await getHotComments(song.id);
    
    return {
        ...song,
        lyrics: lyrics,
        comments: comments
    };
});