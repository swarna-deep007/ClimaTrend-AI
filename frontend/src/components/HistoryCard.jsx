import { useEffect, useState } from "react";
import axios from "axios";

function HistoryCard({ city }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!city) return;

        axios.get(`http://127.0.0.1:8000/api/history/${city}`)
            .then(res => {
                if (res.data.success) setHistory(res.data.data);
            })
            .catch(console.error);

    }, [city]);

    return (
        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <h3>Recent Weather Context</h3>
            {history.map((h, i) => (
                <div key={i}>
                    {h.date} → {h.tavg}°C | {h.prcp} mm
                </div>
            ))}
        </div>
    );
}

export default HistoryCard;