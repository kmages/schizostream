import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, FileText, Phone, Pill, AlertTriangle, CheckCircle2, BookOpen, Star, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Navigator() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="mb-4 text-slate-600" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-slate-900" data-testid="text-page-title">Navigator</h1>
        <p className="text-slate-500">Evidence-Based Guides, Legal Resources & Best Practices</p>
      </div>

      <Tabs defaultValue="clozapine" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl mb-8">
          <TabsTrigger value="clozapine" data-testid="tab-clozapine">
            <Star className="w-4 h-4 mr-2" /> Clozapine
          </TabsTrigger>
          <TabsTrigger value="legal" data-testid="tab-legal">Legal Guide</TabsTrigger>
          <TabsTrigger value="insurance" data-testid="tab-insurance">Insurance</TabsTrigger>
          <TabsTrigger value="resources" data-testid="tab-resources">Resources</TabsTrigger>
        </TabsList>

        {/* CLOZAPINE TAB - Featured */}
        <TabsContent value="clozapine">
          <div className="space-y-6">
            {/* Hero Card */}
            <Card className="bg-gradient-to-r from-teal-600 to-teal-700 text-white border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="shrink-0">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Pill className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <Badge className="bg-yellow-400 text-yellow-900 mb-3">Gold Standard Treatment</Badge>
                    <h2 className="text-2xl font-bold mb-3">Clozapine: The Most Effective Antipsychotic</h2>
                    <p className="text-teal-100 leading-relaxed">
                      Clozapine is the <strong className="text-white">only FDA-approved medication</strong> for treatment-resistant 
                      schizophrenia. Despite being the most effective antipsychotic available, it remains dramatically underutilized 
                      due to outdated fears and monitoring requirements. Understanding Clozapine can be the difference between 
                      years of suffering and a path to stability.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-green-600 mb-1">85%</p>
                  <p className="text-sm text-slate-600">Reduction in hospitalization with Clozapine vs. other antipsychotics</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-green-600 mb-1">90%</p>
                  <p className="text-sm text-slate-600">Reduction in suicide attempts in patients on Clozapine</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-amber-600 mb-1">4%</p>
                  <p className="text-sm text-slate-600">Of eligible patients actually receive Clozapine (despite its efficacy)</p>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                  Clozapine FAQ for Families & Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what">
                    <AccordionTrigger>What is Clozapine and who should consider it?</AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed space-y-2">
                      <p>Clozapine (Clozaril) is an atypical antipsychotic approved for treatment-resistant schizophrenia (TRS) and reducing suicidality in schizophrenia/schizoaffective patients.</p>
                      <p><strong>Candidates include:</strong> Patients who have not responded adequately to at least 2 other antipsychotics (at proper doses for 6+ weeks each), OR patients at high risk of suicide.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="why-underused">
                    <AccordionTrigger>Why is it so underutilized if it's the best?</AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed space-y-2">
                      <p><strong>Monitoring requirements:</strong> Clozapine requires regular blood tests (initially weekly) due to risk of agranulocytosis (low white blood cell count). This scares many providers and patients.</p>
                      <p><strong>Reality check:</strong> The actual risk of fatal agranulocytosis is approximately 1 in 10,000 with monitoring. Compare this to the 5-10% suicide rate in schizophrenia without effective treatment.</p>
                      <p><strong>Provider unfamiliarity:</strong> Many psychiatrists were trained to fear Clozapine. Some have never prescribed it. This is a training gap, not an evidence gap.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="advocate">
                    <AccordionTrigger>How do I advocate for my loved one to try Clozapine?</AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed space-y-3">
                      <p className="font-medium text-slate-800">Use this script with the treating psychiatrist:</p>
                      <div className="p-4 bg-teal-50 rounded-lg border border-teal-200 italic">
                        "My family member has now failed [X] antipsychotics. According to treatment guidelines from APA and NICE, they meet criteria for treatment-resistant schizophrenia. I'd like to discuss a trial of Clozapine. If you don't prescribe it, could you refer us to a Clozapine clinic or psychiatrist who specializes in it?"
                      </div>
                      <p><strong>Key points:</strong> Document all prior medication trials. Know that failure of 2+ adequate trials = treatment-resistant. Push for referral if current provider won't prescribe.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="monitoring">
                    <AccordionTrigger>What does Clozapine monitoring involve?</AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed space-y-2">
                      <ul className="space-y-2">
                        <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> <span><strong>Weeks 1-26:</strong> Weekly blood tests (ANC - Absolute Neutrophil Count)</span></li>
                        <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> <span><strong>Weeks 27-52:</strong> Every 2 weeks</span></li>
                        <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> <span><strong>After 1 year:</strong> Monthly (if stable)</span></li>
                      </ul>
                      <p className="mt-3">Results are submitted to the Clozapine REMS Program. If ANC drops too low, medication is paused until counts recover.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="side-effects">
                    <AccordionTrigger>What are common side effects to watch for?</AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-slate-800 mb-2">Common (manageable):</p>
                          <ul className="space-y-1 text-sm">
                            <li>Sedation (usually improves)</li>
                            <li>Hypersalivation (especially at night)</li>
                            <li>Weight gain</li>
                            <li>Constipation</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> Report immediately:
                          </p>
                          <ul className="space-y-1 text-sm">
                            <li>Fever, flu-like symptoms</li>
                            <li>Severe constipation (can be serious)</li>
                            <li>Rapid heartbeat, chest pain</li>
                            <li>Signs of infection</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LEGAL TAB */}
        <TabsContent value="legal">
          <Card className="border-l-4 border-l-teal-500 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Scale className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <CardTitle>Involuntary Commitment & Rights</CardTitle>
                  <CardDescription>Understanding the legal framework during a crisis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is a 72-Hour Hold (5150)?</AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">
                    A 72-hour hold (often called a 5150 in CA, Baker Act in FL) allows a qualified officer or clinician to involuntarily confine a person deemed to have a mental disorder that makes them a danger to themselves, a danger to others, or gravely disabled. During this time, they will be evaluated and treated.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Conservatorship vs. Guardianship</AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">
                    <p className="mb-2"><strong>Conservatorship:</strong> Typically for adults who cannot care for themselves or manage finances. A judge appoints a responsible person (conservator).</p>
                    <p><strong>Guardianship:</strong> Similar concept, often used in different states or for minors. It grants legal authority to make decisions for another person.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>HIPAA for Families</AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">
                    HIPAA prevents doctors from sharing medical info without patient consent. HOWEVER, if the patient is incapacitated or poses a danger, doctors can use professional judgment to share relevant info with family. Always present a signed HIPAA waiver if you have one stored in your Vault.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Assisted Outpatient Treatment (AOT)</AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">
                    AOT (also called "Kendra's Law" in NY, "Laura's Law" in CA) is court-ordered outpatient treatment. It can require a person to attend appointments, take medication, and comply with a treatment plan while living in the community. It's a middle ground between full hospitalization and no intervention.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INSURANCE TAB */}
        <TabsContent value="insurance">
          <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <CardTitle>Insurance Battle Scripts</CardTitle>
                  <CardDescription>What to say when they deny coverage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Scenario: "Not Medically Necessary" Denial</h3>
                    <p className="text-sm font-medium text-blue-600 mb-2 uppercase tracking-wide">Script:</p>
                    <p className="text-slate-600 italic border-l-2 border-slate-300 pl-4">
                      "I am requesting a peer-to-peer review immediately. My family member is currently in an acute psychotic state and is a danger to themselves. Discharging them now would be negligent. Please provide the specific medical criteria you are using to determine they are stable, as the attending physician disagrees."
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Scenario: Requesting a Case Manager</h3>
                    <p className="text-sm font-medium text-blue-600 mb-2 uppercase tracking-wide">Script:</p>
                    <p className="text-slate-600 italic border-l-2 border-slate-300 pl-4">
                      "Given the complexity of this diagnosis and the likelihood of readmission without proper care, I am requesting a complex case manager be assigned to our file to help coordinate transition of care."
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Scenario: Denying Clozapine or Specialized Treatment</h3>
                    <p className="text-sm font-medium text-blue-600 mb-2 uppercase tracking-wide">Script:</p>
                    <p className="text-slate-600 italic border-l-2 border-slate-300 pl-4">
                      "My family member has failed [X] antipsychotic trials and meets APA guidelines for treatment-resistant schizophrenia. Clozapine is the only FDA-approved medication for this condition. Denying this medication is denying the standard of care. I am requesting an expedited appeal and will file a complaint with the state insurance commissioner if this is not approved within 72 hours."
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Scenario: Mental Health Parity Violation</h3>
                    <p className="text-sm font-medium text-blue-600 mb-2 uppercase tracking-wide">Script:</p>
                    <p className="text-slate-600 italic border-l-2 border-slate-300 pl-4">
                      "Under the Mental Health Parity and Addiction Equity Act, you are required to cover mental health conditions at parity with physical health conditions. If you would cover a 7-day stay for a patient with a heart condition requiring stabilization, you must cover the same for an acute psychiatric episode. I am documenting this conversation and will file a parity complaint if necessary."
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESOURCES TAB */}
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  National Hotlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800">988 Suicide & Crisis Lifeline</h4>
                  <p className="text-sm text-slate-500">Call or Text 988 (24/7)</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">NAMI Helpline</h4>
                  <p className="text-sm text-slate-500">1-800-950-NAMI (6264)</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Clozapine Support Line (REMS)</h4>
                  <p className="text-sm text-slate-500">1-844-267-8678</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Advocacy Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800">Treatment Advocacy Center</h4>
                  <p className="text-sm text-slate-500">Focuses on removing barriers to treatment for SMI. Essential resource for AOT information.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Mental Health America</h4>
                  <p className="text-sm text-slate-500">Community-based non-profit dedicated to addressing needs of those living with mental illness.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Doro Mind</h4>
                  <p className="text-sm text-slate-500">Clinical care teams and coaching for psychosis recovery. Team-based approach.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-teal-50 border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-800">For Healthcare Providers</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700">
                <p className="mb-4">If you're a provider wanting to learn more about prescribing Clozapine:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" /> <span>Register with the Clozapine REMS program at clozapinerems.com</span></li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" /> <span>Review APA Practice Guidelines for treatment-resistant schizophrenia</span></li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" /> <span>Consider Clozapine after failure of 2 adequate antipsychotic trials (6 weeks each, at therapeutic doses)</span></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
