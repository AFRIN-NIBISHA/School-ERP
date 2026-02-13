const axios = require('axios');

async function testDirectAPI() {
    try {
        console.log('🔍 Testing direct API calls...');
        
        // Test students endpoint
        const studentsResponse = await axios.get('http://localhost:5000/api/students', {
            timeout: 5000
        });
        console.log('✅ Students API:', studentsResponse.status, '- Count:', studentsResponse.data?.data?.length);
        
        // Test staff endpoint
        const staffResponse = await axios.get('http://localhost:5000/api/shifts/staff', {
            timeout: 5000
        });
        console.log('✅ Staff API:', staffResponse.status, '- Count:', staffResponse.data?.data?.length);
        
        // Test schedule endpoint
        const scheduleResponse = await axios.get('http://localhost:5000/api/shifts/schedule', {
            timeout: 5000
        });
        console.log('✅ Schedule API:', scheduleResponse.status, '- Count:', scheduleResponse.data?.data?.length);
        
        console.log('🎉 All APIs are working!');
        
    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
        console.error('Code:', error.code);
    }
}

testDirectAPI();
