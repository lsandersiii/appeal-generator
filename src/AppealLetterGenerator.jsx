import { useState } from "react";

const FIELD_GROUPS = [
  {
    title: "Claim Information",
    fields: [
      { id: "payer", label: "Payer Name", placeholder: "e.g., Anthem Blue Cross", type: "text" },
      { id: "denialCode", label: "Denial Code (CARC)", placeholder: "e.g., CARC 50", type: "text" },
      { id: "denialDescription", label: "Denial Reason Description", placeholder: "e.g., Services deemed not medically necessary", type: "text" },
      { id: "cptCode", label: "CPT Code", placeholder: "e.g., 29881", type: "text" },
      { id: "cptDescription", label: "CPT Description", placeholder: "e.g., Arthroscopy, knee, surgical; with meniscectomy", type: "text" },
      { id: "dateOfService", label: "Date of Service", placeholder: "e.g., April 14, 2025", type: "text" },
      { id: "claimNumber", label: "Claim Number", placeholder: "e.g., ANT-2025-0847291", type: "text" },
      { id: "claimValue", label: "Claim Value ($)", placeholder: "e.g., 4850", type: "text" },
      { id: "priorAuth", label: "Prior Authorization Reference", placeholder: "e.g., AUTH-7741903 (or N/A)", type: "text" },
    ],
  },
  {
    title: "Patient Information (De-Identified)",
    fields: [
      { id: "patientAge", label: "Patient Age", placeholder: "e.g., 52", type: "text" },
      { id: "patientGender", label: "Patient Gender", placeholder: "e.g., Male", type: "text" },
      { id: "memberID", label: "Member ID Placeholder", placeholder: "[MEMBER ID]", type: "text" },
    ],
  },
  {
    title: "Clinical Details",
    fields: [
      { id: "clinicalSummary", label: "Clinical Summary", placeholder: "Presenting complaint, duration of symptoms, diagnostic findings (MRI, X-ray, labs, etc.)", type: "textarea" },
      { id: "conservativeTreatments", label: "Conservative Treatments Attempted", placeholder: "List each treatment with duration and outcome, e.g.:\n1. Physical therapy: 12 sessions over 8 weeks, no sustained improvement\n2. NSAIDs: naproxen 500mg BID for 6 weeks, discontinued due to GI intolerance\n3. Corticosteroid injection: triamcinolone 40mg, temporary relief lasting 3 weeks\n4. Activity modification: 8 weeks, no improvement", type: "textarea" },
      { id: "functionalScore", label: "Functional Assessment Score (if applicable)", placeholder: "e.g., Lysholm score: 42/100, or DASH score, or VAS pain scale", type: "text" },
    ],
  },
  {
    title: "Guideline References",
    fields: [
      { id: "payerGuideline", label: "Payer Clinical Guideline Reference", placeholder: "e.g., Anthem CG-SURG-71 for Knee Arthroscopy", type: "text" },
      { id: "clinicalGuideline", label: "Clinical Practice Guideline Reference", placeholder: "e.g., AAOS Clinical Practice Guideline for Management of Meniscal Injuries (2019)", type: "text" },
    ],
  },
  {
    title: "Practice Information",
    fields: [
      { id: "practiceName", label: "Practice Name Placeholder", placeholder: "[PRACTICE NAME]", type: "text" },
      { id: "providerName", label: "Provider Name Placeholder", placeholder: "[PROVIDER NAME], MD, FAAOS", type: "text" },
      { id: "providerNPI", label: "Provider NPI Placeholder", placeholder: "[NPI]", type: "text" },
    ],
  },
];

const DEFAULT_VALUES = {
  payer: "", denialCode: "", denialDescription: "", cptCode: "", cptDescription: "",
  dateOfService: "", claimNumber: "", claimValue: "", priorAuth: "",
  patientAge: "", patientGender: "", memberID: "[MEMBER ID]",
  clinicalSummary: "", conservativeTreatments: "", functionalScore: "",
  payerGuideline: "", clinicalGuideline: "",
  practiceName: "[PRACTICE NAME]", providerName: "[PROVIDER NAME], MD, FAAOS", providerNPI: "[NPI]",
};

