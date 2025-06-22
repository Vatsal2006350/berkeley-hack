import { generatePatientReport } from './pdf-generator';

// Types for Unify integration
export interface UnifyPatientRecord {
  patient_id: string;
  patient_name: string;
  date_of_birth: string;
  report_date: string;
  genetic_analysis_summary: string;
  image_analysis_summary: string;
  transcript_summary: string;
  clinical_recommendations: string;
  critical_alerts?: string | null;
}

export interface PDFSummaryData {
  patient_information: {
    Name: string;
    "Patient ID": string;
    "Date of Birth": string;
    "Report Date": string;
  };
  sections: Array<{
    title: string;
    content: string;
  }>;
}

// Convert patient data to PDF format
export function convertToPatientData(record: UnifyPatientRecord) {
  return {
    id: record.patient_id,
    name: record.patient_name,
    dob: record.date_of_birth,
    mrn: record.patient_id,
    caseId: record.patient_id,
    age: calculateAge(record.date_of_birth),
    sex: 'Unknown', // Add if available in your system
    diagnosis: 'Generated from Unify analysis', // Will be extracted from summaries
    tumor_stage: 0, // Will be extracted from analysis if available
    case_overview: {
      summary: record.clinical_recommendations,
      timeline: [
        {
          date: record.report_date,
          event: 'Unify analysis report generated'
        }
      ]
    },
    biomarkers: [], // Will be populated from analysis
    imaging: [], // Will be populated from imaging analysis
    reports: [
      {
        type: 'Genetic Analysis',
        date: record.report_date,
        summary: record.genetic_analysis_summary
      },
      {
        type: 'Imaging Analysis',
        date: record.report_date,
        summary: record.image_analysis_summary
      },
      {
        type: 'Consultation Summary',
        date: record.report_date,
        summary: record.transcript_summary
      }
    ]
  };
}

// Calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Generate comprehensive analysis from Unify record
export function generateAnalysisFromUnifyRecord(record: UnifyPatientRecord) {
  const analysis = {
    genetic: {
      summary: record.genetic_analysis_summary,
      variants: extractVariantsFromSummary(record.genetic_analysis_summary),
      recommendations: extractGeneticRecommendations(record.genetic_analysis_summary)
    },
    imaging: {
      summary: record.image_analysis_summary,
      findings: extractImagingFindings(record.image_analysis_summary)
    },
    consultation: {
      summary: record.transcript_summary,
      keyPoints: extractKeyPoints(record.transcript_summary)
    },
    clinical: {
      recommendations: record.clinical_recommendations,
      alerts: record.critical_alerts || null
    }
  };

  return analysis;
}

// Helper functions to extract structured data
function extractVariantsFromSummary(summary: string): string[] {
  // Basic extraction - in production, you'd use more sophisticated NLP
  const variants: string[] = [];
  const lines = summary.split('\n');
  
  lines.forEach(line => {
    if (line.toLowerCase().includes('variant') || line.toLowerCase().includes('mutation')) {
      variants.push(line.trim());
    }
  });
  
  return variants;
}

function extractGeneticRecommendations(summary: string): string[] {
  const recommendations: string[] = [];
  const lines = summary.split('\n');
  
  lines.forEach(line => {
    if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest')) {
      recommendations.push(line.trim());
    }
  });
  
  return recommendations;
}

function extractImagingFindings(summary: string): string[] {
  const findings: string[] = [];
  const lines = summary.split('\n');
  
  lines.forEach(line => {
    if (line.toLowerCase().includes('finding') || 
        line.toLowerCase().includes('abnormal') ||
        line.toLowerCase().includes('normal')) {
      findings.push(line.trim());
    }
  });
  
  return findings;
}

function extractKeyPoints(summary: string): string[] {
  const keyPoints: string[] = [];
  const lines = summary.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.length > 20 && 
        (trimmed.includes(':') || trimmed.endsWith('.') || trimmed.endsWith('!'))) {
      keyPoints.push(trimmed);
    }
  });
  
  return keyPoints.slice(0, 5); // Limit to top 5 key points
}

// Main function to generate PDF from Unify record
export async function generateUnifyPDF(record: UnifyPatientRecord): Promise<Buffer> {
  const patientData = convertToPatientData(record);
  const analysis = generateAnalysisFromUnifyRecord(record);
  
  // Convert to format expected by existing PDF generator
  const pdfData = {
    patient: patientData,
    reportDate: record.report_date,
    analysis: {
      summary: `Generated comprehensive report combining genetic analysis, imaging findings, and consultation notes for ${record.patient_name}.`,
      details: [
        {
          category: 'Genetic Analysis',
          content: record.genetic_analysis_summary
        },
        {
          category: 'Imaging Analysis', 
          content: record.image_analysis_summary
        },
        {
          category: 'Consultation Summary',
          content: record.transcript_summary
        },
        {
          category: 'Clinical Recommendations',
          content: record.clinical_recommendations
        }
      ]
    },
    geneticFindings: analysis.genetic.variants,
    imagingFindings: analysis.imaging.findings,
    recommendations: record.clinical_recommendations,
    criticalAlerts: record.critical_alerts
  };
  
  // Generate PDF using existing system
  generatePatientReport({
    patient: patientData,
    vcfAnalysis: undefined, // Will be populated from genetic analysis if needed
    biomarkers: undefined, // Will be populated from imaging/lab data if needed
    customNotes: `Unify Generated Report\n\n${JSON.stringify(pdfData.analysis, null, 2)}`
  });
  
  // Return empty buffer for now - in production, modify generatePatientReport to return Buffer
  return Buffer.from('PDF generation completed');
}

// Function to call the Unify PDF Summary API
export async function processUnifyRecord(record: UnifyPatientRecord, recordId?: string) {
  try {
    const response = await fetch('/api/unify-pdf-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        record,
        record_id: recordId
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error processing Unify record:', error);
    throw error;
  }
}

// Example usage function
export async function processPatientReport(unifyRecord: UnifyPatientRecord, generatePdfFile = false) {
  try {
    // Process through Unify PDF Summary Agent
    const summaryResult = await processUnifyRecord(unifyRecord);
    
    if (!summaryResult.success) {
      throw new Error('Failed to generate summary');
    }
    
    // Optionally generate actual PDF file
    let pdfBuffer: Buffer | null = null;
    if (generatePdfFile) {
      pdfBuffer = await generateUnifyPDF(unifyRecord);
    }
    
    return {
      summary: summaryResult.summary,
      pdfBuffer,
      structuredData: summaryResult.summary
    };
  } catch (error) {
    console.error('Error processing patient report:', error);
    throw error;
  }
} 