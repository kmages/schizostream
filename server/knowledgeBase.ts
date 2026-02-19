export interface KnowledgeEntry {
  id: string;
  expert: string;
  source: string;
  sourceUrl?: string;
  category: string;
  title: string;
  content: string;
  keywords: string[];
}

export const knowledgeBase: KnowledgeEntry[] = [
  // DR. ROBERT LAITMAN - Clozapine Expert
  {
    id: "laitman-1",
    expert: "Dr. Robert Laitman",
    source: "Team Daniel / Doro Mind",
    sourceUrl: "https://www.teamdanielrunningforrecovery.org",
    category: "clozapine",
    title: "Clozapine as Gold Standard Treatment",
    content: `Clozapine is the only FDA-approved medication for treatment-resistant schizophrenia. Dr. Robert Laitman, an internal medicine physician (nephrologist) who became a psychosis treatment expert after his son Daniel was diagnosed with schizophrenia in 2006, advocates for earlier use of clozapine rather than treating it as a "last resort."

Daniel achieved meaningful recovery with clozapine (started March 2008) and is now a college graduate who performs standup comedy. Dr. Laitman has treated 100+ patients over the last 10+ years using optimal clozapine management combined with a biopsychosocial approach including diet, exercise, housing, education, and vocational training.

Key outcomes with proper clozapine treatment:
- Reduces hospitalization by 85%
- Reduces suicide attempts by 90%
- Significantly improves quality of life
- Many patients return to independent, fulfilling lives

The E.A.S.E. model (published in Schizophrenia Research) provides guidance for optimum use of clozapine with careful monitoring and medication adjustments to mitigate side effects.`,
    keywords: ["clozapine", "treatment-resistant", "schizophrenia", "medication", "recovery", "FDA", "hospitalization", "suicide", "EASE"]
  },
  {
    id: "laitman-2",
    expert: "Dr. Robert Laitman",
    source: "Team Daniel",
    sourceUrl: "https://www.teamdanielrunningforrecovery.org/book",
    category: "recovery",
    title: "Meaningful Recovery is Possible",
    content: `Dr. Laitman's book "Meaningful Recovery from Schizophrenia and Serious Mental Illness with Clozapine" (now in its 5th edition) documents recovery outcomes from treating 100 patients over 10 years. The book covers clozapine history, optimal usage, side effect management, and includes the family perspective.

The biopsychosocial approach emphasizes:
- Primary treatment with clozapine for appropriate patients
- Wraparound support including diet and exercise
- Housing stability
- Education and vocational training
- Family involvement throughout the care journey

Team Daniel was formed in 2013 as a nonprofit to advocate for and support people living with mental illness through social events, exercise programs, and helping families navigate the healthcare system.

Schizophrenia is not a death sentence. With proper treatment, particularly early and optimal use of clozapine combined with comprehensive support, meaningful recovery is possible.`,
    keywords: ["recovery", "hope", "meaningful recovery", "biopsychosocial", "support", "family", "Team Daniel"]
  },
  {
    id: "laitman-3",
    expert: "Dr. Robert Laitman",
    source: "HMP Global Learning Network Podcast",
    sourceUrl: "https://www.hmpgloballearningnetwork.com/site/neurology/podcasts/robert-s-laitman-md-reclassifying-schizophrenia",
    category: "understanding",
    title: "Reclassifying Schizophrenia as Neurological",
    content: `Dr. Laitman discusses evidence for viewing schizophrenia as a neurological disorder rather than purely psychiatric. This reclassification could help reduce stigma and improve treatment approaches by emphasizing the biological basis of the condition.

Understanding schizophrenia as a brain disorder helps families and patients recognize that:
- Symptoms are not the patient's fault
- Treatment is medical, not just behavioral
- Recovery is achievable with proper medical intervention
- The condition deserves the same medical attention as other neurological disorders`,
    keywords: ["neurological", "brain disorder", "stigma", "reclassification", "biological"]
  },

  // DR. XAVIER AMADOR - LEAP Method & Anosognosia
  {
    id: "amador-1",
    expert: "Dr. Xavier Amador",
    source: "LEAP Institute",
    sourceUrl: "https://leapinstitute.org",
    category: "communication",
    title: "The LEAP Method for Treatment Refusal",
    content: `LEAP (Listen-Empathize-Agree-Partner) is an evidence-based communication approach developed by Dr. Xavier Amador to help gain cooperation from people who don't believe they are ill.

The core principle: "You win on the strength of your relationship, not your argument."

The LEAP approach:
- LISTEN: Practice reflective listening that immediately lowers anger and defensiveness
- EMPATHIZE: Convey genuine understanding of their perspective
- AGREE: Find common ground and shared goals (employment, housing, independence)
- PARTNER: Work together toward mutually beneficial outcomes

When you use LEAP, you stop trying to force your adversary to admit they're wrong. Instead, you establish empathy and respect for their point of view, even when you disagree with it. The result is you become more trustworthy.

Scientific evidence is clear: trusting relationships result in acceptance of treatment and services. LEAP has helped families get loved ones into treatment after years of homelessness and no contact.`,
    keywords: ["LEAP", "communication", "treatment refusal", "denial", "relationship", "trust", "listen", "empathize", "agree", "partner"]
  },
  {
    id: "amador-2",
    expert: "Dr. Xavier Amador",
    source: "LEAP Institute",
    sourceUrl: "https://leapinstitute.org/about/",
    category: "anosognosia",
    title: "Understanding Anosognosia",
    content: `Anosognosia (pronounced uh-nah-suh-no-zhuh) is a neurological symptom—NOT denial—that prevents people from recognizing they have a mental illness.

Prevalence:
- Affects approximately 50-60% of people with schizophrenia
- Affects 20-40% of people with bipolar disorder

This is the primary barrier to accepting help and leads to:
- Treatment refusal and medication noncompliance
- Homelessness
- Criminal justice involvement
- Family conflict and relationship breakdown

Dr. Amador's research was inspired by his brother Henry, who developed schizophrenia and refused treatment due to anosognosia. His decade-long journey helping Henry accept treatment led him to resign his tenured Columbia University position in 2002 to devote himself full-time to educating families, clinicians, law enforcement, and policymakers.

Key insight: Anosognosia is caused by damage to the brain, specifically the frontal lobes. It is not stubbornness, denial, or a defense mechanism. Understanding this changes how families approach their loved ones.`,
    keywords: ["anosognosia", "insight", "denial", "awareness", "frontal lobe", "brain damage", "treatment refusal"]
  },
  {
    id: "amador-3",
    expert: "Dr. Xavier Amador",
    source: "I Am Not Sick, I Don't Need Help!",
    sourceUrl: "https://dramador.com/books/",
    category: "family-guide",
    title: "Helping Someone Who Doesn't Believe They're Ill",
    content: `Dr. Amador's book "I Am Not Sick, I Don't Need Help!" (translated into 30 languages, 1.5 million copies sold) provides practical guidance for families.

Key strategies:
1. Stop arguing about whether they are sick - you cannot win this argument
2. Focus on shared goals they care about (job, apartment, relationships, getting out of hospital)
3. Build trust through reflective listening
4. Never say "you need to take your medication because you're sick"
5. Instead, explore what THEY want and how treatment might help achieve those goals

The book transforms the relationship from adversarial to collaborative. Endorsed by Dr. Aaron T. Beck (founder of cognitive therapy) who stated: "I very strongly recommend that all families and therapists learn and use LEAP."`,
    keywords: ["family", "book", "strategies", "communication", "goals", "trust", "I Am Not Sick"]
  },

  // DR. E. FULLER TORREY - Treatment Advocacy
  {
    id: "torrey-1",
    expert: "Dr. E. Fuller Torrey",
    source: "Treatment Advocacy Center",
    sourceUrl: "https://www.treatmentadvocacycenter.org",
    category: "advocacy",
    title: "Treatment Advocacy and Legal Reform",
    content: `Dr. E. Fuller Torrey founded the Treatment Advocacy Center (TAC) in 1998 after 15 years working with unhoused people with severe mental illness in Washington, D.C.

TAC's mission: Eliminate barriers to treatment for serious mental illness and reform state civil commitment laws.

Key advocacy positions:
- Promotes Assisted Outpatient Treatment (AOT) when deemed appropriate by courts
- Helped pass Kendra's Law in New York allowing court-ordered outpatient treatment
- Advocates for treating people before crisis, not after
- Supports assertive community treatment (ACT) and supported housing/employment

Dr. Torrey emphasizes that reform of civil commitment laws is essential to treat people who cannot recognize they need help. The current system often waits until tragedy occurs before intervening.

TAC does NOT accept pharmaceutical funding—relies solely on individual donors to maintain independence.`,
    keywords: ["advocacy", "TAC", "Kendra's Law", "AOT", "assisted outpatient treatment", "civil commitment", "legal", "court-ordered"]
  },
  {
    id: "torrey-2",
    expert: "Dr. E. Fuller Torrey",
    source: "Surviving Schizophrenia (7th Edition)",
    sourceUrl: "https://www.amazon.com/Surviving-Schizophrenia-7th-Family-Manual/dp/0062880802",
    category: "family-guide",
    title: "Surviving Schizophrenia - The Definitive Family Guide",
    content: `"Surviving Schizophrenia: A Family Manual" by Dr. E. Fuller Torrey (first published 1983, now in 7th edition 2019) is the definitive guide for families understanding schizophrenia.

The book covers:
- Nature and causes of schizophrenia
- Symptoms and their biological basis
- Treatment options and what works
- Navigating the mental health system
- Legal issues and advocacy
- Practical day-to-day management

Dr. Torrey has written 21 books and over 200 professional papers. He advocates for a biological understanding of severe mental illness and critiques policies that led to widespread homelessness, incarceration, and criminalization of mental illness.

Recognition: 2020 NAMI Exemplary Psychiatrist Award, Fellow of the Royal Society, frequent media presence (NPR, 60 Minutes, Oprah).`,
    keywords: ["Surviving Schizophrenia", "book", "family guide", "causes", "symptoms", "treatment", "Torrey"]
  },

  // DR. DEEPAK D'SOUZA - Cannabis & Psychosis Research
  {
    id: "dsouza-1",
    expert: "Dr. Deepak Cyril D'Souza",
    source: "Yale School of Medicine",
    sourceUrl: "https://medicine.yale.edu/profile/deepak-dsouza/",
    category: "cannabis",
    title: "Cannabis and Psychosis: The Scientific Evidence",
    content: `Dr. Deepak Cyril D'Souza, Professor of Psychiatry at Yale School of Medicine, is a world-renowned expert on cannabis pharmacology and its relationship to psychosis.

Key research findings:
- THC (the psychoactive compound in cannabis) reliably produces transient psychotic symptoms in healthy volunteers
- These symptoms include paranoia, delusions, conceptual disorganization, depersonalization, and perceptual alterations
- The effects closely mimic schizophrenia symptoms
- 75% of early psychosis patients at Yale's STEP program had cannabis use history

Cannabis-Induced Psychotic Disorder (CIPD):
- THC produces short-term psychotic symptoms lasting days to weeks
- Up to 50% of CIPD patients are later diagnosed with schizophrenia or bipolar disorder
- Higher THC potency and frequency of use increases CIPD risk

Risk is comparable to the relationship between high cholesterol and heart disease.`,
    keywords: ["cannabis", "THC", "marijuana", "psychosis", "Yale", "research", "CIPD", "D'Souza"]
  },
  {
    id: "dsouza-2",
    expert: "Dr. Deepak Cyril D'Souza",
    source: "Yale Research / PMC4352721",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4352721/",
    category: "cannabis",
    title: "How Cannabis Affects the Brain in Psychosis",
    content: `The link between cannabis and psychosis involves multiple biological mechanisms:

1. Dopamine Dysregulation:
- THC induces a surge of dopamine in the striatum
- In a psychotic brain, the striatum is already hyperactive
- Result: The brain assigns extreme importance to irrelevant stimuli (aberrant salience)
- This fuels paranoia and delusions

2. Endocannabinoid System Disruption:
- THC binds to CB1 receptors much more strongly than the brain's natural chemicals
- This overloads the brain's "traffic controller" for neurotransmitters
- Signals that should be dampened are allowed through
- Results in disorganized thinking and sensory overload

3. Structural Brain Changes:
- Heavy THC exposure accelerates brain thinning (synaptic pruning)
- Particularly affects the prefrontal cortex (logic and impulse control)
- Excessive thinning is characteristic of schizophrenia patients

4. Genetic Vulnerability:
- COMT gene Val/Val variant causes critically unbalanced dopamine with cannabis use
- AKT1 gene variations make the brain hypersensitive to THC's psychosis-mimicking effects

Cannabis is neither necessary nor sufficient to cause schizophrenia, but it is a component cause that interacts with genetic and environmental factors.`,
    keywords: ["dopamine", "endocannabinoid", "CB1", "brain", "striatum", "prefrontal cortex", "COMT", "AKT1", "genetics"]
  },
  {
    id: "dsouza-3",
    expert: "Dr. Deepak Cyril D'Souza",
    source: "Yale / Clinical Recommendations",
    sourceUrl: "https://medicine.yale.edu/news-article/behind-the-smoke-unmasking-the-link-between-cannabis-and-schizophrenia/",
    category: "cannabis",
    title: "Cannabis Risk Factors and Clinical Recommendations",
    content: `Clinical recommendations from Dr. D'Souza's research:

High-risk groups who should avoid cannabis:
- Individuals with family history of schizophrenia
- Those with prodromal (early warning) symptoms
- Anyone who has experienced cannabis-induced psychosis
- Adolescents and young adults (brain develops until age 25)

Risk factors:
- Regular high-potency cannabis use (>15% THC) increases schizophrenia risk 4-fold
- Modern cannabis averages 20-25% THC (vs. <1% at Woodstock 1969)
- Adolescent use poses greatest risk due to ongoing brain development
- Daily use associated with 25% increased heart attack risk, 42% increased stroke risk

THC vs CBD:
- THC is the primary psychoactive constituent causing psychosis
- CBD may have antipsychotic/anxiolytic properties
- Problem: CBD is often bred out of high-potency strains

Medication Interference:
- Smoking cannabis induces liver enzymes (CYP1A2) that metabolize medications faster
- Can cause antipsychotic medications to be cleared too quickly
- Leads to relapse even if medications are taken as prescribed

There is "insufficient evidence" for cannabis treating depression, anxiety, ADHD, PTSD, or psychosis. THC is "generally harmful" to people with psychiatric conditions.`,
    keywords: ["risk factors", "adolescent", "high-potency", "THC", "CBD", "medication", "CYP1A2", "antipsychotic"]
  },

  // SIR ROBIN MURRAY & DR. MARTA DI FORTI - King's College London
  {
    id: "murray-1",
    expert: "Sir Robin Murray & Dr. Marta Di Forti",
    source: "King's College London",
    sourceUrl: "https://www.kcl.ac.uk/people/professor-sir-robin-murray",
    category: "cannabis",
    title: "High-Potency Cannabis and Psychosis Risk",
    content: `Sir Robin Murray (Professor of Psychiatric Research, Fellow of the Royal Society, Knighted 2011) and Dr. Marta Di Forti (Professor of Drug Use, Genetics and Psychosis) at King's College London have conducted groundbreaking research on cannabis and psychosis.

Key findings:
- First to show that high-potency cannabis (e.g., "skunk") carries higher psychosis risk than traditional types
- Demonstrated how cannabis affects rates of psychotic disorders across Europe
- Regular high-potency cannabis use significantly increases schizophrenia risk

Dr. Di Forti established the first Cannabis Clinic for patients with psychotic disorders in the UK (NHS Cannabis Clinic for Psychosis, launched 2019).

EU-GEI case-control study findings:
- Risk decreases after cannabis cessation
- Cannabis users with acute mental illness have higher risk of psychiatric intensive care unit transfer

Sir Robin Murray is the most frequently cited psychosis researcher outside the USA with over 800 publications.`,
    keywords: ["King's College", "high-potency", "skunk", "UK", "Cannabis Clinic", "EU-GEI", "Murray", "Di Forti"]
  },
  {
    id: "murray-2",
    expert: "Sir Robin Murray & Dr. Marta Di Forti",
    source: "Maudsley Learning Podcast",
    sourceUrl: "https://maudsleylearning.com/podcasts/maudsley-learning-podcast/cannabis-psychosis-with-dr-marta-di-forti-and-professor-robin-murray/",
    category: "cannabis",
    title: "Changes in Cannabis Potency Over Decades",
    content: `Research from King's College London documents dramatic changes in cannabis potency:

Historical context:
- Cannabis at Woodstock (1969): <1% THC
- Modern cannabis: 20-25% THC average
- Some high-potency strains: 30%+ THC

The problem with modern cannabis:
- CBD (which may have antipsychotic properties) has been bred out
- Higher THC concentrations produce more intense effects
- Risk of psychosis increases with potency
- Legalization correlated with decreased risk perception among adolescents

Dr. Di Forti's "Cannabis & Me" study (£2.5+ million MRC funding) investigates:
- Gene-cannabis interactions in schizophrenia
- How cannabis changes the epigenome
- Individual vulnerability factors

The neurodevelopmental model pioneered by Sir Robin Murray (1987) shows how environmental factors including cannabis dysregulate striatal dopamine, contributing to psychosis risk.`,
    keywords: ["potency", "THC concentration", "history", "CBD", "epigenome", "genetics", "neurodevelopmental"]
  },

  // GENERAL INFORMATION
  {
    id: "general-1",
    expert: "Multiple Sources",
    source: "Clinical Consensus",
    category: "symptoms",
    title: "Understanding Psychotic Symptoms",
    content: `Psychotic disorders like schizophrenia are characterized by three main symptom categories:

Positive Symptoms (additions to normal experience):
- Hallucinations (hearing, seeing, or sensing things others don't)
- Delusions (fixed false beliefs)
- Thought disorganization
- Paranoia

Negative Symptoms (subtractions from normal experience):
- Amotivation (lack of drive)
- Anhedonia (inability to feel pleasure)
- Asociality (social withdrawal)
- Affective flattening (reduced emotional expression)
- Alogia (reduced speech)

Cognitive Symptoms:
- Deficits in attention and concentration
- Working memory problems
- Executive function impairment
- Difficulty with abstract thinking

Negative and cognitive symptoms often cause more long-term disability than positive symptoms. Treatment should address all three categories.`,
    keywords: ["symptoms", "positive symptoms", "negative symptoms", "cognitive", "hallucinations", "delusions", "paranoia"]
  },
  {
    id: "general-2",
    expert: "Multiple Sources",
    source: "Clinical Consensus",
    category: "early-intervention",
    title: "Early Intervention and Duration of Untreated Psychosis",
    content: `The Duration of Untreated Psychosis (DUP) is a critical factor in outcomes:

Research shows:
- Longer DUP associated with worse long-term outcomes
- Early intervention leads to better recovery
- First 2-5 years after onset are critical for treatment

Warning signs that may precede psychosis (prodromal symptoms):
- Social withdrawal
- Declining school or work performance
- Unusual thoughts or perceptions
- Suspiciousness
- Difficulty concentrating
- Sleep disturbances
- Neglect of personal hygiene

If you notice these signs, seek evaluation promptly. Early, aggressive, evidence-based treatment works. The goal is to reduce DUP and begin treatment as soon as possible.

First Episode Psychosis (FEP) programs provide specialized care including:
- Coordinated specialty care
- Case management
- Family support and education
- Supported employment and education
- Low-dose medication management`,
    keywords: ["early intervention", "DUP", "prodromal", "warning signs", "first episode", "FEP"]
  },
  {
    id: "general-3",
    expert: "Multiple Sources",
    source: "HIPAA / HHS",
    sourceUrl: "https://www.hhs.gov/hipaa/for-individuals/mental-health/index.html",
    category: "legal",
    title: "HIPAA Rights for Family Caregivers",
    content: `Understanding your rights as a family caregiver under HIPAA:

Key provision: "Where a patient is incapacitated, a healthcare provider MAY SHARE the patient's information with family and friends..."

Healthcare providers can share information when:
- The patient is incapacitated or in an emergency
- The provider believes sharing is in the patient's best interest
- The patient has given verbal or written permission
- The patient is present and doesn't object

Tips for caregivers:
- Ask to be included in treatment team meetings
- Request that your loved one sign a release of information
- If they refuse, document your observations and concerns in writing
- Provide information TO the treatment team even if they can't share back
- In emergencies, providers can share necessary information

Navigating the system:
- Know your state's civil commitment laws
- Understand criteria for involuntary treatment
- Learn about Assisted Outpatient Treatment (AOT) in your state
- Connect with NAMI for local resources and support`,
    keywords: ["HIPAA", "privacy", "family", "caregiver", "rights", "information sharing", "incapacitated"]
  }
];

