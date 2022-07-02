var express = require('express')
var app = express()
var session = require('express-session')

const bodyparser = require('body-parser')
const multer = require('multer')
const hbs = require("hbs");
const path = require('path')

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerPartials(__dirname + '/views/partials');


app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(bodyparser.urlencoded({ extended: true }))



const async = require('hbs/lib/async')

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb+srv://clusteratn:az123321@clusteratn.0otjk97.mongodb.net/test'

let imageurl
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
        imageurl = Date.now() + '.jpg'
        cb(null, imageurl);
    }
})

var upload = multer({ storage })

app.use(session({
    secret: 'mySecret !@#%#$%$#%^&$%^@#$',
    resave: false
}))
app.get('/login', (req, res) => {
    res.render('login')
})

function isAuthenticated(req, res, next) {
    let notLogin = !req.session.userName
    if (notLogin) {
        res.redirect('/login')
        return
    } else {
        next()
    }
}

app.post('/login', async (req, res) => {
    let name = req.body.txtName
    let pass = req.body.txtPass
    let server = await MongoClient.connect(url)
    let dbo = server.db("ASMATN")

    let users = await dbo.collection('profile').find({ $and: [{ 'name': name }, { 'pass': pass }] }).toArray()
    if (users.length > 0) {
        req.session.userName = name
        res.redirect('/')
        return
    } else {
        res.render('login', { 'ErrorLogin': "Username or Password are not correct", 'oldname': name, 'oldpass': pass })
    }

})
app.get('/', isAuthenticated, async (req, res) => {

    let server = await MongoClient.connect(url)
    let dbo = server.db("ASMATN")
    let products = await dbo.collection('product').find().toArray()
    res.render('home', { 'Username': req.session.userName, 'products': products })
})

app.get('/newToy', isAuthenticated, (req, res) => {
    res.render('new', { 'Username': req.session.userName })
})

app.post('/create', upload.single('image'), async (req, res) => {
    let name = req.body.name2
    let price = req.body.price2
    let description = req.body.description
    let image = imageurl
    let nameError = ""
    let priceError = ""
    let descriptionError = ""
    let imageError = ""
    const file = req.file
    if (name.length == 0) {
        nameError = "Please enter name of Toy"
        res.render('new', {
            'name': name, 'price': price, 'description': description,'Username': req.session.userName,
            'nameError': nameError, 'priceError': priceError, 'descriptionError': descriptionError, 'imageError': imageError
        })
        return
    }
    if (price.length == 0) {
        priceError = "Please enter price of Toy"
        res.render('new', {
            'name': name, 'price': price, 'description': description,'Username': req.session.userName,
            'nameError': nameError, 'priceError': priceError, 'descriptionError': descriptionError, 'imageError': imageError
        })
        return
    }
    if (isNaN(price) == true) {
        priceError = "Price must be a number"
        res.render('new', {
            'name': name, 'price': price, 'description': description,'Username': req.session.userName,
            'nameError': nameError, 'priceError': priceError, 'descriptionError': descriptionError, 'imageError': imageError
        })
        return
    }
    if (description.length == 0) {
        descriptionError = "Please enter description of Toy"
        res.render('new', {
            'name': name, 'price': price, 'description': description,'Username': req.session.userName,
            'nameError': nameError, 'priceError': priceError, 'descriptionError': descriptionError, 'imageError': imageError
        })
        return
    }
    if (!file) {
        imageError = "Please choose a image"
        res.render('new', {
            'name': name, 'price': price, 'description': description,'Username': req.session.userName,
            'nameError': nameError, 'priceError': priceError, 'descriptionError': descriptionError, 'imageError': imageError
        })
        return
    }
    let product = {
        'name': name,
        'price': price,
        'description': description,
        'image': image
    }
    let server = await MongoClient.connect(url)
    //truy cap vao db
    let dbo = server.db("ASMATN")
    // insert product into database
    await dbo.collection('product').insertOne(product)

    res.redirect("/")
})


