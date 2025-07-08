import React, { useState } from "react";
import { RotateCcw, Copy, Download, AlertCircle, Shuffle } from "lucide-react";

export const SequenceConverter = () => {
  const [inputSeq, setInputSeq] = useState("");
  const [operation, setOperation] = useState("upper");
  const [readingFrame, setReadingFrame] = useState(1);
  const [geneticCode, setGeneticCode] = useState("standard");
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Standard genetic code table
  const geneticCodes = {
    standard: {
      name: "标准遗传密码",
      table: {
        'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
        'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
        'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
        'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
        'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
        'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
        'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
        'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
        'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
        'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
        'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
        'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
        'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
        'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
        'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
        'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
      }
    },
    mitochondrial: {
      name: "线粒体遗传密码",
      table: {
        'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
        'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
        'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
        'TGT': 'C', 'TGC': 'C', 'TGA': 'W', 'TGG': 'W',
        'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
        'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
        'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
        'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
        'ATT': 'I', 'ATC': 'I', 'ATA': 'M', 'ATG': 'M',
        'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
        'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
        'AGT': 'S', 'AGC': 'S', 'AGA': '*', 'AGG': '*',
        'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
        'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
        'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
        'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
      }
    }
  };

  const operationOptions = [
    { value: "upper", label: "转换为大写" },
    { value: "lower", label: "转换为小写" },
    { value: "reverse", label: "反向序列" },
    { value: "complement", label: "互补序列" },
    { value: "reverse-complement", label: "反向互补序列" },
    { value: "translate", label: "翻译为蛋白质" },
  ];

  const geneticCodeOptions = [
    { value: "standard", label: "标准遗传密码" },
    { value: "mitochondrial", label: "线粒体遗传密码" },
  ];

  const readingFrameOptions = [
    { value: 1, label: "读框 1" },
    { value: 2, label: "读框 2" },
    { value: 3, label: "读框 3" },
  ];

  const cleanSequence = (seq: string): string => {
    // Remove whitespace, numbers, and non-nucleotide characters
    return seq.replace(/[^ATCGUatcgu]/g, '').replace(/U/gi, 'T');
  };

  const validateDnaSequence = (seq: string): boolean => {
    const cleanSeq = cleanSequence(seq);
    return /^[ATCGatcg]*$/.test(cleanSeq) && cleanSeq.length > 0;
  };

  const getComplement = (nucleotide: string): string => {
    const complementMap: { [key: string]: string } = {
      'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C',
      'a': 't', 't': 'a', 'c': 'g', 'g': 'c'
    };
    return complementMap[nucleotide] || nucleotide;
  };

  const reverseSequence = (seq: string): string => {
    return seq.split('').reverse().join('');
  };

  const complementSequence = (seq: string): string => {
    return seq.split('').map(getComplement).join('');
  };

  const reverseComplementSequence = (seq: string): string => {
    return complementSequence(reverseSequence(seq));
  };

  const translateSequence = (seq: string, frame: number, code: string): string => {
    const cleanSeq = cleanSequence(seq).toUpperCase();
    const codonTable = geneticCodes[code as keyof typeof geneticCodes].table;
    
    // Adjust for reading frame (1-based to 0-based)
    const startPos = frame - 1;
    const sequence = cleanSeq.substring(startPos);
    
    let protein = '';
    for (let i = 0; i < sequence.length; i += 3) {
      const codon = sequence.substring(i, i + 3);
      if (codon.length === 3) {
        const aa = codonTable[codon as keyof typeof codonTable] || 'X';
        protein += aa;
      }
    }
    
    return protein;
  };

  const performOperation = () => {
    if (!inputSeq.trim()) {
      setError("请输入DNA序列");
      return;
    }

    setError(null);
    const cleanSeq = cleanSequence(inputSeq);

    try {
      let output = "";

      switch (operation) {
        case "upper":
          output = cleanSeq.toUpperCase();
          break;
        case "lower":
          output = cleanSeq.toLowerCase();
          break;
        case "reverse":
          output = reverseSequence(cleanSeq);
          break;
        case "complement":
          if (!validateDnaSequence(inputSeq)) {
            throw new Error("序列包含无效字符，请输入有效的DNA序列（A、T、C、G）");
          }
          output = complementSequence(cleanSeq);
          break;
        case "reverse-complement":
          if (!validateDnaSequence(inputSeq)) {
            throw new Error("序列包含无效字符，请输入有效的DNA序列（A、T、C、G）");
          }
          output = reverseComplementSequence(cleanSeq);
          break;
        case "translate":
          if (!validateDnaSequence(inputSeq)) {
            throw new Error("序列包含无效字符，请输入有效的DNA序列（A、T、C、G）");
          }
          output = translateSequence(cleanSeq, readingFrame, geneticCode);
          break;
        default:
          throw new Error("未知操作");
      }

      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
      setResult("");
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

    const operationNames: { [key: string]: string } = {
      "upper": "uppercase",
      "lower": "lowercase", 
      "reverse": "reverse",
      "complement": "complement",
      "reverse-complement": "reverse_complement",
      "translate": "translation"
    };

    const filename = `sequence_${operationNames[operation]}.txt`;
    const content = operation === "translate" 
      ? `>Protein translation (Reading frame ${readingFrame}, ${geneticCodes[geneticCode as keyof typeof geneticCodes].name})\n${result}`
      : `>DNA sequence (${operationOptions.find(op => op.value === operation)?.label})\n${result}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatSequence = (sequence: string, lineLength: number = 80): string => {
    if (operation === "translate") {
      // Format protein sequence with 60 characters per line
      return sequence.match(/.{1,60}/g)?.join('\n') || sequence;
    }
    // Format DNA sequence with 80 characters per line
    return sequence.match(new RegExp(`.{1,${lineLength}}`, 'g'))?.join('\n') || sequence;
  };

  const getSequenceInfo = (seq: string) => {
    if (operation === "translate") {
      const stopCodons = (seq.match(/\*/g) || []).length;
      return {
        length: seq.length,
        type: "氨基酸",
        stopCodons: stopCodons
      };
    } else {
      const cleanSeq = cleanSequence(seq);
      const counts = {
        A: (cleanSeq.match(/[Aa]/g) || []).length,
        T: (cleanSeq.match(/[Tt]/g) || []).length,
        C: (cleanSeq.match(/[Cc]/g) || []).length,
        G: (cleanSeq.match(/[Gg]/g) || []).length,
      };
      const gcContent = ((counts.G + counts.C) / cleanSeq.length * 100).toFixed(1);
      
      return {
        length: cleanSeq.length,
        type: "核苷酸",
        counts,
        gcContent
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          序列转换
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          DNA序列格式转换、反向互补和蛋白质翻译工具
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              输入DNA序列
            </label>
            <textarea
              value={inputSeq}
              onChange={(e) => setInputSeq(e.target.value)}
              placeholder="输入DNA序列（支持FASTA格式）..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              支持A、T、C、G核苷酸字符，自动过滤其他字符
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                转换操作
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {operationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {operation === "translate" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    读码框
                  </label>
                  <select
                    value={readingFrame}
                    onChange={(e) => setReadingFrame(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {readingFrameOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    遗传密码
                  </label>
                  <select
                    value={geneticCode}
                    onChange={(e) => setGeneticCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {geneticCodeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <button
            onClick={performOperation}
            className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            执行转换
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
              转换结果
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(result)}
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

          {(() => {
            const info = getSequenceInfo(result);
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">长度</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {info.length} {info.type}
                  </p>
                </div>
                
                {operation === "translate" && info.stopCodons !== undefined && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">终止密码子</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {info.stopCodons}
                    </p>
                  </div>
                )}

                {operation !== "translate" && info.gcContent && (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">GC含量</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {info.gcContent}%
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">碱基组成</p>
                      <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
                        A:{info.counts?.A} T:{info.counts?.T} C:{info.counts?.C} G:{info.counts?.G}
                      </p>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {operation === "translate" ? "蛋白质序列" : "DNA序列"}
            </h4>
            <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
              {formatSequence(result)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceConverter;