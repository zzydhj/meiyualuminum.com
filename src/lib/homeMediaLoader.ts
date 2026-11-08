/**
 * 首页素材加载器（T6 重构，2026-11-08）
 *
 * 首页「什么时候下载什么」的全部逻辑集中在这一份文件里，`src/pages/index.astro` 的
 * script 只调用 startHomeMediaLoader() 一次。重构前它散在同一段的四个 IIFE 里，
 * 其中三层兜底是为了修上一层自己引入的 bug 而加的（业主 2026-11-07 指出），
 * 所以这次的目标不是提速，是把同一件事只说一遍。
 *
 * 优先级阶梯（业主 2026-11-07 定的口径，改之前先想清楚为什么要改顺序）：
 *   P1 静态首屏（HTML/CSS/首屏图）        —— 浏览器自己干，本文件只在 load 后把
 *                                            首屏 1.25 屏高以内的 lazy 图升 eager（P1.5）
 *   P2 hero 视频（LCP 元素）              —— HeroLoader
 *   P3 画廊首格视频                        —— wireVideoGallery 的 featured 分支
 *   P4 滚动区图片  P5 隐藏 Tab 图  P6 其余视频 —— 预热队列 LADDER
 * 前三级由各自的实现负责，LADDER 只补后三级；任何一级都不许越过前一级抢带宽。
 *
 * 三条铁律（每条都用真金白银的实测换来，别顺手"优化"掉）：
 * 1. video.load() 是「重置」不是「确保已加载」：它掐掉进行中的下载、把 currentTime
 *    推回片段起点再重拉。所以只有「屏幕上还没解出任何一帧」时才允许重试，
 *    且首发只能生效一次。2026-11-07 的回归症状就是「播几秒跳回 0 重播」。
 * 2. Range 是 privileged no-CORS header，页面 JS 设了会被静默剥掉，fetch 退化成 200
 *    整包。想热视频只能用真实 <video> 走媒体层（206 + 分片缓存）。
 * 3. fetch() 的 Promise 在响应头到达就 resolve，不等 body。预热必须把 body 读完，
 *    否则整条队列会在两三百毫秒里把几十张图全发出去（2026-11-07 实测过）。
 *
 * 另有一条不变量：requestIdleCallback 在隐藏标签页/后台窗口里可能一直不执行，
 * 所以本文件里每一个 idle 都配硬超时（同一个坑不踩第二次）。
 */

/* ============================================================
   运行环境画像：整段只读一次，各处按同一份判断，不许各自 matchMedia
   ============================================================ */
export interface NetProfile {
    /** 省流量开关：整条预热队列直接不跑 */
    saveData: boolean;
    /** 2G：只跳 P6 视频档，图片照跑 */
    slowNet: boolean;
    /** <1024px：不预热视频，也不做整页铺图（手机上是白花的流量） */
    desktop: boolean;
    /** 偏好减少动态：首格不自播、P6 不预热 */
    reduceMotion: boolean;
}

