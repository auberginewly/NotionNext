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
  const tianliTheme = siteConfig('TianliGPT_THEME') || ''

  useEffect(() => {
    if (!tianliKey) return

    // 打字机效果函数
    const showTypingAnimation = (text) => {
      const element = document.querySelector('.tianliGPT-explanation')
      if (!element) return

      let currentIndex = 0
      const typingDelay = 25 // 每个字符的延迟(毫秒)
      const punctuationDelayMultiplier = 6 // 标点符号延迟倍数
      let animationRunning = true
      let lastUpdateTime = performance.now()

      const animate = () => {
        if (currentIndex < text.length && animationRunning) {
          const currentTime = performance.now()
          const timeDiff = currentTime - lastUpdateTime

          const letter = text.slice(currentIndex, currentIndex + 1)
          const isPunctuation = /[，。！、？,.!?]/.test(letter)
          const delay = isPunctuation ? typingDelay * punctuationDelayMultiplier : typingDelay

          if (timeDiff >= delay) {
            currentIndex++
            element.innerHTML = text.slice(0, currentIndex) + '<span class="blinking-cursor"></span>'
            lastUpdateTime = currentTime

            if (currentIndex >= text.length) {
              // 动画完成,移除光标和加载动画
              element.innerHTML = text
              const aiTag = document.querySelector('.tianliGPT-tag')
              if (aiTag) {
                aiTag.classList.remove('loadingAI')
              }
              observer.disconnect()
            }
          }
          requestAnimationFrame(animate)
        }
      }

      // 使用 IntersectionObserver 检测元素是否在视口中
      const observer = new IntersectionObserver(
        (entries) => {
          animationRunning = entries[0].isIntersecting
          if (animationRunning && currentIndex === 0) {
            setTimeout(() => {
              requestAnimationFrame(animate)
            }, 200)
          }
        },
        { threshold: 0 }
      )

      const postAI = document.querySelector('.post-TianliGPT')
      if (postAI) {
        observer.observe(postAI)
      }

      // 立即开始动画
      requestAnimationFrame(animate)
    }

    const initTianliGPT = async () => {
      console.log('loading tianliGPT', tianliKey, tianliTheme)

      // 设置全局主题变量(在加载 CSS 之前)
      if (tianliTheme) {
        window.tianliGPT_theme = tianliTheme
      }

      // 加载 TianliGPT CSS
      await loadExternalResource(tianliCss, 'css')

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
            
            // 如果设置了主题,添加主题类名
            if (window.tianliGPT_theme) {
              aiDiv.classList.add(`tianliGPT-theme-${window.tianliGPT_theme}`)
            }
            
            aiDiv.innerHTML = `
              <div class="tianliGPT-title">
                <i class="tianliGPT-title-icon">🍆</i>
                <div class="tianliGPT-title-text">AI摘要</div>
                <div class="tianliGPT-tag loadingAI" id="tianliGPT-tag">aubergineGPT</div>
              </div>
              <div class="tianliGPT-explanation">生成中...<span class="blinking-cursor"></span></div>
            `
            container.insertBefore(aiDiv, container.firstChild)
            
            // 启动打字机效果
            showTypingAnimation(data.summary)
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
