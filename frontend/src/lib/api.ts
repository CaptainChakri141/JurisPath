export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface Evidence {
  doc_name: string;
  page_number: number;
  section_number: string;
  section_title: string;
  text: string;
  similarity_score?: number;
}

export interface Clause {
  id: string;
  section_number: string;
  title: string;
  text: string;
  page_number: number;
  category: string;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  file_type: string;
  upload_date: string;
  page_count: number;
  doc_type: string;
  parties: string[];
  jurisdiction: string;
  important_dates: string[];
  monetary_values: string[];
}

export interface DocumentSummary {
  overview: string;
  doc_type: string;
  parties: string[];
  important_obligations: string[];
  deadlines: string[];
  payments: string[];
  clauses_requiring_attention: string[];
  rights_summary: string[];
  penalties_summary: string[];
  termination_summary: string;
  dispute_resolution: string;
}

export interface DocumentDetail {
  metadata: DocumentMetadata;
  summary: DocumentSummary;
  clauses: Clause[];
  full_text: string;
  pages: string[];
}

export interface SimpleLanguageClause {
  section_number: string;
  title: string;
  original_text: string;
  plain_language: string;
  practical_meaning: string;
  things_to_check: string[];
  page_number: number;
}

export interface DeadlineItem {
  id: string;
  title: string;
  date_str: string;
  days_remaining: number | null;
  category: string;
  urgency: string;
  source_page: number;
  source_section: string;
  source_text: string;
}

export interface AskResponse {
  answer: string;
  evidences: Evidence[];
  grounding_status: string;
  confidence_score: number;
  disclaimer: string;
}

export interface ComparisonCategory {
  category: string;
  doc_a_value: string;
  doc_b_value: string;
  difference_explanation: string;
  impact_analysis: string;
}

export interface ComparisonResponse {
  doc_a_id: string;
  doc_a_title: string;
  doc_b_id: string;
  doc_b_title: string;
  categories: ComparisonCategory[];
  overall_summary: string;
  disclaimer: string;
}

export interface LegalSourceCitation {
  source_name: string;
  title: string;
  section: string;
  official_url: string;
  relevance: string;
}

export interface NavigatorGuidanceResponse {
  scenario_id: string;
  scenario_title: string;
  jurisdiction: string;
  situation_summary: string;
  relevant_statutes: LegalSourceCitation[];
  documents_to_gather: string[];
  important_dates_checklist: string[];
  possible_next_steps: string[];
  when_professional_help_needed: string[];
  disclaimer: string;
}

export interface NavigatorScenario {
  id: string;
  title: string;
  icon: string;
  badge: string;
  description: string;
  questions: Array<{
    id: string;
    label: string;
    type: string;
    options: string[];
  }>;
}

// API Functions
export async function getDocuments(): Promise<DocumentMetadata[]> {
  const res = await fetch(`${API_BASE}/api/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function getDocument(id: string): Promise<DocumentDetail> {
  const res = await fetch(`${API_BASE}/api/documents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch document details');
  return res.json();
}

export async function uploadDocumentFile(file: File): Promise<DocumentDetail> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return res.json();
}

export async function askDocumentQuestion(docId: string, query: string): Promise<AskResponse> {
  const res = await fetch(`${API_BASE}/api/documents/${docId}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Failed to ask question');
  return res.json();
}

export async function getSimpleLanguageClauses(docId: string): Promise<SimpleLanguageClause[]> {
  const res = await fetch(`${API_BASE}/api/documents/${docId}/simple-language`);
  if (!res.ok) throw new Error('Failed to fetch simple language breakdown');
  return res.json();
}

export async function getDeadlines(docId: string): Promise<DeadlineItem[]> {
  const res = await fetch(`${API_BASE}/api/documents/${docId}/deadlines`);
  if (!res.ok) throw new Error('Failed to fetch deadlines');
  return res.json();
}

export async function compareDocuments(docAId: string, docBId: string): Promise<ComparisonResponse> {
  const res = await fetch(`${API_BASE}/api/documents/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_a_id: docAId, doc_b_id: docBId }),
  });
  if (!res.ok) throw new Error('Failed to compare documents');
  return res.json();
}

export interface DemoDocument {
  id: string;
  filename: string;
  doc_type: string;
  parties: string[];
  jurisdiction: string;
  page_count: number;
}

export async function getNavigatorScenarios(): Promise<NavigatorScenario[]> {
  const res = await fetch(`${API_BASE}/api/navigator/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
}

export async function getNavigatorGuidance(
  scenarioId: string,
  answers: Record<string, string | number | boolean>,
  country: string = 'India',
  state: string = 'Andhra Pradesh'
): Promise<NavigatorGuidanceResponse> {
  const res = await fetch(`${API_BASE}/api/navigator/guidance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario_id: scenarioId,
      jurisdiction_country: country,
      jurisdiction_state: state,
      answers,
    }),
  });
  if (!res.ok) throw new Error('Failed to generate guidance');
  return res.json();
}

export async function setGeminiApiKey(apiKey: string): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/settings/gemini-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to configure Gemini API key');
  return res.json();
}

export async function getDemoDocuments(): Promise<DemoDocument[]> {
  const res = await fetch(`${API_BASE}/api/demo-documents`);
  if (!res.ok) throw new Error('Failed to fetch demo documents');
  return res.json();
}
