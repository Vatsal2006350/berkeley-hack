'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { processUnifyRecord, type UnifyPatientRecord } from '../lib/unify-pdf-generator';

// Sample Unify patient record for demonstration
const sampleUnifyRecord: UnifyPatientRecord = {
  patient_id: "UNI-2024-001",
  patient_name: "John Smith",
  date_of_birth: "1975-03-15",
  report_date: "2024-01-15",
  genetic_analysis_summary: `Comprehensive pharmacogenomic analysis reveals several clinically significant variants:

CYP2D6 Analysis:
- Genotype: *1/*4 (Intermediate Metabolizer)
- Clinical Impact: Reduced metabolism of codeine, tramadol, and metoprolol
- Recommendation: Consider dose adjustment for CYP2D6 substrates

EGFR Mutation Analysis:
- Exon 19 deletion detected (c.2235_2249del15)
- Clinical Significance: Predictive of response to EGFR tyrosine kinase inhibitors
- Recommendation: Patient may benefit from erlotinib or gefitinib therapy

BRCA1/BRCA2 Testing:
- No pathogenic variants detected
- Family history warrants continued surveillance`,

  image_analysis_summary: `Multimodal imaging analysis using BiomedCLIP reveals:

Chest CT Findings:
- 2.4cm spiculated nodule in right upper lobe
- No evidence of mediastinal lymphadenopathy
- Mild ground-glass opacities in bilateral lower lobes

Histopathology Analysis:
- Adenocarcinoma with lepidic pattern
- Tumor cells show strong TTF-1 positivity
- Ki-67 proliferation index: 15%
- Tumor invasion depth: T1c

PET-CT Integration:
- SUVmax of 4.2 in primary lesion
- No distant metastatic disease identified`,

  transcript_summary: `Tumor Board Discussion Summary:

Participants: Dr. Smith (Oncology), Dr. Johnson (Radiology), Dr. Brown (Pathology)

Key Discussion Points:
- 67-year-old male with newly diagnosed lung adenocarcinoma
- Stage IA3 (T1cN0M0) based on imaging and pathology
- Strong smoking history (40 pack-years, quit 5 years ago)
- Excellent performance status (ECOG 0)
- Patient preferences for minimally invasive treatment

Treatment Consensus:
- Primary surgical resection recommended
- Video-assisted thoracoscopic surgery (VATS) preferred approach
- Adjuvant chemotherapy not indicated for Stage IA disease
- Genetic counseling recommended given family history`,

  clinical_recommendations: `Evidence-Based Treatment Plan:

Primary Treatment:
1. VATS right upper lobectomy with mediastinal lymph node sampling
2. Perioperative optimization including pulmonary function testing
3. Anesthesia consultation for surgical planning

Pharmacogenomic Considerations:
1. Avoid standard-dose codeine due to CYP2D6 intermediate metabolism
2. Consider reduced initial dosing of metoprolol if beta-blockade needed
3. Standard morphine dosing acceptable for post-operative pain management

Follow-up Surveillance:
1. Chest CT every 6 months for first 2 years
2. Annual low-dose CT thereafter
3. Smoking cessation support and counseling
4. Genetic counseling for family screening

Biomarker Monitoring:
1. CEA level baseline and follow-up monitoring
2. Consider circulating tumor DNA testing if recurrence suspected`,

  critical_alerts: `⚠️ CRITICAL ALERTS:

1. CYP2D6 Intermediate Metabolizer - AVOID standard-dose codeine and tramadol
2. EGFR mutation detected - Patient eligible for targeted therapy if recurrence occurs
3. Strong family history of cancer - Genetic counseling strongly recommended
4. Active monitoring required due to smoking history and lung cancer diagnosis`
};

