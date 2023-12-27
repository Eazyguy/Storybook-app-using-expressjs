const express = require('express')
const router = express.Router()
const {ensureAuth,ensureGuest} = require('../middleware/auth.js')
const upload = require('../config/multer.js')
const {check,validationResult} = require('express-validator')
const fs = require('fs')

const Story = require('../models/Story')
const User = require('../models/User.js')

// @desc Login/Landing Page
// @route GET /
router.get('/',ensureGuest,(req,res)=>{
    res.render('login',{
        layout:'login'
    })
})

// @desc Dashboard
// @route GET /dashboard
router.get('/dashboard',ensureAuth,async(req,res)=>{
    try {
        let perpage = 10
        let page = req.query.page || 1

        const stories = await Story.find({user:req.user.id})
        .skip((perpage*page)-perpage)
        .limit(perpage) 
        .lean()

    
        const count = await Story.countDocuments({user:req.user.id})

        res.render('Dashboard',{
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
            stories,
            pagination:{
                page: Number(req.query.page) || 1,
                limit:10,
                totalRows: count
            }
        })
    } catch (error) {
        console.error(error)
        res.render('error/500',{
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
        })
    }
})

// @desc Search 
// @route GET /
router.get('/search',ensureAuth,async(req,res)=>{
    try {
        let query = req.query.search
        let perpage = 9
        let page = req.query.page || 1
         
        const stories = await Story.find(
            {$text:{$search:query}},
            {score:{$meta:"textScore"}},
            {status:'public'})
        .sort({score:{$meta:"textScore"}})
        .populate('user')
        .skip((perpage*page)-perpage)
        .limit(perpage) 
        .lean()
    
            res.render('stories/index',{
                stories,
                name:req.user.firstName,
                Lname:req.user.lastName,
                image:req.user.image.filename || req.user.image,
                id:req.user._id,
                email:req.user.email,
                phone:req.user.Phone,
                pagination:{
                    page: Number(req.query.page) || 1,
                    limit:9,
                    totalRows: 4,
                    queryParams:{
                        search:req.query.search
                    }
                }
            }) 
    } catch (err) {
        console.error(err)
        res.render('error/500',{
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
        })
    }
    })

// @desc Edit Profile
// @route GET /edit-profile
    router.get('/update-profile',ensureAuth,async(req,res)=>{
        try {
            const user = await User.findOne({_id:req.user.id})
            .lean()
    
            res.render('edit_profile',{
                user,
                name:req.user.firstName,
                Lname:req.user.lastName,
                image:req.user.image.filename || req.user.image,
                id:req.user._id,
                email:req.user.email,
                phone:req.user.Phone,
            }) 
        } catch (err) {
            console.error(err)
        res.render('error/404',{
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
        })
        }
        
    })

    
// @desc update Profile
// @route POST /edit-profile

    let validator = [
        check('firstName','First Name cannot be empty').notEmpty(),
        check('lastName','Last Name cannot be empty').notEmpty()
    ]

router.post('/update-profile',upload,validator,ensureAuth,async(req,res)=>{
    try {

        const user = await User.findOne({_id:req.user.id}).lean()

    req.body.image = req.file || user.image 
    const query = req.body
    let errors = validationResult(req)

    if(!errors.isEmpty()){
        res.render('edit_profile',{
            errors:errors.array(),
            user
        })
        fs.unlink(req.file.destination + req.file.filename,(err)=>{
            if(err)console.error(err)
        })
    }else{
        await User.findOneAndUpdate({_id:req.user.id},query)
    req.flash('success','Successfully updated profile')
    res.redirect('/dashboard')

    }
    } catch (err) {
        console.error(err)
        res.render('error/500',{
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
        })
    }
    

})

module.exports = router