import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { DevTools } from "@/pages/DevTools";
import { ErrorPage } from "@/pages/ErrorPage";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Skeleton } from '@/components/ui/Skeleton';
import PixivPage from "@/pages/PixivPage";

export const JsonEditor = React.lazy(
  () => import("../components/features/dev-tools/JsonEditor")
);
export const RegexTester = React.lazy(
  () => import("../components/features/dev-tools/RegexTester")
);
export const ColorPicker = React.lazy(
  () => import("../components/features/style-tools/ColorPicker")
);
export const Base64Tool = React.lazy(
  () => import("../components/features/encode-tools/Base64Tool")
);
export const TimeConverter = React.lazy(
  () => import("../components/features/style-tools/TimeConverter")
);
export const JwtTool = React.lazy(
  () => import("../components/features/encode-tools/JwtTool")
);
export const HashTool = React.lazy(
  () => import("../components/features/encode-tools/HashTool")
);
export const ImageConverter = React.lazy(
  () => import("../components/features/image-tools/ImageConverter")
);
export const ImageCompressor = React.lazy(
  () => import("../components/features/image-tools/ImageCompressor")
);
export const SvgEditor = React.lazy(
  () => import("../components/features/image-tools/SvgEditor")
);
export const QrCodeTool = React.lazy(
  () => import("../components/features/dev-tools/QrCodeTool")
);
export const MarkdownEditor = React.lazy(
  () => import("../components/features/dev-tools/MarkdownEditor")
);
export const TypographyTool = React.lazy(
  () => import("../components/features/style-tools/TypographyTool")
);
export const EmojiPicker = React.lazy(
  () => import("../components/features/style-tools/emoji-tools/EmojiPicker")
);
export const DataVisualization = React.lazy(
  () => import("../components/features/dev-tools/DataVisualization")
);
export const GitHubCdnTool = React.lazy(
  () => import("../components/features/dev-tools/GitHubCdnTool")
);
export const GenomeSequence = React.lazy(
  () => import("../components/features/bio-tools/GenomeSequence")
);
export const BlatSearch = React.lazy(
  () => import("../components/features/bio-tools/BlatSearch")
);
export const SequenceConverter = React.lazy(
  () => import("../components/features/bio-tools/SequenceConverter")
);
export const PairwiseAlignment = React.lazy(
  () => import("../components/features/bio-tools/PairwiseAlignment")
);

import {
  Code2,
  FileJson,
  Regex,
  Palette,
  KeyRound,
  Hash,
  Timer,
  Binary,
  Image,
  QrCode,
  Type,
  FileText,
  Smile,
  BarChart,
  Link,
  Dna,
  Search,
  RefreshCw,
  ArrowRightLeft,
} from "lucide-react";

export const tools = [
  {
    category: "编码转换",
    items: [
      {
        id: "base64",
        label: "Base64",
        icon: Binary,
        component: Base64Tool,
        description: "快速进行Base64编码和解码转换",
      },
      {
        id: "jwt",
        label: "JWT解析",
        icon: KeyRound,
        component: JwtTool,
        description: "解析和验证JWT令牌，查看Payload内容",
      },
      {
        id: "hash",
        label: "哈希计算",
        icon: Hash,
        component: HashTool,
        description: "计算文本的MD5、SHA1、SHA256等哈希值",
      },
    ],
  },
  {
    category: "开发工具",
    items: [
      {
        id: "json",
        label: "JSON工具",
        icon: FileJson,
        component: JsonEditor,
        description: "JSON格式化、压缩、验证和转换",
      },
      {
        id: "regex",
        label: "正则测试",
        icon: Regex,
        component: RegexTester,
        description: "正则表达式在线测试和验证工具",
      },
      {
        id: "qrcode",
        label: "二维码工具",
        icon: QrCode,
        component: QrCodeTool,
        description: "生成和解析二维码，支持自定义样式",
      },
      {
        id: "markdown",
        label: "Markdown编辑器",
        icon: FileText,
        component: MarkdownEditor,
        description: "所见即所得的Markdown编辑和预览",
      },
      {
        id: "data-visualization",
        label: "数据可视化",
        icon: BarChart,
        component: DataVisualization,
        description: "数据图表生成工具",
      },
      {
        id: "github-cdn",
        label: "GitHub CDN",
        icon: Link,
        component: GitHubCdnTool,
        description: "GitHub文件CDN加速链接生成工具",
      },
    ],
  },
  {
    category: "样式工具",
    items: [
      {
        id: "color",
        label: "颜色工具",
        icon: Palette,
        component: ColorPicker,
        description: "颜色选择、转换和调色板生成",
      },
      {
        id: "time",
        label: "时间转换",
        icon: Timer,
        component:TimeConverter,
        description: "时间戳转换、格式化和时区转换",
      },
      {
        id: "typography",
        label: "字体工具",
        icon: Type,
        component: TypographyTool,
        description: "字体预览、单位转换和文本处理",
      },
      {
        id: "emoji",
        label: "表情工具",
        icon: Smile,
        component: EmojiPicker,
        description: "表情符号搜索和复制工具",
      },
    ],
  },
  {
    category: "生信工具",
    items: [
      {
        id: "genome-sequence",
        label: "获取基因组",
        icon: Dna,
        component: GenomeSequence,
        description: "从UCSC基因组数据库获取指定区域的DNA序列",
      },
      {
        id: "blat-search",
        label: "查找基因组",
        icon: Search,
        component: BlatSearch,
        description: "使用UCSC BLAT工具在基因组中搜索序列相似性",
      },
      {
        id: "sequence-converter",
        label: "序列转换",
        icon: RefreshCw,
        component: SequenceConverter,
        description: "DNA序列格式转换、反向互补和蛋白质翻译",
      },
      {
        id: "pairwise-alignment",
        label: "双序列比对",
        icon: ArrowRightLeft,
        component: PairwiseAlignment,
        description: "DNA双序列全局比对，可选择正向或反向互补序列",
      },
    ],
  },
  {
    category: "图像工具",
    items: [
      {
        id: "pixiv",
        label: "Pixiv图片",
        icon: Image,
        component: PixivPage,
        description: "随机获取 Pixiv 图片，支持多种筛选条件",
      },
      {
        id: "image-convert",
        label: "图片转换",
        icon: Image,
        component: ImageConverter,
        description: "图片格式转换，支持常见图片格式",
      },
      {
        id: "image-compress",
        label: "图片压缩",
        icon: Image,
        component: ImageCompressor,
        description: "在线图片压缩，保持最佳质量",
      },
      {
        id: "svg-editor",
        label: "SVG编辑",
        icon: Image,
        component: SvgEditor,
        description: "SVG在线编辑和优化工具",
      },
    ],
  },
];

// 创建路由配置
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Skeleton />}>
        <ToolLayout>
          <DevTools tools={tools} />
        </ToolLayout>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  ...tools.flatMap((category) =>
    category.items.map((tool) => ({
      path: `/tools/${tool.id}`,
      element: (
        <Suspense fallback={<Skeleton />}>
          <ToolLayout>
            <tool.component />
          </ToolLayout>
        </Suspense>
      ),
      errorElement: <ErrorPage />,
    }))
  ),
]);
