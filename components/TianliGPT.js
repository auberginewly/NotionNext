/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'
/**
 * TianliGpt AI文章摘要生成工具 @see https://docs_s.tianli0.top/
 * @returns {JSX.Element}
 * @constructor
 */

const TianLiGPT = () => {
  const tianliKey = siteConfig('TianliGPT_KEY')
  const tianliCss = siteConfig('TianliGPT_CSS')
  const tianliJs = siteConfig('TianliGPT_JS')
  const tianliTheme = siteConfig('TianliGPT_THEME') || ''

  useEffect(() => {
    if (!tianliKey) return

    const initTianliGPT = async () => {
      console.log('loading tianliGPT', tianliKey, tianliCss, tianliTheme)

      // 加载主题对应的 CSS
      let cssUrl = tianliCss
      if (tianliTheme) {
        // 使用不同主题的 CSS: simple, yanzhi, menghuan
        cssUrl = `https://ai.tianli0.top/static/public/tianli_gpt_${tianliTheme}.css`
      }
      await loadExternalResource(cssUrl, 'css')

      // 等待页面渲染完成
      setTimeout(async () => {
        const container = document.querySelector('#notion-article')
        if (!container) {
          console.warn('TianliGPT: 找不到文章容器')
          return
        }

        // 读取文章内容（适配 NotionNext 的 .notion-text 结构）
        const title = document.title
        const notionTexts = container.querySelectorAll('.notion-text')
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5')
        let content = ''

        for (let h of headings) {
          content += h.innerText + ' '
        }

        for (let t of notionTexts) {
          content += t.innerText + ' '
        }

        const combinedText = title + ' ' + content
        const truncatedText = combinedText.slice(0, 1000)

        console.log('TianliGPT 读取内容长度:', truncatedText.length)

        if (truncatedText.length < 100) {
          console.warn('TianliGPT: 文章内容太短')
          return
        }

        // 调用 TianliGPT API
        try {
          const response = await fetch('https://summary.tianli0.top/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: tianliKey,
              content: truncatedText,
              url: window.location.href,
              title: document.title
            })
          })

          const data = await response.json()

          if (data.summary) {
            // 插入 AI 摘要卡片
            const aiDiv = document.createElement('div')
            aiDiv.className = 'post-TianliGPT'
            aiDiv.innerHTML = `
              <div class="tianliGPT-title">
                <i class="tianliGPT-title-icon">🤖</i>
                <div class="tianliGPT-title-text">AI摘要</div>
                <div class="tianliGPT-tag" id="tianliGPT-tag">TianliGPT</div>
              </div>
              <div class="tianliGPT-explanation">${data.summary}</div>
            `
            container.insertBefore(aiDiv, container.firstChild)
            console.log('✅ TianliGPT 摘要已生成')
          } else if (data.err_msg) {
            console.warn('TianliGPT 错误:', data.err_msg)
          }
        } catch (error) {
          console.error('TianliGPT API 调用失败:', error)
        }
      }, 1000)
    }

    initTianliGPT()
  }, [tianliKey, tianliCss, tianliTheme])

  if (!tianliKey) {
    return null
  }

  return <></>
}

export default TianLiGPT