export default function UnifyIntegrationDemo() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [record, setRecord] = useState<UnifyPatientRecord>(sampleUnifyRecord);

  const handleProcessRecord = async () => {
    setIsProcessing(true);
    setResult(null); // Clear previous results
    
    try {
      console.log('Starting to process record:', record);
      
      // Call the API directly for better error handling
      const response = await fetch('/api/unify-pdf-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          record,
          record_id: 'demo-record-001'
        })
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API Success Response:', result);
      setResult(result);
      
    } catch (error) {
      console.error('Error processing record:', error);
      setResult({ 
        error: error instanceof Error ? error.message : 'Failed to process record',
        details: error instanceof Error ? [error.stack || error.message] : ['Unknown error occurred']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateRecordField = (field: keyof UnifyPatientRecord, value: string) => {
    setRecord(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎯 Unify PDF Summary Agent Demo</CardTitle>
          <CardDescription>
            Test the Unify AI Agent that generates structured clinical summaries for PDF export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Patient Record Input</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_id">Patient ID</Label>
                  <Input
                    id="patient_id"
                    value={record.patient_id}
                    onChange={(e) => updateRecordField('patient_id', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="patient_name">Patient Name</Label>
                  <Input
                    id="patient_name"
                    value={record.patient_name}
                    onChange={(e) => updateRecordField('patient_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={record.date_of_birth}
                    onChange={(e) => updateRecordField('date_of_birth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="report_date">Report Date</Label>
                  <Input
                    id="report_date"
                    type="date"
                    value={record.report_date}
                    onChange={(e) => updateRecordField('report_date', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="genetic_analysis">Genetic Analysis Summary</Label>
                <Textarea
                  id="genetic_analysis"
                  rows={4}
                  value={record.genetic_analysis_summary}
                  onChange={(e) => updateRecordField('genetic_analysis_summary', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="image_analysis">Image Analysis Summary</Label>
                <Textarea
                  id="image_analysis"
                  rows={4}
                  value={record.image_analysis_summary}
                  onChange={(e) => updateRecordField('image_analysis_summary', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="transcript_summary">Consultation Summary</Label>
                <Textarea
                  id="transcript_summary"
                  rows={4}
                  value={record.transcript_summary}
                  onChange={(e) => updateRecordField('transcript_summary', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="clinical_recommendations">Clinical Recommendations</Label>
                <Textarea
                  id="clinical_recommendations"
                  rows={4}
                  value={record.clinical_recommendations}
                  onChange={(e) => updateRecordField('clinical_recommendations', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="critical_alerts">Critical Alerts (Optional)</Label>
                <Textarea
                  id="critical_alerts"
                  rows={3}
                  value={record.critical_alerts || ''}
                  onChange={(e) => updateRecordField('critical_alerts', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleProcessRecord} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 'Generate PDF Summary'}
                </Button>
                
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/unify-pdf-summary');
                      const result = await response.json();
                      console.log('Health check result:', result);
                      alert(`API Health Check: ${result.status} - ${result.service}`);
                    } catch (error) {
                      console.error('Health check failed:', error);
                      alert('Health check failed - check console for details');
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Test API Health
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Generated Summary</h3>
              
              {result ? (
                <div className="space-y-4">
                  {result.error ? (
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="pt-6">
                        <p className="text-red-600">Error: {result.error}</p>
                        {result.details && (
                          <div className="mt-2">
                            <p className="text-sm text-red-500">Details:</p>
                            <ul className="list-disc list-inside text-sm text-red-500">
                              {result.details.map((detail: string, index: number) => (
                                <li key={index}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                          <p className="text-green-600">✅ {result.message}</p>
                          <div className="mt-2 text-xs">
                            <details className="cursor-pointer">
                              <summary className="text-gray-600">Debug: View API Response</summary>
                              <pre className="bg-gray-100 p-2 mt-2 rounded text-xs overflow-auto max-h-32">
                                {JSON.stringify(result, null, 2)}
                              </pre>
                            </details>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Debug Info */}
                      <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                          <p className="text-blue-700 text-sm">
                            🔍 Debug Info:
                            <br />• summary exists: {result.summary ? 'YES' : 'NO'}
                            <br />• patient_information exists: {result.summary?.patient_information ? 'YES' : 'NO'}
                            <br />• sections exists: {result.summary?.sections ? 'YES' : 'NO'}
                            <br />• sections length: {result.summary?.sections?.length || 'N/A'}
                            <br />• sections is array: {Array.isArray(result.summary?.sections) ? 'YES' : 'NO'}
                          </p>
                        </CardContent>
                      </Card>

                      {result.summary && result.summary.patient_information && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Patient Information</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><strong>Name:</strong> {result.summary.patient_information.Name}</div>
                              <div><strong>ID:</strong> {result.summary.patient_information["Patient ID"]}</div>
                              <div><strong>DOB:</strong> {result.summary.patient_information["Date of Birth"]}</div>
                              <div><strong>Report Date:</strong> {result.summary.patient_information["Report Date"]}</div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Force render sections */}
                      {result.summary?.sections && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700">Clinical Summary Sections ({result.summary.sections.length})</h4>
                          {result.summary.sections.map((section: any, index: number) => (
                            <Card key={index} className="border-l-4 border-l-blue-500">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">{section.title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-xs whitespace-pre-wrap leading-relaxed">{section.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Fallback if no sections */}
                      {!result.summary?.sections && (
                        <Card className="border-yellow-200 bg-yellow-50">
                          <CardContent className="pt-6">
                            <p className="text-yellow-700">
                              ⚠️ No sections found in API response
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <Card className="border-gray-200 bg-gray-50">
                  <CardContent className="pt-6">
                    <p className="text-gray-500">No results yet. Click "Generate PDF Summary" to process the record.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Endpoint:</h4>
              <code className="text-sm bg-gray-100 p-2 rounded block">POST /api/unify-pdf-summary</code>
            </div>
            
            <div>
              <h4 className="font-semibold">Request Format:</h4>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "record": {
    "patient_id": "string",
    "patient_name": "string", 
    "date_of_birth": "YYYY-MM-DD",
    "report_date": "YYYY-MM-DD",
    "genetic_analysis_summary": "string",
    "image_analysis_summary": "string", 
    "transcript_summary": "string",
    "clinical_recommendations": "string",
    "critical_alerts": "string | null"
  },
  "record_id": "string (optional)"
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold">Environment Variables:</h4>
              <code className="text-sm bg-gray-100 p-2 rounded block">UNIFY_API_KEY=your_unify_api_key_here</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 