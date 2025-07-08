# DevTools 开发者工具箱(使用EdgeOne部署)

一个集成了常用开发工具的在线工具箱，包括GPT 智能对话、代码格式化、颜色选择器、二维码生成/解析等功能。

[在线体验](https://devtools.xiaohanys.so.kg/)

![工具箱预览](https://tncache1-f1.v3mh.com/image/2025/07/08/72c25c2ced493d8921ad33f6979bba37.png)

## 🚀 功能特性

### 编码工具
- Base64 编解码
- JWT Token 解析
- Hash 计算工具
- 正则表达式测试

### 样式工具
- 颜色选择器/调色板
- 排版工具
- 时间格式转换

### 实用工具
- 二维码生成/解析
- Emoji 选择器
- Github CDN: 输入Github链接转换为CDN静态资源

### 数据工具
- 数据可视化
  - 支持多种图表类型：折线图、柱状图、饼图、雷达图、散点图、玫瑰图
  - 内置数据模板：销售数据、人口分布、技能评估
  - 支持 JSON 和 CSV 格式数据导入
  - 自定义配色方案
  - 响应式布局

### 生信工具
- 根据位置获取基因组序列
- 根据基因组序列获取基因位置
- 修改序列（反向互补，翻译）
- 双序列比对

  
## 🛠️ 技术栈

- React 18
- TypeScript
- React Router v6
- Tailwind CSS
- OpenAI API
- Monaco Editor
- Lucide Icons
- Recharts

## 📦 快速开始

### 安装依赖

```bash
npm install
npm install -g edgeone
```

### 启动开发服务器
```bash
# 启动前端
npm run dev

# 启动后端
edgeone pages dev
```

### 构建项目
```bash
npm run build
```

## 📝 开发说明

- 前端运行在 5173 端口
- 后端运行在 8088 端口
- 使用 Vite 作为构建工具
- 使用 TypeScript 进行类型检查
- 使用 Tailwind CSS 进行样式管理
