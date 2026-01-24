const axios = require('axios');

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
            email: 'employee@example.com',
            password: 'password123'
        });

        console.log('Login Response Status:', response.status);
        console.log('\n=== User Data ===');
        console.log(JSON.stringify(response.data.user, null, 2));
        console.log('\n=== Permissions ===');
        console.log(response.data.user.permissions);

    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testLogin();
