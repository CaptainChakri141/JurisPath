import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getDocuments,
  getDocument,
  askDocumentQuestion,
  compareDocuments,
  getNavigatorScenarios,
  getNavigatorGuidance,
  API_BASE
} from '../api';

describe('Frontend API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getDocuments calls /api/documents and returns list', async () => {
    const mockDocs = [{ id: 'sample_rental_1', filename: 'Rental.txt' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDocs,
    });

    const docs = await getDocuments();
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/api/documents`);
    expect(docs).toEqual(mockDocs);
  });

  it('getDocument throws error on failed response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    await expect(getDocument('invalid_id')).rejects.toThrow('Failed to fetch document details');
  });

  it('askDocumentQuestion sends POST with query payload', async () => {
    const mockAnswer = { answer: '2 months notice', evidences: [] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAnswer,
    });

    const resp = await askDocumentQuestion('doc_1', 'What is notice?');
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE}/api/documents/doc_1/ask`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ query: 'What is notice?' }),
      })
    );
    expect(resp).toEqual(mockAnswer);
  });

  it('compareDocuments sends POST with doc_a_id and doc_b_id', async () => {
    const mockComparison = { categories: [], overall_summary: 'Different' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockComparison,
    });

    const resp = await compareDocuments('doc_a', 'doc_b');
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE}/api/documents/compare`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ doc_a_id: 'doc_a', doc_b_id: 'doc_b' }),
      })
    );
    expect(resp).toEqual(mockComparison);
  });

  it('getNavigatorScenarios fetches scenarios list', async () => {
    const mockScenarios = [{ id: 'legal_notice', title: 'Received Notice' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockScenarios,
    });

    const scenarios = await getNavigatorScenarios();
    expect(scenarios).toEqual(mockScenarios);
  });

  it('getNavigatorGuidance passes jurisdiction parameters', async () => {
    const mockGuidance = { scenario_id: 'rental_issue', situation_summary: 'Summary' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGuidance,
    });

    const res = await getNavigatorGuidance(
      'rental_issue',
      { issue_type: 'Deposit' },
      'India',
      'Andhra Pradesh'
    );
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE}/api/navigator/guidance`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          scenario_id: 'rental_issue',
          jurisdiction_country: 'India',
          jurisdiction_state: 'Andhra Pradesh',
          answers: { issue_type: 'Deposit' },
        }),
      })
    );
    expect(res).toEqual(mockGuidance);
  });
});
