import React, { useState } from "react";
import { Search, Copy, Download, AlertCircle, CheckCircle } from "lucide-react";

interface GenomeSequenceResult {
  dna: string;
  strand: string;
  start: number;
  stop: number;
}

export const GenomeSequence = () => {
  const [genome, setGenome] = useState("hg38");
  const [coordinates, setCoordinates] = useState("");
  const [reverseComplement, setReverseComplement] = useState(false);
  const [result, setResult] = useState<GenomeSequenceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genomeOptions = [
    { value: "hg38", label: "Human (hg38)" },
    { value: "hg19", label: "Human (hg19)" },
    { value: "mm10", label: "Mouse (mm10)" },
    { value: "mm39", label: "Mouse (mm39)" },
    { value: "danRer11", label: "Zebrafish (danRer11)" },
    { value: "dm6", label: "Drosophila (dm6)" },
    { value: "ce11", label: "C. elegans (ce11)" },
  ];

  const parseCoordinates = (coords: string) => {
    const match = coords.match(/^(chr\w+):(\d+)-(\d+)$/);
    if (!match) {
      throw new Error("坐标格式错误，请使用格式：chr1:100-200");
    }
    
    const [, chrom, start, end] = match;
    const startNum = parseInt(start);
    const endNum = parseInt(end);
    
    if (startNum >= endNum) {
      throw new Error("起始位置必须小于结束位置");
    }
    
    return { chrom, start: startNum, end: endNum };
  };

  const fetchGenomeSequence = async () => {
    if (!coordinates.trim()) {
      setError("请输入坐标");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { chrom, start, end } = parseCoordinates(coordinates.trim());
      
      // Convert to 0-based coordinates for UCSC API (subtract 1 from start)
      const zeroBasedStart = start - 1;
      
      const params = new URLSearchParams({
        genome,
        chrom,
        start: zeroBasedStart.toString(),
        end: end.toString(),
        reverse: reverseComplement.toString(),
      });

      const response = await fetch(`/api/dna-sequence?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `请求失败 ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取序列失败");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const downloadFasta = () => {
    if (!result) return;

    const fastaContent = `>${genome}:${coordinates}${reverseComplement ? '_reverse_complement' : ''}\n${result.dna}`;
    const blob = new Blob([fastaContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${genome}_${coordinates.replace(/:/g, "_").replace(/-/g, "_")}.fasta`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatSequence = (sequence: string) => {
    return sequence.match(/.{1,80}/g)?.join('\n') || sequence;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          获取基因组序列
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          从UCSC基因组数据库获取指定区域的DNA序列
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                基因组版本
              </label>
              <select
                value={genome}
                onChange={(e) => setGenome(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {genomeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                基因组坐标
              </label>
              <input
                type="text"
                value={coordinates}
                onChange={(e) => setCoordinates(e.target.value)}
                placeholder="例: chr1:100-200"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                输入1-based坐标，系统会自动转换为0-based
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="reverseComplement"
              checked={reverseComplement}
              onChange={(e) => setReverseComplement(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="reverseComplement" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              获取反向互补序列
            </label>
          </div>

          <button
            onClick={fetchGenomeSequence}
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? "获取中..." : "获取序列"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              序列结果
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(result.dna)}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Copy className="w-4 h-4 mr-1" />
                复制
              </button>
              <button
                onClick={downloadFasta}
                className="flex items-center px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/40"
              >
                <Download className="w-4 h-4 mr-1" />
                下载FASTA
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                位置: {result.start} - {result.stop}
              </span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                链: {result.strand || (reverseComplement ? "负链" : "正链")}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              DNA序列 ({result.dna.length} bp)
            </h4>
            <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
              {formatSequence(result.dna)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenomeSequence;