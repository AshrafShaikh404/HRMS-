const https = require('https');

console.log("Checking public IP address...");

https.get('https://api.ipify.org?format=json', (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const ipInfo = JSON.parse(data);
            console.log("============================================");
            console.log(`YOUR PUBLIC IP IS: ${ipInfo.ip}`);
            console.log("============================================");
            console.log("Please copy this IP and add it to MongoDB Atlas Network Access.");
            console.log("OR better: Add '0.0.0.0/0' to allow ALL IPs.");
        } catch (e) {
            console.error("Error parsing IP response:", e.message);
        }
    });
}).on('error', (err) => {
    console.error("Error fetching IP:", err.message);
});
