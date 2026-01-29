import express from 'express';
import { adminLogin, updateProfile, getUserProfile, loginUser, registerUser } from '../controllers/userController.js';
import authUser from '../middleware/auth.js'
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.get('/get-profile', authUser, getUserProfile);
userRouter.put('/update-profile', authUser, upload.single('image'), updateProfile);

export default userRouter;

