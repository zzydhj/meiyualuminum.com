/**
 * youtube.ts — YouTube URL 解析工具
 *
 * 从各种格式的 YouTube 链接中提取视频 ID，
 * 并提供封面图 / 嵌入播放器 URL 的生成函数。
 */

/**
 * 从 YouTube URL 中提取视频 ID。
 * 支持格式：
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/embed/ID
 * - https://www.youtube.com/shorts/ID
 * 无法解析时返回 null。
 */
export function parseYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}

/** YouTube 自动封面图（hqdefault 480×360，所有视频都有） */
export function youTubeThumb(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** YouTube 隐私增强嵌入地址（youtube-nocookie.com） */
export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
