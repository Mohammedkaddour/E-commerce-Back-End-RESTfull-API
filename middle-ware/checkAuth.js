let jwt = require("jsonwebtoken")


module.exports = (req,res,next)=>{
    try {
        let token= req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token,"secret")
        req.userData = decoded
        next()
    } catch (error){
        res.status(500).send(JSON.stringify({message: "sorry Auth failed"}))
    }
}