import { useEffect, useState } from "react";
import axios from "axios";

function RiskTimeline({ city }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        if (!city) return;

        const fetchData = async () => {
            try {
                const dates = [];
                const today = new Date();

                for (let i = 0; i < 5; i++) {
                    const d = new Date();
                    d.setDate(today.getDate() + i);
                    dates.push(d.toISOString().split('T')[0]);
                }

                const results = await Promise.all(
                    dates.map(date =>
                        axios.post("http://127.0.0.1:8000/api/advanced-predict", { city, date })
                    )
                );

                const formatted = results.map((r, i) => ({
                    date: dates[i],
                    prob: r.data.probability || 0
                }));

                setData(formatted);

            } catch (e) {
                console.error("Timeline error", e);
            }
        };

        fetchData();
    }, [city]);

    return (
        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '10px' }}>5-Day Risk Timeline</h3>
            {data.map((d, i) => (
                <div key={i}>
                    {d.date} → {(d.prob * 100).toFixed(2)}%
                </div>
            ))}
        </div>
    );
}

export default RiskTimeline;