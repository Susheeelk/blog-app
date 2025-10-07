import express from 'express'
import { allUser, login, logout, register, updateProfile } from '../controller/user.controller.js'
import { isAuthenticated } from '../middlewere/isAuthentication.js'
import { singleUpload } from '../middlewere/multer.js'


const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.put('/profile/update', isAuthenticated, singleUpload, updateProfile)
router.get('/all-users', allUser);

export default router;