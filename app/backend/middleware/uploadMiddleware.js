
import { connectDBB } from '../config/dbb.js';

const dbb = connectDBB();

export const attachDBMiddleware = (req, res, next) => {
  console.log('Attaching database to request'); // Log middleware usage
  req.dbb = connectDBB();
  next();
};


