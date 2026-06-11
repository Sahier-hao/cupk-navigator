/**
 * player.js —— 跨页面背景音乐播放器
 *
 * 功能说明：
 * - 右下角浮动小组件，所有页面共享同一播放器实例，切换页面不影响播放
 * - 支持播放/暂停、上一首/下一首切换、音量调节、进度拖拽
 * - 播放状态（当前曲目索引、音量、播放状态、播放进度）通过 localStorage 持久化，
 *   页面切换后自动恢复进度，实现跨页面无缝续播
 * - 自动切歌：当前曲目播放完毕后自动加载下一首并继续播放
 * - 加载失败自动跳过：单曲加载出错后等待 1.5 秒自动切换到下一首
 * - 浏览器自动播放策略兼容：若被浏览器阻止自动播放，
 *   监听用户首次点击页面任意位置后恢复播放
 *
 * 依赖：svgIcon() 全局函数（定义于 common.js），用于生成内联 SVG 图标
 *
 * 数据结构（localStorage key: shiguang_player）：
 * {
 *   trackIndex: number,    // 当前播放曲目在 playlist 中的索引（从 0 开始）
 *   volume: number,        // 音量，范围 0~1
 *   isPlaying: boolean,    // 是否正在播放中
 *   currentTime: number    // 当前播放进度，单位秒
 * }
 */

