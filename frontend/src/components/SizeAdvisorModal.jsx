import React, { useState } from 'react';
import { recommendationService } from '../services/recommendationService';
import { X, Sparkles, Check } from 'lucide-react';

export const SizeAdvisorModal = ({ isOpen, onClose, targetProduct, onApplySize }) => {
  const [referenceBrand, setReferenceBrand] = useState('Nike');
  const [referenceSize, setReferenceSize] = useState('10.0');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen || !targetProduct) return null;

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await recommendationService.getSizeRecommendation(
        targetProduct.id,
        referenceBrand,
        referenceSize
      );
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to calculate size');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result && onApplySize) {
      onApplySize(result.recommendedSize);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>SneakX Sizing Advisor</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
          Different sneaker models cut differently through the toe-box and instep. Tell us what you usually wear, and our brand-variance algorithm will calculate your ideal fit for <strong>{targetProduct.name}</strong>.
        </p>

        <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">What brand do you wear comfortably?</label>
            <select
              className="form-select"
              value={referenceBrand}
              onChange={(e) => setReferenceBrand(e.target.value)}
            >
              <option value="Nike">Nike (e.g. Air Force 1, Dunk)</option>
              <option value="Jordan">Jordan (e.g. AJ1, AJ4)</option>
              <option value="Adidas">Adidas (e.g. Stan Smith, Samba)</option>
              <option value="Yeezy">Yeezy (e.g. 350 V2)</option>
              <option value="Converse">Converse (e.g. Chuck 70)</option>
              <option value="New Balance">New Balance (e.g. 550, 990)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Your standard US size in that shoe:</label>
            <select
              className="form-select"
              value={referenceSize}
              onChange={(e) => setReferenceSize(e.target.value)}
            >
              {['6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0', '9.5', '10.0', '10.5', '11.0', '11.5', '12.0', '12.5', '13.0'].map((s) => (
                <option key={s} value={s}>US {s}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Analyzing Fit Profile...' : 'Calculate Optimal Size'}
          </button>
        </form>

        {error && <p className="form-error" style={{ marginTop: '12px' }}>{error}</p>}

        {result && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Recommended Fit
              </span>
              <span className={`badge ${result.fitType === 'RUNS_SMALL' ? 'badge-warning' : result.fitType === 'RUNS_LARGE' ? 'badge-info' : 'badge-success'}`}>
                {result.fitType.replace(/_/g, ' ')}
              </span>
            </div>

            <p style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--accent-primary)',
              marginBottom: '6px'
            }}>
              US {result.recommendedSize}
            </p>

            <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}>
              {result.fitNote}
            </p>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              {result.explanation}
            </p>

            <button
              onClick={handleApply}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
            >
              <Check size={14} /> Apply Size US {result.recommendedSize} to Selector
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
