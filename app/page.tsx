"use client";

import { useState, useEffect, useMemo } from "react";
import { encode } from "@toon-format/toon";
import { BotMessageSquare, Clipboard, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// A more realistic tokenizer that splits by spaces and punctuation
const tokenize = (text: string) => {
  if (!text) return [];
  return text.split(/(\s+|[,.;:?!(){}[\]"'])/g).filter(Boolean);
};

// Helper function to generate a color from a string hash
const colors = [
  "bg-red-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
];

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [toonOutput, setToonOutput] = useState("");
  const [compressedJsonOutput, setCompressedJsonOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const jsonTokens = useMemo(() => tokenize(jsonInput), [jsonInput]);
  const toonTokens = useMemo(() => tokenize(toonOutput), [toonOutput]);
  const compressedJsonTokens = useMemo(
    () => tokenize(compressedJsonOutput),
    [compressedJsonOutput],
  );

  const jsonTokenCount = jsonTokens.length;
  const toonTokenCount = toonTokens.length;
  const compressedJsonTokenCount = compressedJsonTokens.length;

  const percentageDifferenceToon = useMemo(() => {
    if (jsonTokenCount > 0) {
      return (
        ((jsonTokenCount - toonTokenCount) / jsonTokenCount) *
        100
      ).toFixed(2);
    }
    return 0;
  }, [jsonTokenCount, toonTokenCount]);

  const percentageDifferenceCompressed = useMemo(() => {
    if (jsonTokenCount > 0) {
      return (
        ((jsonTokenCount - compressedJsonTokenCount) / jsonTokenCount) *
        100
      ).toFixed(2);
    }
    return 0;
  }, [jsonTokenCount, compressedJsonTokenCount]);

  const handleConvert = () => {
    try {
      const json = JSON.parse(jsonInput);
      const toon = encode(json);
      const compressedJson = JSON.stringify(json);
      setToonOutput(toon);
      setCompressedJsonOutput(compressedJson);
      setError("");
    } catch (e) {
      if (e instanceof Error) {
        setError(`Invalid JSON: ${e.message}`);
      } else {
        setError("An unknown error occurred.");
      }
      setToonOutput("");
      setCompressedJsonOutput("");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleClear = () => {
    setJsonInput("");
    setToonOutput("");
    setCompressedJsonOutput("");
    setError("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex h-16 shrink-0 items-center border-b border-solid border-black/8 px-4 dark:border-white/[.145]">
        <div className="flex items-center gap-2">
          <BotMessageSquare className="h-6 w-6 text-black dark:text-white" />
          <h1 className="text-lg font-semibold text-black dark:text-white">
            Toonify
          </h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-8">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    JSON Input{" "}
                    {jsonInput && (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        ({jsonTokenCount} tokens)
                      </span>
                    )}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <Textarea
                  className="flex-1 font-mono text-sm min-h-[400px]"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{ "key": "value" }'
                />
                <Button
                  className="mt-4 w-full md:w-auto"
                  onClick={handleConvert}
                >
                  Convert
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>JSON Tokens</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1">
                {jsonTokens.map((token, index) => {
                  return (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded-md text-white text-sm font-mono ${stringToColor(token)}`}
                    >
                      {token}
                    </span>
                  );
                })}
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col gap-8">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Toon Output{" "}
                    {toonOutput && (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        ({toonTokenCount} tokens,{" "}
                        <span className="font-bold text-green-500">
                          {percentageDifferenceToon}% smaller
                        </span>
                        )
                      </span>
                    )}
                  </span>
                  {toonOutput && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(toonOutput)}
                    >
                      {copied ? (
                        <span className="text-green-500">Copied!</span>
                      ) : (
                        <Clipboard className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <pre className="flex-1 rounded-md border bg-zinc-100 p-2 font-mono text-sm dark:bg-zinc-900 whitespace-pre-wrap wrap-break-word min-h-[400px]">
                  {error ? (
                    <span className="text-red-500">{error}</span>
                  ) : (
                    toonOutput
                  )}
                </pre>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Toon Tokens</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1">
                {toonTokens.map((token, index) => {
                  return (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded-md text-white text-sm font-mono ${stringToColor(token)}`}
                    >
                      {token}
                    </span>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="mt-8 grid gap-8">
          <div className="flex flex-col gap-8">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Compressed JSON{" "}
                    {compressedJsonOutput && (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        ({compressedJsonTokenCount} tokens,{" "}
                        <span className="font-bold text-green-500">
                          {percentageDifferenceCompressed}% smaller
                        </span>
                        )
                      </span>
                    )}
                  </span>
                  {compressedJsonOutput && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(compressedJsonOutput)}
                    >
                      {copied ? (
                        <span className="text-green-500">Copied!</span>
                      ) : (
                        <Clipboard className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <pre className="flex-1 rounded-md border bg-zinc-100 p-2 font-mono text-sm dark:bg-zinc-900 whitespace-pre-wrap wrap-break-word">
                  {error ? (
                    <span className="text-red-500">{error}</span>
                  ) : (
                    compressedJsonOutput
                  )}
                </pre>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Compressed JSON Tokens</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1">
                {compressedJsonTokens.map((token, index) => {
                  return (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded-md text-white text-sm font-mono ${stringToColor(token)}`}
                    >
                      {token}
                    </span>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
