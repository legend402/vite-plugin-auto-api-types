// 客户端脚本生成器

/**
 * 生成客户端注入脚本
 * @param excludeUrls 排除的URL正则表达式列表
 * @returns HTML脚本字符串
 */
export const getClientScript = (excludeUrls: RegExp[] = []): string => {
    // 将排除的URL正则转为字符串（避免序列化问题）
    const excludeUrlSources = excludeUrls.map(re => re.source);

    return `
      <script>
        // 自动生成的请求拦截脚本
        (() => {
          // 避免重复注入
          if (window.__autoApiTypesInjected) return;
          window.__autoApiTypesInjected = true;

          // 排除的URL列表
          const excludeUrls = ${JSON.stringify(excludeUrlSources)}.map(src => new RegExp(src));
          excludeUrls.push(new RegExp('/__auto_api_types/update'));
          // 向服务端发送类型数据
          const sendTypeData = (url, data) => {
            url = new URL(url)
            fetch('/__auto_api_types/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: url.pathname, data })
            }).catch(err => console.debug('更新API类型失败:', err));
          };

          // ========== 拦截Fetch API ==========
          const originalFetch = window.fetch;
          window.fetch = async function(...args) {
            const [input] = args;
            const url = typeof input === 'string' ? input : input?.url || '';
            
            // 排除指定URL
            if (excludeUrls.some(re => re.test(url))) {
              return originalFetch.apply(this, args);
            }

            try {
              const response = await originalFetch.apply(this, args);
              // 克隆响应避免消费
              const clone = response.clone();
              
              // 只处理JSON响应
              if (clone.headers.get('content-type')?.includes('application/json')) {
                const data = await clone.json();
                sendTypeData(url, data);
              }
              
              return response;
            } catch (err) {
              console.debug('Fetch拦截错误:', err);
              throw err;
            }
          };

          // ========== 拦截XHR请求 ==========
          const originalXHR = window.XMLHttpRequest;
          window.XMLHttpRequest = class extends originalXHR {
            open(method, url, async = true, user = null, password = null) {
              this._apiUrl = typeof url === 'string' ? url : url.toString();
              super.open(method, url, async, user, password);
            }

            send(body = null) {
              const url = this._apiUrl;
              
              if (excludeUrls.some(re => re.test(url))) {
                super.send(body);
                return;
              }

              this.addEventListener('load', () => {
                try {
                  if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
                    const contentType = this.getResponseHeader('content-type');
                    if (contentType?.includes('application/json')) {
                      let data;
                      try {
                        data = this.responseType === 'json' ? this.response : JSON.parse(this.responseText);
                      } catch (e) {
                        console.debug('解析XHR响应失败:', e);
                        return;
                      }
                      sendTypeData(url, data);
                    }
                  }
                } catch (err) {
                  console.debug('XHR拦截错误:', err);
                }
              });

              super.send(body);
            }
          };
        })();
      </script>
    `;
};