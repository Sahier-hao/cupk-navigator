/**
 * effects.js —— 石光驿站 前端特效模块
 *
 * 本文件包含项目中使用的所有视觉增强特效，所有特效均通过 IIFE（立即调用函数表达式）包裹，
 * 拥有独立作用域，避免变量泄漏到全局命名空间造成冲突。每个特效都可以独立运作，互不依赖。
 *
 * 包含特效：
 *   1. Hero Canvas 粒子系统   —— 首页 Hero 区域的浮动粒子背景动画
 *   2. 浮动渐变 Blob          —— 页面背景中的柔和彩色渐变装饰元素
 *   3. 全屏页面过渡           —— 页面切换时的视觉过渡效果（当前已禁用）
 *   4. 数字滚动计数器         —— 统计数据进入视口时触发的数字递增动画
 *
 * 性能优化策略：
 *   - 尊重用户 prefers-reduced-motion 系统设置，检测到后自动禁用所有动画特效
 *   - 在移动设备（无 hover 能力或缺少精细指针）上跳过粒子效果以节省 GPU 资源
 *   - 粒子数量精简为 25 个，不使用连线/光晕/鼠标交互等高消耗特性
 *   - 使用 requestAnimationFrame 驱动动画循环，自动与屏幕刷新率同步，页面不可见时暂停
 */
