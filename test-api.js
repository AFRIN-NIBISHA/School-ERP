const axios = require('axios');

async function testAPI() {
    try {
        console.log('🔍 Testing API response structure...');
        
        const response = await axios.get('http://localhost:5000/api/students');
        
        console.log('📡 Full Response:', JSON.stringify(response.data, null, 2));
        console.log('📚 Students Array:', JSON.stringify(response.data?.data || [], null, 2));
        
        if (response.data?.data && response.data.data.length > 0) {
            console.log('\n👤 First few students:');
            response.data.data.slice(0, 3).forEach((student, index) => {
                console.log(`  ${index + 1}. Name: "${student.name}", Roll: ${student.roll_no}, Class: ${student.class_name || student.class}-${student.section}`);
            });
        }
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
    }
}

testAPI();
