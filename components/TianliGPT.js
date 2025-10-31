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

  useEffect(() => {
    if (!tianliKey) return

    const initTianliGPT = async () => {
      console.log('loading tianliGPT', tianliKey, tianliCss, tianliJs)

      // 1. 先设置全局变量
      window.tianliGPT_postSelector = '#notion-article'
      window.tianliGPT_key = tianliKey

      // 2. 加载 CSS
      await loadExternalResource(tianliCss, 'css')

      // 3. 加载 JS
      await loadExternalResource(tianliJs, 'js')

      // 4. 重写 TianliGPT 的内容读取函数以适配 NotionNext
      setTimeout(() => {
        if (typeof window.tianliGPT === 'object') {
          // 重写 getTitleAndContent 方法
          window.tianliGPT.getTitleAndContent = function() {
            try {
              const title = document.title
              const container = document.querySelector(window.tianliGPT_postSelector)
              if (!container) {
                console.warn('TianliGPT: 找不到文章容器')
                return ''
              }

              // NotionNext 使用 .notion-text 而不是 <p> 标签
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
              let wordLimit = 1000
              if (typeof window.tianliGPT_wordLimit !== 'undefined') {
                wordLimit = window.tianliGPT_wordLimit
              }
              const truncatedText = combinedText.slice(0, wordLimit)
              console.log('TianliGPT 读取内容长度:', truncatedText.length)
              return truncatedText
            } catch (e) {
              console.error('TianliGPT 读取内容失败:', e)
              return ''
            }
          }
        }

        // 5. 触发 TianliGPT
        if (typeof window.tianliGPT === 'function') {
          window.tianliGPT(false)
          console.log('tianliGPT triggered')
        } else {
          console.error('tianliGPT function not found')
        }
      }, 500)
    }

    initTianliGPT()
  }, [tianliKey, tianliCss, tianliJs])

  if (!tianliKey) {
    return null
  }

  return <></>
}

export default TianLiGPT
