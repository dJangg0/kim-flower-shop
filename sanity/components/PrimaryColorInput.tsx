import { useCallback, type ChangeEvent } from 'react';
import { set, type StringInputProps } from 'sanity';

const fallbackColor = '#B14A66';
const hexColorPattern = /^#[\da-f]{6}$/i;

export function PrimaryColorInput(props: StringInputProps) {
  const { elementProps, onChange, value } = props;
  const color = typeof value === 'string' && hexColorPattern.test(value)
    ? value
    : fallbackColor;

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onChange(set(event.currentTarget.value.toUpperCase()));
  }, [onChange]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <input
        {...elementProps}
        type="color"
        value={color}
        onChange={handleChange}
        disabled={elementProps.readOnly}
        aria-label="Choose primary color"
        style={{
          ...elementProps.style,
          width: '3.25rem',
          height: '2.5rem',
          padding: '0.25rem',
          border: '1px solid var(--card-border-color)',
          borderRadius: '0.375rem',
          backgroundColor: 'var(--card-bg-color)',
          cursor: elementProps.readOnly ? 'not-allowed' : 'pointer',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          width: '2.25rem',
          height: '2.25rem',
          flex: '0 0 auto',
          border: '1px solid var(--card-border-color)',
          borderRadius: '0.375rem',
          backgroundColor: color,
        }}
      />
      <output style={{ fontSize: '0.75rem', color: 'var(--card-muted-fg-color, #666)' }}>
        {color.toUpperCase()}
      </output>
    </div>
  );
}
