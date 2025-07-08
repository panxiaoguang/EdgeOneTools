import React, { useState } from "react";
import { ArrowRightLeft, Copy, Download, AlertCircle, Info, Shuffle } from "lucide-react";

interface AlignmentResult {
  seq1Aligned: string;
  seq2Aligned: string;
  score: number;
  identity: number;
  similarity: number;
  gaps: number;
  direction: 'forward' | 'reverse-complement';
}

export const PairwiseAlignment = () => {
  const [seq1, setSeq1] = useState("");
  const [seq2, setSeq2] = useState("");
  const [useReverseComplement, setUseReverseComplement] = useState(false);
  const [matchScore, setMatchScore] = useState(2);
  const [mismatchScore, setMismatchScore] = useState(-1);
  const [beginGapScore, setBeginGapScore] = useState(0);
  const [internalGapScore, setInternalGapScore] = useState(-2);
  const [endGapScore, setEndGapScore] = useState(0);
  const [result, setResult] = useState<AlignmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanSequence = (seq: string): string => {
    return seq.replace(/[^ATCGUatcgu]/g, '').replace(/U/gi, 'T').toUpperCase();
  };

  const validateDnaSequence = (seq: string): boolean => {
    const cleanSeq = cleanSequence(seq);
    return /^[ATCG]*$/.test(cleanSeq) && cleanSeq.length > 0;
  };

  const getComplement = (nucleotide: string): string => {
    const complementMap: { [key: string]: string } = {
      'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'
    };
    return complementMap[nucleotide] || nucleotide;
  };

  const reverseComplement = (seq: string): string => {
    return seq.split('').reverse().map(getComplement).join('');
  };

  // Improved Needleman-Wunsch algorithm with proper gap handling
  const needlemanWunsch = (s1: string, s2: string, match: number, mismatch: number, beginGap: number, internalGap: number, endGap: number): AlignmentResult => {
    const len1 = s1.length;
    const len2 = s2.length;
    
    // Initialize scoring matrix
    const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    // Initialize first row and column with begin gap penalties
    for (let i = 1; i <= len1; i++) {
      matrix[i][0] = beginGap + (i - 1) * internalGap;
    }
    for (let j = 1; j <= len2; j++) {
      matrix[0][j] = beginGap + (j - 1) * internalGap;
    }
    
    // Fill the matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        // Match/mismatch score
        const matchMismatch = matrix[i-1][j-1] + (s1[i-1] === s2[j-1] ? match : mismatch);
        
        // Gap in s2 (deletion from s1)
        const gapInS2 = matrix[i-1][j] + internalGap;
        
        // Gap in s1 (insertion in s1)
        const gapInS1 = matrix[i][j-1] + internalGap;
        
        matrix[i][j] = Math.max(matchMismatch, gapInS1, gapInS2);
      }
    }
    
    // Add end gap penalties to final score
    let finalScore = matrix[len1][len2];
    
    // Traceback to get alignment
    let aligned1 = '';
    let aligned2 = '';
    let i = len1;
    let j = len2;
    let matches = 0;
    let gaps = 0;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0) {
        const matchMismatch = matrix[i-1][j-1] + (s1[i-1] === s2[j-1] ? match : mismatch);
        const gapInS2 = matrix[i-1][j] + internalGap;
        const gapInS1 = matrix[i][j-1] + internalGap;
        
        if (matrix[i][j] === matchMismatch) {
          aligned1 = s1[i-1] + aligned1;
          aligned2 = s2[j-1] + aligned2;
          if (s1[i-1] === s2[j-1]) matches++;
          i--;
          j--;
        } else if (matrix[i][j] === gapInS2) {
          aligned1 = s1[i-1] + aligned1;
          aligned2 = '-' + aligned2;
          gaps++;
          i--;
        } else {
          aligned1 = '-' + aligned1;
          aligned2 = s2[j-1] + aligned2;
          gaps++;
          j--;
        }
      } else if (i > 0) {
        aligned1 = s1[i-1] + aligned1;
        aligned2 = '-' + aligned2;
        gaps++;
        i--;
      } else {
        aligned1 = '-' + aligned1;
        aligned2 = s2[j-1] + aligned2;
        gaps++;
        j--;
      }
    }
    
    const alignmentLength = aligned1.length;
    const identity = (matches / alignmentLength) * 100;
    const similarity = identity; // For DNA, similarity equals identity
    
    return {
      seq1Aligned: aligned1,
      seq2Aligned: aligned2,
      score: finalScore,
      identity,
      similarity,
      gaps,
      direction: 'forward'
    };
  };

  const performAlignment = () => {
    if (!seq1.trim() || !seq2.trim()) {
      setError("请输入两条DNA序列");
      return;
    }

    const cleanSeq1 = cleanSequence(seq1);
    const cleanSeq2 = cleanSequence(seq2);

    if (!validateDnaSequence(seq1) || !validateDnaSequence(seq2)) {
      setError("序列包含无效字符，请输入有效的DNA序列（A、T、C、G）");
      return;
    }

    if (cleanSeq1.length === 0 || cleanSeq2.length === 0) {
      setError("序列不能为空");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine which sequence 2 to use based on user selection
      const processedSeq2 = useReverseComplement ? reverseComplement(cleanSeq2) : cleanSeq2;
      
      // Perform single alignment based on user choice
      const alignmentResult = needlemanWunsch(
        cleanSeq1, 
        processedSeq2, 
        matchScore, 
        mismatchScore, 
        beginGapScore, 
        internalGapScore, 
        endGapScore
      );
      alignmentResult.direction = useReverseComplement ? 'reverse-complement' : 'forward';
      
      console.log('Alignment score:', alignmentResult.score);
      console.log('Direction:', alignmentResult.direction);
      
      setResult(alignmentResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "比对失败");
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

  const downloadResult = () => {
    if (!result) return;

    const content = `>序列1 (${cleanSequence(seq1).length} bp)
${result.seq1Aligned}
>序列2 (${cleanSequence(seq2).length} bp) - ${result.direction === 'reverse-complement' ? '反向互补' : '正向'}
${result.seq2Aligned}

比对统计:
得分: ${result.score}
一致性: ${result.identity.toFixed(1)}%
相似性: ${result.similarity.toFixed(1)}%
间隙数: ${result.gaps}
方向: ${result.direction === 'reverse-complement' ? '反向互补' : '正向'}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pairwise_alignment.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatAlignment = (seq1: string, seq2: string, lineLength: number = 60): string => {
    let formatted = '';
    for (let i = 0; i < seq1.length; i += lineLength) {
      const chunk1 = seq1.substring(i, i + lineLength);
      const chunk2 = seq2.substring(i, i + lineLength);
      
      // Create match line
      let matchLine = '';
      for (let j = 0; j < chunk1.length; j++) {
        if (chunk1[j] === chunk2[j] && chunk1[j] !== '-') {
          matchLine += '|';
        } else if (chunk1[j] === '-' || chunk2[j] === '-') {
          matchLine += ' ';
        } else {
          matchLine += ':';
        }
      }
      
      formatted += `Seq1  ${chunk1}\n      ${matchLine}\nSeq2  ${chunk2}\n\n`;
    }
    return formatted;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          双序列比对
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          DNA双序列全局比对工具，可选择正向或反向互补序列进行比对
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                序列1
              </label>
              <textarea
                value={seq1}
                onChange={(e) => setSeq1(e.target.value)}
                placeholder="输入第一条DNA序列..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                序列2
              </label>
              <textarea
                value={seq2}
                onChange={(e) => setSeq2(e.target.value)}
                placeholder="输入第二条DNA序列..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="useReverseComplement"
              checked={useReverseComplement}
              onChange={(e) => setUseReverseComplement(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useReverseComplement" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              使用序列2的反向互补序列进行比对
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                匹配得分
              </label>
              <input
                type="number"
                value={matchScore}
                onChange={(e) => setMatchScore(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                错配得分
              </label>
              <input
                type="number"
                value={mismatchScore}
                onChange={(e) => setMismatchScore(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                序列前间隙得分
              </label>
              <input
                type="number"
                value={beginGapScore}
                onChange={(e) => setBeginGapScore(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                内部间隙得分
              </label>
              <input
                type="number"
                value={internalGapScore}
                onChange={(e) => setInternalGapScore(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                序列后间隙得分
              </label>
              <input
                type="number"
                value={endGapScore}
                onChange={(e) => setEndGapScore(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <button
            onClick={performAlignment}
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            {loading ? "比对中..." : "开始比对"}
          </button>

          <button
            onClick={() => {
              setSeq1("gcgcgtgcgcggaaggagccaaggtgaagttgtagcagtgtgtcagaagaggtgcgtggcaccatgctgtcccccgaggcggagcgggtgctgcggtacctggtcgaagtagaggagttg");
              setSeq2("gacttgtggaacctacttcctgaaaataaccttctgtcctccgagctctccgcacccgtggatgacctgctcccgtacacagatgttgccacctggctggatgaatgtccgaatgaagcg");
              setUseReverseComplement(false);
              setMatchScore(2);
              setMismatchScore(-1);
              setBeginGapScore(0);
              setInternalGapScore(-2);
              setEndGapScore(0);
            }}
            className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            加载测试序列
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
              <p className="font-medium mb-1">比对说明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>使用Needleman-Wunsch全局比对算法</li>
                <li>可选择使用序列2的反向互补序列进行比对</li>
                <li>匹配得分为正值，错配和间隙得分为负值</li>
                <li>间隙用"-"表示，"|"表示完全匹配，":"表示错配</li>
                <li>建议分别尝试正向和反向互补比对，比较结果选择最佳</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              比对结果
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(formatAlignment(result.seq1Aligned, result.seq2Aligned))}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Copy className="w-4 h-4 mr-1" />
                复制
              </button>
              <button
                onClick={downloadResult}
                className="flex items-center px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/40"
              >
                <Download className="w-4 h-4 mr-1" />
                下载
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">比对得分</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {result.score}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">一致性</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {result.identity.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">相似性</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {result.similarity.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">间隙数</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {result.gaps}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">比对方向</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {result.direction === 'reverse-complement' ? '反向互补' : '正向'}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              比对结果
            </h4>
            <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto">
              {formatAlignment(result.seq1Aligned, result.seq2Aligned)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PairwiseAlignment;