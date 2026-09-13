import React from 'react';

export const SizeSelector = ({ variants = [], selectedVariant, onSelectVariant }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select US Sizing
        </span>
        {selectedVariant && selectedVariant.stockQuantity <= 3 && selectedVariant.stockQuantity > 0 && (
          <span className="badge badge-warning">
            Only {selectedVariant.stockQuantity} Left in Stock
          </span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(58px, 1fr))',
        gap: '8px'
      }}>
        {variants.map((v) => {
          const isSelected = selectedVariant?.id === v.id;
          const isOutOfStock = v.stockQuantity <= 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(v)}
              className="touch-target"
              style={{
                minHeight: '44px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-family-mono)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms ease',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                backgroundColor: isSelected
                  ? 'var(--text-primary)'
                  : isOutOfStock
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'var(--bg-tertiary)',
                color: isSelected
                  ? 'var(--text-inverse)'
                  : isOutOfStock
                    ? 'var(--text-muted)'
                    : 'var(--text-primary)',
                border: isSelected
                  ? '1px solid var(--text-primary)'
                  : '1px solid var(--border-subtle)',
                textDecoration: isOutOfStock ? 'line-through' : 'none',
                opacity: isOutOfStock ? 0.4 : 1
              }}
            >
              US {v.size}
            </button>
          );
        })}
      </div>
    </div>
  );
};
