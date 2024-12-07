import { connectDB } from '../config/db.js';
import { User } from '../models/userModel.js';

const db = connectDB();

export const getUserProfile = (req, res) => {
    const { id } = req.user; 
    User.findUserById(db, id, (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ message: 'Error fetching user.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = results[0];
        res.status(200).json({
            id: user.user_id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            account_type: user.account_type,
        });
    });
};

export const updateUserProfile = (req, res) => {
    const { id } = req.user; 
    const { first_name, last_name, phone_number, date_of_birth } = req.body;

    const updateData = { first_name, last_name, phone_number, date_of_birth };

    User.updateUser(db, id, updateData, (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ message: 'Error updating user profile.' });
        }

        res.status(200).json({ message: 'User profile updated successfully.' });
    });
};
