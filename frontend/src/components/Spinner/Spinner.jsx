import './Spinner.css'

const sizeClassByValue = {
  16: 'spinner--sm',
  20: 'spinner--md',
  24: 'spinner--lg',
  30: 'spinner--xl',
}

function Spinner({ size = 30, className = '', label = 'Loading…' }) {
  const sizeClass = sizeClassByValue[size] ?? 'spinner--xl'
  return (
    <span
      className={`spinner ${sizeClass} ${className}`.trim()}
      role="status"
      aria-label={label}
    />
  )
}

export default Spinner
