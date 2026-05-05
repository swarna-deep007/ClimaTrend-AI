import { useState } from "react";

function FeaturePanel({ features }) {
    const [open, setOpen] = useState(false);

    if (!features || features.length === 0) return null;

    return (
        <div style={{ marginTop: '20px' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%',
                    padding: '10px',
                    background: '#ff6b35',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer'
                }}
            >
                {open ? "Hide Feature Details" : "Show Feature Details"}
            </button>

            {open && (
                <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                    {features.slice(0, 15).map((f, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                            <strong>{f.name}</strong>: {f.value.toFixed(3)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FeaturePanel;