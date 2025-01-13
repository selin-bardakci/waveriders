import { uploadMultiplePhotos, deleteFromS3 } from '../config/s3.js'; // Assuming you already have these helpers
import { getBoatById, updateBoatListing } from '../config/boatService.js'; // Service layer functions
import fs from 'fs/promises';
import path from 'path';
import { connectDB } from '../config/db.js';
const db = connectDB();


export const updateBoat = async (req, res) => {
  const boatId = req.params.id;
  const updates = req.body;
  const files = req.files;

  try {
    const existingBoat = await getBoatById(db, boatId);
    if (!existingBoat) {
      return res.status(404).json({ message: 'Boat not found' });
    }

    let photoUrls = existingBoat.photos;
    if (files?.photos) {
      // Handle existing photos deletion
      if (existingBoat.photos) {
        try {
          const existingPhotos = typeof existingBoat.photos === 'string' 
            ? JSON.parse(existingBoat.photos) 
            : Array.isArray(existingBoat.photos) 
              ? existingBoat.photos 
              : [];
              
          for (const url of existingPhotos) {
            await deleteS3Object(url).catch(err => 
              console.error(`Failed to delete photo ${url}:`, err)
            );
          }
        } catch (e) {
          console.error('Error handling existing photos:', e);
        }
      }

      // Upload new photos
      const newPhotoUrls = await uploadMultiplePhotos(
        files.photos,
        process.env.AWS_S3_BUCKET,
        existingBoat.business_id,
        boatId,
        'boat-photos'
      );
      photoUrls = JSON.stringify(newPhotoUrls);
    }

    // Update boat data
    const updatedBoat = await updateBoatListing(db, boatId, {
      ...updates,
      photos: photoUrls
    });

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

export const removeBoatListing = async (req, res) => {
  const { boat_id } = req.params;

  if (!boat_id) {
    return res.status(400).json({ message: 'Boat ID is required' });
  }

  try {
    // Get the existing boat to check for associated photos
    const existingBoat = await getBoatById(db, boat_id);
    if (!existingBoat) {
      return res.status(404).json({ message: 'Boat not found' });
    }

    // Step 1: Delete the boat's photos from S3 (if any)
    const existingPhotos = JSON.parse(existingBoat.photos || '[]');
    for (const photoUrl of existingPhotos) {
      await deleteFromS3(photoUrl); // Delete each old photo from S3
    }

    // Step 2: Remove the boat from the database
    await removeBoatListingFromDb(db, boat_id);

    res.status(200).json({ message: 'Boat listing removed successfully' });
  } catch (error) {
    console.error('Error removing boat listing:', error);
    res.status(500).json({ message: 'Failed to remove boat listing' });
  }
};