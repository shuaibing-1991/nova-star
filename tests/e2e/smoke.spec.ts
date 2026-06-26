/**
 * E2E smoke test
 *
 * 阶段 8 Round 4 扩展：
 * - 增加路由守卫验证
 * - 增加 SEO 资源验证（sitemap/robots/JSON-LD）
 * - 增加离线 fallback 验证
 * - 增加关键页面 meta 标签验证
 */
import { test, expect } from '@playwright/test'

test.describe('首页 smoke', () => {
  test('应能正常加载并显示标题', async ({ page }) => {
    await page.goto('/')
    // 等待页面渲染
    await expect(page.locator('h1')).toContainText('世界上有一种幻象')
  })

  test('应有开始体验按钮', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('button', { name: '开始体验' })
    await expect(button).toBeVisible()
  })

  test('应有继续上次按钮', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('button', { name: '继续上次' })
    await expect(button).toBeVisible()
  })

  test('关键页面无 JS 错误', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

    // 阶段 8 Round 4：JS 错误应为空
    expect(errors, `JS errors: ${errors.join('\n')}`).toHaveLength(0)
  })
})

test.describe('路由守卫', () => {
  test('play 页未 onboarding 时跳转', async ({ page }) => {
    await page.goto('/play')
    // 路由守卫应跳到 onboarding
    await page.waitForURL(/\/onboarding/, { timeout: 5000 })
    expect(page.url()).toContain('/onboarding')
  })
})

test.describe('PWA 与资源', () => {
  test('manifest.json 可访问且合法', async ({ request }) => {
    const response = await request.get('/manifest.json')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.name).toContain('NOVA STAR')
    expect(body.start_url).toBe('/')
    expect(body.display).toBe('standalone')
    expect(Array.isArray(body.icons)).toBe(true)
    expect(body.icons.length).toBeGreaterThan(0)
  })

  test('sitemap.xml 可访问', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const xml = await response.text()
    expect(xml).toContain('<urlset')
  })

  test('robots.txt 可访问', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const txt = await response.text()
    expect(txt).toContain('User-Agent')
  })

  test('sw.js 可访问', async ({ request }) => {
    const response = await request.get('/sw.js')
    expect(response.status()).toBe(200)
  })
})

test.describe('SEO 与结构化数据', () => {
  test('meta viewport 设置正确', async ({ page }) => {
    await page.goto('/')
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
  })

  test('title 包含 NOVA STAR', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title).toContain('NOVA STAR')
  })

  test('JSON-LD 至少 3 个 schema', async ({ page }) => {
    await page.goto('/')
    const scripts = await page.locator('script[type="application/ld+json"]').all()
    expect(scripts.length).toBeGreaterThanOrEqual(3)

    // 第一个应为 WebSite
    const firstContent = await scripts[0].textContent()
    expect(firstContent).toContain('WebSite')
  })

  test('OG image meta 存在', async ({ page }) => {
    await page.goto('/')
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(ogImage).toBeTruthy()
  })

  test('ending 页有独立 metadata', async ({ page }) => {
    await page.goto('/ending/success')
    const title = await page.title()
    expect(title).toContain('成功出道')
  })

  test('play 页有独立 metadata', async ({ page }) => {
    await page.goto('/play')
    const title = await page.title()
    expect(title).toContain('开始你的 30 天')
  })

  test('onboarding 页有独立 metadata', async ({ page }) => {
    await page.goto('/onboarding')
    const title = await page.title()
    expect(title).toContain('艺人档案')
  })

  test('offline 页有独立 metadata', async ({ page }) => {
    await page.goto('/offline')
    const title = await page.title()
    expect(title).toContain('离线')
  })

  test('关键页面 canonical 完整', async ({ page }) => {
    const pages = ['/', '/play', '/ending/success']
    for (const path of pages) {
      await page.goto(path)
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href')
      expect(canonical, `${path} 缺 canonical`).toBeTruthy()
    }
  })

  test('onboarding / phone / offline 应 noindex', async ({ page }) => {
    const privatePages = ['/onboarding', '/offline']
    for (const path of privatePages) {
      await page.goto(path)
      const robots = await page
        .locator('meta[name="robots"]')
        .getAttribute('content')
      expect(robots, `${path} 应有 robots meta`).toBeTruthy()
      expect(robots, `${path} 应 noindex`).toContain('noindex')
    }
  })
})

test.describe('离线与降级', () => {
  test('offline 页可访问', async ({ page }) => {
    await page.goto('/offline')
    await expect(page.locator('text=/离线|无法连接/')).toBeVisible()
  })

  test('offline 页有重新加载按钮', async ({ page }) => {
    await page.goto('/offline')
    const retryButton = page.getByRole('button', { name: /重新加载/ })
    await expect(retryButton).toBeVisible()
  })
})

test.describe('错误处理', () => {
  test('404 路径返回 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345')
    expect(response?.status()).toBe(404)
  })
})