/* ---- IIFE 立即执行函数：隔离作用域，防止变量污染全局命名空间 ---- */
(function () {
  var STORE_KEY = "shiguang_player";
  /* ---- 播放列表：预定义曲目（标题、艺术家、音频文件路径） ---- */
  var playlist = [
    { title: "黄昏之时", artist: "兮沐", file: "music/黄昏之时-兮沐.mp3" },
    { title: "Call of Silence", artist: "澤野弘之", file: "music/Call of Silence-澤野弘之.mp3" },
    { title: "magnolia", artist: "Dr.Phonk", file: "music/magnolia-Dr.Phonk.mp3" },
    { title: "诀别书", artist: "Cloudin", file: "music/诀别书-Cloudin.mp3" },
  ];

  /**
   * 从 localStorage 读取播放器持久化状态
   * @returns {object} 解析后的状态对象；若数据不存在或 JSON 解析失败则返回空对象
   *
   * 注意：
   * - 使用 try-catch 包裹，防止 localStorage 不可用或数据损坏导致程序崩溃
   * - 返回空对象时，调用方需为各个属性提供默认值
   */
  function loadState() {
    try { var raw = localStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
  }

  /**
   * 将播放器部分状态合并写入 localStorage
   * @param {object} state - 要保存的状态键值对（例如 { volume: 0.5, isPlaying: true }）
   *
   * 写入策略：
   * - 先读取当前完整状态对象，再将传入的属性覆盖写入，
   *   避免因只写入部分属性而丢失其他属性的值
   */
  function saveState(state) {
    try {
      var current = loadState();
      for (var k in state) { current[k] = state[k]; }
      localStorage.setItem(STORE_KEY, JSON.stringify(current));
    } catch (e) {}
  }

  /* ---- 初始化播放状态：从 localStorage 读取上次状态，缺失的属性使用默认值 ---- */
  var state = loadState();
  if (state.trackIndex === undefined) { state.trackIndex = 0; }
  if (state.volume === undefined) { state.volume = 0.3; }
  if (state.isPlaying === undefined) { state.isPlaying = true; }
  if (state.currentTime === undefined) { state.currentTime = 0; }

  var audio = new Audio();
  audio.volume = state.volume;
  audio.preload = "auto";

  /* ---- 创建播放器 DOM 结构并注入页面 ---- */

  // 创建播放器容器 div，默认收起（music-player-collapsed），设置无障碍标签
  var playerBar = document.createElement("div");
  playerBar.className = "music-player music-player-collapsed";
  playerBar.setAttribute("aria-label", "背景音乐播放器");

  // 播放器内部 HTML 结构（使用 svgIcon 生成内联 SVG 图标）：
  // - mp-toggle：展开/折叠触发按钮
  // - mp-body：播放器主体（曲目标题 + 控制按钮 + 进度条 + 音量滑块 + 时间显示）
  playerBar.innerHTML =
    '<button class="mp-toggle" title="展开播放器" aria-label="展开播放器">' + window.svgIcon("icon-music", 18) + "</button>" +
    '<div class="mp-body">' +
    '  <span class="mp-track">Call of Silence</span>' +
    '  <div class="mp-actions">' +
    '    <button class="mp-btn mp-prev" title="上一首" aria-label="上一首">' + window.svgIcon("icon-skip-back", 14) + "</button>" +
    '    <button class="mp-btn mp-play" title="播放" aria-label="播放">' + window.svgIcon("icon-play", 13) + "</button>" +
    '    <button class="mp-btn mp-next" title="下一首" aria-label="下一首">' + window.svgIcon("icon-skip-forward", 14) + "</button>" +
    "  </div>" +
    '  <input class="mp-progress" type="range" min="0" max="100" step="0.1" value="0" title="进度" aria-label="播放进度" />' +
    '  <input class="mp-volume" type="range" min="0" max="100" step="1" value="30" title="音量" aria-label="音量" />' +
    '  <span class="mp-time">00:00</span>' +
    "</div>";
  document.body.appendChild(playerBar);

  /* ---- DOM 引用：缓存播放器内部 UI 元素，避免重复 DOM 查询 ---- */
  var mpToggle = playerBar.querySelector(".mp-toggle");
  var mpTrack = playerBar.querySelector(".mp-track");
  var mpPlayBtn = playerBar.querySelector(".mp-play");
  var mpPrevBtn = playerBar.querySelector(".mp-prev");
  var mpNextBtn = playerBar.querySelector(".mp-next");
  var mpProgress = playerBar.querySelector(".mp-progress");
  var mpVolume = playerBar.querySelector(".mp-volume");
  var mpTime = playerBar.querySelector(".mp-time");

  /**
   * 将秒数格式化为 MM:SS 格式的字符串
   * @param {number} sec - 要格式化的秒数（可能为 NaN 或负数）
   * @returns {string} 格式化后的时间字符串，例如 "01:23"
   *
   * 边界处理：
   * - 输入为 NaN 或负数时返回 "00:00"
   * - 分钟和秒数均补零到两位（如 "03:05"）
   */
  function fmtTime(sec) {
    if (isNaN(sec) || sec < 0) return "00:00";
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  /**
   * 加载指定索引的曲目
   * @param {number} index - 目标曲目在 playlist 数组中的索引（允许越界，内部取模修正）
   *
   * 功能说明：
   * - 通过取模运算 (index + length) % length 确保索引始终在合法范围内，实现循环播放
   * - 设置 audio.src 并调用 load() 触发浏览器加载音频文件
   * - 更新界面显示当前曲目标题
   * - 持久化当前曲目索引，并将播放进度重置为 0
   */
  function loadTrack(index) {
    state.trackIndex = (index + playlist.length) % playlist.length;
    var track = playlist[state.trackIndex];
    audio.src = encodeURI(track.file);
    audio.load();
    mpTrack.textContent = track.title;
    mpToggle.innerHTML = window.svgIcon("icon-music", 18);
    saveState({ trackIndex: state.trackIndex, currentTime: 0 });
  }

  /**
   * 开始（或恢复）播放
   *
   * 播放流程：
   * 1. 检查当前 audio.src 是否与目标曲目一致，不一致则调用 loadTrack 加载新曲目
   * 2. 调用 audio.play() 开始播放
   * 3. 播放成功后更新按钮图标为"暂停"，保存播放状态到 localStorage
   * 4. 若播放失败（浏览器自动播放策略限制），提示用户点击页面任意位置以恢复播放
   *    同时注册一次性点击事件监听，用户首次点击页面后自动恢复播放
   *
   * 自动播放策略兼容：多数浏览器要求用户先与页面交互才能播放音频，
   * 因此当 play() 被浏览器拒绝时，通过 document click 事件等待用户主动交互
   */
  function play() {
    var track = playlist[state.trackIndex];
    // 判断当前 audio 是否已加载目标曲目：若 src 为空或不匹配则重新加载
    var needLoad = !audio.src || audio.src.indexOf(encodeURI(track.file)) === -1;
    if (needLoad) loadTrack(state.trackIndex);
    audio.play().then(function () {
      // 播放成功：更新界面图标为暂停，标记播放状态并持久化
      state.isPlaying = true;
      mpPlayBtn.innerHTML = window.svgIcon("icon-pause", 13);
      mpPlayBtn.title = "暂停";
      mpPlayBtn.setAttribute("aria-label", "暂停");
      mpToggle.innerHTML = window.svgIcon("icon-music", 18);
      saveState({ isPlaying: true });
    }).catch(function () {
      // 播放被浏览器阻止（自动播放策略），切换到"等待用户交互"模式
      mpToggle.innerHTML = window.svgIcon("icon-music", 18);
      mpToggle.title = "点击页面任意位置开始播放";
      // 注册一次性点击事件：用户首次点击页面任意位置后尝试恢复播放，然后移除监听
      var resumeOnce = function () {
        audio.play().then(function () {
          state.isPlaying = true;
          mpPlayBtn.innerHTML = window.svgIcon("icon-pause", 13);
          mpPlayBtn.title = "暂停";
          mpPlayBtn.setAttribute("aria-label", "暂停");
          mpToggle.innerHTML = window.svgIcon("icon-music", 18);
          saveState({ isPlaying: true });
        }).catch(function () {});
        document.removeEventListener("click", resumeOnce);
      };
      document.addEventListener("click", resumeOnce);
    });
  }

  /**
   * 暂停播放
   * 更新播放按钮图标为"播放"样式，持久化当前播放进度到 localStorage
   */
  function pause() {
    audio.pause();
    state.isPlaying = false;
    mpPlayBtn.innerHTML = window.svgIcon("icon-play", 13);
    mpPlayBtn.title = "播放";
    mpPlayBtn.setAttribute("aria-label", "播放");
    mpToggle.innerHTML = window.svgIcon("icon-music", 18);
    saveState({ isPlaying: false, currentTime: audio.currentTime || 0 });
  }

  // 播放/暂停切换：根据当前 isPlaying 状态调用对应的 play() 或 pause()
  function togglePlay() {
    if (state.isPlaying) pause(); else play();
  }

  /**
   * 恢复播放状态 —— 页面加载完成后调用
   * 根据 localStorage 中保存的 state 恢复上次的曲目、进度和播放状态
   *
   * 恢复策略：
   * - 如果上次是暂停状态，仅加载曲目不自动播放
   * - 如果上次是播放状态，则加载曲目后尝试跳转到上次进度并继续播放
   * - 若音频已缓冲完毕（readyState >= 1），直接设置 currentTime，避免等待 loadedmetadata 事件
   */
  function restorePlayback() {
    if (!state.isPlaying) { loadTrack(state.trackIndex); return; }
    loadTrack(state.trackIndex);
    audio.onloadedmetadata = function () {
      if (state.currentTime > 0) audio.currentTime = state.currentTime;
      play();
    };
    if (audio.readyState >= 1 && state.currentTime > 0) {
      audio.currentTime = state.currentTime;
      play();
    }
  }

  // 播放/暂停按钮：点击切换播放状态
  mpPlayBtn.addEventListener("click", togglePlay);
  // 上一首按钮：先暂停当前播放，加载上一首曲目，再开始播放
  mpPrevBtn.addEventListener("click", function () { pause(); loadTrack(state.trackIndex - 1); play(); });
  // 下一首按钮：先暂停当前播放，加载下一首曲目，再开始播放
  mpNextBtn.addEventListener("click", function () { pause(); loadTrack(state.trackIndex + 1); play(); });

  // 进度条拖拽事件：将滑块百分比转换为音频时间并跳转到对应位置
  mpProgress.addEventListener("input", function () {
    var pct = parseFloat(mpProgress.value);
    if (!isNaN(audio.duration)) audio.currentTime = (pct / 100) * audio.duration;
  });

  // 音量滑块事件：调节 audio.volume（范围 0~1），并将音量值持久化
  if (mpVolume) {
    mpVolume.value = state.volume * 100;
    mpVolume.addEventListener("input", function () {
      var vol = parseFloat(mpVolume.value) / 100;
      audio.volume = vol;
      saveState({ volume: vol });
    });
  }

  /* ---- 其他交互：播放器折叠切换 ---- */

  // 默认收起播放器，点击展开/折叠按钮切换面板显示状态
  playerBar.classList.add("music-player-collapsed");
  mpToggle.addEventListener("click", function () {
    playerBar.classList.toggle("music-player-collapsed");
  });

  // 当前曲目播放完毕：自动暂停 -> 加载下一首 -> 继续播放（循环播放模式）
  audio.addEventListener("ended", function () { pause(); loadTrack(state.trackIndex + 1); play(); });

  // 播放进度更新事件（约每秒触发 4 次）：同步进度条滑块位置及时间显示
  // 每 5 秒将当前进度持久化到 localStorage，保证页面意外关闭时进度不丢失
  audio.addEventListener("timeupdate", function () {
    if (!isNaN(audio.duration)) {
      mpProgress.value = (audio.currentTime / audio.duration) * 100;
      mpTime.textContent = fmtTime(audio.currentTime) + " / " + fmtTime(audio.duration);
    }
    if (Math.floor(audio.currentTime) % 5 === 0) {
      saveState({ currentTime: audio.currentTime });
    }
  });

  // 曲目元数据（时长等）加载完成后，更新时间显示区域的曲目总时长
  audio.addEventListener("loadedmetadata", function () {
    mpTime.textContent = "00:00 / " + fmtTime(audio.duration);
  });

  // 音频加载出错时的处理：界面显示"加载失败"，1.5 秒后自动尝试下一首
  // 若当前为播放状态则继续播放，实现出错自动跳过
  audio.addEventListener("error", function () {
    mpToggle.innerHTML = window.svgIcon("icon-music", 18);
    mpTrack.textContent = "加载失败…";
    setTimeout(function () {
      loadTrack(state.trackIndex + 1);
      if (state.isPlaying) play();
    }, 1500);
  });

  // 页面关闭或刷新前保存当前播放状态（曲目标引、播放进度、播放状态），确保下次打开精确恢复
  window.addEventListener("beforeunload", function () {
    saveState({ currentTime: audio.currentTime || 0, isPlaying: state.isPlaying, trackIndex: state.trackIndex });
  });

  // 启动播放器：根据 localStorage 中的状态，恢复上次的曲目、进度和播放/暂停状态
  restorePlayback();
})();