const SAMPLE_VALUES = {
  payer: "Anthem Blue Cross",
  denialCode: "CARC 50",
  denialDescription: "Services deemed not medically necessary",
  cptCode: "29881",
  cptDescription: "Arthroscopy, knee, surgical; with meniscectomy",
  dateOfService: "April 14, 2025",
  claimNumber: "ANT-2025-0847291",
  claimValue: "4,850",
  priorAuth: "AUTH-7741903",
  patientAge: "52",
  patientGender: "Male",
  memberID: "[MEMBER ID]",
  clinicalSummary: "Patient presented with persistent right medial knee pain, mechanical locking, and functional limitation of 14 weeks duration. MRI of the right knee confirmed a complex tear of the posterior horn of the medial meniscus with associated joint effusion.",
  conservativeTreatments: "1. Physical therapy: 12 sessions over 8 weeks, no sustained improvement\n2. NSAIDs: naproxen 500mg BID for 6 weeks, discontinued due to GI intolerance\n3. Corticosteroid injection: triamcinolone 40mg, temporary relief lasting 3 weeks only\n4. Activity modification and home exercise program: 8 weeks, no improvement",
  functionalScore: "Lysholm functional assessment score: 42/100 (significant disability)",
  payerGuideline: "Anthem Clinical UM Guideline CG-SURG-71 for Knee Arthroscopy",
  clinicalGuideline: "AAOS Clinical Practice Guideline for Management of Meniscal Injuries (2019)",
  practiceName: "[PRACTICE NAME]",
  providerName: "[PROVIDER NAME], MD, FAAOS",
  providerNPI: "[NPI]",
};

function buildPrompt(data) {
  return `Write a formal insurance appeal letter for the following denied claim.

Denial reason: ${data.denialCode}, ${data.denialDescription}
Payer: ${data.payer}
CPT: ${data.cptCode} (${data.cptDescription})
Date of service: ${data.dateOfService}
Claim number: ${data.claimNumber}
Claim value: $${data.claimValue}
Prior authorization reference: ${data.priorAuth}

Patient: [PATIENT NAME], ${data.patientAge}-year-old ${data.patientGender}
Member ID: ${data.memberID}

Clinical history: ${data.clinicalSummary}

Conservative treatment attempted and failed:
${data.conservativeTreatments}

Functional assessment: ${data.functionalScore || "Not provided"}

Requirements for the letter:
- Reference ${data.payerGuideline || "applicable payer clinical guideline"} if provided
- Reference ${data.clinicalGuideline || "applicable clinical practice guidelines"} if provided
${data.priorAuth && data.priorAuth !== "N/A" ? "- Emphasize that prior authorization was obtained, confirming medical necessity was already established" : ""}
- List all conservative treatment failures with duration and outcome
- Include a supporting documentation list (operative report, pre-op notes, imaging reports, therapy notes, prior auth confirmation if applicable, functional assessment)
- Request written response within 30 business days per contractual obligations
- Tone: professional, factual, persuasive
- Length: one page maximum
- Practice name: ${data.practiceName}
- Provider: ${data.providerName}
- NPI: ${data.providerNPI}

Format the letter with proper headers, date, recipient address block, and professional closing. Use today's date for the letter date. Address to the payer's Appeals and Grievances Department.`;
}

