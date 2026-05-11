'use client';

import { useState } from 'react';
import { Code, X, Copy, Check } from 'lucide-react';

export function ExportCodeModal({ prompt, variables }: { prompt: string, variables: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'python' | 'node' | 'curl'>('python');
  const [copied, setCopied] = useState(false);

  // Helper to generate a prompt string with variables for code insertion
  const generateCodePrompt = () => {
    let p = prompt.replace(/\n/g, '\\n').replace(/"/g, '\\"');
    if (language === 'python') {
        variables.forEach(v => {
            p = p.replace(new RegExp(`\\\\{\\\\\\{${v}\\\\\\}\\\\\\}`, 'g'), `{${v}}`);
            p = p.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), `{${v}}`);
        });
        return `f"${p}"`;
    }
    if (language === 'node') {
        variables.forEach(v => {
            p = p.replace(new RegExp(`\\\\{\\\\\\{${v}\\\\\\}\\\\\\}`, 'g'), `\${${v}}`);
            p = p.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), `\${${v}}`);
        });
        return `\`${p}\``;
    }
    // for curl just leave as is or use bash variables
    return `"${p}"`;
  };

  const getSnippet = () => {
    const codePrompt = generateCodePrompt();
    const varsStrPython = variables.map(v => `${v} = "your_value_here"`).join('\n');
    const varsStrNode = variables.map(v => `const ${v} = "your_value_here";`).join('\n');

    switch (language) {
      case 'python':
        return `import os
from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

# Variables
${varsStrPython}

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": ${codePrompt},
        }
    ],
    model="llama3-8b-8192",
)

print(chat_completion.choices[0].message.content)`;
      
      case 'node':
        return `import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Variables
${varsStrNode}

async function main() {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: ${codePrompt},
      },
    ],
    model: "llama3-8b-8192",
  });

  console.log(chatCompletion.choices[0]?.message?.content || "");
}

main();`;

      case 'curl':
        return `curl https://api.groq.com/openai/v1/chat/completions \\
  -H "Authorization: Bearer $GROQ_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {
        "role": "user",
        "content": ${codePrompt}
      }
    ],
    "model": "llama3-8b-8192"
  }'`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
      >
        <Code className="w-3.5 h-3.5" /> Export Code
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-brand-purple"></div>
            
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#161616]">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                Export Prompt as Code
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-800">
              {(['python', 'node', 'curl'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    language === lang 
                      ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  {lang === 'python' ? 'Python' : lang === 'node' ? 'Node.js' : 'cURL'}
                </button>
              ))}
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-[#0a0a0a] relative group">
              <button
                onClick={copyToClipboard}
                className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {getSnippet()}
              </pre>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-[#161616] flex justify-end">
                <button
                    onClick={() => setIsOpen(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
