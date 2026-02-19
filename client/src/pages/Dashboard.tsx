import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Shield, CheckSquare, Activity, CalendarClock, Plus, Sparkles, ArrowRight, Star, Pill, Bot } from "lucide-react";
import { useDocuments, useTasks, useSymptoms } from "@/hooks/use-resources";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export default function Dashboard() {
  const { data: documents } = useDocuments();
  const { data: tasks } = useTasks();
  const { data: symptoms } = useSymptoms();

  // Calculate stats
  const pendingTasks = tasks?.filter(t => !t.isComplete).length || 0;
  const recentDocs = documents?.slice(0, 3) || [];
  const chartData = symptoms?.slice(-7).map(s => ({
    date: format(new Date(s.createdAt!), 'MM/dd'),
    severity: s.severity
  })) || [];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900" data-testid="text-page-title">Dashboard</h1>
          <p className="text-slate-500">Your Crisis Command Center</p>
        </div>
        <div className="flex gap-2">
          <Link href="/data-logger">
            <Button className="bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20" data-testid="button-log-symptom">
              <Plus className="w-4 h-4 mr-2" /> Log Symptom
            </Button>
          </Link>
        </div>
      </div>

      {/* Hope Message - Prominent */}
      <Card className="bg-gradient-to-r from-teal-600 to-teal-700 text-white border-0 mb-8 shadow-xl shadow-teal-900/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2 text-white">Recovery is Possible</h2>
              <p className="text-white/90 text-sm leading-relaxed mb-3">
                With consistent treatment and the right medication, many individuals with schizophrenia and schizoaffective disorder 
                return to independent, fulfilling lives. You are doing the hard work. Stay the course.
              </p>
              <Link href="/navigator">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" data-testid="button-learn-clozapine">
                  <Star className="w-4 h-4 mr-2" /> Learn About Clozapine
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Expert Support - Prominent */}
      <Link href="/chat">
        <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0 mb-8 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                <Bot className="w-6 h-6 text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-white">AI Expert Support</h3>
                  <span className="text-[10px] font-bold bg-amber-500 text-amber-950 px-1.5 py-0.5 rounded">NEW</span>
                </div>
                <p className="text-slate-300 text-sm">Expert knowledge base + AI guidance from leading psychiatrists on Clozapine, crisis navigation, and recovery</p>
              </div>
              <ArrowRight className="w-6 h-6 text-teal-400" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Documents" 
          value={documents?.length || 0} 
          description="In the secure vault"
          icon={Shield}
          color="blue"
        />
        <StatCard 
          title="Pending Tasks" 
          value={pendingTasks} 
          description="Requires attention"
          icon={CheckSquare}
          color="rose"
        />
        <StatCard 
          title="Health Logs" 
          value={symptoms?.length || 0} 
          description="Total recorded entries"
          icon={Activity}
          color="teal"
        />
        <StatCard 
          title="Days Active" 
          value="12" 
          description="Since crisis onset"
          icon={CalendarClock}
          color="indigo"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/vault">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 h-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">The Vault</h3>
                <p className="text-xs text-slate-500">Upload HIPAA waivers, crisis plans</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/navigator">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 h-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                <Pill className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Clozapine Guide</h3>
                <p className="text-xs text-slate-500">The gold standard treatment</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/care-team">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 h-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Care Team</h3>
                <p className="text-xs text-slate-500">Tasks & family coordination</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-md border-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Symptom Severity Trend
              </CardTitle>
              <CardDescription>Track changes over time to share with providers</CardDescription>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#cbd5e1' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="severity" 
                      stroke="#0d9488" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No symptom data available yet. Log your first entry.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border-slate-100">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Recent Vault Additions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentDocs.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentDocs.map(doc => (
                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {doc.fileType.split('/')[1] || 'DOC'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{doc.title}</p>
                          <p className="text-xs text-slate-500">{format(new Date(doc.createdAt!), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      {doc.isEmergency && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                          Emergency
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No documents in vault yet. Upload your first file.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <Card className="shadow-md border-slate-100">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg font-semibold text-slate-800">Priority Tasks</CardTitle>
              <Link href="/care-team">
                <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 h-8">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {pendingTasks > 0 ? (
                <div className="divide-y divide-slate-100">
                  {tasks?.filter(t => !t.isComplete).slice(0, 5).map(task => (
                    <div key={task.id} className="p-4 flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-800 leading-tight mb-1">{task.title}</p>
                        {task.assignedTo && (
                          <p className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                            Assigned to: {task.assignedTo}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  All caught up! No pending tasks.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Resource Card */}
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-amber-800 flex items-center gap-2">
                <Star className="w-4 h-4" /> Key Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-900 leading-relaxed">
                <strong>85% of patients</strong> on Clozapine have significantly reduced hospitalizations 
                compared to other antipsychotics. If your loved one has tried 2+ medications without success, 
                ask about Clozapine.
              </p>
              <Link href="/navigator">
                <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800 mt-2 px-0">
                  Read the full guide <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
