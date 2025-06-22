"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { Patient } from "@/lib/types"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { BotAvatar } from "@/components/ui/bot-avatar"
import { ActionCard } from "@/components/ui/action-card"
import { Eye, Dna, FileText, TestTube, Stethoscope, Users, Download } from "lucide-react"

interface Message {
  id: string
  sender: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: Array<{
    icon: any
    title: string
    description: string
    action: string
  }>
}

interface ChatInterfaceProps {
  patient: Patient
  onTabChange: (tab: string) => void
}

export function ChatInterface({ patient, onTabChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "assistant",
      content: `Hi! My name is Nila. Let's get started reviewing the case for ${patient.name}. How can I assist you today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Reset chat when patient changes
    setMessages([
      {
        id: Date.now().toString(),
        sender: "assistant",
        content: `Hi! My name is Nila. Let's get started reviewing the case for ${patient.name}. How can I assist you today?`,
        timestamp: new Date(),
      },
    ])
  }, [patient])

  const getAIResponse = (userInput: string): { content: string; actions?: Array<{icon: any, title: string, description: string, action: string}> } => {
    const input = userInput.toLowerCase()

    // Radiology and imaging keywords - switch to Images tab
    if (
      input.includes("radiological") ||
      input.includes("radiology") ||
      input.includes("imaging") ||
      input.includes("image") ||
      input.includes("scan") ||
      input.includes("mri") ||
      input.includes("ct")
    ) {
      setTimeout(() => onTabChange("IMAGES"), 1500)

      if (patient.name === "Jane Doe") {
        return { content: "Switching to Images tab... I can see a suspicious 2.5 cm irregular mass in the right temporal lobe. The lesion shows irregular margins and heterogeneous enhancement pattern on T1-weighted post-contrast sequences, highly concerning for malignancy. Recommend immediate neurosurgical consultation." }
      } else {
        return { content: "Switching to Images tab... Analysis reveals a 1.8 cm spiculated nodule in the left lung lower lobe with irregular margins and associated pleural retraction. The lesion demonstrates ground-glass opacity components suspicious for adenocarcinoma. Recommend tissue confirmation." }
      }
    }

    // Biomarker keywords - switch to Biomarkers tab
    if (
      input.includes("biomarker") ||
      input.includes("molecular") ||
      input.includes("genetic") ||
      input.includes("mutation") ||
      input.includes("gene")
    ) {
      setTimeout(() => onTabChange("BIOMARKERS"), 1500)

      if (patient.name === "Jane Doe") {
        return { content: "Switching to Biomarkers tab... OmniScreen analysis identifies TP53 alterations (PPV: 0.63) and EGFR amplification (PPV: 0.36). These findings suggest potential responsiveness to targeted therapies including ceritinib, neratinib, and lapatinib. Molecular confirmation recommended for treatment planning." }
      } else {
        return { content: "Switching to Biomarkers tab... H&E-based analysis shows TP53 mutations (PPV: 0.63), EGFR alterations (PPV: 0.36), and RTK pathway involvement (PPV: 0.56). High likelihood of actionable mutations detected. Recommend comprehensive genomic profiling for precision therapy selection." }
      }
    }

    // Treatment and therapy keywords
    if (input.includes("treatment") || input.includes("therapy") || input.includes("recommend")) {
      if (patient.name === "Jane Doe") {
        return { content: "Based on imaging characteristics and biomarker profile, I recommend: 1) Core needle biopsy for definitive diagnosis, 2) Neoadjuvant chemotherapy with anti-HER2 therapy if HER2+, 3) Surgical consultation for breast-conserving surgery vs. mastectomy. Estimated treatment timeline: 6-8 months. Oncology referral initiated." }
      } else {
        return { content: "Treatment recommendations based on molecular profile: 1) EGFR-targeted therapy (osimertinib first-line), 2) Combination immunotherapy for PD-L1+ tumors, 3) Surgical evaluation if resectable. Expected response rate: 70-80% with targeted therapy. Thoracic oncology consultation scheduled." }
      }
    }

    // Report generation - more realistic response
    if (input.includes("report") || input.includes("generate") || input.includes("document")) {
      const timestamp = new Date().toLocaleString()
      const reportId = Math.random().toString(36).substr(2, 9).toUpperCase()

      return { content: `Generating comprehensive pathology report... 

📄 Report ID: ${reportId}
📧 PDF sent to: pathology@hospital.org, oncology@hospital.org
📋 Report includes: Clinical history, imaging findings, biomarker analysis, treatment recommendations
⏰ Generated: ${timestamp}
🔒 HIPAA-compliant delivery confirmed

The report has been automatically added to the patient's EMR and distributed to the multidisciplinary team.` }
    }

    // Unify PDF Summary generation
    if (input.includes("unify") || input.includes("pdf summary") || input.includes("clinical summary")) {
      return { 
        content: `🎯 Generating Unify PDF Summary for ${patient.name}...

📋 Processing multimodal patient data:
• Genetic analysis and biomarker data
• Medical imaging and histopathology findings  
• Clinical notes and consultation summaries
• Treatment recommendations and alerts

⚙️ Creating patient-friendly summary document...
📄 Formatting for PDF export...
🔗 Integrating with Unify GTM platform...

Summary will be ready for download in patient dashboard.`,
        actions: [
          {
            icon: Download,
            title: "Generate Unify PDF Summary",
            description: "Create comprehensive clinical summary for patient",
            action: "generate-unify-summary"
          }
        ]
      }
    }

    // Ordering tests/stains - realistic workflow
    if (input.includes("order") || input.includes("request")) {
      const orderTime = new Date().toLocaleTimeString()

      if (input.includes("her2") || input.includes("HER2")) {
        return { content: `🧪 HER2 IHC/FISH Order Placed
Order #: HER2-${Math.random().toString(36).substr(2, 6).toUpperCase()}
⏰ Ordered: ${orderTime}
🏥 Lab: Molecular Pathology Lab
📅 Expected results: 24-48 hours
📧 Results will auto-populate in Biomarkers tab
👨‍⚕️ Ordering physician: Dr. [Current User]

The lab has been notified and tissue blocks are being retrieved for processing.` }
      } else if (input.includes("stain") || input.includes("order")) {
        return { content: `🧪 IHC Panel Order Placed
Order #: IHC-${Math.random().toString(36).substr(2, 6).toUpperCase()}
🔬 Stains: ER, PR, Ki-67, p53
⏰ Ordered: ${orderTime}
📅 Expected completion: 18-24 hours
💰 Insurance pre-authorization: Approved
📧 Results notification: Enabled

Tissue sections are being prepared for immunohistochemical analysis.` }
      } else {
        return { content: `📋 Test Order Menu Available:
• Immunohistochemistry (ER/PR/HER2/Ki-67)
• Molecular sequencing (NGS panel)
• Additional imaging (PET/CT, Brain MRI)
• Tumor markers (CA 15-3, CEA)

Which specific tests would you like me to order? I can process the requests immediately.` }
      }
    }

    // Prognosis keywords
    if (input.includes("prognosis") || input.includes("outcome") || input.includes("survival")) {
      if (patient.name === "Jane Doe") {
        return { content: `📊 Prognostic Analysis for ${patient.name}:

Current staging: Likely T2N0M0 (pending full workup)
5-year survival estimates:
• HR+/HER2-: 92-95%
• HER2+: 87-91% 
• Triple-negative: 77-83%

Risk factors: Age (63), tumor size (2.5cm)
Favorable factors: No lymphadenopathy, early detection

🎯 Personalized risk score will be calculated once molecular subtyping is complete.` }
      } else {
        return { content: `📊 Prognostic Analysis for ${patient.name}:

Suspected stage: T1cN0M0 (pending staging)
5-year survival with targeted therapy:
• EGFR+: 65-75%
• ALK+: 70-80%
• Wild-type: 45-55%

🧬 Molecular profile suggests favorable response to precision therapy. Median PFS with osimertinib: 18.9 months.` }
      }
    }

    // Staging keywords - switch to Case Overview
    if (input.includes("stage") || input.includes("staging")) {
      setTimeout(() => onTabChange("CASE OVERVIEW"), 1500)

      if (patient.name === "Jane Doe") {
        return { content: "Switching to Case Overview... Current staging assessment: T2 (tumor >2cm), N0 (no palpable nodes), M0 (no distant mets visible). Recommend: sentinel lymph node biopsy, chest CT, bone scan if symptomatic. Staging will guide surgical approach and adjuvant therapy decisions." }
      } else {
        return { content: "Switching to Case Overview... Preliminary staging: T1c (1.8cm nodule), N0 (no mediastinal adenopathy), M0 (no distant disease). Recommend: PET/CT for mediastinal assessment, brain MRI given adenocarcinoma histology. Stage will determine surgical vs. systemic therapy approach." }
      }
    }

    // Multidisciplinary team/tumor board
    if (input.includes("tumor board") || input.includes("mdt") || input.includes("multidisciplinary")) {
      const boardDate = new Date()
      boardDate.setDate(boardDate.getDate() + 3)

      return { content: `📅 Tumor Board Presentation Scheduled

Patient: ${patient.name}
Date: ${boardDate.toLocaleDateString()} at 7:00 AM
Location: Conference Room A / Virtual Link
Attendees: Medical Oncology, Radiation Oncology, Surgery, Pathology, Radiology

 Case summary prepared and distributed
 Images uploaded to presentation system
 Biomarker data compiled
 Treatment options analysis ready

The case has been added to Thursday's multidisciplinary tumor board agenda.` }
    }

    // Patient history - switch to Patient History tab
    if (input.includes("history") || input.includes("background") || input.includes("past medical")) {
      setTimeout(() => onTabChange("PATIENT HISTORY"), 1500)

      return { content: `Switching to Patient History tab... Reviewing comprehensive medical background for ${patient.name}. Key factors include family history of cancer, current medications, and relevant comorbidities that may impact treatment planning. This information is crucial for personalized care decisions.` }
    }

    // Resources and guidelines
    if (input.includes("guideline") || input.includes("resource") || input.includes("protocol")) {
      setTimeout(() => onTabChange("RESOURCES"), 1500)

      return { content: `Switching to Resources tab... Accessing current NCCN guidelines and clinical protocols relevant to ${patient.name}'s case. I've compiled the latest evidence-based recommendations, ongoing clinical trials, and patient education materials for your review.` }
    }

    // General help or unclear input
    if (input.includes("help") || input.includes("what can you do")) {
      return { content: `🤖 Nila Genomics Capabilities:

 **Analysis & Interpretation**
• Radiological findings review → "show me the images"
• Biomarker analysis → "explain the mutations"
• Staging assessment → "what's the stage"

 **Clinical Workflow**
• Order tests → "order HER2 stain"
• Generate reports → "create pathology report"
• Treatment planning → "recommend therapy"

**Collaboration**
• Tumor board prep → "prepare for MDT"
• Case summaries → "summarize findings"
• Resource access → "show guidelines"

What would you like me to help you with today?` }
    }

    // Default response for unrecognized input with action cards
    return {
      content: `Hello! I've analyzed the case for **${patient.name}**. I can assist you with several key areas of this case. Please choose what you'd like to explore:`,
      actions: [
        {
          icon: Eye,
          title: "Show radiological findings",
          description: "Review imaging with AI analysis and annotations",
          action: "Show radiological findings"
        },
        {
          icon: Dna,
          title: "Explain biomarkers",
          description: "Molecular profile interpretation and clinical significance",
          action: "Explain biomarkers"
        },
        {
          icon: Stethoscope,
          title: "Treatment recommendations",
          description: "Evidence-based therapy options and protocols",
          action: "Treatment recommendations"
        },
        {
          icon: FileText,
          title: "Generate report",
          description: "Comprehensive pathology documentation",
          action: "Generate report"
        },
        {
          icon: TestTube,
          title: "Order additional tests",
          description: "Lab and imaging requests with protocols",
          action: "Order additional tests"
        },
        {
          icon: Users,
          title: "Prepare for tumor board",
          description: "MDT presentation and case summary",
          action: "Prepare for tumor board"
        },
        {
          icon: Download,
          title: "Generate Unify PDF Summary",
          description: "Create comprehensive clinical summary for patient",
          action: "Generate Unify PDF Summary"
        }
      ]
    }
  }

  const handleActionClick = async (action: string) => {
    if (action === "Generate Unify PDF Summary") {
      await handleUnifyPDFGeneration()
      return
    }
    
    setInput(action)
    // Auto-send the message after a short delay to show the input was filled
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const handleUnifyPDFGeneration = async () => {
    if (isGenerating) return
    
    setIsGenerating(true)
    
    const processingMessage: Message = {
      id: Date.now().toString(),
      sender: "assistant",
      content: `🎯 Generating Unify PDF Summary for ${patient.name}...

📋 Processing multimodal patient data:
• Genetic analysis and biomarker data
• Medical imaging and histopathology findings  
• Clinical notes and consultation summaries
• Treatment recommendations and alerts

⚙️ Creating patient-friendly summary document...
📄 Formatting for PDF export...`,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, processingMessage])

    try {
      // Create a comprehensive Unify record with all required fields
      const today = new Date().toISOString().split('T')[0]
      
      // Convert patient DOB from readable format to YYYY-MM-DD format
      let patientDOB = "1960-01-01" // Default fallback
      if (patient.dob) {
        try {
          const dobDate = new Date(patient.dob)
          if (!isNaN(dobDate.getTime())) {
            patientDOB = dobDate.toISOString().split('T')[0]
          }
        } catch (error) {
          console.warn('Invalid date format for patient DOB:', patient.dob)
        }
      }
      
      const unifyRecord = {
        patient_id: patient.id || `PAT-${Date.now()}`,
        patient_name: patient.name || "Unknown Patient",
        date_of_birth: patientDOB,
        report_date: today,
        genetic_analysis_summary: `🧬 Comprehensive Genetic Analysis for ${patient.name || 'Patient'}

**Molecular Profile Summary:**
${patient.biomarkers?.map(b => `• ${b.name}: ${b.result} (${b.status})`).join('\n') || '• Complete genomic profiling performed using next-generation sequencing\n• Targeted cancer gene panel analysis completed\n• Pharmacogenomic variants assessed for drug metabolism'}

**Key Clinical Findings:**
• EGFR mutation status: L858R variant detected (actionable)
• KRAS/NRAS status: Wild-type (favorable for targeted therapy)
• TP53 mutation: Detected (impacts prognosis and treatment selection)
• HER2 amplification: Not detected (standard of care applies)

**Pharmacogenomic Profile:**
• CYP2D6 genotype: Normal metabolizer (*1/*1)
• DPYD deficiency: No pathogenic variants detected
• UGT1A1 polymorphism: *1/*28 genotype (dose adjustment may be needed)
• TPMT activity: Normal function predicted

**Clinical Implications:**
• Patient is eligible for EGFR-targeted therapy (osimertinib recommended)
• Standard chemotherapy dosing appropriate based on metabolizer status
• Genetic counseling recommended for family members
• Clinical trial opportunities available for combination therapies`,

        image_analysis_summary: `📱 Advanced Medical Imaging Analysis

**Imaging Studies Completed:**
${patient.imaging?.map(img => `• ${img.type} (${img.date}): ${img.description}`).join('\n') || '• CT Chest/Abdomen/Pelvis with contrast enhancement\n• MRI Brain with gadolinium (metastatic screening)\n• PET-CT whole body scan for comprehensive staging\n• Echocardiogram for baseline cardiac assessment'}

**AI-Enhanced Image Analysis:**
• Automated tumor detection and segmentation algorithms applied
• 3D volumetric analysis performed for treatment planning
• Radiomics feature extraction completed for prognosis prediction
• Multi-parametric imaging assessment for response monitoring

**Key Imaging Findings:**
• Primary tumor: 3.2 cm spiculated mass in right upper lobe
• Regional lymph nodes: Enlarged right hilar node (1.8 cm, concerning)
• Distant metastases: No evidence of metastatic disease detected
• Cardiac function: Normal ejection fraction (65%), no contraindications

**Quantitative Analysis:**
• Tumor volume: 8.7 cm³ (baseline measurement established)
• SUV max on PET: 12.4 (high metabolic activity consistent with malignancy)
• Apparent diffusion coefficient: Restricted pattern suggesting high cellularity
• Response assessment: RECIST 1.1 criteria established for monitoring`,

        transcript_summary: `👨‍⚕️ Multidisciplinary Clinical Consultation Summary

**Healthcare Team Present:**
• Dr. Smith (Medical Oncology) - Primary attending physician
• Dr. Johnson (Radiation Oncology) - Treatment planning consultation
• Dr. Williams (Thoracic Surgery) - Surgical evaluation and recommendations
• Dr. Brown (Pathology) - Tissue diagnosis and molecular profiling review

**Patient Demographics & Presentation:**
• Age: ${patient.age || 65} years, Gender: ${patient.sex || 'Female'}
• Primary diagnosis: ${patient.diagnosis || 'Non-small cell lung cancer, adenocarcinoma'}
• Staging: ${patient.tumor_stage ? `T${patient.tumor_stage}N1M0` : 'T2N1M0'} (Stage IIB)
• Performance status: ECOG 1 (ambulatory, capable of light work)

**Clinical Discussion Highlights:**
• Comprehensive review of diagnostic imaging and pathology results
• Molecular profiling results discussed in context of treatment options
• Surgical resection deemed feasible with acceptable operative risk
• Multimodal treatment approach recommended for optimal outcomes

**Shared Decision Making Process:**
• All treatment options thoroughly explained to patient and family
• Risks, benefits, and alternatives carefully reviewed and documented
• Patient expressed strong preference for curative intent treatment
• Psychosocial support resources provided for coping and adjustment`,

        clinical_recommendations: `🎯 Evidence-Based Clinical Treatment Plan

**Primary Treatment Strategy:**
• Neoadjuvant therapy: 3 cycles of carboplatin + pemetrexed + pembrolizumab
• Surgical intervention: Right upper lobectomy with mediastinal lymph node dissection
• Adjuvant immunotherapy: Continue pembrolizumab for total duration of 1 year
• Expected overall response rate: 70-80% based on molecular profile and staging

**Comprehensive Supportive Care:**
• Antiemetic prophylaxis: Ondansetron + dexamethasone for chemotherapy
• Nutritional optimization: Dietitian consultation for treatment preparation
• Pulmonary rehabilitation: Pre-operative conditioning to improve outcomes
• Psychological support: Counseling services for treatment-related anxiety

**Monitoring and Surveillance Protocol:**
• Imaging assessment: CT chest every 6 weeks during neoadjuvant phase
• Laboratory monitoring: CBC, CMP, LFTs weekly during active treatment
• Immunotherapy toxicity surveillance: TSH, inflammatory markers every 6 weeks
• Quality of life assessments: Patient-reported outcomes at each visit

**Long-term Survivorship Planning:**
• Post-treatment surveillance: Annual imaging for 5 years minimum
• Late effects monitoring: Cardiac, pulmonary, and secondary cancer screening
• Genetic counseling: Family member screening recommendations provided
• Research participation: Clinical trial opportunities for maintenance therapy`,

        critical_alerts: `⚠️ CRITICAL SAFETY ALERTS AND MONITORING REQUIREMENTS

🚨 **Immediate Safety Priorities:**
• Pre-treatment cardiac evaluation completed (ECHO: EF 65%, no contraindications)
• Pulmonary function testing required prior to surgical intervention
• Fertility preservation counseling completed (patient elected to proceed without intervention)
• Emergency contact information verified and updated in medical record

⚠️ **Treatment-Related Monitoring:**
• Immune-related adverse events: Patient education completed, monitoring protocol active
• Pneumonitis risk assessment: Baseline chest imaging obtained, patient counseled on symptoms
• Thyroid dysfunction surveillance: Baseline TSH obtained, monitoring every 6 weeks
• Hepatotoxicity monitoring: Baseline liver function tests, weekly monitoring during treatment

🏥 **Emergency Management Protocols:**
• 24/7 oncology emergency hotline: (555) 123-ONCO (patient card provided)
• Neutropenic fever action plan: Reviewed with patient and family, wallet card given
• Severe infusion reaction management: Protocols in place, emergency medications available
• Hospital admission criteria: Clearly defined thresholds communicated to patient

📱 **Patient Safety Resources:**
• Patient portal access activated: Real-time communication with care team
• Mobile symptom tracking app: Installed and configured for daily monitoring
• Caregiver education: Family member trained in emergency symptom recognition
• Pharmacy consultation: Drug interaction screening completed, patient counseled`
      }

      // Log the Unify API call for tracking/verification
      console.log('🔵 UNIFY API CALL INITIATED:', {
        timestamp: new Date().toISOString(),
        endpoint: '/api/unify-pdf-summary',
        method: 'POST',
        patient_id: unifyRecord.patient_id,
        patient_name: unifyRecord.patient_name,
        record_id: `record-${Date.now()}`,
        data_size: JSON.stringify(unifyRecord).length
      })

      const response = await fetch('/api/unify-pdf-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          record: unifyRecord,
          record_id: `record-${Date.now()}`
        })
      })

      // Log the response for verification
      console.log('🟢 UNIFY API RESPONSE:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString()
      })

      if (response.ok) {
        const result = await response.json()
        
        // Generate actual PDF from the summary data using jsPDF directly
        const jsPDF = (await import('jspdf')).default
        const doc = new jsPDF()
        
        // Add Unify branding header
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text('Generated by Unify GTM PDF Summary Agent v1.0.0', 20, 15)
        doc.text(`Request ID: ${result.request_id || 'N/A'} | Processing Time: ${result.processing_time_ms || 0}ms`, 20, 20)
        
        // Create a comprehensive PDF from the summary data
        doc.setFontSize(20)
        doc.setTextColor(40, 40, 40)
        doc.text('UNIFY CLINICAL SUMMARY REPORT', 20, 35)
        
        // Patient Information Header
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(40, 40, 40)
        doc.text('Patient Information', 20, 55)
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        let yPos = 65
        const patientInfo = [
          `Name: ${result.summary?.patient_information?.Name || patient.name}`,
          `Patient ID: ${result.summary?.patient_information?.['Patient ID'] || patient.id}`,
          `Date of Birth: ${result.summary?.patient_information?.['Date of Birth'] || patient.dob}`,
          `Report Date: ${result.summary?.patient_information?.['Report Date'] || new Date().toLocaleDateString()}`,
          `Generated: ${new Date().toLocaleString()}`
        ]
        
        patientInfo.forEach(info => {
          doc.text(info, 20, yPos)
          yPos += 8
        })
        
        // Add each section from the summary
        result.summary?.sections?.forEach((section: any, index: number) => {
          if (yPos > 200) {
            doc.addPage()
            yPos = 30
          }
          
          yPos += 15
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(14)
          doc.text(`${index + 1}. ${section.title}`, 20, yPos)
          
          yPos += 10
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          
          // Split long text into multiple lines
          const lines = doc.splitTextToSize(section.content, 170)
          lines.forEach((line: string) => {
            if (yPos > 270) {
              doc.addPage()
              yPos = 30
            }
            doc.text(line, 20, yPos)
            yPos += 6
          })
        })
        
        // Add footer with Unify branding on last page
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFontSize(8)
          doc.setTextColor(150, 150, 150)
          doc.text('Powered by Unify GTM Platform - Advanced Clinical Content Processing', 20, 285)
          doc.text(`Page ${i} of ${pageCount} | Generated: ${new Date().toLocaleString()}`, 20, 290)
        }
        
        // Generate PDF blob and download
        const pdfBlob = doc.output('blob')
        const pdfUrl = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = `${patient.name || 'Patient'}_Clinical_Summary_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(pdfUrl)
        
        // Store API call for monitoring dashboard
        const apiCallRecord = {
          id: `call-${Date.now()}`,
          timestamp: new Date().toISOString(),
          endpoint: '/api/unify-pdf-summary',
          method: 'POST',
          status: 200,
          patient_name: patient.name,
          processing_time_ms: result.processing_time_ms || 0,
          request_id: result.request_id || 'unknown'
        }
        
        const storedCalls = localStorage.getItem('unify-api-calls')
        const calls = storedCalls ? JSON.parse(storedCalls) : []
        calls.push(apiCallRecord)
        localStorage.setItem('unify-api-calls', JSON.stringify(calls))

        // Create detailed success message with PDF content preview
        const successMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          content: `✅ **UNIFY GTM PDF SUMMARY GENERATED SUCCESSFULLY**

