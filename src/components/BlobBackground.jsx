/**
 * Decorative gradient blobs — fixed behind all content.
 * Orange, purple, green, blue as per design spec.
 */
export default function BlobBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}
    >
      {/* Orange — top right */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          right: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: '#F97316',
          opacity: 0.18,
          filter: 'blur(72px)',
        }}
      />
      {/* Purple — bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '-70px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: '#A855F7',
          opacity: 0.14,
          filter: 'blur(80px)',
        }}
      />
      {/* Green — mid right */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: '#22C55E',
          opacity: 0.12,
          filter: 'blur(64px)',
        }}
      />
      {/* Blue — upper left */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          left: '-40px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: '#3B82F6',
          opacity: 0.13,
          filter: 'blur(70px)',
        }}
      />
    </div>
  )
}
