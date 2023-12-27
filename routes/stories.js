const express = require('express')
const router = express.Router()
const {ensureAuth} = require('../middleware/auth.js')
const flash = require('connect-flash')
const {check,validationResult} = require('express-validator')

const Story = require('../models/Story')

// @desc show add page
// @route GET /stories/add
router.get('/add',ensureAuth,(req,res)=>{
    res.render('stories/add',{
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
    })
})

// @desc process add form
// @route POST /stories

let validator = [
check('title','Title is required').notEmpty(),
check('body','Story can\'t be Empty').notEmpty()
]

router.post('/',ensureAuth,validator,async(req,res)=>{
    try {
        let errors = validationResult(req)

        if(!errors.isEmpty()){
            res.render('stories/add',{
                errors:errors.array()
            })
        }else{
            req.body.user = req.user.id
        await Story.create(req.body)
        req.flash('success','Story created successfully')
        res.redirect('/dashboard')
        }
    } catch (err) {
        console.log(err)
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

//@desc show all stories
// @route GET /stories
router.get('/',ensureAuth,async(req,res)=>{
    try {
        let perpage = 9
        let page = req.query.page || 1


        const stories = await Story.find({status:'public'})
        .populate('user')
        .sort({createdAt:'desc'})
        .skip((perpage*page)-perpage)
        .limit(perpage) 
        .lean()

        const count = await Story.countDocuments()

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
                totalRows: count,
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

// @desc show single
// @route GET /stories/:id
router.get('/:id',ensureAuth,async(req,res)=>{
    try {
        let story = await Story.findById(req.params.id)
        .populate('user')
        .lean()
        
        if(!story){
            return res.render('error/404',{
                name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
            })
        }

        res.render('stories/show',{
            story,
            name:req.user.firstName,
            Lname:req.user.lastName,
            StoryUser:story.user.image.filename || story.user.image,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
        })
    } catch (error) {
        console.error(error)
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

// @desc show edit page
// @route GET /stories/edit/:id
router.get('/edit/:id',ensureAuth,async(req,res)=>{
    try {
        const story = await Story.findOne({
            _id:req.params.id
        }).lean()
    
        if(!story){
            return res.render('error/404',{
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
            })
        }
    
        if(story.user != req.user.id){
            req.flash('error','Access denied')
            res.redirect('/stories')
        }else{
            res.render('stories/edit',{
            story,
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
            })
        }
    
    } catch (error) {
        console.error(err)
        return res.render('error/500',{
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
        })
    }
    
})


// @desc Update story
// @route PUT /stories/:id

let validator2 = [
    check('title','Title is required').notEmpty(),
    check('body','Story can\'t be Empty').notEmpty()
    ]

router.put('/:id',ensureAuth,validator2,async(req,res)=>{
    try {

        let story = await Story.findById(req.params.id).lean()

    if(!story){
        return res.render('error/404',{
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
        })
    }

    if(story.user != req.user.id){
        req.flash('error','Access Denied')
        res.redirect('/stories')
    }else{
        console.log(req.body)
        let errors = validationResult(req)

        if(!errors.isEmpty()){
            res.render('stories/edit',{
                errors:errors.array(),
                story
            })
        }else{

            story = await Story.findOneAndUpdate({_id:req.params.id},req.body,{
                new:true,
                runValidators:true
            })
            req.flash('success','Story successfully updated')
            res.redirect('/dashboard')

        }
    }
    } catch (err) {
        console.error(err)
        return res.render('error/500',{
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
        })
    }
     
})

// @desc Delete story
// @route DELETE /stories/:id
router.delete('/:id',ensureAuth,async(req,res)=>{
    try {
        await Story.deleteOne({_id:req.params.id})
        req.flash('success','Story successfully Deleted')
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        return res.render('error/500',{
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
        })
    }
})

// @desc show add page
// @route GET /stories/add
router.get('/user/:userId',ensureAuth,async(req,res)=>{
    try {
        const stories = await Story.find({
            user:req.params.userId,
            status:'public'
        })
        .populate('user')
        .lean()

        res.render('stories/index',{
            stories,
            name:req.user.firstName,
            Lname:req.user.lastName,
            image:req.user.image.filename || req.user.image,
            id:req.user._id,
            email:req.user.email,
            phone:req.user.Phone,
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

module.exports = router