🏢 **Platform:** ${result.unify_platform || 'Unify GTM PDF Summary Agent v1.0.0'}
🆔 **Request ID:** \`${result.request_id || 'N/A'}\`
⚡ **Processing Time:** ${result.processing_time_ms || 0}ms

📄 **${result.summary?.patient_information?.Name || patient.name} - Clinical Summary Report**
📅 Report Date: ${result.summary?.patient_information?.['Report Date'] || new Date().toLocaleDateString()}
🆔 Patient ID: ${result.summary?.patient_information?.['Patient ID'] || patient.id}

📋 **Generated Sections** (${result.summary?.sections?.length || 0} total):

${result.summary?.sections?.map((section: any, index: number) => 
  `**${index + 1}. ${section.title}**\n${section.content.substring(0, 150)}${section.content.length > 150 ? '...' : ''}\n`
).join('\n') || '• Comprehensive clinical data processed'}

📥 **PDF Download:**
• File automatically downloaded: \`${patient.name || 'Patient'}_Clinical_Summary_${new Date().toISOString().split('T')[0]}.pdf\`
• Format: Professional clinical report (optimized for printing)
• Generated using Unify GTM content processing

🔗 **Unify Platform Integration:**
• ✅ Multi-modal data integration completed
• ✅ Patient-friendly language formatting applied  
• ✅ Clinical terminology simplification active
• ✅ Structured PDF generation successful
• ✅ API validation and processing completed

📊 **Monitoring:** View detailed API analytics at \`/unify-monitoring\`

💡 **Powered by Unify GTM Platform** - Advanced clinical content processing and PDF generation`,
          timestamp: new Date(),
        }
        
        setMessages(prev => [...prev, successMessage])
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details ? `Validation errors: ${errorData.details.join(', ')}` : 'Failed to generate summary')
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: "assistant", 
        content: `❌ Error generating Unify PDF Summary:

${error instanceof Error ? error.message : 'Unknown error occurred'}

Please try again or contact support if the issue persists.`,
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendMessage = () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        content: input,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, userMessage])
      setInput("")

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = getAIResponse(input)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          content: aiResponse.content,
          timestamp: new Date(),
          actions: aiResponse.actions,
        }
        setMessages(prev => [...prev, assistantMessage])
      }, 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a1e]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <BotAvatar />
          <div>
            <h3 className="text-sm font-medium text-white/90">Nila AI Assistant</h3>
            <p className="text-xs text-white/50">Powered by Omnyla</p>
          </div>
        </div>
        <Button
          onClick={handleUnifyPDFGeneration}
          variant="outline"
          size="sm"
          className="bg-[#4a6bff] hover:bg-[#3a5bef] text-white border-[#4a6bff] hover:border-[#3a5bef] flex items-center space-x-2"
          disabled={isGenerating}
        >
          <Download className="w-4 h-4" />
          <span>{isGenerating ? "Generating..." : "PDF Summary"}</span>
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-[#4a6bff] text-white"
                    : "bg-[#1a1a2e] text-white/90 border border-white/10"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.actions && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action, index) => (
                      <ActionCard
                        key={index}
                        icon={action.icon}
                        title={action.title}
                        description={action.description}
                        action={action.action}
                        onClick={() => handleActionClick(action.action)}
                      />
                    ))}
                  </div>
                )}
                
                <p className="text-xs opacity-50 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about the patient case, imaging, biomarkers, or treatment options..."
            className="flex-1 bg-[#1a1a2e] border-white/20 text-white placeholder:text-white/50 resize-none"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="bg-[#4a6bff] hover:bg-[#4a6bff]/80 text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
