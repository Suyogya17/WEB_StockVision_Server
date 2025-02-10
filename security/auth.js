const jwt = require("jsonwebtoken")
const SECRET_KEY = "4d8ba63524bafdd9e9dde45a05118e7ffb99f4cdcd7d2543c7f7b77a6de9b302";
function authenticateToken(req, res, next) {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).send("Access denied: No token provided");
    }
    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (e) {
        return res.status(401).send("Invalid token");
    }
}


function authorizeRole (role){
    return(req,res,next)=>{
        if (req.user.role!==role){
            return res.status(403).send("Access Denied: Insuffecient Permissions")
        }

        next();
    }
}

module.exports={authenticateToken,authorizeRole}