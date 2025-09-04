const User = require('../models/User');

// User registration
const signup = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Check if email already exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Create new user
    const userData = await User.create({
      full_name,
      email,
      password
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          user_id: userData.user_id,
          full_name: userData.full_name,
          email: userData.email,
          account_level: userData.account_level,
          is_active: userData.is_active
        },
        token: userData.token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate new token
    const token = user.generateToken();
    
    // Update token in database
    await User.updateToken(user.user_id, token);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, email } = req.body;
    const userId = req.user.user_id;

    // Check if email is being updated and if it already exists
    if (email && email !== req.user.email) {
      const emailExists = await User.emailExists(email);
      if (emailExists) {
        return res.status(409).json({
          status: 'error',
          message: 'Email already registered'
        });
      }
    }

    // Update user profile
    await User.updateProfile(userId, { full_name, email });

    // Get updated user data
    const updatedUser = await User.findById(userId);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toJSON()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Logout (invalidate token)
const logout = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Clear token in database
    await User.updateToken(userId, null);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Verify token endpoint
const verifyToken = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Token verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  logout,
  verifyToken
};
