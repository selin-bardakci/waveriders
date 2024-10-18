import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js'; 
import { User } from '../models/userModel.js';
import { Business } from '../models/businessModel.js';
import { Boat } from '../models/boatModel.js';
import { Captain } from '../models/captainModel.js';


const db = connectDB();

// Account setup for choosing between business or customer account
export const accountSetup = (req, res) => {
  const { selectedOption } = req.body;  // Get the selected option from the request body

  if (!selectedOption) {
    return res.status(400).json({ message: 'No option selected' });
  }

  // Handle the logic based on the selected option
  if (selectedOption === 'customer') {
    res.status(200).json({ message: 'Customer account setup' });
  } else if (selectedOption === 'business') {
    res.status(200).json({ message: 'Business account setup' });
  } else {
    res.status(400).json({ message: 'Invalid option' });
  }
};

// Register a business account (business owner registration)
export const registerBusiness = async (req, res) => {
  const { first_name, last_name, business_name, email, phone_number, password, business_registration } = req.body;

  if ((!first_name && !last_name) || !business_name) {
    return res.status(400).json({ message: 'Enter your first name & last name OR a business name' });
  }

  if (!email || !phone_number || !password || !business_registration) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // First, create the user with account_type as 'business_owner'
    User.createUser(db, {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone_number,
      account_type: 'business_owner'
    }, (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      const userId = result.insertId;  // Get the user ID of the created user

      // Then, create the business entry associated with the user
      Business.createBusiness(db, {
        user_id: userId,
        business_name,
        business_registration
      }, (err, businessResult) => {
        if (err) {
          console.error('Error creating business:', err);
          return res.status(500).json({ message: 'Error creating business' });
        }

        res.status(200).json({ message: 'Business registration successful' });
      });
    });

  } catch (err) {
    console.error('Error hashing password:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const registerUser = async (req, res) => {
  const { name, lastname, email, password, phone, birthdate } = req.body;

  if (!name || !lastname || !email || !password || !phone || !birthdate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    User.createUser(db, {
      first_name: name,
      last_name: lastname,
      email,
      password: hashedPassword,
      phone_number: phone,
      date_of_birth: birthdate,
      account_type: 'customer'
    }, (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      res.status(200).json({ message: 'Registration successful' });
    });
  } catch (err) {
    console.error('Error hashing password:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


// Login user (business owner or regular customer)
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Fetch user from the database
    User.findUserByEmail(db, email, async (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.status(200).json({ message: 'Login successful', user: { id: user.user_id, email: user.email, account_type: user.account_type } });
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const registerBoat = async (req, res) => {
  const { boat_name, description, trip_types, price_per_hour, price_per_day, capacity, boat_type, location, business_id } = req.body;

  if (!boat_name || !description || !trip_types || !price_per_hour || !price_per_day || !capacity || !boat_type || !location) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create the boat entry in the database
    Boat.createBoat(db, {
      boat_name,
      description,
      trip_types,
      price_per_hour,
      price_per_day,
      capacity,
      boat_type,
      location,
      business_id
    }, (err, result) => {
      if (err) {
        console.error('Error creating boat:', err);
        return res.status(500).json({ message: 'Error creating boat' });
      }
      res.status(200).json({ message: 'Boat registration successful' });
    });
  } catch (err) {
    console.error('Error registering boat:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const registerCaptain = async (req, res) => {
  const { first_name, last_name, experience_years, phone_number, date_of_birth, business_id } = req.body;

  if (!first_name || !last_name || !experience_years || !phone_number || !date_of_birth || !req.file) {
    return res.status(400).json({ message: 'All fields and captain license are required' });
  }

  try {
    // Create the captain entry in the database
    Captain.createCaptain(db, {
      first_name,
      last_name,
      experience_years,
      phone_number,
      date_of_birth,
      business_id,
      registration_papers: req.file.path  // Path to the captain's license file
    }, (err, result) => {
      if (err) {
        console.error('Error creating captain:', err);
        return res.status(500).json({ message: 'Error creating captain' });
      }
      res.status(200).json({ message: 'Captain registration successful' });
    });
  } catch (err) {
    console.error('Error registering captain:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
