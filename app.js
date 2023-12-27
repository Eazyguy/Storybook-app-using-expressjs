const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const path = require('path')
const methodOverride = require('method-override')
const exphbs = require('express-handlebars')
const connectDB = require('./config/db')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const multer = require('multer')

// load config
dotenv.config({path:'./config/config.env'})

// passport config
require('./config/passport')(passport)

connectDB()

const app = express()

// Body parser
app.use(express.urlencoded({extended:false}))
app.use(express.json())


// method Override
app.use(methodOverride(function(req,res){
    if(req.body && typeof req.body === 'object' && '_method' in req.body){
        let method = req.body._method
        delete req.body._method
        return method
    }
})) 

// logging
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// Handlebars Helpers
const { formatDate,stripTags,truncate,editIcon,select,msg,ren,paginate,image,editImage,index} = require('./helpers/hbs')

// Handlebars
app.engine('.hbs', exphbs.engine({
    helpers:{
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
    msg,
    ren,
    paginate,
    image,
    editImage,
    index
},
defaultLayout:'main',extname:'.hbs'}))
app.set('view engine','.hbs')
//handlebars paginate
//exphbs.registerHelper('paginateHelper',paginateHelper.createPagination)

//session
app.use(session({
    secret: 'keyboardcat',
    resave: true,
    saveUninitialized: true,
    store:MongoStore.create({mongoUrl:process.env.MONGO_URI})
}))

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
res.locals.messages = require('express-messages')(req, res);
next();
});
// express flash miidleware
app.use(flash())

// passport middleware
app.use(passport.initialize())
app.use(passport.session())

// set global var
app.use((req,res,next)=>{
    res.locals.user = req.user || null
    next()
})

// Routes
app.use('/',require('./routes/index'))
app.use('/auth',require('./routes/auth'))
app.use('/stories',require('./routes/stories'))

//public 
app.use(express.static(path.join(__dirname,'public')))
 

const PORT = process.env.PORT || 3000

app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))