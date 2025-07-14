import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
// Multer configuration for file uploads
// This middleware handles file uploads and stores them in the 'public/temp' directory

export const upload = multer({ 
    storage, 
})