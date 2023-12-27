const moment = require('moment')
const paginate = require('express-handlebars-paginate')

module.exports = {
    formatDate: (date,format)=>{
        return moment(date).format(format)
    },
    truncate: (str,len)=>{
        if(str.length > len && str.length > 0){
            let new_str = str + ' '
            new_str = str.substr(0,len)
            new_str = str.substr(0,new_str.lastIndexOf(' '))
            new_str = new_str.length > 0 ? new_str : str.substr(0,len)
            return new_str + '...'
        }
        return str
    },
    stripTags:(input)=>{
return input.replace(/<(?:.|\n)*?>/gm, '')
    },
    editIcon:(storyUser,loggedUser,storyId,floating=true)=>{
    if(storyUser._id.toString() == loggedUser._id.toString()){
        if(floating){
            return `<a href="/stories/edit/${storyId}"  class='btn-floating halfway-fab blue'><i class='fas fa-edit fa-small'></i></a>` 
        }else{
            return `<a href='/stories/edit/${storyId}'><i class='fas fa-edit'></i></a>`
        }

    }else{
        return ''
    }

    },
    select: (selected,options)=>{
        return options
        .fn(this)
        .replace(
            new RegExp('value="'+selected+'"'),'$& selected="selected"'
        )
        .replace(
            new RegExp('>'+selected+'</option>'),'selected="selected"$&'
        )
    },
    ren:(mes)=>mes(),
    //msg:(mes)=>console.log(Object.keys(mes).toString()),
    paginate:paginate.createPagination,
    image:(image,userImage)=>{
        if(userImage.image.filename){
            return `/user-profiles/${image}`
        }else{
           return image
            
        }
    },
    editImage:(loggedUser,floating=true)=>{
        if(loggedUser._id.toString()){
            if(floating){
                return `<a href="/update-profile"  class='btn-floating halfway-fab blue btn-menu' ><i class='fas fa-edit fa-big'></i></a>` 
            }else{
                return `<a href='/update-profile'><i class='fas fa-edit'></i></a>`
            }
    
        }else{
            return ''
        }
    },
    index:(image,userImage)=>{
        if(userImage.image.filename){
            return `/user-profiles/${image.image.filename}`|| `/user-profiles/${image.image}`
        }else{
            if(image){
           return image.image
            }
            
        }
    }
}

