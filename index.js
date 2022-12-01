const express = require('express')
const path = require('path')
const bodyparser = require('body-parser')
const multer = require('multer')
const gm = require('gm')
const fs = require('fs')

const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyparser.urlencoded({extended: true}))
app.use(bodyparser.json())
app.use('/uploads', express.static(path.join(__dirname + '/uploads')))

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    )
  }
})

const upload = multer({
  storage:storage,
  fileFilter: (req, file, cb) => {
    if( file.mimetype == 'image/png' || 
        file.mimetype == 'image/jpg' || 
        file.mimetype == 'image/jpeg' )
    {
      cb(null, true)
    }
    else {
      cb(null, false)
      return console.error('Arquivo não suportado!')
    }
  }
})

app.get('/', (req, res) => {
  res.render('index', {noImgUp: ''})
})

app.post('/upload', upload.single('img-upload'), (req, res, next) => {
  if(!req.file) {
    res.render('index', {noImgUp: 'Envie uma imagem'})
  }
  else {
    gm('./uploads/' + req.file.filename).size((err, size) => {
      if(!err) {
        res.render('image', { 
          url: req.file.path, 
          imgsize: size, 
          imgname: req.file.filename,
          imgformat: path.extname(req.file.originalname)
        })
      }
    })
  }
})

app.post('/edit/:imgname', (req, res) => {
  let width = req.body.newimagewidth
  let height = req.body.newimageheight
  let imageFormat = req.body.imgformat
  let imageName = req.params.imgname
  let newName = __dirname + '/uploads/' + Date.now() + '_resized_' + imageFormat

  if(isNaN(width) || isNaN(height)) {
    res.render('index', {noImgUp: 'Insira apenas números!'})
  }
  else {
    gm('./uploads/' + imageName)
    .resize(width, height)
    .write(newName, (err) => {
        if(!err) {
          res.download(newName)
        }
        else {
          console.error(err)
          res.render('index', {noImgUp: 'Erro :('})
        }
    })
  }
})

app.listen(5000, () => console.log('running :5000'))