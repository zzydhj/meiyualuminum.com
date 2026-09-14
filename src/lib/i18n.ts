/**
 * i18n 配置 — 多语言框架核心（英语无前缀方案）
 *
 * URL 规则：
 *   /           = English（默认语言，无前缀）
 *   /blog/xxx/  = English blog
 *   /zh/        = 中文首页
 *   /zh/blog/xxx/ = 中文博客
 *
 * 加新语言 = 在 LANG_PREFIXES 加一项 + 创建首页文件 + 数据库插翻译记录。
 */

/** 所有支持的语言（含英语，用于数据库查询和类型） */
export const SUPPORTED_LANGS = [
    'en', 'zh', 'ar', 'es', 'fr', 'ru', 'pt', 'tr', 'vi', 'id', 'de',
] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

/** 默认语言 = 英语（根路径，无前缀） */
export const DEFAULT_LANG: Lang = 'en';

/** 需要 URL 前缀的语言，不含英语 */
export const LANG_PREFIXES = [
    'zh', 'ar', 'es', 'fr', 'ru', 'pt', 'tr', 'vi', 'id', 'de',
] as const;

/** 语言显示名（原生名称） */
export const LANG_LABELS: Record<Lang, string> = {
    en: 'English',
    zh: '中文',
    ar: 'العربية',
    es: 'Español',
    fr: 'Français',
    ru: 'Русский',
    pt: 'Português',
    tr: 'Türkçe',
    vi: 'Tiếng Việt',
    id: 'Indonesia',
    de: 'Deutsch',
};

/** 语言对应国旗 ISO 国家代码（用于 flagcdn.com SVG） */
export const LANG_FLAGS: Record<Lang, string> = {
    en: 'gb',
    zh: 'cn',
    ar: 'sa',
    es: 'es',
    fr: 'fr',
    ru: 'ru',
    pt: 'br',
    tr: 'tr',
    vi: 'vn',
    id: 'id',
    de: 'de',
};

/** 生成国旗 SVG URL（本地自托管，零外部依赖） */
export function flagUrl(lang: Lang): string {
    return `/flags/${LANG_FLAGS[lang]}.svg`;
}

/** 判断是否为支持的语言 */
export function isValidLang(value: string | undefined): value is Lang {
    return !!value && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

/** 判断是否为需要 URL 前缀的语言 */
export function hasPrefix(value: string | undefined): boolean {
    return !!value && (LANG_PREFIXES as readonly string[]).includes(value);
}

/**
 * 从 Astro.locals 读取当前语言（[lang] 路由写入）
 * 无前缀的根路径默认返回 'en'。
 */
export function currentLang(locals: unknown): Lang {
    const value = (locals as Record<string, unknown>)?.lang;
    return isValidLang(value as string) ? (value as Lang) : DEFAULT_LANG;
}

/**
 * 生成语言前缀路径
 * loc('zh', '/blog/xxx/') => '/zh/blog/xxx/'
 * loc('en', '/blog/xxx/') => '/blog/xxx/'  （英语无前缀）
 */
export function loc(lang: Lang, path: string): string {
    const clean = path.startsWith('/') ? path : `/${path}`;
    if (lang === DEFAULT_LANG) return clean;
    return `/${lang}${clean === '/' ? '/' : clean}`;
}

/**
 * 从当前 URL 路径生成所有语言的 hreflang 替代链接。
 *
 * 自动处理：
 *   - 根路径 / → 各语言首页 /zh/ /ar/ ...
 *   - 非英语前缀路径 /zh/blog/x/ → 英语 /blog/x/ + 其他 /ar/blog/x/ ...
 *   - 英语根路径 /blog/x/ → /zh/blog/x/ /ar/blog/x/ ...
 *
 * 在 BaseLayout 中调用，每个页面零改动自动获得 hreflang。
 */
export function buildAlternates(pathname: string): { lang: string; href: string }[] {
    // 检测并去掉语言前缀，得到英语基础路径
    const firstSegment = pathname.split('/').filter(Boolean)[0] ?? '';
    let basePath: string;
    if ((LANG_PREFIXES as readonly string[]).includes(firstSegment)) {
        // /zh/blog/x/ → /blog/x/
        basePath = pathname.slice(firstSegment.length + 1) || '/';
    } else {
        basePath = pathname;
    }
    if (!basePath.startsWith('/')) basePath = '/' + basePath;

    // 为每种语言生成 URL
    return (SUPPORTED_LANGS as readonly Lang[]).map(lang => ({
        lang,
        href: loc(lang, basePath),
    }));
}
