import axios from 'axios';

const testSignup = async () => {
    const testUser = {
        fullName: "Test User " + Math.floor(Math.random() * 1000),
        email: `test${Math.floor(Math.random() * 10000)}@example.com`,
        password: "password123"
    };

    console.log("Attempting signup with:", testUser);

    try {
        const response = await axios.post('http://localhost:3000/api/v1/auth/register', testUser);
        console.log("Response:", response.status, response.data);
    } catch (error) {
        if (error.response) {
            console.error("Error Response:", error.response.status, error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
};

testSignup();
