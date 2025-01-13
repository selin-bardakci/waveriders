import { uploadMultiplePhotos, deleteFromS3 } from '../config/s3.js'; // Assuming you already have these helpers
import { getBoatById, updateBoatListing } from '../config/boatService.js'; // Service layer functions
import fs from 'fs/promises';
import path from 'path';
import { connectDB } from '../config/db.js';
const db = connectDB();


export const updateBoat = async (req, res) => {
  console.log("updateBoat INVOKED");
  const boatId = req.params.id;
  const updates = req.body;
  const files = req.files;

  try {
    const existingBoat = await getBoatById(db, boatId);
    if (!existingBoat) {
      return res.status(404).json({ message: 'Boat not found' });
    }

    // Prepare the update data starting with the basic updates
    const updateData = { ...updates };
    
    // Handle trip_types mapping
    if (updateData.trip_types) {
      try {
        // Parse the trip_types if it's a JSON string
        const tripTypesArray = typeof updateData.trip_types === 'string' 
          ? JSON.parse(updateData.trip_types)
          : updateData.trip_types;

        // Map trip type IDs to their corresponding database values
        const tripTypeMap = {
          1: 'short',
          2: 'day',
          3: 'sunrise',
          4: 'overnight'
        };

        // Convert trip type IDs to database strings and join them
        const mappedTripTypes = tripTypesArray
          .map(id => tripTypeMap[id])
          .filter(Boolean)
          .join(',');

        updateData.trip_types = mappedTripTypes;
      } catch (e) {
        console.error('Error processing trip types:', e);
        // If there's an error, keep the existing trip types
        updateData.trip_types = existingBoat.trip_types;
      }
    } else {
      // If no trip types provided, keep existing ones
      updateData.trip_types = existingBoat.trip_types;
    }
    
    // Handle photos only if new files are uploaded
    if (files?.photos) {
      // Delete old photos from S3 if they exist
      if (existingBoat.photos) {
        try {
          const existingPhotos = typeof existingBoat.photos === 'string'
            ? JSON.parse(existingBoat.photos)
            : existingBoat.photos || [];

          for (const url of existingPhotos) {
            await deleteFromS3(url).catch(err =>
              console.error('Failed to delete photo ${url}:', err)
            );
          }
        } catch (e) {
          console.error('Error handling existing photos:', e);
        }
      }

      // Upload new photos to S3
      const newPhotoUrls = await uploadMultiplePhotos(
        files.photos,
        process.env.AWS_S3_BUCKET,
        existingBoat.business_id,
        boatId,
        'boat-photos'
      );
      updateData.photos = JSON.stringify(newPhotoUrls);
    } else {
      // If no new photos, remove photos field from updates to keep existing photos
      delete updateData.photos;
    }

    // Remove the boat_license_path from the update
    delete updateData.boat_license_path;

    // Update boat data in the database
    const updatedBoat = await updateBoatListing(db, boatId, updateData);

    res.status(200).json({
      message: 'Boat listing updated successfully',
      boat: updatedBoat
    });
    
  } catch (error) {
    console.error('Error updating boat listing:', error);
    res.status(500).json({
      message: 'Failed to update boat listing',
      error: error.message
    });
  }
};
export const removeBoatListing = async (req, res) => {
  const { boat_id } = req.params;

  if (!boat_id) {
    return res.status(400).json({ message: 'Boat ID is required' });
  }

  try {
    const sql = `DELETE FROM boats WHERE boat_id = ?`;

    db.query(sql, [boat_id], (err, result) => {
      if (err) {
        console.error('Error removing boat listing:', err);
        return res.status(500).json({ message: 'Error removing boat listing' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Boat listing not found' });
      }

      res.status(200).json({ message: 'Boat listing removed successfully' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBoatDetails = async (req, res) => {
  const boatId = req.params.id;

  try {
    const boat = await getBoatById(db, boatId);
    if (!boat) {
      return res.status(404).json({ message: 'Boat not found' });
    }
    res.status(200).json({ boat });
  } catch (error) {
    console.error('Error fetching boat details:', error);
    res.status(500).json({ message: 'Failed to fetch boat details' });
  }
};