function readProfile(): NetProfile {
    const conn = (
        navigator as Navigator & {
            connection?: { saveData?: boolean; effectiveType?: string };
        }
    ).connection;
    return {
        saveData: !!conn?.saveData,
        slowNet: /2g/.test(conn?.effectiveType || ""),
        desktop: window.matchMedia("(min-width: 1024px)").matches,
        reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
}

/* ============================================================
   共用小工具
   ============================================================ */
const nap = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 等主线程空闲。三个数各管一件事，必须按调用点逐一对着重构前的行为：
 *   ricTimeout —— 有 rIC 时最多再等这么久（浏览器自己保证会执行）
 *   noRicDelay —— 没有 rIC 的浏览器（Safari）多久硬做
 *   hardMs     —— 额外一个硬兜底：后台标签页里 rIC 可能一直不执行，连它的
 *                timeout 也不跳，所以只能靠一个独立定时器保证一定开始。
 *                hero 和预热队列各配了一个，P1.5 没配（图晚点铺不伤 LCP）。
 */
function onIdle(opts: {
    ricTimeout: number;
    noRicDelay: number;
    hardMs?: number;
}): Promise<void> {
    return new Promise((res) => {
        let done = false;
        const go = () => {
            if (done) return;
            done = true;
            res();
        };
        if (typeof requestIdleCallback === "function") {
            requestIdleCallback(go, { timeout: opts.ricTimeout });
        } else {
            setTimeout(go, opts.noRicDelay);
        }
        if (opts.hardMs) setTimeout(go, opts.hardMs);
    });
}

/** window load 之后才动的事，统一走这一个入口（readyState 已经 complete 的场合也要对） */
function afterLoad(fn: () => void): void {
    if (document.readyState === "complete") {
        fn();
        return;
    }
    window.addEventListener("load", fn, { once: true });
}

/* ============================================================
   视频元素：创建时的两套形状只差「铺满格子」还是「藏在屏外」
   ============================================================ */
/**
 * 这里不设 src。预热那一路（hidden）必须在 src 赋值之前把 progress/error 监听器挂好、
 * 把元素进 DOM：src 一赋值下载就发出去了，晚挂的监听器会错过事件，
 * 而预热循环正是靠 progress 判完成的（inject 那一路那么做也没问题，它不靠监听器）。
 *
 * "fill" 那一段内联样式不能省：Astro 的 scoped CSS 不会命中 JS 动态创建的
 * <video>（它没有 data-astro-cid-xxx 属性），.vg-cell video 的铺满规则对它无效——
 * 省掉的话首格自播会按原始尺寸撑爆网格列（实测踩过）。
 */
function makeVideo(mode: "fill" | "hidden"): HTMLVideoElement {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    if (mode === "fill") {
        v.loop = true;
        v.style.cssText =
            "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block";
    } else {
        v.style.cssText =
            "position:fixed;left:-9999px;top:0;width:2px;height:2px;pointer-events:none";
    }
    return v;
}

/* ============================================================
   P2 hero 视频：一台状态机 + 一张看门狗表
   ============================================================ */
/**
 * 状态只看一个事实：屏幕上有没有解出过画面（readyState）。
 * 重构前这里住着五个分散的兜底（muted 双设、rIC、4s 硬兜底、canplay 重试、
 * 8s/16s 两个看门狗），其中 8s 和 16s 是同一个意思的两种写法，loadStarted
 * 这个布尔量则是为了修「rIC 和 4s 都触发 → 第二次 load() 把流掐掉」而补的。
 * 现在合成一个尝试次数上限 + 一条判据，语义与原来逐字对应：
 *
 *   首发          load + idle 后触发一次，4s 硬兜底同一路                    → 尝试 1
 *   看门狗 A 8s   一帧都没有 且 流并不真的在下（networkState≠LOADING）→ 重试   → 尝试 2
 *   看门狗 B 16s  一帧都没有，不管它是不是「还在拉流」（卡死的连接会一直
 *                 保持 networkState=2）→ 重试                              → 尝试 3
 *   24s           还是什么都没有 → 判定失败，回退底图
 *   error 事件    任何时刻直接失败（视频本身 + 每个 <source>）
 *
 * 尝试次数封顶 3 就是原来 8s/16s 两条定时器，不是新增的重试轮数——
 * 多一轮就会多下一遍已经下过的字节，慢网上更慢。
 */
const MAX_ATTEMPTS = 3;

class HeroLoader {
    private attempts = 0;
    /** 首发只能生效一次：rIC 与 4s 硬兜底是两条都能走到这里的路 */
    private kicked = false;
    private failed = false;

    constructor(private readonly video: HTMLVideoElement) {
        // muted 必须在 HTML 和 JS 两处都设：autoplay 策略看的是实时属性
        this.video.muted = true;
        this.video.addEventListener("error", () => this.fail());
        this.video.querySelectorAll("source").forEach((s) => {
            s.addEventListener("error", () => this.fail());
        });
        // 不设 once：canplay 可能早于这个监听器挂载
        this.video.addEventListener("canplay", () => {
            if (this.video.paused) this.tryPlay();
        });
    }

    /** 一帧都没解出过 = readyState 回到 HAVE_NOTHING（load() 重置后也会回到这里） */
    private noPicture = () => this.video.readyState === 0;

    private start(): void {
        if (this.attempts >= MAX_ATTEMPTS || this.failed) return;
        this.attempts += 1;
        this.video.preload = "auto";
        this.video.load();
    }

    /** 只在「首发」这条路上用：保证 load() 只被发起一次 */
    private startOnce(): void {
        if (this.kicked) return;
        this.kicked = true;
        this.start();
    }

    /**
     * 看门狗。allowStalled=false 对应原来的兜底 A：慢网上下载健康进行中时
     * readyState 同样是 0，只看它会把那条好端端的流掐掉重来（2026-11-07 就是这么误伤的）。
     */
    private watchdog(atMs: number, allowStalled: boolean): void {
        setTimeout(() => {
            if (this.failed || !this.noPicture()) return;
            if (!allowStalled && this.video.networkState === 2) return; // 2 = NETWORK_LOADING
            this.start();
        }, atMs);
    }

    private fail(): void {
        this.failed = true;
        this.video.classList.add("video-failed");
    }

    /** autoplay 被拒是正常事件（iOS/省电模式），等用户任何一次交互后补放 */
    private tryPlay(): void {
        const p = this.video.play();
        if (!p) return;
        p.catch(() => {
            const onInteract = () => {
                this.video.play().catch(() => { });
                document.removeEventListener("touchstart", onInteract);
                document.removeEventListener("click", onInteract);
                document.removeEventListener("pointerdown", onInteract);
                document.removeEventListener("keydown", onInteract);
            };
            document.addEventListener("touchstart", onInteract, {
                once: true,
                passive: true,
            });
            document.addEventListener("click", onInteract, { once: true });
            document.addEventListener("pointerdown", onInteract, {
                once: true,
                capture: true,
            });
            document.addEventListener("keydown", onInteract, { once: true });
        });
    }

    /** hero 拿到画面的另一种说法：P3 和 P6 都要等它，但各自的耐心不一样 */
    whenReady(capMs: number): Promise<void> {
        return new Promise((res) => {
            let done = false;
            const go = () => {
                if (done) return;
                done = true;
                res();
            };
            if (this.video.readyState >= 2) {
                go();
                return;
            }
            // 判据不只看事件：loadeddata 理论上可能在 readyState 还不够时被补投
            this.video.addEventListener("loadeddata", () => {
                if (this.video.readyState >= 2) go();
            });
            // 上限兜底：hero 被慢网或自动播放策略卡住时，不能把下游永远锁死
            setTimeout(go, capMs);
        });
    }

    run(): void {
        afterLoad(() => {
            // P1.5 先跑：业主口径「图片先加载展示，才轮到视频后台下载」
            eagerFirstScreenImages();
            // 阶段 2（业主 2026-11-06 定口径）：整页能浏览之后才默默下载视频。
            // 首屏有底图垫着，视觉不断档；慢网上几 MB 的自动播放视频不再和首屏
            // 底图/CSS 抢带宽，也不会把 LCP 观测点拖到几十秒。
            void onIdle({ ricTimeout: 5000, noRicDelay: 2000, hardMs: 4000 }).then(() =>
                this.startOnce(),
            );
        });
        this.watchdog(8000, false);
        this.watchdog(16000, true);
        setTimeout(() => {
            if (this.noPicture() && !this.failed) this.fail();
        }, 24000);
    }
}

/* ============================================================
   P1.5：把首屏附近的 lazy 图升为 eager
   ============================================================ */
/**
 * 只升「首屏 1.25 屏高以内」的图。全部升级是错的：移动端实测会把
 * facade/mega-menu/factory 等 ~40 张屏外图一次拉满，从 load 堵到 30s+，
 * 反把 hero 视频首帧挤到最后（LCP 爆到 24s）。屏外一律保持原生 lazy，
 * 滚到才加载，天然从上往下。
 */
function eagerFirstScreenImages(): void {
    void onIdle({ ricTimeout: 5000, noRicDelay: 2000 }).then(() => {
        const limit = window.innerHeight * 1.25; // 首屏 + 一点提前量
        document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
            // 隐藏 Tab 面板（display:none）里的图一律跳过：不点就不加载。
            // 升 eager 会让 5 个 Tab 的图一起在后台抢带宽（业主明确不要）。
            // 这批图交给预热队列的 P5，那里按 Tab 顺序排。
            if (img.closest(".gallery-panel:not(.active)")) return;
            const rect = img.getBoundingClientRect();
            // 无渲染盒（display:none）或落在首屏之外：保持 lazy，滚到再加载
            if (!rect.height || rect.top > limit || rect.bottom < 0) return;
            img.loading = "eager";
            // decode() 在后台线程解码，不阻塞主线程（避免滚动时卡顿）
            if (!img.complete) img.decode().catch(() => { });
        });
    });
}

