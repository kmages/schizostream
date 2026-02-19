import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type InsertDocument, type InsertTimelineEvent, type InsertTask, 
  type InsertMedication, type InsertMedicationLog, type InsertSymptomLog,
  type InsertChatMessage, type UpdateTaskRequest, type UpdateMedicationRequest
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// === DOCUMENTS ===
export function useDocuments() {
  return useQuery({
    queryKey: [api.documents.list.path],
    queryFn: async () => {
      const res = await fetch(api.documents.list.path);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return api.documents.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertDocument) => {
      const res = await fetch(api.documents.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create document");
      return api.documents.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
      toast({ title: "Document Saved", description: "File successfully added to the vault." });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.documents.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete document");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
      toast({ title: "Document Deleted", description: "File removed from the vault." });
    },
  });
}

// === TIMELINE ===
export function useTimeline() {
  return useQuery({
    queryKey: [api.timeline.list.path],
    queryFn: async () => {
      const res = await fetch(api.timeline.list.path);
      if (!res.ok) throw new Error("Failed to fetch timeline");
      return api.timeline.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTimelineEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertTimelineEvent) => {
      const res = await fetch(api.timeline.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return api.timeline.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.timeline.list.path] });
      toast({ title: "Event Logged", description: "Timeline updated successfully." });
    },
  });
}

// === TASKS ===
export function useTasks() {
  return useQuery({
    queryKey: [api.tasks.list.path],
    queryFn: async () => {
      const res = await fetch(api.tasks.list.path);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return api.tasks.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertTask) => {
      const res = await fetch(api.tasks.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return api.tasks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      toast({ title: "Task Created", description: "New task assigned to care team." });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateTaskRequest) => {
      const url = buildUrl(api.tasks.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return api.tasks.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tasks.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      toast({ title: "Task Deleted", description: "Task removed from list." });
    },
  });
}

export function useCleanupPastTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/tasks/cleanup', { method: "POST" });
      if (!res.ok) throw new Error("Failed to cleanup tasks");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      toast({ 
        title: "Cleanup Complete", 
        description: data.deleted > 0 
          ? `Removed ${data.deleted} past-due task${data.deleted > 1 ? 's' : ''}.`
          : "No past-due tasks to remove."
      });
    },
  });
}

// === MEDICATIONS ===
export function useMedications() {
  return useQuery({
    queryKey: [api.medications.list.path],
    queryFn: async () => {
      const res = await fetch(api.medications.list.path);
      if (!res.ok) throw new Error("Failed to fetch medications");
      return api.medications.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertMedication) => {
      const res = await fetch(api.medications.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add medication");
      return api.medications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.medications.list.path] });
      toast({ title: "Medication Added", description: "Tracking started for new medication." });
    },
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateMedicationRequest) => {
      const url = buildUrl(api.medications.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update medication");
      return api.medications.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.medications.list.path] });
      toast({ title: "Medication Updated", description: "Changes saved successfully." });
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.medications.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete medication");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.medications.list.path] });
      toast({ title: "Medication Removed", description: "Medication deleted from tracking." });
    },
  });
}

export function useCreateMedicationLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ medId, data }: { medId: number; data: InsertMedicationLog }) => {
      const url = buildUrl(api.medications.log.create.path, { id: medId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to log dose");
      return api.medications.log.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.medications.log.list.path] });
      toast({ title: "Dose Logged", description: "Compliance record updated." });
    },
  });
}

export function useMedicationLogs() {
  return useQuery({
    queryKey: [api.medications.log.list.path],
    queryFn: async () => {
      const res = await fetch(api.medications.log.list.path);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.medications.log.list.responses[200].parse(await res.json());
    },
  });
}

// === SYMPTOMS ===
export function useSymptoms() {
  return useQuery({
    queryKey: [api.symptoms.list.path],
    queryFn: async () => {
      const res = await fetch(api.symptoms.list.path);
      if (!res.ok) throw new Error("Failed to fetch symptoms");
      return api.symptoms.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSymptom() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertSymptomLog) => {
      const res = await fetch(api.symptoms.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to log symptom");
      return api.symptoms.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.symptoms.list.path] });
      toast({ title: "Symptom Logged", description: "Health record updated." });
    },
  });
}

// === CHAT ===
export function useChatMessages() {
  return useQuery({
    queryKey: [api.chat.list.path],
    queryFn: async () => {
      const res = await fetch(api.chat.list.path);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.chat.list.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Simple polling for MVP
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertChatMessage) => {
      const res = await fetch(api.chat.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.chat.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chat.list.path] });
    },
  });
}
