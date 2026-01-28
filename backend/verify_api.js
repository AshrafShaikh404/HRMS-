const API_URL = 'http://localhost:5001/api/v1';

const verifyAppraisalAPI = async () => {
    try {
        // 1. Login
        console.log('Logging in as Ashraf...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'ashraf@hrms.com',
                password: 'emp123'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message || 'Login failed');

        const token = loginData.token;
        console.log('Login successful, token received.');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Fetch My History
        console.log('Fetching appraisal history...');
        const historyRes = await fetch(`${API_URL}/appraisals/my-history`, { headers });
        const historyData = await historyRes.json();

        if (historyData.success && historyData.data.length > 0) {
            const record = historyData.data[0];
            console.log('--- Appraisal History Found ---');
            console.log('Cycle:', record.appraisalCycleId?.name);
            console.log('Rating:', record.finalRating);
            console.log('Increment:', record.incrementType, record.incrementValue);
            console.log('CTC:', record.oldCTC, '->', record.newCTC);
            console.log('Remarks:', record.remarks);
        } else {
            console.error('No appraisal history found or request failed', historyData);
        }

        // 3. Fetch My Profile
        console.log('Fetching profile data...');
        const profileRes = await fetch(`${API_URL}/auth/me`, { headers });
        const profileData = await profileRes.json();

        if (profileData.success) {
            const user = profileData.data.user;
            console.log('--- Profile Data ---');
            console.log('Name:', user.name);
            console.log('Role:', typeof user.role === 'string' ? user.role : user.role?.name);
            console.log('Permissions:', JSON.stringify(user.permissions, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error during verification:', error.message);
        process.exit(1);
    }
};

verifyAppraisalAPI();