/* ============================================================
   Tab 面板：切过去就全力加载该面板的图（用户动作 = 最高优先级）
   ============================================================ */
function wireGalleryTabs(): void {
    document.querySelectorAll(".gallery-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            document
                .querySelectorAll(".gallery-tab")
                .forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            const target = tab.getAttribute("data-tab");
            document.querySelectorAll(".gallery-panel").forEach((p) => p.classList.remove("active"));
            const panel = document.querySelector<HTMLElement>(
                `.gallery-panel[data-panel="${target}"]`,
            );
            panel?.classList.add("active");
            // 切到的面板立即全力加载自己的图；没切过的面板继续保持 lazy，
            // 一张都不多下（业主 2026-11-06 口径）
            panel
                ?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
                .forEach((img) => {
                    img.loading = "eager";
                });
        });
    });
}

/* ============================================================
   P3：视频画廊——静态封面 + 点 Play 才注入，首格按顺序自动播
   ============================================================ */
function wireVideoGallery(hero: HeroLoader | null, profile: NetProfile): void {
    const section = document.getElementById("videoGallery");
    if (!section) return;

    /** 首次调用才把 <video> 注入 .vg-cell（盖在封面 img 上层），之后复用 */
    const ensureVideo = (item: HTMLElement): HTMLVideoElement | null => {
        const existing = item.querySelector<HTMLVideoElement>("video");
        if (existing) return existing;
        const src = item.dataset.vgSrc;
        const cell = item.querySelector<HTMLElement>(".vg-cell");
        if (!src || !cell) return null;
        const video = makeVideo("fill");
        video.src = src;
        cell.appendChild(video);
        return video;
    };

    section.querySelectorAll<HTMLElement>(".vg-item").forEach((item) => {
        const btn = item.querySelector<HTMLButtonElement>("[data-vg-play]");
        const label = btn?.querySelector(".vg-play-text");
        if (!btn) return;

        const sync = (playing: boolean) => {
            item.classList.toggle("playing", playing);
            if (label) label.textContent = playing ? "Pause" : "Play";
        };

        btn.addEventListener("click", () => {
            const video = ensureVideo(item);
            if (!video) return;
            // 事件只绑一次：注入后播放/暂停都由 sync 刷按钮状态
            if (!video.dataset.vgBound) {
                video.dataset.vgBound = "1";
                video.addEventListener("play", () => sync(true));
                video.addEventListener("pause", () => sync(false));
            }
            if (video.paused) video.play().catch(() => { });
            else video.pause();
        });
    });

    // 封面必须「滚到就有图、秒加载」（业主 2026-11-06）。vg 整段在首屏之下，
    // 原生 lazy 要等真正滚到才发请求，所以临近视口（提前一整屏）时把 6 张封面
    // 一次性升 eager：单张 39~63KB、合计 ~300KB，换「滚到即满图」值得。
    const covers = Array.from(
        section.querySelectorAll<HTMLImageElement>("img.vg-cover"),
    );
    if (covers.length && "IntersectionObserver" in window) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    covers.forEach((img) => {
                        img.loading = "eager";
                    });
                    io.disconnect();
                });
            },
            { rootMargin: "100% 0px" },
        );
        io.observe(section);
    }

    // 首格自动播：window load 之后 + hero 已拿到画面 + 进视口，三者都成立才注入；
    // 离开视口只暂停不预先下载；用户手动点过该格按钮后交还手动控制；
    // 偏好减少动态时不自动播（封面图照常显示）。业主 2026-11-07 口径：
    // 开屏视频全力优先，才轮到首格；整站因此只剩 hero + 首格两个视频请求。
    const featured = section.querySelector<HTMLElement>(".vg-item[data-vg-auto]");
    if (!featured || profile.reduceMotion) return;
    const fBtn = featured.querySelector<HTMLButtonElement>("[data-vg-play]");
    let manual = false;
    fBtn?.addEventListener("click", () => {
        manual = true;
    });

    afterLoad(() => {
        // hero 的 5.9MB 优先，首格 23.6MB 是它的 4 倍，两路并发实测把 hero
        // 首帧从 3.8s 推到 13s。12s 是耐心上限：hero 卡住时不能把画廊永远锁死，
        // 首格自己仍受下面的视口门控约束。
        void (hero ? hero.whenReady(12000) : Promise.resolve()).then(() => {
            if (!("IntersectionObserver" in window)) return;
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (manual) return;
                        if (entry.isIntersecting) {
                            // 下载门控（业主 2026-11-07）：ensureVideo 里是 preload="auto"，
                            // <video> 一创建就开始整片下载，后面的 pause() 拦不住它。
                            // 而 IntersectionObserver 在 observe() 那一刻必定先投递一次
                            // isIntersecting=false 的初始回调——以前 ensureVideo 写在这个
                            // 回调外面，等于屏幕外就把 23.6MB 拉走了（实测 buffered 先涨到
                            // 14.8/25.2s，滚过去之后一条新的 mp4 请求都没产生）。
                            const video = ensureVideo(featured);
                            video?.play().catch(() => { });
                        } else {
                            // 只有已经注入过的（用户滚回来又滚走）才需要暂停；没注入就什么都不做
                            featured.querySelector<HTMLVideoElement>("video")?.pause();
                        }
                    });
                },
                { threshold: 0.35 },
            );
            io.observe(featured);
        });
    });
}

