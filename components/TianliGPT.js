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

      // 4. 等待 JS 加载完成后手动触发
      setTimeout(() => {
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
