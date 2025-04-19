import axios from 'axios';

const API_URL = 'http://localhost:5000';

class AuthService {
  async register(username, password) {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Server connection error' };
    }
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username, 
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify({
          username,
          token: response.data.token,
          userId: response.data.userId
        }));
      }
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Server connection error' };
    }
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }
}

export default new AuthService();