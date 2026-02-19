import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, MessageCircle, ArrowLeft, Trash2, BookOpen, Sparkles, ExternalLink, Paperclip, X, FileText, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AiChatMessage } from "@shared/schema";
import ReactMarkdown from "react-markdown";

type SourceInfo = {
  expert: string;
  source: string;
  sourceUrl?: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  usedExpertKnowledge?: boolean;
  responseSource?: 'knowledge_base' | 'general_ai';
  sources?: SourceInfo[];
};

export default function Chat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [sourceCache, setSourceCache] = useState<Map<string, { usedExpertKnowledge: boolean; responseSource: 'knowledge_base' | 'general_ai'; sources: SourceInfo[] }>>(new Map());
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFile(file);
    setExtractedText('');

    // Extract text from PDF/Word files
    if (file.type === 'application/pdf' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword') {
      setIsExtracting(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/knowledge/extract-text', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setExtractedText(data.text || '');
        }
      } catch (err) {
        console.error('Failed to extract text:', err);
      } finally {
        setIsExtracting(false);
      }
    } else if (file.type.startsWith('text/')) {
      // Plain text files
      const text = await file.text();
      setExtractedText(text);
    }
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    setExtractedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const { data: historyData, isLoading: isHistoryLoading } = useQuery<AiChatMessage[]>({
    queryKey: ['/api/ai-chat/history']
  });

  const serverMessages: ChatMessage[] = (historyData || []).map(m => {
    const cached = sourceCache.get(m.content);
    // Parse sources from JSON string if stored in database
    let parsedSources: SourceInfo[] | undefined;
    if ((m as any).sources) {
      try {
        parsedSources = JSON.parse((m as any).sources);
      } catch (e) {
        parsedSources = undefined;
      }
    }
    return {
      role: m.role as 'user' | 'assistant',
      content: m.content,
      usedExpertKnowledge: cached?.usedExpertKnowledge ?? ((m as any).responseSource === 'knowledge_base'),
      responseSource: cached?.responseSource ?? (m as any).responseSource,
      sources: cached?.sources ?? parsedSources
    };
  });

  const messages = [...serverMessages, ...optimisticMessages];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearHistoryMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/ai-chat/history'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-chat/history'] });
      setOptimisticMessages([]);
      setSourceCache(new Map());
    }
  });

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !extractedText) || isLoading) return;

    const userMessage = input.trim();
    const fileContent = extractedText;
    const fileName = attachedFile?.name;
    
    // Build display message for UI
    let displayMessage = userMessage;
    if (fileName) {
      displayMessage = userMessage 
        ? `[Attached: ${fileName}]\n\n${userMessage}` 
        : `[Attached: ${fileName}]`;
    }
    
    setInput('');
    clearAttachment();
    
    setOptimisticMessages(prev => [...prev, { role: 'user', content: displayMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          message: userMessage,
          fileContent: fileContent || undefined,
          fileName: fileName || undefined
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      
      setSourceCache(prev => {
        const newCache = new Map(prev);
        newCache.set(data.response, {
          usedExpertKnowledge: data.usedExpertKnowledge,
          responseSource: data.responseSource || 'general_ai',
          sources: data.sources || []
        });
        return newCache;
      });
      
      setOptimisticMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        usedExpertKnowledge: data.usedExpertKnowledge,
        responseSource: data.responseSource || 'general_ai',
        sources: data.sources
      }]);
      
      queryClient.invalidateQueries({ queryKey: ['/api/ai-chat/history'] });
      
      setTimeout(() => setOptimisticMessages([]), 500);
    } catch (error) {
      setOptimisticMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const SourceBadge = ({ responseSource, sources }: { responseSource?: 'knowledge_base' | 'general_ai'; sources?: SourceInfo[] }) => {
    if (responseSource === 'knowledge_base' && sources && sources.length > 0) {
      return (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 gap-1">
              <BookOpen className="w-3 h-3" />
              Expert Knowledge Base
            </Badge>
          </div>
          <div className="mt-2 space-y-1">
            {sources.slice(0, 2).map((source, idx) => (
              <div key={idx} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="font-medium">{source.expert}</span>
                <span className="text-slate-400 dark:text-slate-500">-</span>
                {source.sourceUrl ? (
                  <a 
                    href={source.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline flex items-center gap-0.5"
                  >
                    {source.source}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span>{source.source}</span>
                )}
              </div>
            ))}
            {sources.length > 2 && (
              <div className="text-xs text-slate-400">+{sources.length - 2} more sources</div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700 gap-1">
            <Sparkles className="w-3 h-3" />
            Web Search Result
          </Badge>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
          This response includes live web search results. Please verify details with official sources.
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Always consult your care team for medical decisions
        </p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-2 text-slate-600" data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white" data-testid="text-page-title">AI Support Assistant</h1>
            <p className="text-slate-500 dark:text-slate-400">Expert knowledge base + AI - Ask about treatment, Clozapine, LEAP method, or crisis navigation</p>
          </div>
        </div>

        <Card className="flex-1 flex flex-col shadow-lg border-slate-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 border-b py-4">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Bot className="w-5 h-5" /> Crisis Navigation AI
              </CardTitle>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearHistoryMutation.mutate()}
                  disabled={clearHistoryMutation.isPending}
                  className="text-teal-100 hover:text-white hover:bg-teal-500/30"
                  data-testid="button-clear-chat-history"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <CardDescription className="text-teal-100">
              Powered by curated expert knowledge from Dr. Laitman, Dr. Amador, Dr. Torrey, Dr. D'Souza & more
            </CardDescription>
          </CardHeader>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {isHistoryLoading && (
              <div className="text-center text-slate-400 py-12">
                <Bot className="w-16 h-16 mx-auto mb-4 opacity-40 animate-pulse" />
                <p className="text-sm">Loading your conversation history...</p>
              </div>
            )}
            {!isHistoryLoading && messages.length === 0 && (
              <div className="text-center text-slate-400 py-12">
                <Bot className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <h3 className="text-lg font-semibold mb-2 text-slate-600 dark:text-slate-300">How can I help you today?</h3>
                <p className="text-sm max-w-md mx-auto mb-4">
                  Ask me anything about navigating mental health crisis care, treatment options, 
                  Clozapine, the LEAP method, or legal resources.
                </p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 gap-1">
                    <BookOpen className="w-3 h-3" />
                    Expert Knowledge Base
                  </Badge>
                  <span className="text-xs text-slate-400">from leading clinicians & researchers</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInput("What is Clozapine and why is it considered the gold standard?")}
                    className="text-teal-700 border-teal-300"
                    data-testid="button-suggestion-clozapine"
                  >
                    What is Clozapine?
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInput("My loved one refuses treatment and doesn't believe they're sick. What can I do?")}
                    className="text-teal-700 border-teal-300"
                    data-testid="button-suggestion-refusal"
                  >
                    Treatment refusal help
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInput("What is the connection between cannabis and psychosis?")}
                    className="text-teal-700 border-teal-300"
                    data-testid="button-suggestion-cannabis"
                  >
                    Cannabis & psychosis
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInput("Is recovery from schizophrenia really possible?")}
                    className="text-teal-700 border-teal-300"
                    data-testid="button-suggestion-recovery"
                  >
                    Is recovery possible?
                  </Button>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {msg.role === 'user' ? (
                    <MessageCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  )}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-teal-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <>
                      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-slate-900 dark:prose-strong:text-white">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <SourceBadge responseSource={msg.responseSource} sources={msg.sources} />
                    </>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center animate-pulse">
                  <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none p-4 border border-teal-200 dark:border-teal-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-teal-700 dark:text-teal-300 font-medium">
                      Searching expert knowledge base...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            {attachedFile && (
              <div className="mb-3 flex items-center gap-2 p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg border border-teal-200 dark:border-teal-800">
                <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <span className="text-sm text-teal-700 dark:text-teal-300 truncate flex-1">
                  {attachedFile.name}
                </span>
                {isExtracting ? (
                  <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                ) : extractedText ? (
                  <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-200">
                    Ready
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Attached
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={clearAttachment}
                  data-testid="button-remove-attachment"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file-attachment"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isExtracting}
                className="flex-shrink-0"
                title="Attach a file"
                data-testid="button-attach-file"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={attachedFile ? "Add a question about this file..." : "Type your question here..."}
                className="flex-1 text-base"
                disabled={isLoading}
                data-testid="input-ai-chat"
              />
              <Button 
                type="submit" 
                disabled={(!input.trim() && !extractedText) || isLoading || isExtracting} 
                className="bg-teal-600 hover:bg-teal-700 px-6"
                data-testid="button-send-ai-chat"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