/* ============================================================
   P4–P6：后台预热队列（声明式阶梯 + 一次一件 + 让路）
   ============================================================ */
/**
 * 目标不是省流量，是「看起来整页早就加载完了」：用户还没点的时候慢慢铺，
 * 点了就秒开。所以图片用 fetch 而不是 new Image()——预热必须能被中断
 * （业主：用户点了某个资源就全力加载那一个，剩下的等一下），而 img.src
 * 一旦发出去就收不回。no-cors 拿到 opaque 响应、读不到状态码，但 HTTP 缓存
 * 按 URL 记账，之后 <img> 显示时直接命中。
 *
 * 一次只跑一件：串行由 runLadder 的 await 保证，中断由 AbortController 保证。
 * 重构前这两个能力分属两层（先不串行、后加中断），现在只有一个循环。
 */
interface WarmTask {
    url: string;
    run: (signal: AbortSignal) => Promise<void>;
}

/** P4：滚动会看到的图，按离视口的距离排 */
function collectScrollImages(seen: Set<string>): WarmTask[] {
    const ranked: { rank: number; url: string }[] = [];
    document
        .querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
        .forEach((img) => {
            // 隐藏容器里的图交给 P5，那里要按 Tab 顺序而不是距离排
            if (img.closest(".gallery-panel:not(.active)")) return;
            const url = img.src;
            if (!url || seen.has(url)) return;
            seen.add(url);
            const rect = img.getBoundingClientRect();
            // 隐藏容器里的图 rect 全是 0，没法比距离，统一排在 P4 末尾
            ranked.push({ rank: rect.height ? rect.top : Number.MAX_SAFE_INTEGER, url });
        });
    return ranked
        .sort((a, b) => a.rank - b.rank)
        .map((it) => ({ url: it.url, run: (s: AbortSignal) => warmImage(it.url, s) }));
}