app.get('/edit', isAuthenticated, async (req, res) => {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID

    let client = await MongoClient.connect(url)
    let dbo = client.db("ASMATN")
    let result = await dbo.collection("product").findOne({ "_id": ObjectID(id) })
    res.render('update', { product: result, 'Username': req.session.userName })
})
app.post('/update', upload.single('image'), async (req, res) => {
    let id = req.body.id;
    let name = req.body.name2
    let price = req.body.price2
    let description = req.body.description2
    let image2 = imageurl
    const file = req.file

    let nameError = ""
    let priceError = ""
    let descriptionError = ""
    let imageError = ""

     if (name.length == 0) {
        nameError = "Please enter name of Toy"
        res.render('update', {
            'name': name, 'price': price, 'description': description,'Username': req.session.userName, 'id':id,
            'nameError': nameError, 'priceError': priceError, 'descriptionError': descriptionError, 'imageError': imageError
        })
        return
    }
    if (price.length == 0) {
        priceError = "Please enter price of Toy"
        res.render('update', {
            'name': name, 'price': price, 'description': description,'Username': req.session.userName,'id':id,
            'nameError': nameError, 'priceError': priceError, 'descriptionError': descriptionError, 'imageError': imageError
        })
        return
    }
    if (isNaN(price) == true) {
        priceError = "Price must be a number"
        res.render('update', {
            'name': name, 'price': price, 'description': description,'Username': req.session.userName,'id':id,
            'nameError': nameError, 'priceError': priceError, 'descriptionError': descriptionError, 'imageError': imageError
        })
        return
    }

    if (description.length == 0) {
        descriptionError = "Please enter description of Toy"
        res.render('update', {
            'name': name, 'price': price, 'description': description,'Username': req.session.userName,'id':id,
            'nameError': nameError, 'priceError': priceError, 'descriptionError': descriptionError, 'imageError': imageError
        })
        return
    }
    if (!file) {
        imageError = "Please choose a image"
        res.render('update', {
            'name': name, 'price': price, 'description': description,'Username': req.session.userName,'id':id,
            'nameError': nameError, 'priceError': priceError, 'descriptionError': descriptionError, 'imageError': imageError
        })
        return
    }

    let newValues = { $set: { name: name, price: price, description: description, image: image2 } }
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(id) }
    let client = await MongoClient.connect(url)
    let dbo = client.db("ASMATN")
    await dbo.collection("product").updateOne(condition, newValues)
    let results = await dbo.collection("product").find({}).toArray()
    res.redirect('/')
})



app.get('/preview', isAuthenticated, async (req, res) => {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID
    let client = await MongoClient.connect(url)
    let dbo = client.db("ASMATN")
    let result = await dbo.collection("product").findOne({ "_id": ObjectID(id) })
    res.render('preview', { product: result, 'Username': req.session.userName })
})

app.get('/confirm', isAuthenticated, async (req, res) => {
    
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID
    let client = await MongoClient.connect(url)
    let dbo = client.db("ASMATN")
    let result = await dbo.collection("product").findOne({ "_id": ObjectID(id) })
    res.render('confirm', { product: result, 'Username': req.session.userName })
})


app.post('/delete', async (req, res) => {
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID
    let client = await MongoClient.connect(url)
    let dbo = client.db("ASMATN")
    await dbo.collection("product").deleteOne({ "_id": ObjectID(id) })
    res.redirect('/')
})



app.post('/search', async (req, res) => {
    let server = await MongoClient.connect(url)
    let dbo = server.db("ASMATN")
    let name = req.body.search2
    let products = await dbo.collection('product').find({ "name": new RegExp(name, 'i') }).toArray()
    res.render('home', { 'products': products, 'Username': req.session.userName, 'nameSearch': name })

})


app.get('/logout', (req, res) => {
    req.session.userName = null
    req.session.save((err) => {
        req.session.regenerate((err2) => {
            res.redirect('/login')
        })
    })
})


const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log('server is running at ' + PORT)