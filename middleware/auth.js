module.exports = {
    ensureAuth: (req,res,next)=>{
        if(req.isAuthenticated()){
            return next()
        }else{
            req.flash('error','Access Denied please login')
            res.redirect('/')
        }
    },
    ensureGuest: (req,res,next)=>{
        if(req.isAuthenticated()){
            res.redirect('/dashboard')
        }else{
            return next()
        }
    }
}