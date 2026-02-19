import { DashboardLayout } from "@/components/DashboardLayout";
import { useDocuments, useCreateDocument, useDeleteDocument } from "@/hooks/use-resources";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ShieldAlert, Trash2, Download, AlertTriangle, Sparkles, Loader2, Eye, X } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { InsertDocument, Document } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Vault() {
  const { data: documents, isLoading } = useDocuments();
  const deleteMutation = useDeleteDocument();
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">The Vault</h1>
          <p className="text-slate-500">Secure Document Defense</p>
        </div>
        <AddDocumentDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && [1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
        ))}

        {documents?.map((doc) => (
          <Card key={doc.id} className="group hover:shadow-lg transition-all border-slate-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${doc.isEmergency ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {doc.isEmergency ? <ShieldAlert className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-slate-500 hover:text-teal-600"
                    onClick={() => setViewingDoc(doc)}
                    data-testid={`view-doc-${doc.id}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <a href={`/api/documents/${doc.id}/download`} download target="_blank" rel="noopener noreferrer" data-testid={`download-doc-${doc.id}`}>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-teal-600">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-slate-500 hover:text-red-600"
                    onClick={() => deleteMutation.mutate(doc.id)}
                    data-testid={`delete-doc-${doc.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-slate-900 mb-1 truncate" title={doc.title}>
                {doc.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10">
                {doc.description || "No description provided."}
              </p>
              
              <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                <span>{doc.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                <span>{format(new Date(doc.createdAt!), 'MMM d, yyyy')}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {documents?.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">Vault is Empty</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              Upload critical documents like HIPAA waivers, court orders, and insurance cards here for safe keeping.
            </p>
          </div>
        )}
      </div>

      <Dialog open={!!viewingDoc} onOpenChange={(open) => !open && setViewingDoc(null)}>
        <DialogContent className="w-[95vw] max-w-4xl h-[95vh] md:h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-3 md:p-6 pb-3 md:pb-4 border-b shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base md:text-xl truncate">{viewingDoc?.title}</DialogTitle>
                <DialogDescription className="truncate text-xs md:text-sm">
                  {viewingDoc?.description || 'No description'}
                </DialogDescription>
              </div>
              <div className="flex gap-1 md:gap-2 shrink-0">
                <a href={viewingDoc ? `/api/documents/${viewingDoc.id}/download` : '#'} download>
                  <Button variant="outline" size="sm" className="h-8 px-2 md:px-3" data-testid="dialog-download-btn">
                    <Download className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Download</span>
                  </Button>
                </a>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingDoc(null)} data-testid="close-viewer-btn">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto bg-slate-100 dark:bg-slate-900">
            {viewingDoc && (
              <DocumentViewer doc={viewingDoc} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function DocumentViewer({ doc }: { doc: Document }) {
  const viewUrl = `/api/documents/${doc.id}/view`;
  const downloadUrl = `/api/documents/${doc.id}/download`;
  const fileType = doc.fileType.toLowerCase();
  const [isMobile] = useState(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  
  if (fileType.includes('pdf')) {
    // Mobile browsers often can't render PDFs in iframes well
    if (isMobile) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <FileText className="w-16 h-16 text-teal-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
            {doc.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6 text-sm">
            PDF preview works best in the native viewer. Tap below to open or download.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button className="w-full bg-teal-600 hover:bg-teal-700" data-testid="open-pdf-btn">
                <Eye className="w-4 h-4 mr-2" />
                Open PDF
              </Button>
            </a>
            <a href={downloadUrl} download className="w-full">
              <Button variant="outline" className="w-full" data-testid="download-pdf-btn">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </a>
          </div>
        </div>
      );
    }
    
    return (
      <iframe 
        src={viewUrl} 
        className="w-full h-full border-0"
        title={doc.title}
        data-testid="pdf-viewer"
      />
    );
  }
  
  if (fileType.includes('image')) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
        <img 
          src={viewUrl} 
          alt={doc.title}
          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          style={{ touchAction: 'pinch-zoom' }}
          data-testid="image-viewer"
        />
      </div>
    );
  }
  
  if (fileType.includes('text') || fileType.includes('json') || fileType.includes('xml')) {
    return (
      <iframe 
        src={viewUrl} 
        className="w-full h-full border-0 bg-white dark:bg-slate-800"
        title={doc.title}
        data-testid="text-viewer"
      />
    );
  }
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-8 text-center">
      <FileText className="w-12 md:w-16 h-12 md:h-16 text-slate-300 mb-4" />
      <h3 className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
        Preview not available
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6 text-sm">
        This file type ({fileType.split('/')[1]?.toUpperCase() || 'FILE'}) cannot be previewed directly. 
        Please download it to view on your device.
      </p>
      <a href={downloadUrl} download>
        <Button className="bg-teal-600 hover:bg-teal-700" data-testid="fallback-download-btn">
          <Download className="w-4 h-4 mr-2" />
          Download File
        </Button>
      </a>
    </div>
  );
}

function AddDocumentDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string, type: string, name?: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  const createMutation = useCreateDocument();
  const { toast } = useToast();

  const analyzeDocument = async (fileContent: string, filename: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: fileContent, filename }),
      });
      if (res.ok) {
        const analysis = await res.json();
        setTitle(analysis.title);
        setDesc(analysis.description);
        setIsEmergency(analysis.isEmergency);
        setAiSuggested(true);
        toast({
          title: "AI Analysis Complete",
          description: `Suggested: ${analysis.title}${analysis.isEmergency ? ' (Emergency)' : ''}`,
        });
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractAndAnalyze = async (file: File) => {
    setPendingFile(file);
    if (file.type === 'application/pdf' || file.type.includes('word')) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/admin/knowledge/extract-text', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          if (data.text && data.text.length > 20) {
            analyzeDocument(data.text, file.name);
            return;
          }
        }
      } catch (err) {
        console.error('Text extraction failed:', err);
      }
    }
    analyzeDocument(file.name, file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) return;

    createMutation.mutate({
      title,
      description: desc,
      isEmergency,
      fileUrl: uploadedFile.url,
      fileType: uploadedFile.type,
      userId: "", // Handled by backend context
    }, {
      onSuccess: () => {
        setOpen(false);
        setTitle("");
        setDesc("");
        setUploadedFile(null);
        setAiSuggested(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700 shadow-md">
          <ShieldAlert className="w-4 h-4 mr-2" /> Upload to Vault
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Document to Vault</DialogTitle>
          <DialogDescription>
            Securely store important legal or medical files.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 p-3 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">
            <strong>AI-Powered:</strong> Upload a PDF or Word file and we'll automatically suggest a title and description.
          </span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. HIPAA Waiver 2024" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="desc">Description (Optional)</Label>
            <Input 
              id="desc" 
              placeholder="Brief context..." 
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="emergency" 
              checked={isEmergency}
              onCheckedChange={(checked) => setIsEmergency(!!checked)}
            />
            <Label htmlFor="emergency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Mark as Emergency Document
            </Label>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <Label>File Attachment</Label>
              {uploadedFile && !title && !isAnalyzing && pendingFile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => extractAndAnalyze(pendingFile)}
                  className="h-7 text-xs"
                  data-testid="button-ai-analyze"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Suggest
                </Button>
              )}
              {isAnalyzing && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing...
                </span>
              )}
            </div>
            {uploadedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <span className="text-sm font-medium truncate flex-1">
                    {uploadedFile.name || 'File ready for vault'}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => { setUploadedFile(null); setAiSuggested(false); setPendingFile(null); setTitle(''); setDesc(''); setIsEmergency(false); }} className="h-6 text-xs hover:text-red-600">
                    Remove
                  </Button>
                </div>
                {aiSuggested && (
                  <div className="flex items-center gap-1 text-xs text-teal-600">
                    <Sparkles className="w-3 h-3" />
                    AI suggested title and description
                  </div>
                )}
              </div>
            ) : (
              <ObjectUploader
                onGetUploadParameters={async (file) => {
                  if (file.data && file.data instanceof File) {
                    extractAndAnalyze(file.data);
                  }
                  
                  const res = await fetch("/api/uploads/request-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: file.name,
                      size: file.size,
                      contentType: file.type,
                    }),
                  });
                  const { uploadURL } = await res.json();
                  return {
                    method: "PUT",
                    url: uploadURL,
                    headers: { "Content-Type": file.type },
                  };
                }}
                onComplete={async (result) => {
                  if (result.successful && result.successful[0]) {
                    const file = result.successful[0];
                    const filename = file.name || pendingFile?.name || 'document';
                    const uploadUrl = file.uploadURL || '';
                    setUploadedFile({
                      url: uploadUrl,
                      type: file.type,
                      name: filename
                    });
                  }
                }}
                buttonClassName="w-full bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300"
              >
                Select File
              </ObjectUploader>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-teal-600 hover:bg-teal-700 mt-4"
            disabled={!uploadedFile || !title}
          >
            {createMutation.isPending ? "Encrypting & Saving..." : "Save to Vault"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
