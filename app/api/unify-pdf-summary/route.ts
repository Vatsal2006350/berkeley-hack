import { NextRequest, NextResponse } from 'next/server';

// Types for the Unify patient report record
interface UnifyPatientRecord {
  patient_id: string;
  patient_name: string;
  date_of_birth: string; // YYYY-MM-DD format
  report_date: string; // YYYY-MM-DD format
  genetic_analysis_summary: string;
  image_analysis_summary: string;
  transcript_summary: string;
  clinical_recommendations: string;
  critical_alerts?: string | null;
}

// Output schema for PDF generation
interface PDFSummaryOutput {
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

// Validation function to check required fields
function validatePatientRecord(record: any): string[] {
  const errors: string[] = [];
  const requiredFields = [
    'patient_id',
    'patient_name', 
    'date_of_birth',
    'report_date',
    'genetic_analysis_summary',
    'image_analysis_summary',
    'transcript_summary',
    'clinical_recommendations'
  ];

  requiredFields.forEach(field => {
    if (!record[field] || typeof record[field] !== 'string' || record[field].trim() === '') {
      errors.push(`Missing or empty required field: ${field}`);
    }
  });

  // Validate date formats
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (record.date_of_birth && !dateRegex.test(record.date_of_birth)) {
    errors.push('Invalid date_of_birth format. Expected YYYY-MM-DD');
  }
  if (record.report_date && !dateRegex.test(record.report_date)) {
    errors.push('Invalid report_date format. Expected YYYY-MM-DD');
  }

  return errors;
}

// Format content for patient-friendly language
function formatContentForPatients(content: string, sectionType: string): string {
  // Basic formatting to make content more accessible
  let formatted = content.trim();
  
  // Add section-specific formatting
  switch (sectionType) {
    case 'genetic':
      // Simplify genetic terminology
      formatted = formatted
        .replace(/\b(variant|mutation|polymorphism)\b/gi, 'genetic change')
        .replace(/\b(pathogenic|benign)\b/gi, (match) => 
          match.toLowerCase() === 'pathogenic' ? 'concerning' : 'normal'
        );
      break;
    case 'imaging':
      // Simplify medical imaging terms
      formatted = formatted
        .replace(/\b(lesion|mass)\b/gi, 'area of concern')
        .replace(/\b(enhancement|hyperintense|hypointense)\b/gi, 'abnormal signal');
      break;
  }
  
  return formatted;
}

// Generate structured summary for PDF
function generatePDFSummary(record: UnifyPatientRecord): PDFSummaryOutput {
  const sections: Array<{ title: string; content: string }> = [];

  // Add Imaging Analysis section
  if (record.image_analysis_summary) {
    sections.push({
      title: "Imaging Analysis Summary",
      content: formatContentForPatients(record.image_analysis_summary, 'imaging')
    });
  }

  // Add Genetic Analysis section
  if (record.genetic_analysis_summary) {
    sections.push({
      title: "Genetic Analysis Summary", 
      content: formatContentForPatients(record.genetic_analysis_summary, 'genetic')
    });
  }

  // Add Consultation Summary section
  if (record.transcript_summary) {
    sections.push({
      title: "Consultation Summary",
      content: formatContentForPatients(record.transcript_summary, 'consultation')
    });
  }

  // Add Clinical Recommendations section
  if (record.clinical_recommendations) {
    sections.push({
      title: "Clinical Recommendations",
      content: formatContentForPatients(record.clinical_recommendations, 'recommendations')
    });
  }

  // Add Critical Alerts section if present
  if (record.critical_alerts && record.critical_alerts.trim() !== '') {
    sections.push({
      title: "Critical Alerts",
      content: formatContentForPatients(record.critical_alerts, 'alerts')
    });
  }

  return {
    patient_information: {
      Name: record.patient_name,
      "Patient ID": record.patient_id,
      "Date of Birth": record.date_of_birth,
      "Report Date": record.report_date
    },
    sections
  };
}

// Optional function to update Unify record with PDF URL
async function updateUnifyRecord(recordId: string, pdfUrl: string): Promise<boolean> {
  try {
    const unifyApiKey = process.env.UNIFY_API_KEY;
    if (!unifyApiKey) {
      console.warn('UNIFY_API_KEY not configured. Skipping record update.');
      return false;
    }

    const response = await fetch(
      `https://api.unifygtm.com/data/v1/objects/patient_reports/records/${recordId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${unifyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attributes: {
            status: 'complete',
            pdf_url: pdfUrl
          }
        })
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to update Unify record:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `unify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('🔵 UNIFY PDF SUMMARY API - REQUEST RECEIVED:', {
    requestId,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    contentType: request.headers.get('content-type'),
    referer: request.headers.get('referer')
  });

  try {
    const body = await request.json();
    
    // Extract patient record from request
    const patientRecord = body.record || body;
    
    console.log('📋 UNIFY DATA PROCESSING:', {
      requestId,
      patient_id: patientRecord.patient_id,
      patient_name: patientRecord.patient_name,
      data_fields: Object.keys(patientRecord),
      total_content_length: JSON.stringify(patientRecord).length,
      timestamp: new Date().toISOString()
    });
    
    // Validate the patient record
    const validationErrors = validatePatientRecord(patientRecord);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // Generate structured PDF summary
    console.log('⚙️  UNIFY PDF GENERATION STARTED:', {
      requestId,
      timestamp: new Date().toISOString(),
      sections_to_generate: ['genetic_analysis', 'image_analysis', 'transcript', 'recommendations', 'alerts']
    });
    
    const pdfSummary = generatePDFSummary(patientRecord as UnifyPatientRecord);
    
    console.log('✅ UNIFY PDF SUMMARY GENERATED:', {
      requestId,
      sections_created: pdfSummary.sections.length,
      section_titles: pdfSummary.sections.map(s => s.title),
      patient_info: pdfSummary.patient_information,
      content_length: pdfSummary.sections.reduce((acc, s) => acc + s.content.length, 0),
      timestamp: new Date().toISOString()
    });
    
    // Optional: Generate actual PDF and get URL
    // This would integrate with your PDF generation service
    let pdfUrl: string | null = null;
    
    // For now, we'll return the structured data
    // In a real implementation, you would:
    // 1. Generate PDF from pdfSummary using your PDF service
    // 2. Upload to cloud storage and get public URL
    // 3. Update Unify record with the PDF URL
    
    const recordId = body.record_id;
    if (pdfUrl && recordId) {
      await updateUnifyRecord(recordId, pdfUrl);
    }

    const processingTime = Date.now() - startTime;
    
    console.log('🎯 UNIFY API REQUEST COMPLETED:', {
      requestId,
      processing_time_ms: processingTime,
      success: true,
      sections_returned: pdfSummary.sections.length,
      pdf_url_generated: !!pdfUrl,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      summary: pdfSummary,
      pdf_url: pdfUrl,
      request_id: requestId,
      processing_time_ms: processingTime,
      unify_platform: "Unify GTM PDF Summary Agent v1.0.0",
      api_version: "1.0.0",
      message: 'Clinical summary generated successfully using Unify platform'
    });

  } catch (error) {
    console.error('Error in Unify PDF Summary Agent:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Unify PDF Summary Agent',
    version: '1.0.0'
  });
} 