(function () {
  // 检测用户是否设置了"减少动画"的辅助功能偏好
  // 若开启此项，则跳过所有动态特效以尊重用户设置并提升可访问性
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 检测是否为移动设备：根据 CSS hover 和 pointer:fine 媒体特性判断
  // 移动设备上 CPU/GPU 资源有限，跳过粒子特效以保证页面滚动和交互的流畅度
  var isMobile = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ================================================================
   * 1. Hero Canvas 粒子系统（轻量高性能版）
   * ----------------------------------------------------------------
   * 在首页 Hero 区域叠加一个透明 Canvas 绘制浮动粒子，营造动态背景效果。
   *
   * 设计决策（性能优先）：
   *   - 仅 25 个粒子，每帧操作极少，不导致重绘瓶颈
   *   - 无粒子间连线，减少 Canvas draw 调用次数
   *   - 无光晕/辉光效果，避免阴影模糊带来的 GPU 渲染压力
   *   - 无鼠标交互（不追踪鼠标位置），减少事件监听和额外重绘
   *   - Canvas 设置 pointer-events: none，确保不阻挡下方内容的点击事件
   * ================================================================ */
  /**
   * 初始化 Hero 区域粒子系统
   *
   * 查找页面中 id 为 heroSection 的元素，在其内部创建全尺寸 Canvas 元素，
   * 生成一组随机粒子并通过 requestAnimationFrame 循环驱动其运动。
   *
   * 前置条件：页面中必须存在 #heroSection 元素，否则静默退出不执行任何操作。
   * 退出条件：若用户启用了 prefers-reduced-motion 或是移动设备，则跳过初始化。
   *
   * 副作用：向 #heroSection 内追加一个 Canvas 元素，并在 window.resize 上注册事件。
   *
   * @returns {void} 无返回值
   */
  function initParticles() {
    var hero = document.getElementById("heroSection");
    if (!hero) return;
    if (prefersReduced || isMobile) return;

    // 创建全尺寸 Canvas 元素，覆盖整个 Hero 区域
    // pointer-events:none 使其不拦截鼠标事件，确保下方交互元素正常可用
    // opacity:0.55 保持粒子半透明，避免过于醒目而喧宾夺主
    var canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0.55;";
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
    hero.appendChild(canvas);
    // 获取 Canvas 2D 绘图上下文，所有粒子绘制操作均通过此对象完成
    var ctx = canvas.getContext("2d");

    // 粒子数组，用于存储所有 Particle 实例，供动画循环遍历绘制
    var particles = [];
    // 粒子总数设为 25 个，在视觉效果与渲染性能之间取得平衡
    var COUNT = 25;

    /**
     * 粒子构造函数
     *
     * 创建一个具有随机初始位置、随机速度、随机半径、随机透明度
     * 和随机颜色的粒子对象。所有属性在初始化时一次性确定，后续不再变化
     * （位置除外，由 update 方法每帧更新）。
     *
     * 属性说明：
     *   x, y    —— 粒子在 Canvas 上的初始位置（像素值）
     *   vx, vy  —— 粒子在水平和垂直方向上的速度分量（像素/帧），范围约 -0.175 ~ +0.175
     *   r       —— 粒子绘制半径（像素），范围 0.8 ~ 2.6
     *   alpha   —— 粒子透明度，范围 0.2 ~ 0.6
     *   color   —— 粒子颜色 RGB 前缀字符串（不含 alpha 通道），
     *              拼接 alpha 值后形成完整 RGBA 颜色值
     *              颜色池：[暖棕, 冷蓝, 纯白] 三种配色
     */
    function Particle() {
      this.x = Math.random() * canvas.width;                  // 水平位置：0 ~ Canvas 宽度
      this.y = Math.random() * canvas.height;                 // 垂直位置：0 ~ Canvas 高度
      this.vx = (Math.random() - 0.5) * 0.35;                 // 水平速度：随机方向，低速
      this.vy = (Math.random() - 0.5) * 0.35;                 // 垂直速度：随机方向，低速
      this.r = Math.random() * 1.8 + 0.8;                     // 半径：0.8~2.6 像素，小粒子更精致
      this.alpha = Math.random() * 0.4 + 0.2;                 // 透明度：0.2~0.6，半透明层次感
      // 从三种颜色中随机选取一种作为粒子颜色，使画面色彩更丰富
      this.color = ["rgba(212,133,106,", "rgba(91,155,213,", "rgba(255,255,255,"][Math.floor(Math.random() * 3)];
    }
    /**
     * 更新粒子位置
     *
     * 按当前速度移动粒子位置，当粒子碰到 Canvas 四周边界时反弹（对应方向速度取反）。
     * 此方法每帧由 animate 循环对每个粒子调用一次。
     *
     * @returns {void}
     */
    Particle.prototype.update = function () {
      this.x += this.vx;   // 水平方向移动
      this.y += this.vy;   // 垂直方向移动
      // 边界碰撞检测：若粒子超出 Canvas 左右边界，水平速度取反（水平反弹）
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      // 边界碰撞检测：若粒子超出 Canvas 上下边界，垂直速度取反（垂直反弹）
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    };

    for (var i = 0; i < COUNT; i++) particles.push(new Particle());

    // 窗口大小改变时，同步更新 Canvas 尺寸以匹配 Hero 区域的新尺寸
    // 避免粒子绘制到 Canvas 可见区域之外，或 Canvas 过小显示不全
    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    window.addEventListener("resize", resize);

    /**
     * 动画主循环——粒子系统的核心驱动
     *
     * 每帧执行以下操作：
     *   1. 清空整个 Canvas（清除上一帧的绘制内容）
     *   2. 遍历所有粒子，依次调用 update() 更新位置并重新绘制圆形
     *   3. 通过 requestAnimationFrame 请求下一帧，形成持续动画
     *
     * 使用 requestAnimationFrame 而非 setInterval/setTimeout 的优势：
     *   - 与显示器刷新率同步（通常 60fps），画面更流畅无撕裂
     *   - 页面切换至后台或不可见时自动暂停，节省 CPU/GPU 资源
     *   - 移动端更省电，减少不必要的电池消耗
     */
    function animate() {
      // 清空 Canvas 上的所有内容，为绘制新帧做准备
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 遍历所有粒子，逐个更新位置并绘制到 Canvas 上
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.update();                     // 更新粒子位置（包含边界反弹检测）
        ctx.beginPath();                // 开始一段新的绘制路径
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);  // 绘制圆形路径（起始角 0 到 360 度）
        ctx.fillStyle = p.color + p.alpha + ")";  // 拼接完整 RGBA 颜色字符串
        ctx.fill();                     // 填充圆形，完成此粒子的绘制
      }
      // 请求浏览器在下一帧调用 animate，形成持续动画循环
      requestAnimationFrame(animate);
    }
    // 启动动画循环，开始粒子的运动与绘制
    animate();
  }

  /* ================================================================
   * 2. 浮动渐变 Blob 装饰
   * ----------------------------------------------------------------
   * 在页面背景中创建两片柔和彩色渐变圆形元素，通过 CSS 动画使其缓慢浮动，
   * 营造类似毛玻璃光晕的视觉层次感，丰富页面背景的细节。
   *
   * 性能考量：
   *   - Blob 的 CSS filter: blur() 模糊半径保持较小值，降低 GPU 渲染压力
   *   - 仅创建 2 个 Blob 元素，不对布局造成显著影响
   *
   * 可访问性：
   *   - 设置 aria-hidden="true" 告知屏幕阅读器忽略此装饰元素
   *   - 因其纯装饰性质，不承载任何语义信息，无需被辅助技术识别
   * ================================================================ */
  /**
   * 初始化浮动 Blob 装饰元素
   *
   * 在文档 body 的开头（最底层）插入两个带有 blob 样式的 div 元素。
   * 具体的浮动动画和渐变色彩由 CSS（.floating-blobs 及相关类）控制，
   * 本函数仅负责创建 DOM 结构，不涉及样式逻辑。
   *
   * 退出条件：若用户启用了 prefers-reduced-motion，跳过创建，不产生额外 DOM 节点。
   *
   * @returns {void}
   */
  function initBlobs() {
    // 如果用户偏好减少动画，则不创建 Blob 装饰，直接退出
    if (prefersReduced) return;
    // 创建一个容器 div，用于承载两个 Blob 子元素
    var container = document.createElement("div");
    container.className = "floating-blobs";
    // 标记为纯装饰元素，辅助技术（如屏幕阅读器）应忽略此节点
    container.setAttribute("aria-hidden", "true");
    // 插入两个 Blob 子元素到容器中，具体的 CSS 动画和渐变样式在 common.css 中定义
    container.innerHTML = '<div class="blob blob-1"></div><div class="blob blob-2"></div>';
    // 将 Blob 容器插入到 body 的最前面，使其位于页面所有内容的底层作为背景装饰
    document.body.prepend(container);
  }

  /* ================================================================
   * 3. 全屏页面过渡覆盖层（已废弃）
   * ----------------------------------------------------------------
   * 之前的页面切换动画效果，现已移除。其功能已由首页的 splash 启动画面替代。
   * 保留此空函数仅用于占位，避免调用处 ReferenceError，实际不执行任何操作。
   *
   * 移除原因：页面过渡动画与动态渲染的 header/footer 机制存在兼容性问题，
   * 且增加了页面跳转的等待时间，影响用户体验。
   * ================================================================ */
  /**
   * 初始化全屏页面过渡效果（已废弃）
   *
   * 当前为空函数，不做任何操作。保留方法签名以确保调用链完整性。
   *
   * @returns {void}
   */
  function initPageTransition() {
    /* 此功能已移除，保留空函数占位 */
  }

  /* ================================================================
   * 4. 数字滚动递增计数器
   * ----------------------------------------------------------------
   * 当带有 .stat-num 类的元素进入视口（用户可见区域）时，
   * 以动画形式从 0 递增到目标数值，用于统计数据（如用户数、资源数等）的展示。
   *
   * 核心机制：
   *   - 使用 IntersectionObserver API 检测元素是否进入视口
   *   - 使用 easeOutCubic 缓动函数（1 - (1-p)³）使动画先快后慢，观感更自然
   *   - 动画完成（到达目标值）后取消观察，避免重复触发浪费性能
   *   - 元素文本中的数字后缀（如 "+"、"K"）会被正确保留
   * ================================================================ */
  /**
   * 初始化数字滚动计数器
   *
   * 查找页面中所有 class 包含 "stat-num" 的元素，为每个元素注册
   * IntersectionObserver。当元素进入视口超过 50% 时，触发从 0 到目标值的
   * 递增动画。
   *
   * 数字解析规则：
   *   1. 取元素文本中开头的连续数字部分作为目标数值
   *   2. 数字后的剩余文本（如 "+"、"K"、"人"等）作为后缀保留
   *   3. 动画过程中实时更新元素文本为"当前数值 + 后缀"
   *   4. 动画结束后恢复原始文本（确保最终数值精确）
   *
   * 浏览器兼容性：需要 IntersectionObserver API 支持，不支持则静默退出。
   *
   * @returns {void}
   */
  function initCountUp() {
    // 浏览器兼容性检查：不支持 IntersectionObserver 则直接退出，不执行任何操作
    if (!("IntersectionObserver" in window)) return;
    // 获取页面中所有带有 .stat-num 类的 DOM 元素（通常是统计数字）
    var statNums = document.querySelectorAll(".stat-num");
    // 如果页面中没有统计数字元素，无需初始化，直接返回
    if (!statNums.length) return;
    // 创建 IntersectionObserver 实例，监视元素是否进入用户视口
    var observer = new IntersectionObserver(function (entries) {
      // 遍历所有触发回调的被观察元素
      entries.forEach(function (entry) {
        // 仅处理进入视口的元素（从不可见变为可见，isIntersecting === true）
        if (!entry.isIntersecting) return;
        var el = entry.target;                   // 当前触发回调的 DOM 元素
        var text = el.textContent.trim();         // 获取元素原始文本并去除首尾空格
        var match = text.match(/^(\d+)/);          // 用正则提取开头的连续数字
        // 如果元素文本中不包含数字（如纯文字），则跳过处理
        if (!match) return;
        // targetNum: 目标终值，即 text 中开头的数字部分，如 "1234+" 中的 1234
        var targetNum = parseInt(match[1], 10);
        // suffix: 数字后面的非数字后缀，如 "1234+" 中的 "+"，"999K" 中的 "K"
        var suffix = text.slice(match[1].length);
        var current = 0;          // 当前计数值，动画从 0 开始递增
        var duration = 1000;      // 动画总时长：1000 毫秒（即 1 秒）
        var start = performance.now();  // 记录动画开始时刻的高精度时间戳

        /**
         * 动画帧步进函数
         *
         * 由 requestAnimationFrame 每帧调用一次，计算当前进度并更新元素显示内容。
         * 使用 easeOutCubic 缓动函数使动画先快后慢，模拟物理惯性效果。
         *
         * @param {number} now - 由 requestAnimationFrame 传入的当前高精度时间戳
         * @returns {void}
         */
        function step(now) {
          // p: 线性进度比，范围 0~1（当前已用时间 / 总时长），超过 1 时截断为 1
          var p = Math.min((now - start) / duration, 1);
          // eased: easeOutCubic 缓动函数公式：1 - (1 - p)³
          // 效果对比线性：开始阶段数字增长较快，接近目标时逐渐减速
          // 这种缓动方式在视觉上更符合"冲刺后减速"的直观感受
          var eased = 1 - Math.pow(1 - p, 3);
          // 根据缓动后的进度计算当前应显示的整数值，向下取整保证不超目标
          current = Math.floor(targetNum * eased);
          // 更新元素的显示文本为"当前数值 + 后缀"
          el.textContent = current + suffix;
          if (p < 1) {
            // 动画尚未完成（p < 1），继续请求下一帧
            requestAnimationFrame(step);
          } else {
            // 动画已完成（p >= 1），将元素文本恢复为原始完整内容
            // 这样做是为了处理浮点数累计精度问题，确保显示值与原始目标完全一致
            el.textContent = text;
          }
        }
        // 启动第一帧动画，浏览器将在下次重绘前调用 step 函数
        requestAnimationFrame(step);
        // 动画已启动，取消对该元素的观察，避免用户滚动时重复触发
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });  // 配置：元素进入视口比例达到 50% 时触发回调
    // 为每个统计数字元素注册观察器，开始监听其可见性变化
    statNums.forEach(function (el) { observer.observe(el); });
  }

  /* ================================================================
   * 启动入口
   * ----------------------------------------------------------------
   * 在 DOM 内容加载完成后依次初始化所有特效模块。
   * 事件注册在 DOMContentLoaded 上（而非 window.onload），
   * 确保在样式表和图片等资源完全加载前即可启动动画，
   * 减少用户的等待时间，提升感知性能（Perceived Performance）。
   *
   * 初始化顺序说明：
   *   1. initBlobs()        —— 先创建背景装饰层，插入 body 最前作为底层
   *   2. initParticles()    —— 再叠加前景粒子特效到 Hero 区域
   *   3. initPageTransition() —— 页面过渡（已废弃，保留调用占位）
   *   4. initCountUp()      —— 最后注册 IntersectionObserver，等待统计数字进入视口
   * ================================================================ */
  document.addEventListener("DOMContentLoaded", function () {
    // 按照从背景到前景的顺序初始化各特效模块
    initBlobs();            // 2. 浮动渐变 Blob 装饰（底层背景效果）
    initParticles();        // 1. Hero 粒子系统（叠加在 Hero 区域上方的前景效果）
    initPageTransition();   // 3. 页面过渡覆盖层（已废弃，保留空函数占位）
    initCountUp();          // 4. 数字滚动计数器（被动触发，等待 .stat-num 进入视口）
  });
})();
