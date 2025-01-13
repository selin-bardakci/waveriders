import { Boat2 } from '../models/boatModel.js';
import { uploadMultiplePhotos  } from './s3.js';
import { mapTripTypesToDatabaseStrings } from '../middleware/tripTypeMapper.js';
import fs from 'fs/promises';
import path from 'path';

export const createBoatRegistration = async (db, boatData, files, bucketName) => {
  const { photos, license } = files;
  const { business_id } = boatData;

  try {
    // First create the boat record to get the boat_id
    const formattedTripTypes = mapTripTypesToDatabaseStrings(boatData.trip_types);
    const initialBoat = {
      ...boatData,
      trip_types: formattedTripTypes.join(','),
      photos: '[]',
      boat_license_path: '',
    };

    // Create boat record and get the inserted ID
    const newBoat = await new Promise((resolve, reject) => {
      Boat2.createBoat(db, initialBoat, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        // Get the newly created boat with its ID
        db.query('SELECT * FROM boats WHERE boat_id = LAST_INSERT_ID()', (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows[0]);
        });
      });
    });

    if (!newBoat || !newBoat.boat_id) {
      throw new Error('Failed to create boat record or get boat ID');
    }

    // Now we have the boat_id, upload photos
    const photoUrls = await uploadMultiplePhotos(
      photos,
      bucketName,
      business_id,
      newBoat.boat_id,
      'boat-photos'
    );

    // Upload license with the boat_id
    const licenseUrl = await uploadMultiplePhotos(
      [license],
      bucketName,
      business_id,
      newBoat.boat_id,
      'boat-licenses'
    );

    // Update boat record with URLs
    const updatedBoat = await updateBoatListing(db, newBoat.boat_id, {
      photos: JSON.stringify(photoUrls),
      boat_license_path: licenseUrl[0]
    });

    return updatedBoat;
  } catch (error) {
    // Clean up any remaining files in case of error
    await Promise.all([
      ...(photos || []).map(file => fs.unlink(file.path).catch(() => {})),
      license && fs.unlink(license.path).catch(() => {})
    ]);
    throw error;
  }
};

export const getBoatById = (db, boatId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM boats WHERE boat_id = ?';
    db.query(query, [boatId], (err, results) => {
      if (err) reject(err);
      resolve(results[0]);
    });
  });
};

export const updateBoatListing = (db, boatId, updates) => {
  return new Promise((resolve, reject) => {
      if ('photos' in updates && !updates.photos) {
      delete updates.photos;
    }
  
    if (updates.photos && typeof updates.photos === 'string') {
      try {
        // If it's already a JSON string, parse and stringify to validate
        JSON.parse(updates.photos);
      } catch (e) {
        // If it's a single URL, convert to JSON array
        updates.photos = JSON.stringify([updates.photos]);
      }
    }

    const query = `
      UPDATE boats 
      SET ? 
      WHERE boat_id = ?
    `;
    
    db.query(query, [updates, boatId], (err, result) => {
      if (err) reject(err);
      else {
        // Fetch and return the updated boat data
        getBoatById(db, boatId)
          .then(boat => resolve(boat))
          .catch(err => reject(err));
      }
    });
  });
};

export const removeBoatListingFromDb = (db, boatId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM boats WHERE boat_id = ?';
    db.query(query, [boatId], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};