export default function AppealLetterGenerator() {
  const [formData, setFormData] = useState(DEFAULT_VALUES);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTime, setGenerationTime] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [showForm, setShowForm] = useState(true);

  const handleChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const loadSample = () => {
    setFormData(SAMPLE_VALUES);
  };

  const clearForm = () => {
    setFormData(DEFAULT_VALUES);
    setGeneratedLetter("");
    setGenerationTime(null);
    setError("");
    setShowForm(true);
  };

  const requiredFields = ["payer", "denialCode", "cptCode", "dateOfService", "clinicalSummary", "conservativeTreatments"];
  const isValid = requiredFields.every((f) => formData[f]?.trim());

  const generate = async () => {
    if (!isValid) {
      setError("Complete all required fields: Payer, Denial Code, CPT Code, Date of Service, Clinical Summary, and Conservative Treatments.");
      return;
    }
    setError("");
    setIsGenerating(true);
    setGeneratedLetter("");
    setGenerationTime(null);

    const startTime = Date.now();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(formData) }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      setGenerationTime(elapsed);

      if (data.letter) {
        setGeneratedLetter(data.letter);
        setShowForm(false);
      } else {
        setError("No response received. Please try again.");
      }
    } catch (err) {
      setError("Generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = generatedLetter;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const styles = {
    page: { fontFamily: "'DM Sans', system-ui, sans-serif", background: "#F8F9FA", minHeight: "100vh" },
    header: {
      background: "linear-gradient(135deg, #0B1D3A 0%, #1B4F8A 100%)",
      padding: "28px 24px 24px", color: "#fff", textAlign: "center",
    },
    brandTag: { fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#D4A843", marginBottom: 6 },
    h1: { fontSize: "24px", fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.5px" },
    subtitle: { fontSize: "14px", color: "rgba(255,255,255,0.7)", maxWidth: 500, margin: "0 auto" },
    hipaaNote: {
      display: "inline-flex", gap: 6, marginTop: 16,
      background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px",
      fontSize: "12px", color: "rgba(255,255,255,0.6)",
    },
    container: { maxWidth: 780, margin: "0 auto", padding: "24px 16px" },
    actionRow: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
    btnSecondary: {
      padding: "8px 16px", fontSize: 13, fontWeight: 600, border: "1px solid #E2E5E9",
      borderRadius: 6, background: "#fff", color: "#5A6577", cursor: "pointer",
    },
    tabRow: {
      display: "flex", gap: 4, marginBottom: 20, overflowX: "auto",
      borderBottom: "2px solid #E2E5E9", paddingBottom: 0,
    },
    card: {
      background: "#fff", borderRadius: 10, padding: 24,
      boxShadow: "0 2px 12px rgba(11,29,58,0.08)", marginBottom: 20,
    },
    cardTitle: { fontSize: 16, fontWeight: 700, color: "#0B1D3A", marginBottom: 20 },
    fieldLabel: {
      display: "block", fontSize: 12, fontWeight: 600, color: "#5A6577",
      marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px",
    },
    input: {
      width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #E2E5E9",
      borderRadius: 6, fontFamily: "inherit", color: "#2D3442", outline: "none",
    },
    textarea: {
      width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #E2E5E9",
      borderRadius: 6, fontFamily: "inherit", resize: "vertical", lineHeight: 1.6,
      color: "#2D3442", outline: "none",
    },
    navRow: { display: "flex", justifyContent: "space-between", marginTop: 24 },
    btnPrev: (disabled) => ({
      padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6,
      border: "1px solid #E2E5E9", background: "#fff",
      color: disabled ? "#ccc" : "#5A6577", cursor: disabled ? "default" : "pointer",
    }),
    btnNext: {
      padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6,
      border: "none", background: "#1B4F8A", color: "#fff", cursor: "pointer",
    },
    btnGenerate: (enabled) => ({
      padding: "12px 28px", fontSize: 14, fontWeight: 700, borderRadius: 6, border: "none",
      background: enabled ? "linear-gradient(135deg, #0A8F7F 0%, #0B7A6D 100%)" : "#ccc",
      color: "#fff", cursor: enabled ? "pointer" : "default",
      boxShadow: enabled ? "0 4px 12px rgba(10,143,127,0.3)" : "none",
    }),
    error: {
      background: "#FEF2F1", border: "1px solid #C4392D", borderRadius: 8,
      padding: "12px 16px", fontSize: 13, color: "#C4392D", marginBottom: 20,
    },
    spinner: {
      width: 40, height: 40, border: "3px solid #E2E5E9", borderTopColor: "#0A8F7F",
      borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
    },
    statBox: (bg, border) => ({
      flex: 1, minWidth: 140, background: bg, borderRadius: 8, padding: "16px 20px",
      textAlign: "center", border: `1px solid ${border}`,
    }),
    statLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#5A6577", marginBottom: 4 },
    letterHeader: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 20px", background: "#EDFBF3", borderBottom: "2px solid #1A7A4C",
    },
    letterBody: {
      padding: 24, fontSize: 14, lineHeight: 1.8, color: "#2D3442",
      whiteSpace: "pre-wrap", fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    footer: {
      background: "linear-gradient(135deg, #0B1D3A 0%, #1B4F8A 100%)",
      borderRadius: 10, padding: 24, marginTop: 20, textAlign: "center", color: "#fff",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.brandTag}>Revive Revenue Services</div>
        <h1 style={styles.h1}>AI Appeal Letter Generator</h1>
        <p style={styles.subtitle}>Enter denial details. Generate a policy-referenced appeal letter in seconds.</p>
        <div style={styles.hipaaNote}>
          <span style={{ color: "#D4A843" }}>HIPAA Note:</span>
          Use de-identified data only. No real patient names, DOB, SSN, or MRN.
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.actionRow}>
          <button onClick={loadSample} style={styles.btnSecondary}>Load Sample Scenario</button>
          <button onClick={clearForm} style={styles.btnSecondary}>Clear All</button>
          {generatedLetter && (
            <button onClick={() => setShowForm(!showForm)} style={{
              ...styles.btnSecondary, marginLeft: "auto",
              border: "1px solid #1B4F8A",
              background: showForm ? "#1B4F8A" : "#fff",
              color: showForm ? "#fff" : "#1B4F8A",
            }}>
              {showForm ? "View Letter" : "Edit Form"}
            </button>
          )}
        </div>

        {showForm && (
          <div>
            <div style={styles.tabRow}>
              {FIELD_GROUPS.map((group, i) => (
                <button key={i} onClick={() => setActiveSection(i)} style={{
                  padding: "10px 16px", fontSize: 12, fontWeight: 600, border: "none",
                  borderBottom: activeSection === i ? "2px solid #1B4F8A" : "2px solid transparent",
                  background: "none", color: activeSection === i ? "#1B4F8A" : "#8B95A5",
                  cursor: "pointer", whiteSpace: "nowrap", marginBottom: -2, transition: "all 0.15s ease",
                }}>
                  {group.title}
                </button>
              ))}
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>{FIELD_GROUPS[activeSection].title}</h3>
              {FIELD_GROUPS[activeSection].fields.map((field) => (
                <div key={field.id} style={{ marginBottom: 16 }}>
                  <label style={styles.fieldLabel}>
                    {field.label}
                    {requiredFields.includes(field.id) && <span style={{ color: "#C4392D", marginLeft: 3 }}>*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea value={formData[field.id]} onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder} rows={5} style={styles.textarea} />
                  ) : (
                    <input type="text" value={formData[field.id]} onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder} style={styles.input} />
                  )}
                </div>
              ))}

              <div style={styles.navRow}>
                <button onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                  disabled={activeSection === 0} style={styles.btnPrev(activeSection === 0)}>
                  Previous
                </button>
                {activeSection < FIELD_GROUPS.length - 1 ? (
                  <button onClick={() => setActiveSection(activeSection + 1)} style={styles.btnNext}>
                    Next Section
                  </button>
                ) : (
                  <button onClick={generate} disabled={!isValid || isGenerating}
                    style={styles.btnGenerate(isValid && !isGenerating)}>
                    {isGenerating ? "Generating..." : "Generate Appeal Letter"}
                  </button>
                )}
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}
          </div>
        )}

        {isGenerating && (
          <div style={{ ...styles.card, padding: 48, textAlign: "center" }}>
            <div style={styles.spinner} />
            <p style={{ fontSize: 15, color: "#5A6577", fontWeight: 500 }}>Generating your appeal letter...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {generatedLetter && !showForm && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={styles.statBox("#EDFBF3", "#C6F0DC")}>
                <div style={styles.statLabel}>Generation Time</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1A7A4C" }}>{generationTime}s</div>
              </div>
              <div style={styles.statBox("#FEF2F1", "#F5D5D2")}>
                <div style={styles.statLabel}>Manual Process</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#C4392D" }}>45 min</div>
              </div>
              <div style={styles.statBox("#E6F5F3", "#B8E6DF")}>
                <div style={styles.statLabel}>Time Saved</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#0A8F7F" }}>
                  {(45 - (parseFloat(generationTime) / 60)).toFixed(0)} min
                </div>
              </div>
            </div>

            <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
              <div style={styles.letterHeader}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A7A4C", margin: 0 }}>Generated Appeal Letter</h3>
                <button onClick={copyToClipboard} style={{
                  padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 4,
                  border: "none", background: "#1A7A4C", color: "#fff", cursor: "pointer",
                }}>
                  {copied ? "Copied" : "Copy to Clipboard"}
                </button>
              </div>
              <div style={styles.letterBody}>{generatedLetter}</div>
            </div>

            <div style={styles.card}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0B1D3A", marginBottom: 16 }}>
                Before Sending: Review Checklist
              </h3>
              {[
                "Verify all claim details (dates, codes, amounts) are accurate",
                "Confirm denial reason code is correctly addressed in the letter",
                "Replace all placeholder fields ([PATIENT NAME], [MEMBER ID], etc.) with real data in your secure system",
                "Verify insurance company address is correct",
                "Confirm appeal deadline has not passed",
                "Attach all supporting documentation listed in the letter",
                "Save copy to patient billing file",
                "Set follow-up reminder for 30 days",
              ].map((item, i) => (
                <label key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10,
                  fontSize: 13, color: "#5A6577", cursor: "pointer",
                }}>
                  <input type="checkbox" style={{ marginTop: 3, accentColor: "#0A8F7F" }} />
                  <span>{item}</span>
                </label>
              ))}
            </div>

            <div style={styles.footer}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Built by Revive Revenue Services</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                Flora Sanders, CMRM + Lonnie Sanders III, CMRM
              </p>
              <p style={{ fontSize: 12, color: "#D4A843", marginTop: 10 }}>
                Demo version. De-identified data only. For HIPAA-covered production use, contact us about Tier 2 implementation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
