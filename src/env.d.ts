/// <reference types="astro/client" />

/**
 * 全局类型声明
 * Astro.locals 由 middleware / [lang] 路由写入，供页面读取当前语言。
 */
declare namespace App {
    interface Locals {
        /** 当前页面语言代码（'en' | 'zh' | 'ar' | 'es'） */
        lang?: string;
    }
}
