const express=require('express')
const router=express.Router();
const userController=require('./../controllers/userController')
const authController=require('./../controllers/authController'); 
router
.post('/signup',authController.signup)
router.post('/login',authController.login)
router.get('/logout',authController.logout)
router.post('/forgetPassword',authController.forgetPassword)
router.patch('/resetPassword/:token',authController.resetPassword)



router.use(authController.protected)
router.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe)
router.delete('/deleteMe',userController.deleteMe)
router.get('/me',userController.getMe,userController.getUser);
router.patch('/updatePassword',authController.updatePassword);



router.use(authController.restrictedto('admin'))
router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser)

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)

module.exports=router 