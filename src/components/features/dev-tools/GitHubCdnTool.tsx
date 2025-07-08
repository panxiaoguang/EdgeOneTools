import React, { useState } from "react";
import { Link2, Copy, CheckCircle, AlertCircle, ExternalLink, Github } from "lucide-react";

interface CdnLink {
  name: string;
  url: string;
  copied: boolean;
}

interface ParsedGitHubUrl {
  user: string;
  repo: string;
  branch: string;
  path: string;
}

const CDN_PROVIDERS = [
  { name: "jsDelivr", url: "https://cdn.jsdelivr.net/gh" },
  { name: "jsDelivr (gcore)", url: "https://gcore.jsdelivr.net/gh" },
  { name: "jsDelivr (testingcf)", url: "https://testingcf.jsdelivr.net/gh" },
  { name: "jsDelivr (quantil)", url: "https://quantil.jsdelivr.net/gh" },
  { name: "jsDelivr (fastly)", url: "https://fastly.jsdelivr.net/gh" },
  { name: "jsDelivr (originfastly)", url: "https://originfastly.jsdelivr.net/gh" },
  { name: "jsdmirror", url: "https://cdn.jsdmirror.com/gh" },
];

export const GitHubCdnTool = () => {
  const [input, setInput] = useState("");
  const [cdnLinks, setCdnLinks] = useState<CdnLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copyTimeouts, setCopyTimeouts] = useState<{[key: string]: NodeJS.Timeout}>({});

  const parseGitHubUrl = (url: string): ParsedGitHubUrl | null => {
    try {
      const trimmedUrl = url.trim();
      
      // GitHub Raw URL pattern: https://raw.githubusercontent.com/user/repo/branch/path/to/file
      const rawMatch = trimmedUrl.match(/https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/);
      if (rawMatch) {
        return {
          user: rawMatch[1],
          repo: rawMatch[2],
          branch: rawMatch[3],
          path: rawMatch[4]
        };
      }

      // GitHub Blob URL pattern: https://github.com/user/repo/blob/branch/path/to/file
      const blobMatch = trimmedUrl.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/);
      if (blobMatch) {
        return {
          user: blobMatch[1],
          repo: blobMatch[2],
          branch: blobMatch[3],
          path: blobMatch[4]
        };
      }

      return null;
    } catch (err) {
      return null;
    }
  };

  const generateCdnLinks = () => {
    setError(null);
    setCdnLinks([]);

    if (!input.trim()) {
      setError("请输入GitHub链接");
      return;
    }

    const parsed = parseGitHubUrl(input);
    if (!parsed) {
      setError("无效的GitHub链接。请输入有效的GitHub文件链接或Raw链接");
      return;
    }

    const links: CdnLink[] = CDN_PROVIDERS.map(provider => ({
      name: provider.name,
      url: `${provider.url}/${parsed.user}/${parsed.repo}@${parsed.branch}/${parsed.path}`,
      copied: false
    }));

    setCdnLinks(links);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // 清除之前的超时
      if (copyTimeouts[index]) {
        clearTimeout(copyTimeouts[index]);
      }

      // 更新复制状态
      setCdnLinks(prev => prev.map((link, i) => 
        i === index ? { ...link, copied: true } : link
      ));

      // 设置新的超时来重置状态
      const timeout = setTimeout(() => {
        setCdnLinks(prev => prev.map((link, i) => 
          i === index ? { ...link, copied: false } : link
        ));
      }, 2000);

      setCopyTimeouts(prev => ({ ...prev, [index]: timeout }));
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          GitHub 链接
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl
                      border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 
                      focus:border-transparent transition-all duration-200"
              placeholder="输入GitHub文件链接或Raw链接..."
              onKeyDown={(e) => e.key === 'Enter' && generateCdnLinks()}
            />
          </div>
          <button
            onClick={generateCdnLinks}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-400 to-indigo-400 
                   text-white shadow-sm hover:from-violet-500 hover:to-indigo-500 
                   transition-colors"
          >
            生成CDN链接
          </button>
        </div>
      </div>

      {/* 帮助信息 */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          支持的链接格式：
        </h3>
        <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <div>• GitHub文件链接：https://github.com/user/repo/blob/branch/path/to/file</div>
          <div>• GitHub Raw链接：https://raw.githubusercontent.com/user/repo/branch/path/to/file</div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl
                     bg-red-50 dark:bg-red-900/20 
                     text-red-600 dark:text-red-400
                     border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* CDN链接结果 */}
      {cdnLinks.length > 0 && (
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 
                      dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
            CDN 加速链接
          </h3>
          <div className="space-y-3">
            {cdnLinks.map((link, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white dark:bg-gray-800 
                        border border-gray-200 dark:border-gray-700
                        hover:border-violet-300 dark:hover:border-violet-600 
                        transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {link.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(link.url, index)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        link.copied
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'hover:bg-violet-50 dark:hover:bg-violet-900/20 text-gray-600 dark:text-gray-400 hover:text-violet-500 dark:hover:text-violet-400'
                      }`}
                      title="复制链接"
                    >
                      {link.copied ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openLink(link.url)}
                      className="p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 
                               text-gray-600 dark:text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 
                               transition-colors"
                      title="在新窗口打开"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <code className="text-sm font-mono text-gray-600 dark:text-gray-400 break-all">
                    {link.url}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 清空按钮 */}
      {(input || cdnLinks.length > 0) && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setInput("");
              setCdnLinks([]);
              setError(null);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500
                     text-white shadow-sm hover:from-gray-500 hover:to-gray-600 
                     transition-colors"
          >
            清空
          </button>
        </div>
      )}
    </div>
  );
};

export default GitHubCdnTool;