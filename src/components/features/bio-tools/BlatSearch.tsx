import React, { useState } from "react";
import { Search, Copy, Download, AlertCircle, Info, ExternalLink } from "lucide-react";

interface BlatRawData {
  blat?: string[][];
  raw_response?: string;
  content_type?: string;
  error?: string;
}

interface BlatTableRow {
  score: string;
  qStart: string;
  qEnd: string;
  strand: string;
  chrom: string;
  tStart: string;
  tEnd: string;
  span: string;
}

export const BlatSearch = () => {
  const [userSeq, setUserSeq] = useState("");
  const [seqType, setSeqType] = useState("DNA");
  const [database, setDatabase] = useState("hg38");
  const [result, setResult] = useState<BlatRawData | null>(null);
  const [parsedData, setParsedData] = useState<BlatTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seqTypeOptions = [
    { value: "DNA", label: "DNA" },
    { value: "RNA", label: "RNA" },
    { value: "protein", label: "蛋白质" },
    { value: "translated%20RNA", label: "翻译RNA" },
    { value: "translated%20DNA", label: "翻译DNA" },
  ];

  const databaseOptions = [
    { value: "hg38", label: "Human (hg38)" },
    { value: "hg19", label: "Human (hg19)" },
    { value: "mm10", label: "Mouse (mm10)" },
    { value: "mm39", label: "Mouse (mm39)" },
    { value: "danRer11", label: "Zebrafish (danRer11)" },
    { value: "dm6", label: "Drosophila (dm6)" },
    { value: "ce11", label: "C. elegans (ce11)" },
  ];

  const validateSequence = (seq: string, type: string) => {
    const cleanSeq = seq.replace(/\s/g, '').toUpperCase();
    
    if (cleanSeq.length === 0) {
      throw new Error("请输入序列");
    }

    if (type === "DNA") {
      if (!/^[ATCGN]*$/.test(cleanSeq)) {
        throw new Error("DNA序列只能包含 A, T, C, G, N 字符");
      }
    } else if (type === "RNA") {
      if (!/^[AUCGN]*$/.test(cleanSeq)) {
        throw new Error("RNA序列只能包含 A, U, C, G, N 字符");
      }
    } else if (type === "protein") {
      if (!/^[ACDEFGHIKLMNPQRSTVWY]*$/.test(cleanSeq)) {
        throw new Error("蛋白质序列只能包含标准氨基酸字符");
      }
    }

    return cleanSeq;
  };

  const parseBlatData = (blatData: string[][], sequenceType: string): BlatTableRow[] => {
    const scaleFactor = sequenceType === "protein" ? 3 : 1;
    
    return blatData.map((rawData) => {
      const matches = parseInt(rawData[0]);
      const misMatches = parseInt(rawData[1]);
      const repMatches = parseInt(rawData[2]);
      const qinsert = parseInt(rawData[4]);
      const tinsert = parseInt(rawData[6]);
      
      // Calculate score using the same formula as Python code
      const score = scaleFactor * (matches + Math.round(repMatches / 2)) - 
                   scaleFactor * misMatches - qinsert - tinsert;
      
      return {
        score: score.toString(),
        qStart: (parseInt(rawData[11]) + 1).toString(), // Convert to 1-based
        qEnd: rawData[12],
        strand: rawData[8],
        chrom: rawData[13],
        tStart: (parseInt(rawData[15]) + 1).toString(), // Convert to 1-based
        tEnd: rawData[16],
        span: rawData[18]
      };
    });
  };

  const performBlatSearch = async () => {
    if (!userSeq.trim()) {
      setError("请输入要搜索的序列");
      return;
    }

    setLoading(true);
    setError(null);
    setParsedData([]);

    try {
      const cleanSeq = validateSequence(userSeq, seqType);

      const requestBody = {
        userSeq: cleanSeq,
        type: seqType,
        db: database,
        output: "json",
      };

      const response = await fetch('/api/blat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `请求失败 ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      // Parse BLAT data if it's in the expected format
      if (data.blat && Array.isArray(data.blat) && data.blat.length > 0) {
        const tableData = parseBlatData(data.blat, seqType);
        setParsedData(tableData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "BLAT搜索失败");
      setResult(null);
      setParsedData([]);
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

  const downloadResult = () => {
    if (!result) return;

    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    if (parsedData.length > 0) {
      // Download parsed table data as TSV
      const headers = ['Score', 'Q.Start', 'Q.End', 'Strand', 'Chrom', 'T.Start', 'T.End', 'Span'];
      const tsvContent = [
        headers.join('\t'),
        ...parsedData.map(row => [
          row.score, row.qStart, row.qEnd, row.strand, 
          row.chrom, row.tStart, row.tEnd, row.span
        ].join('\t'))
      ].join('\n');
      
      content = tsvContent;
      filename = `blat_results_${database}.tsv`;
      mimeType = 'text/tab-separated-values';
    } else if (result.raw_response) {
      content = result.raw_response;
      filename = `blat_result_${database}.txt`;
    } else {
      content = JSON.stringify(result, null, 2);
      filename = `blat_result_${database}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyTableData = () => {
    if (parsedData.length === 0) return;
    
    const headers = ['Score', 'Q.Start', 'Q.End', 'Strand', 'Chrom', 'T.Start', 'T.End', 'Span'];
    const tsvContent = [
      headers.join('\t'),
      ...parsedData.map(row => [
        row.score, row.qStart, row.qEnd, row.strand, 
        row.chrom, row.tStart, row.tEnd, row.span
      ].join('\t'))
    ].join('\n');
    
    copyToClipboard(tsvContent);
  };

  const formatSequenceInput = (seq: string) => {
    return seq.replace(/(.{60})/g, '$1\n');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          查找基因组 (BLAT)
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          使用UCSC BLAT工具在基因组中搜索序列相似性
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              输入序列
            </label>
            <textarea
              value={userSeq}
              onChange={(e) => setUserSeq(e.target.value)}
              placeholder="输入DNA、RNA或蛋白质序列..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              支持FASTA格式，序列长度建议在25-8000个字符之间
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                序列类型
              </label>
              <select
                value={seqType}
                onChange={(e) => setSeqType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {seqTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                目标数据库
              </label>
              <select
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {databaseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={performBlatSearch}
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? "搜索中..." : "开始BLAT搜索"}
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

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex">
            <Info className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
            <div className="text-blue-700 dark:text-blue-300 text-sm">
              <p className="font-medium mb-1">BLAT搜索说明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>DNA/RNA序列：推荐长度25-8000个字符</li>
                <li>蛋白质序列：推荐长度8-2000个字符</li>
                <li>支持模糊字符：N（核酸）、X（蛋白质）</li>
                <li>搜索结果显示在目标基因组中的匹配位置</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              BLAT搜索结果
            </h3>
            <div className="flex space-x-2">
              {parsedData.length > 0 && (
                <button
                  onClick={copyTableData}
                  className="flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  复制表格
                </button>
              )}
              <button
                onClick={downloadResult}
                className="flex items-center px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/40"
              >
                <Download className="w-4 h-4 mr-1" />
                下载结果
              </button>
            </div>
          </div>

          {parsedData.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                <p className="text-green-700 dark:text-green-300 text-sm">
                  找到 {parsedData.length} 个匹配结果
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                        Score
                      </th>
                      <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                        Q.Start
                      </th>
                      <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                        Q.End
                      </th>
                      <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                        Strand
                      </th>
                      <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                        Chrom
                      </th>
                      <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                        T.Start
                      </th>
                      <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                        T.End
                      </th>
                      <th className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                        Span
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 font-medium text-blue-600 dark:text-blue-400">
                          {row.score}
                        </td>
                        <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                          {row.qStart}
                        </td>
                        <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                          {row.qEnd}
                        </td>
                        <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            row.strand === '+' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            {row.strand}
                          </span>
                        </td>
                        <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-mono">
                          {row.chrom}
                        </td>
                        <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-mono">
                          {row.tStart}
                        </td>
                        <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-mono">
                          {row.tEnd}
                        </td>
                        <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                          {row.span}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                <p><strong>说明：</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><strong>Score:</strong> 匹配得分，考虑匹配、错配和插入缺失</li>
                  <li><strong>Q.Start/Q.End:</strong> 查询序列的起始和结束位置（1-based）</li>
                  <li><strong>Strand:</strong> 匹配链方向（+ 正链，- 负链）</li>
                  <li><strong>T.Start/T.End:</strong> 目标基因组的起始和结束位置（1-based）</li>
                  <li><strong>Span:</strong> 匹配区域的跨度</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                原始搜索结果 (JSON 格式)
              </h4>
              <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                {result.raw_response || JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {result.content_type && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Content-Type: {result.content_type}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlatSearch;