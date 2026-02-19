import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Pencil, Trash2, Lock, Check, X, Sparkles, Loader2, Clock, Upload, FileText } from 'lucide-react';
import { Link } from 'wouter';
import type { KnowledgeEntry } from '@shared/schema';

interface EntryFormData {
  expert: string;
  source: string;
  sourceUrl: string;
  category: string;
  title: string;
  content: string;
  keywords: string;
}

const emptyForm: EntryFormData = {
  expert: '',
  source: '',
  sourceUrl: '',
  category: '',
  title: '',
  content: '',
  keywords: ''
};

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EntryFormData>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [rawContent, setRawContent] = useState('');
  const [sourceUrlInput, setSourceUrlInput] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isExtractingDoc, setIsExtractingDoc] = useState(false);
  const [aiProgress, setAiProgress] = useState<{ step: string; percent: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualInputNeeded, setManualInputNeeded] = useState<string | null>(null);
  
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<KnowledgeEntry[]>({
    queryKey: ['/api/admin/knowledge'],
    queryFn: async () => {
      const res = await fetch('/api/admin/knowledge', {
        headers: { 'x-admin-password': password }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: isAuthenticated
  });

  const createMutation = useMutation({
    mutationFn: async (data: EntryFormData) => {
      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password 
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to create' }));
        throw new Error(err.message || 'Failed to create');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge'] });
      setFormData(emptyForm);
      setShowForm(false);
      setCooldown(0);
      toast({ title: 'Entry created successfully' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to create entry', description: err.message, variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EntryFormData }) => {
      const res = await fetch(`/api/admin/knowledge/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password 
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge'] });
      setEditingId(null);
      setFormData(emptyForm);
      setShowForm(false);
      toast({ title: 'Entry updated successfully' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/knowledge/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/knowledge'] });
      toast({ title: 'Entry deleted' });
    }
  });

  const handleAiGenerate = async () => {
    console.log('handleAiGenerate called', { isGenerating, rawContentLength: rawContent.trim().length, cooldown });
    if (isGenerating || rawContent.trim().length < 10 || cooldown > 0) {
      console.log('Blocked by condition:', { isGenerating, tooShort: rawContent.trim().length < 10, cooldown });
      return;
    }
    
    setIsGenerating(true);
    setAiProgress({ step: 'Starting...', percent: 0 });
    
    try {
      const response = await fetch('/api/admin/knowledge/ai-draft-stream', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password 
        },
        body: JSON.stringify({ rawContent, sourceUrl: sourceUrlInput })
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect to AI service');
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('Stream not available');
      }
      
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines only (SSE format ends each message with \n\n)
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || ''; // Keep incomplete part in buffer
        
        for (const part of parts) {
          const lines = part.split('\n').filter(line => line.startsWith('data: '));
          
          for (const line of lines) {
            try {
              const jsonStr = line.slice(6);
              if (!jsonStr.trim()) continue;
              
              const data = JSON.parse(jsonStr);
              
              if (data.type === 'progress') {
                setAiProgress({ step: data.step, percent: data.percent });
              } else if (data.type === 'complete') {
                setFormData({
                  expert: data.draft.expert,
                  source: data.draft.source,
                  sourceUrl: data.draft.sourceUrl,
                  category: data.draft.category,
                  title: data.draft.title,
                  content: data.draft.content,
                  keywords: data.draft.keywords
                });
                setRawContent('');
                setSourceUrlInput('');
                setCooldown(5);
                toast({ title: 'AI generated draft - please review and save before generating another' });
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (parseErr: any) {
              // Re-throw intentional errors (from error type messages)
              if (parseErr.message && !parseErr.message.includes('JSON')) {
                throw parseErr;
              }
              // If JSON parse fails, it might be a partial chunk - skip and continue
              console.warn('SSE parse warning:', parseErr.message, 'Line:', line);
            }
          }
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || '';
      if (errorMsg.includes('MANUAL_INPUT_NEEDED:')) {
        const videoUrl = errorMsg.split('MANUAL_INPUT_NEEDED:')[1];
        setManualInputNeeded(videoUrl);
        setSourceUrlInput(videoUrl);
        setRawContent(''); // Clear the URL so user can paste manual content
        toast({ 
          title: 'Manual input needed', 
          description: 'This video has no captions. Please paste the video description below.',
        });
      } else {
        toast({ title: 'Failed to generate', description: err.message, variant: 'destructive' });
      }
    } finally {
      setIsGenerating(false);
      setAiProgress(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF or Word (.docx) file', variant: 'destructive' });
      return;
    }
    
    setIsExtractingDoc(true);
    try {
      const res = await fetch('/api/admin/knowledge/extract-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-admin-password': password,
          'x-file-name': file.name
        },
        body: file
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to extract text' }));
        throw new Error(err.message);
      }
      
      const { text } = await res.json();
      setRawContent(text);
      toast({ title: 'Document loaded', description: `Extracted ${text.length} characters from ${file.name}` });
    } catch (err: any) {
      toast({ title: 'Failed to extract document', description: err.message, variant: 'destructive' });
    } finally {
      setIsExtractingDoc(false);
      e.target.value = '';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setAuthError('Invalid password');
      }
    } catch {
      setAuthError('Connection error');
    }
  };

  const handleEdit = (entry: KnowledgeEntry) => {
    setEditingId(entry.id);
    setFormData({
      expert: entry.expert,
      source: entry.source,
      sourceUrl: entry.sourceUrl || '',
      category: entry.category,
      title: entry.title,
      content: entry.content,
      keywords: entry.keywords.join(', ')
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  data-testid="input-admin-password"
                />
              </div>
              {authError && (
                <p className="text-sm text-destructive">{authError}</p>
              )}
              <Button type="submit" className="w-full" data-testid="button-admin-login">
                Access Admin Panel
              </Button>
              <Link href="/">
                <Button variant="ghost" className="w-full" data-testid="link-back-home">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="link-back-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Knowledge Base Admin</h1>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyForm); setCooldown(0); }} data-testid="button-add-entry">
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Entry' : 'New Entry'}</CardTitle>
            </CardHeader>
            <CardContent>
              {!editingId && (
                <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg">
                  <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Add Content with AI
                  </h4>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <Label htmlFor="sourceUrlInput" className="text-sm mb-1 block">Paste URL (YouTube, article, etc.)</Label>
                        <Input
                          id="sourceUrlInput"
                          value={sourceUrlInput}
                          onChange={(e) => {
                            setSourceUrlInput(e.target.value);
                            setRawContent(e.target.value);
                          }}
                          placeholder="https://youtube.com/... or https://article..."
                          disabled={isGenerating || isExtractingDoc}
                          data-testid="input-ai-source-url"
                        />
                      </div>
                      <div className="flex items-end">
                        <span className="text-muted-foreground text-sm px-2 pb-2">or</span>
                      </div>
                      <div className="flex items-end">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isExtractingDoc || isGenerating}
                            data-testid="input-file-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isExtractingDoc || isGenerating}
                            asChild
                          >
                            <span>
                              {isExtractingDoc ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Extracting...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Document
                                </>
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                    
                    {manualInputNeeded && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">
                          This video has no captions available
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                          Open the video, copy the description, and paste it below.
                        </p>
                        <div className="flex gap-2 items-start">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(manualInputNeeded, '_blank')}
                            data-testid="button-open-youtube"
                          >
                            Open Video
                          </Button>
                        </div>
                        <Textarea
                          value={rawContent}
                          onChange={(e) => {
                            setRawContent(e.target.value);
                            if (e.target.value.length > 50) {
                              setManualInputNeeded(null);
                            }
                          }}
                          placeholder="Paste the video description here..."
                          rows={4}
                          className="mt-3"
                          data-testid="input-manual-content"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        onClick={handleAiGenerate}
                        disabled={isGenerating || (!sourceUrlInput.trim() && rawContent.trim().length < 10) || cooldown > 0}
                        className="bg-teal-600 hover:bg-teal-700"
                        data-testid="button-generate-ai-draft"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : cooldown > 0 ? (
                          <>
                            <Clock className="w-4 h-4 mr-2" />
                            Wait {cooldown}s
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Entry
                          </>
                        )}
                      </Button>
                      
                      {aiProgress && (
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-teal-700 dark:text-teal-300 font-medium">{aiProgress.step}</span>
                            <span className="text-muted-foreground">{aiProgress.percent}%</span>
                          </div>
                          <div className="w-full bg-teal-100 dark:bg-teal-900/50 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-teal-600 h-full rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${aiProgress.percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {cooldown > 0 
                        ? 'Please save the current entry before generating another.'
                        : 'AI will extract and structure the content. Review and edit before saving.'}
                    </p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expert">Expert Name</Label>
                    <Input
                      id="expert"
                      value={formData.expert}
                      onChange={(e) => setFormData({ ...formData, expert: e.target.value })}
                      placeholder="Dr. Robert Laitman"
                      required
                      data-testid="input-expert"
                    />
                  </div>
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="Team Daniel"
                      required
                      data-testid="input-source"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sourceUrl">Source URL (optional)</Label>
                    <Input
                      id="sourceUrl"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      placeholder="https://..."
                      data-testid="input-source-url"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="clozapine, cannabis, recovery, etc."
                      required
                      data-testid="input-category"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Clozapine as Gold Standard Treatment"
                    required
                    data-testid="input-title"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Full content of the knowledge entry..."
                    rows={8}
                    required
                    data-testid="input-content"
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords (comma separated)</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="clozapine, treatment, recovery, medication"
                    required
                    data-testid="input-keywords"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-entry">
                    <Check className="w-4 h-4 mr-2" />
                    {editingId ? 'Update' : 'Create'} Entry
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} data-testid="button-cancel">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading entries...</div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No entries yet. Click "Add Entry" to create your first knowledge base entry.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} data-testid={`card-entry-${entry.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {entry.expert} | {entry.source} | Category: {entry.category}
                    </p>
                    {entry.sourceUrl && (
                      <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        {entry.sourceUrl}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(entry)} data-testid={`button-edit-${entry.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => deleteMutation.mutate(entry.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${entry.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap line-clamp-4">{entry.content}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {entry.keywords.map((kw, i) => (
                      <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
