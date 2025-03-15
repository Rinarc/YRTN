const player = new Plyr('#player', {
    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
});

let currentSeries = null;
let currentEpisode = 0;

// 加载视频数据
async function loadData() {
    const response = await fetch('video.json');
    return await response.json();
}

// 初始化系列列表
function renderSeries(series) {
    const container = document.getElementById('seriesList');
    container.innerHTML = series.map((s, index) => `
        <div class="series-item ${index === 0 ? 'active' : ''}" 
             onclick="selectSeries(${index})">
            <h3>${s.title}</h3>
            <p>${s.episodes.length} 集</p>
        </div>
    `).join('');
    
    if (series.length > 0) {
        selectSeries(0);
    }
}

// 选择系列
function selectSeries(index) {
    loadData().then(series => {
        currentSeries = series[index];
        currentEpisode = 0;
        
        document.querySelectorAll('.series-item').forEach(item => 
            item.classList.remove('active'));
        document.querySelectorAll('.series-item')[index].classList.add('active');
        
        renderSeriesInfo();
        renderEpisodes();
        playEpisode(0);
    });
}

// 显示系列信息
function renderSeriesInfo() {
    const container = document.getElementById('seriesInfo');
    container.innerHTML = `
        <h2>${currentSeries.title}</h2>
        <p>${currentSeries.description}</p>
    `;
}

// 渲染分集列表
function renderEpisodes() {
    const container = document.getElementById('episodeList');
    container.innerHTML = currentSeries.episodes.map((episode, index) => `
        <div class="episode-card" onclick="playEpisode(${index})">
            <img src="${episode.thumbnail}" 
                 class="thumbnail" 
                 alt="${episode.title}">
            <div>
                <h3>第 ${index + 1} 集 · ${episode.title}</h3>
                <p>${episode.duration || '时长未知'}</p>
            </div>
        </div>
    `).join('');
}

// 播放指定分集
function playEpisode(index) {
    currentEpisode = index;
    const episode = currentSeries.episodes[index];
    
    player.source = {
        type: 'video',
        sources: [{
            src: episode.url,
            type: 'video/mp4'
        }]
    };
    
    updateEpisodeCounter();
    scrollToCurrentEpisode();
}

// 切换分集
function changeEpisode(step) {
    const newIndex = currentEpisode + step;
    if (newIndex >= 0 && newIndex < currentSeries.episodes.length) {
        playEpisode(newIndex);
    }
}

// 更新分集计数器
function updateEpisodeCounter() {
    document.getElementById('episodeCounter').textContent = 
        `第 ${currentEpisode + 1} / ${currentSeries.episodes.length} 集`;
}

// 自动滚动到当前分集
function scrollToCurrentEpisode() {
    const cards = document.getElementsByClassName('episode-card');
    if (cards[currentEpisode]) {
        cards[currentEpisode].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
}

// 初始化
loadData().then(series => {
    renderSeries(series);
    
    // 播放结束自动下一集
    player.on('ended', () => {
        if (currentEpisode < currentSeries.episodes.length - 1) {
            changeEpisode(1);
        }
    });
});