/** P5：4 个隐藏 Tab 面板的图，按 Tab 在页面上的先后顺序（最可能被点的先热） */
function collectHiddenPanels(seen: Set<string>): WarmTask[] {
    const tasks: WarmTask[] = [];
    document
        .querySelectorAll<HTMLElement>(".gallery-panel:not(.active)")
        .forEach((panel) => {
            panel.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
                const url = img.src;
                if (!url || seen.has(url)) return;
                seen.add(url);
                tasks.push({ url, run: (s) => warmImage(url, s) });
            });
        });
    return tasks;
}

/** P6：其余 5 格视频；首格若还没被滚到（未注入）排在这组第一个 */
function collectGalleryVideos(): WarmTask[] {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".vg-item"));
    const featured = items.find((i) => i.hasAttribute("data-vg-auto"));
    const ordered = featured
        ? [featured, ...items.filter((i) => i !== featured)]
        : items;
    const tasks: WarmTask[] = [];
    ordered.forEach((item) => {
        const url = item.dataset.vgSrc;
        if (!url) return;
        if (item.querySelector("video")) return; // 已注入就在下，不重复
        tasks.push({ url, run: (s) => warmVideo(url, s) });
    });
    return tasks;
}

/** 必须把 body 读完才算一件完成（见文件头铁律 3） */
function warmImage(url: string, signal: AbortSignal): Promise<void> {
    return fetch(url, { mode: "no-cors", credentials: "omit", signal })
        .then((r) => r.arrayBuffer().catch(() => undefined))
        .then(
            () => { },
            () => { },
        );
}

