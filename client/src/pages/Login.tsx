import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, HeartPulse, Scale, Sparkles, BookOpen, Users, Star, Share, X, Plus, AlertTriangle, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import logoImage from "@assets/generated_images/abstract_compass_wave_logo.png";

function MarijuanaWarning() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-red-950/80 border border-red-700 rounded-xl p-4 mb-6 shadow-lg">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
        data-testid="button-marijuana-warning"
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
          <h3 className="font-bold text-red-200 flex-1">Critical Warning: Cannabis and Psychosis</h3>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-red-400 shrink-0" />
          )}
        </div>
      </button>
      
      {expanded && (
        <div className="mt-4 text-red-100/90 text-sm leading-relaxed space-y-4">
          <p>
            Current clinical research suggests that marijuana (specifically the psychoactive compound THC) 
            exacerbates clinical psychosis primarily by hijacking the brain's dopamine system and disrupting 
            neural connectivity in areas responsible for reality processing.
          </p>
          <p>
            While most people can use cannabis without developing psychosis, for individuals with a pre-existing 
            clinical condition (such as schizophrenia or bipolar disorder) or a genetic predisposition, the drug 
            can trigger or worsen symptoms through the following biological mechanisms.
          </p>
          
          <p className="text-red-300/70 text-xs italic">
            — Dr. Robert Laitman
          </p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-200 mb-1">1. The Dopamine Surge (The "Engine" of Psychosis)</h4>
              <p className="text-red-100/80 text-xs">
                THC induces a surge of dopamine in the striatum. In a clinically psychotic brain, this area is 
                already hyperactive. The result: the brain assigns extreme importance to irrelevant things - 
                a random noise becomes a message, a stranger's glance becomes a threat. This "aberrant salience" 
                is the biological fuel for paranoia and delusions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-200 mb-1">2. Disruption of the Endocannabinoid System</h4>
              <p className="text-red-100/80 text-xs">
                THC binds to CB1 receptors much more strongly and for longer than the brain's natural chemicals. 
                This overloads the brain's "traffic controller," allowing signals that should be dampened through, 
                leading to disorganized thinking and sensory overload.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-200 mb-1">3. Accelerated Synaptic Pruning (Structural Changes)</h4>
              <p className="text-red-100/80 text-xs">
                Heavy THC exposure appears to accelerate brain thinning, particularly in the prefrontal cortex 
                (responsible for logic and impulse control). Excessive thinning is a structural characteristic 
                often observed in schizophrenia patients.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-200 mb-1">4. Genetic Vulnerability (COMT and AKT1 Genes)</h4>
              <p className="text-red-100/80 text-xs">
                Specific genes make certain individuals biologically unable to process cannabis safely. 
                The COMT "Val/Val" variant causes critically unbalanced dopamine when cannabis is used. 
                The AKT1 gene variations make the brain hypersensitive to THC's psychosis-mimicking effects.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-200 mb-1">5. Medication Interference</h4>
              <p className="text-red-100/80 text-xs">
                Smoking cannabis induces liver enzymes (CYP1A2) that metabolize medications faster. This can 
                cause antipsychotic medications to be cleared too quickly, effectively lowering the dose and 
                leading to relapse - even if medications are taken as prescribed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    // Hide if already installed as PWA
    if (standalone) {
      setShowBanner(false);
    }
  }, []);

  const dismissBanner = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4 z-50 safe-area-pb">
      <div className="max-w-lg mx-auto">
        <div className="flex items-start gap-3">
          <div className="shrink-0 bg-teal-600 rounded-lg p-2">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm mb-1">Install SchizoStream</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Tap the <Share className="w-3 h-3 inline-block mx-0.5" /> Share button below, then scroll down and tap <strong>"Add to Home Screen"</strong> for quick access.
            </p>
          </div>
          <button 
            onClick={dismissBanner}
            className="shrink-0 p-1 text-slate-400 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      <PWAInstallBanner />
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-slate-900 z-0" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl z-0" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl z-0" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-8">
            <img src={logoImage} alt="SchizoStream Logo" className="w-14 h-14 rounded-xl shadow-lg shadow-teal-500/20" />
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white" data-testid="text-app-name">Navigating The SchizoStream</h1>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight text-white drop-shadow-lg" data-testid="text-headline">
                There is <span className="text-yellow-300">Hope</span>. <br/>
                Recovery is <span className="text-yellow-300">Possible</span>.
              </h2>
              <p className="text-xl text-white mb-6 leading-relaxed drop-shadow-md" data-testid="text-subheadline">
                For families navigating the sudden onset of serious mental illness. 
                You are not alone, and with the right treatment, your loved one can stabilize and thrive.
              </p>
              
              {/* Hope Message Card */}
              <Card className="bg-gradient-to-r from-teal-600/90 to-teal-700/90 border-0 mb-8 shadow-2xl shadow-teal-900/30">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <Sparkles className="w-8 h-8 text-yellow-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">The Truth About Recovery</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        With proper medication adherence - especially <strong>Clozapine</strong> for treatment-resistant cases - 
                        many individuals with schizophrenia and schizoaffective disorder return to independent, fulfilling lives. 
                        The data is clear: early, aggressive, evidence-based treatment works.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <MarijuanaWarning />

              <button 
                onClick={handleLogin}
                className="w-full text-left bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/20 transition-all cursor-pointer group shadow-xl"
                data-testid="button-login"
              >
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="w-6 h-6 text-teal-400" />
                  <span className="text-lg font-bold text-white">HIPAA-Compliant Authentication Required</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  <strong className="text-white">Why do I need to sign in each time?</strong> Because this platform contains sensitive 
                  protected health information (PHI), HIPAA security rules require us to verify your identity 
                  every session. This prevents unauthorized access to your family's medical records, documents, 
                  and care coordination data - even if someone else uses your device.
                </p>
                <div className="flex items-center justify-center gap-2 bg-white text-slate-900 rounded-lg py-3 px-6 font-semibold group-hover:bg-slate-100 transition-colors">
                  Enter HIPAA Turnkey Crisis Toolkit
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Right Side - Feature Panel */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-center text-white">Your Turnkey Crisis Toolkit</h3>
              <div className="space-y-3">
                <FeatureRow icon={Bot} title="AI Expert Support" desc="Expert knowledge base from leading clinicians - Dr. Laitman, Dr. Amador, Dr. Torrey & more" highlight />
                <FeatureRow icon={ShieldCheck} title="The Vault" desc="Secure document storage for HIPAA waivers, POAs, and crisis plans" />
                <FeatureRow icon={Scale} title="Legal Navigator" desc="State-specific commitment laws, conservatorship guides, and insurance scripts" />
                <FeatureRow icon={HeartPulse} title="Clinical Logger" desc="Medication compliance tracking, symptom logs, and data for doctors" />
                <FeatureRow icon={Users} title="Care Team Hub" desc="Coordinate tasks with family, share updates securely" />
                <FeatureRow icon={BookOpen} title="Education Center" desc="Evidence-based information on treatments including Clozapine" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-slate-800 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-serif font-bold text-center mb-12 text-white">Our Mission</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <MissionCard 
              number="1"
              title="Give Hope"
              desc="Recovery is not just possible - it's documented. We share the data that proves treatment works."
            />
            <MissionCard 
              number="2"
              title="Straight-Line Data"
              desc="No fluff. A-Z honest information, especially about Clozapine - the gold standard for treatment-resistant cases."
            />
            <MissionCard 
              number="3"
              title="Educate Providers"
              desc="Help families advocate for evidence-based care when providers may not be current on best practices."
            />
            <MissionCard 
              number="4"
              title="Turnkey Package"
              desc="Medical, legal, insurance, and communication tools - all HIPAA compliant, all in one place."
            />
          </div>
        </div>
      </div>

      {/* Clozapine Highlight */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Star className="w-12 h-12 text-teal-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-white">Why We Emphasize Clozapine</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Clozapine is the <strong className="text-white">only FDA-approved medication</strong> for treatment-resistant schizophrenia. 
                Studies show it reduces hospitalization by 85%, suicide attempts by 90%, and significantly improves quality of life.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Yet it remains drastically underutilized. Our Navigator includes information to help families and providers 
                understand when and how to pursue this life-saving treatment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-teal-400">
            <ShieldCheck className="w-5 h-5" />
            <p className="text-sm font-medium">HIPAA-Compliant Platform</p>
          </div>
          <p className="text-slate-400 text-xs max-w-2xl mx-auto leading-relaxed">
            Navigating The SchizoStream is designed with HIPAA compliance in mind. All authentication, 
            data storage, and transmission use secure, encrypted channels to protect your sensitive health information.
          </p>
          <p className="text-slate-500 text-xs">
            501(c)(3) Non-Profit Organization
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, desc, highlight }: { icon: any, title: string, desc: string, highlight?: boolean }) {
  return (
    <div className={`flex gap-4 items-start p-3 rounded-lg transition-colors ${highlight ? 'bg-teal-500/20 border border-teal-500/30' : 'hover:bg-white/5'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${highlight ? 'bg-teal-500/40' : 'bg-teal-500/20'}`}>
        <Icon className={`w-5 h-5 ${highlight ? 'text-teal-200' : 'text-teal-300'}`} />
      </div>
      <div>
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          {title}
          {highlight && <span className="text-[10px] font-medium bg-yellow-400/90 text-slate-900 px-1.5 py-0.5 rounded">NEW</span>}
        </h4>
        <p className="text-xs text-slate-400 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function MissionCard({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="p-6">
      <div className="w-10 h-10 rounded-full bg-teal-500 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