import { storage } from "./storage";
import type { KnowledgeEntry as DBKnowledgeEntry } from "@shared/schema";

export async function seedKnowledgeBase(): Promise<void> {
  const existing = await storage.getKnowledgeEntries();
  if (existing.length > 0) return;
  
  console.log("Seeding knowledge base with initial entries...");
  
  for (const entry of knowledgeBase) {
    await storage.createKnowledgeEntry({
      expert: entry.expert,
      source: entry.source,
      sourceUrl: entry.sourceUrl || null,
      category: entry.category,
      title: entry.title,
      content: entry.content,
      keywords: entry.keywords
    });
  }
  
  console.log(`Seeded ${knowledgeBase.length} knowledge base entries.`);
}

export function searchKnowledgeBase(query: string, entries: DBKnowledgeEntry[], limit: number = 3): DBKnowledgeEntry[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  
  const scored = entries.map(entry => {
    let score = 0;
    
    const titleLower = entry.title.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    const keywordsLower = entry.keywords.map(k => k.toLowerCase());
    
    for (const word of queryWords) {
      if (titleLower.includes(word)) score += 10;
      if (keywordsLower.some(k => k.includes(word))) score += 8;
      if (contentLower.includes(word)) score += 3;
    }
    
    if (queryLower.includes("clozapine") && entry.category === "clozapine") score += 15;
    if (queryLower.includes("cannabis") || queryLower.includes("marijuana") || queryLower.includes("weed") || queryLower.includes("thc")) {
      if (entry.category === "cannabis") score += 15;
    }
    if (queryLower.includes("leap") || queryLower.includes("refuse") || queryLower.includes("denial")) {
      if (entry.category === "communication" || entry.category === "anosognosia") score += 15;
    }
    if (queryLower.includes("anosognosia") || queryLower.includes("doesn't believe") || queryLower.includes("won't take")) {
      if (entry.category === "anosognosia") score += 15;
    }
    if (queryLower.includes("recovery") || queryLower.includes("hope") || queryLower.includes("better")) {
      if (entry.category === "recovery") score += 10;
    }
    if (queryLower.includes("symptom")) {
      if (entry.category === "symptoms") score += 15;
    }
    if (queryLower.includes("legal") || queryLower.includes("rights") || queryLower.includes("hipaa")) {
      if (entry.category === "legal") score += 15;
    }
    
    return { entry, score };
  });
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry);
}

export function formatKnowledgeForPrompt(entries: DBKnowledgeEntry[]): string {
  if (entries.length === 0) return "";
  
  let result = "\n\n=== EXPERT KNOWLEDGE BASE ===\n";
  result += "Use the following verified information from recognized experts to inform your response:\n\n";
  
  for (const entry of entries) {
    result += `--- ${entry.title} ---\n`;
    result += `Expert: ${entry.expert}\n`;
    result += `Source: ${entry.source}\n`;
    result += `${entry.content}\n\n`;
  }
  
  result += "=== END EXPERT KNOWLEDGE ===\n";
  result += "Prioritize information from the Expert Knowledge Base above. Cite the expert and source when using this information.\n";
  
  return result;
}
