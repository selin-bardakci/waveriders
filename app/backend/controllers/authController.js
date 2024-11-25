import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js'; 
import { User } from '../models/userModel.js';
import { Business } from '../models/businessModel.js';
import { Boat } from '../models/boatModel.js';
import { Captain } from '../models/captainModel.js';
import multer from 'multer';
import path from 'path';


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
  console.log("registerBusiness controller function hit");
  console.log("Request body:", req.body);

  const { first_name, last_name, business_name, email, phone_number, password } = req.body;

  // Check for either full name or business name (mutual exclusivity)
  const hasFirstNameAndLastName = first_name?.trim() && last_name?.trim();
  const hasBusinessName = business_name?.trim();

  if (!(hasFirstNameAndLastName || hasBusinessName)) {
      return res.status(400).json({ message: 'Please provide either first and last names, or a business name.' });
  }

  // Check for other required fields
  if (!email || !phone_number || !password) {
      return res.status(400).json({ message: 'Email, phone number, and password are required.' });
  }

  try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user with account_type as 'business_owner'
      User.createUser(db, {
          first_name: hasFirstNameAndLastName ? first_name : null,
          last_name: hasFirstNameAndLastName ? last_name : null,
          email,
          password: hashedPassword,
          phone_number,
          date_of_birth: "0000-00-00", // Default date for business registrations
          account_type: 'business_owner'
      }, (err, result) => {
          if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({ message: 'Server error' });
          }

          const userId = result.insertId;

      
              Business.createBusiness(db, {
             user_id: userId, business_name: hasBusinessName || null }, (err) => {
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
  console.log("registerUser controller function hit");
  console.log("Request body:", req.body);
  const { name, lastname, email, password, phone,  birthdate } = req.body;

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

const boatLicenseStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/boatlicenses'); // Path for boat licenses
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const uploadBoatLicense = multer({ storage: boatLicenseStorage });

// Configure multer storage for captain licenses
const captainLicenseStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/captainlicenses'); // Path for captain licenses
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploadCaptainLicense = multer({ storage: captainLicenseStorage }).single('registration_papers');

// Upload boat license function
export const handleUploadBoatLicense = (req, res) => {
  const { boat_id } = req.body;

  if (!boat_id) {
    return res.status(400).json({ message: 'Boat ID is required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const licensePath = path.join('uploads/boatlicenses', req.file.filename);

  // Update the boat entry with the license path
  Boat.updateBoat(db, boat_id, licensePath, (err, result) => {
    if (err) {
      console.error('Error updating boat with license:', err);
      return res.status(500).json({ message: 'Error updating boat with license' });
    }

    res.status(200).json({ message: 'Boat license uploaded successfully', licensePath });
  });
};


export const handleRegisterCaptain = (req, res) => {
  const { first_name, last_name, experience_years, phone_number, date_of_birth, business_id } = req.body;

  // Log the received data for debugging
  console.log('Received captain registration data:', req.body);

  // Validate required fields
  if (!first_name || !last_name || !experience_years || !phone_number || !date_of_birth) {
    console.error('Captain registration error: Missing required fields');
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Prepare data for insertion
  const captainData = {
    first_name,
    last_name,
    experience_years: parseInt(experience_years, 10),
    phone_number,
    date_of_birth,
    business_id: business_id || null,
  };

  console.log('Formatted captain data:', captainData);

  // Insert into the captains table
  Captain.createCaptain(db, captainData, (err, result) => {
    if (err) {
      console.error('Error creating captain:', err);
      return res.status(500).json({ message: 'Failed to register captain' });
    }
    res.status(201).json({ message: 'Captain registered successfully', captain_id: result.insertId });
  });
};

export const handleUploadCaptainLicense = (req, res) => {
  const { captain_id } = req.body;

  if (!captain_id) {
    return res.status(400).json({ message: 'Captain ID is required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No registration papers uploaded' });
  }

  const registrationPapersPath = `uploads/captainlicenses/${req.file.filename}`;

  Captain.updateCaptainLicense(db, captain_id, registrationPapersPath, (err, result) => {
    if (err) {
      console.error('Error updating captain with registration papers:', err);
      return res.status(500).json({ message: 'Failed to upload registration papers' });
    }
    res.status(200).json({ message: 'Registration papers uploaded successfully', registrationPapersPath });
  });
};

// Login user (business owner or regular customer)
export const loginUser = async (req, res) => {

  console.log("loginUser controller function hit");
  console.log("Request body:", req.body);

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
function mapTripTypesToDatabaseStrings(tripTypeIds) {
  // Check if tripTypeIds is already an array, if not, parse it
  if (typeof tripTypeIds === 'string') {
    try {
      tripTypeIds = JSON.parse(tripTypeIds);
    } catch (error) {
      console.error('Error parsing tripTypeIds:', error);
      return []; // Return an empty array if parsing fails
    }
  }

  if (!Array.isArray(tripTypeIds)) {
    console.error('tripTypeIds is not an array:', tripTypeIds);
    return [];
  }

  const idToStringMap = {
    1: 'short',
    2: 'day',
    3: 'sunrise', 
    4: 'overnight'
  };

  return tripTypeIds.filter(id => idToStringMap[id]).map(id => idToStringMap[id]);
}


export const registerBoat = async (req, res) => {
  const { boat_name, description, trip_types, price_per_hour, price_per_day, capacity, boat_type, location, business_id } = req.body;
  const photos = req.files;

  if (!boat_name || !description || !trip_types || !price_per_hour || !capacity || !boat_type || !location) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const imagePaths = photos.map((file) => file.path);
    console.log("Received photos:", imagePaths);
    const formattedTripTypes = mapTripTypesToDatabaseStrings(trip_types);

    const newBoat = {
      boat_name,
      description,
      trip_types: formattedTripTypes.join(','),
      price_per_hour,
      price_per_day: Array.isArray(price_per_day) ? price_per_day[1] : price_per_day || null, 
      capacity,
      boat_type,
      location,
      business_id,
      photos: JSON.stringify(imagePaths),
      boat_license: null,
    };

    Boat.createBoat(db, newBoat, (err, result) => {
      if (err) {
        console.error('Error creating boat:', err);
        return res.status(500).json({ message: 'Error creating boat' });
      }
      const boatId = result.insertId;
      newBoat.boat_id = boatId; 

      console.log("Full Response Data:", newBoat); 
      res.status(201).json({ message: 'Boat registration successful', boat: newBoat });
    });
  } catch (err) {
    console.error('Error registering boat:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBoat = (req, res) => {
  Boat.getBoat(db, (err, results) => {
    if (err) {
      console.error('Error fetching boats:', err);
      return res.status(500).json({ message: 'Error fetching boats' });
    }
    res.status(200).json({ boats: results });
  });
};

export const getCaptain = (req, res) => {
  Captain.getCaptain(db, (err, results) => {
    if (err) {
      console.error('Error fetching captains:', err);
      return res.status(500).json({ message: 'Error fetching captains' });
    }
    res.status(200).json({ captains: results });
  });
};

export const getBusiness = (req, res) => {
  Business.getAllBusinesses(db, (err, results) => {
    if (err) {
      console.error('Error fetching businesses:', err);
      return res.status(500).json({ message: 'Error fetching businesses' });
    }
    res.status(200).json({ businesses: results });
  });
};

export const getUser = (req, res) => {
  User.getUser(db, 'business', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Error fetching users' });
    }
    res.status(200).json({ users: results });
  });
};