/**
 * 视频用真实 <video> 而不是 fetch：浏览器把 Range 列为 privileged header，
 * 页面 JS 设了会被静默剥掉——实测 fetch 带 Range 退化成 200 整包（想只热
 * 头部+尾部 moov 共 320KB 的方案因此作废，反而下了三遍整片）。媒体层自己发的
 * 是 206、会分片缓存。2026-11-07 实测：未预热 play()→首帧 3304ms，预热后 190ms。
 * 中断时已下完的分片仍留在缓存里，所以让路不是白干。
 */
function warmVideo(url: string, signal: AbortSignal): Promise<void> {
    return new Promise<void>((res) => {
        const v = makeVideo("hidden");
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            v.pause();
            v.removeAttribute("src");
            v.load();
            v.remove();
            res();
        };
        v.addEventListener("error", finish);
        v.addEventListener("progress", () => {
            const d = v.duration;
            if (
                isFinite(d) &&
                d > 0 &&
                v.buffered.length &&
                v.buffered.end(v.buffered.length - 1) >= d - 0.05
            )
                finish();
        });
        signal.addEventListener("abort", finish);
        document.body.appendChild(v);
        v.src = url;
        setTimeout(finish, 45000); // 一条流卡住不能把整条队列锁死
    });
}

/**
 * 阶梯定义成一个数组：加一级就是加一项，不用改调度循环。
 * enabled 为假的那级整个跳过（手机 / 省流量 / 2G / 偏好减少动态不该替
 * 桌面用户的热身买单）。
 */
function buildLadder(profile: NetProfile): { enabled: boolean; tasks: WarmTask[] }[] {
    const seen = new Set<string>();
    return [
        { enabled: true, tasks: collectScrollImages(seen) },
        { enabled: true, tasks: collectHiddenPanels(seen) },
        {
            enabled: profile.desktop && !profile.slowNet && !profile.reduceMotion,
            tasks: collectGalleryVideos(),
        },
    ];
}

/** 用户一动，队列就排队让路；监听挂在 document 捕获层 + passive，不拖累滚动帧 */
function createInteractionClock(): () => number {
    let last = 0;
    ["pointerdown", "click", "scroll", "keydown"].forEach((evt) =>
        document.addEventListener(
            evt,
            () => {
                last = Date.now();
            },
            { capture: true, passive: true },
        ),
    );
    return () => Date.now() - last;
}

async function runLadder(
    steps: { enabled: boolean; tasks: WarmTask[] }[],
    quietSince: () => number,
): Promise<void> {
    for (const step of steps) {
        if (!step.enabled) continue;
        for (const task of step.tasks) {
            // 让路：最近 2 秒内有交互就等；最多等 20 秒，免得用户一直滚动就永不预热
            let waited = 0;
            while (quietSince() < 2000 && waited < 20000) {
                await nap(600);
                waited += 600;
            }
            await onIdle({ ricTimeout: 4000, noRicDelay: 4500, hardMs: 4500 });
            const ac = new AbortController();
            await task.run(ac.signal);
        }
    }
}

/* ============================================================
   入口
   ============================================================ */
/**
 * 两个时序约定，都是重构前就在的，不能因为「抽成一个函数」而顺手改掉：
 *
 * 1. 阶梯在脚本执行时就采集，不在起跑时才采集。P4 靠 getBoundingClientRect()
 *    排距离，而脚本执行时页面还在顶部；要是等 hero 拿到画面（最长 20s）后才排，
 *    用户已经滚到中部，采到的 rect 就变了——本来该先热的首屏图会被排到后面。
 * 2. 让路用的事件监听也在脚本执行时就挂好，同样不能延到起跑前才挂：
 *    那样从页面起到 hero 落地之间的交互全部不算数，第一批任务会白等 2 秒。
 */
export function startHomeMediaLoader(): void {
    const profile = readProfile();

    const heroEl = document.querySelector<HTMLVideoElement>(".video-hero-bg");
    const hero = heroEl ? new HeroLoader(heroEl) : null;
    if (hero) hero.run();

    wireGalleryTabs();
    wireVideoGallery(hero, profile);

    const ladder = profile.saveData ? null : buildLadder(profile);
    const quietSince = createInteractionClock();

    // 起跑：hero 拿到画面之后。hero 被慢网或自动播放策略卡住时 20 秒也必须放行。
    // 没有 hero 元素（markup 改了才会这样）时保持与重构前一致：20 秒后照样铺图。
    if (ladder) {
        const ready = hero ? hero.whenReady(20000) : nap(20000);
        void ready.then(() => {
            void runLadder(ladder, quietSince);
        });
    }
}
