/**
 * videoSource.ts — 自托管视频判定与第一帧封面地址
 *
 * 全站约定：托管在本站（R2 CDN file.meiyualuminum.com 或同源路径）的视频，
 * 封面默认取视频第一帧——无需单独上传封面图；
 * 实现为 <video preload="metadata"> + URL 媒体片段 #t=0.1
 * （浏览器加载 metadata 后即渲染 0.1s 处的帧作为封面）。
 * YouTube 等外部视频走 iframe / YouTube 自动封面，不受本模块影响。
 */

/** 视频是否托管在本站（R2 CDN 或同源路径） */
export function isSelfHostedVideo(url: string | null | undefined): boolean {
    if (!url) return false;
    return (
        url.startsWith("https://file.meiyualuminum.com/") || url.startsWith("/")
    );
}

/** 第一帧预览地址：追加媒体片段 #t=0.1，强制浏览器渲染 0.1s 帧作封面（避免首帧黑屏） */
export function firstFrameSrc(url: string): string {
    return url.includes("#") ? url : `${url}#t=0.1`;
}
