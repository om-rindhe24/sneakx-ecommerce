import React, { useState } from 'react';
import { reviewService } from '../services/reviewService';
import { X, Star } from 'lucide-react';

export const ReviewModal = ({ isOpen, onClose, productId, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      setError('Please provide both a review title and detailed comments.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newReview = await reviewService.addReview(productId, { rating, title, comment });
      if (onReviewAdded) {
        onReviewAdded(newReview);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Write a Review</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="form-label">Your Overall Rating</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ color: (hoverRating || rating) >= star ? '#F59E0B' : 'var(--text-muted)' }}
                >
                  <Star size={24} fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Review Headline</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Unbelievable comfort and clean aesthetic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Your Detailed Review</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="How does it fit? Quality of leather? Would you recommend sizing up or down?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Submitting Review...' : 'Post Verified Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
