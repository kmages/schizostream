import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, Activity, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMedications, useCreateMedication, useUpdateMedication, useDeleteMedication, useCreateMedicationLog, useSymptoms, useCreateSymptom } from "@/hooks/use-resources";
import type { Medication } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

export default function DataLogger() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-slate-900">Data Logger</h1>
        <p className="text-slate-500">Medication Compliance & Symptom Tracking</p>
      </div>

      <Tabs defaultValue="meds" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mb-8">
          <TabsTrigger value="meds">Medications</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
        </TabsList>

        <TabsContent value="meds">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Active Medications</h2>
            <AddMedicationDialog />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MedicationList />
          </div>
        </TabsContent>

        <TabsContent value="symptoms">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card>
               <CardHeader>
                 <CardTitle>Log New Symptom</CardTitle>
               </CardHeader>
               <CardContent>
                 <LogSymptomForm />
               </CardContent>
             </Card>
             <Card>
               <CardHeader>
                 <CardTitle>Recent History</CardTitle>
               </CardHeader>
               <CardContent>
                 <SymptomHistory />
               </CardContent>
             </Card>
           </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function MedicationList() {
  const { data: meds } = useMedications();
  const logDoseMutation = useCreateMedicationLog();
  const deleteMutation = useDeleteMedication();
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  if (!meds?.length) return <p className="text-slate-500 col-span-3 text-center py-10">No medications tracked yet.</p>;

  return (
    <>
      {meds.map((med) => (
        <Card key={med.id} className="border-t-4 border-t-teal-500 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2">
              <div className="p-2 bg-teal-50 rounded-lg">
                <Pill className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex gap-1">
                <Button 
                  size="icon" 
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setEditingMed(med)}
                  data-testid={`button-edit-med-${med.id}`}
                >
                  <Pencil className="w-4 h-4 text-slate-500" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => {
                    if (confirm(`Delete ${med.name}? This will also remove all dose logs for this medication.`)) {
                      deleteMutation.mutate(med.id);
                    }
                  }}
                  data-testid={`button-delete-med-${med.id}`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
            <CardTitle className="mt-4 text-lg">{med.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <p className="flex justify-between text-slate-600">
                <span>Dosage:</span> <span className="font-semibold text-slate-900">{med.dosage}</span>
              </p>
              <p className="flex justify-between text-slate-600">
                <span>Frequency:</span> <span className="font-semibold text-slate-900">{med.frequency}</span>
              </p>
              {med.notes && <p className="text-xs text-slate-400 mt-2 italic">{med.notes}</p>}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full mt-4 text-xs"
              onClick={() => logDoseMutation.mutate({ 
                medId: med.id, 
                data: { medicationId: med.id, status: 'taken', notes: '' } 
              })}
              data-testid={`button-log-dose-${med.id}`}
            >
              Log Dose Taken
            </Button>
          </CardContent>
        </Card>
      ))}
      
      {editingMed && (
        <EditMedicationDialog 
          medication={editingMed} 
          open={!!editingMed}
          onOpenChange={(open) => !open && setEditingMed(null)}
        />
      )}
    </>
  );
}

function EditMedicationDialog({ medication, open, onOpenChange }: { medication: Medication, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState(medication.name);
  const [dosage, setDosage] = useState(medication.dosage);
  const [freq, setFreq] = useState(medication.frequency);
  const [notes, setNotes] = useState(medication.notes || "");
  const updateMutation = useUpdateMedication();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ id: medication.id, name, dosage, frequency: freq, notes: notes || undefined }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Medication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Medication Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lithium" required data-testid="input-edit-med-name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dosage</Label>
              <Input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 300mg" required data-testid="input-edit-med-dosage" />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Input value={freq} onChange={e => setFreq(e.target.value)} placeholder="e.g. Twice Daily" required data-testid="input-edit-med-frequency" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Take with food" data-testid="input-edit-med-notes" />
          </div>
          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" data-testid="button-save-med">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddMedicationDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [freq, setFreq] = useState("");
  const createMutation = useCreateMedication();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, dosage, frequency: freq, userId: "" }, {
      onSuccess: () => {
        setOpen(false);
        setName("");
        setDosage("");
        setFreq("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" /> Add Medication
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track New Medication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Medication Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lithium" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dosage</Label>
              <Input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 300mg" required />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Input value={freq} onChange={e => setFreq(e.target.value)} placeholder="e.g. Twice Daily" required />
            </div>
          </div>
          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">Start Tracking</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LogSymptomForm() {
  const [type, setType] = useState("mood");
  const [severity, setSeverity] = useState([5]);
  const [notes, setNotes] = useState("");
  const createMutation = useCreateSymptom();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ 
      type, 
      severity: severity[0], 
      notes, 
      userId: "" 
    }, {
      onSuccess: () => {
        setNotes("");
        setSeverity([5]);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label>Log Type</Label>
        <div className="flex gap-2">
          {['mood', 'side_effect', 'symptom'].map(t => (
            <div 
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors capitalize ${
                type === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.replace('_', ' ')}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>Severity (1-10)</Label>
          <span className="font-bold text-teal-600">{severity[0]}</span>
        </div>
        <Slider 
          value={severity} 
          onValueChange={setSeverity} 
          min={1} 
          max={10} 
          step={1}
          className="py-2"
        />
        <p className="text-xs text-slate-400 text-center">
          1 = Mild / 10 = Severe Crisis
        </p>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input 
          value={notes} 
          onChange={e => setNotes(e.target.value)} 
          placeholder="Describe what is happening..."
        />
      </div>

      <Button type="submit" className="w-full bg-slate-900 text-white">Log Entry</Button>
    </form>
  );
}

function SymptomHistory() {
  const { data: symptoms } = useSymptoms();

  if (!symptoms?.length) return <p className="text-slate-500 text-sm">No recent logs.</p>;

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {symptoms.map(log => (
        <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
            log.severity > 7 ? 'bg-red-500' : log.severity > 4 ? 'bg-yellow-500' : 'bg-green-500'
          }`} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-800 capitalize">{log.type.replace('_', ' ')}</span>
              <span className="text-xs bg-white border px-1.5 rounded text-slate-500">
                Severity: {log.severity}
              </span>
            </div>
            {log.notes && <p className="text-sm text-slate-600">{log.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
