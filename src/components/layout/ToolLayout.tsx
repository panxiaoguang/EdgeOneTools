import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Menu } from "lucide-react";
import React, { useEffect } from "react";
import { Sidebar } from "../Sidebar";
import { tools } from "@/router";
import { useTheme } from "@/hooks/useTheme";

interface ToolLayoutProps {
  children: React.ReactNode;
}

export const ToolLayout = ({ children }: ToolLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { theme, toggleTheme } = useTheme();

  // 当进入工具页面时，保存当前工具ID
  useEffect(() => {
    if (!isHome && location.pathname.startsWith('/tools/')) {
      const toolId = location.pathname.split('/tools/')[1];
      if (toolId) {
        localStorage.setItem('lastSelectedToolId', toolId);
      }
    }
  }, [location.pathname, isHome]);

  // 处理返回工具箱的点击事件
  const handleReturnToToolbox = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    
    // 延迟滚动，确保页面已渲染
    setTimeout(() => {
      const lastToolId = localStorage.getItem('lastSelectedToolId');
      if (lastToolId) {
        // 查找工具元素并滚动到该位置
        const toolElement = document.querySelector(`[data-tool-id="${lastToolId}"]`);
        if (toolElement) {
          toolElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // 添加高亮效果
          toolElement.classList.add('ring-2', 'ring-purple-400', 'ring-opacity-75');
          setTimeout(() => {
            toolElement.classList.remove('ring-2', 'ring-purple-400', 'ring-opacity-75');
          }, 2000);
        }
      }
    }, 100);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 移动端遮罩层 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <Sidebar
        tools={tools}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        toggleTheme={toggleTheme}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* 主内容区 */}
      <main className="flex-1">
        {/* 移动端顶部导航栏 */}
        <div className="sticky top-0 z-10 lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 h-16">
            <Link
              to="/"
              onClick={handleReturnToToolbox}
              className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 
                       dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent"
            >
              DevTools
            </Link>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {!isHome && (
            <button
              onClick={handleReturnToToolbox}
              className="inline-flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 
                       hover:text-violet-500 dark:hover:text-violet-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>返回工具箱</span>
            </button>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default ToolLayout;
