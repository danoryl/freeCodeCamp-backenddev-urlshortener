require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser'); // parse POST body
const mongoose = require('mongoose');
const shortId = require('shortid'); // url short id creator
const validUrl = require('valid-url'); // url validator

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// MOUNT BODYPARSER
app.use('/', bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// MONGODB CONNECT
const myURI = process.env['MONGO_URI']
mongoose.connect(myURI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
       });

// Create a Mongo Schema and model 
const urlSchema = new mongoose.Schema({
  original: String,
  short: String,
});

const URL = mongoose.model('URL', urlSchema);

// POST A NEW URL IF NOT ALREADY IN DB
app.post('/api/shorturl/', async function (req, res) {
  let url = req.body.url;
  let urlShort = shortId.generate();
  if (!validUrl.isWebUri(url)) {
    res.json({
      error: 'invalid URL'
    })
  } else {
  let foundURL = await URL.findOne({
        original: url
      })
  if (foundURL) {
    res.json({
          original_url: foundURL.original,
          short_url: foundURL.short
        })
    } else {
    urlToAdd = new URL({
          original: url,
          short: urlShort
        })
    await urlToAdd.save()
    res.json({
      original_url: urlToAdd.original,
      short_url: urlToAdd.short
       })
     }
    
  } // chiusura else validurl
}) //chiudura app.post

app.get('/api/shorturl/:short?', async function (req, res) {
  
  const foundURL = await URL.findOne({
     short: req.params.short
   })
   if (foundURL) {
     return res.redirect(foundURL.original)
   } else {
     return res.json('No URL found')
   }
  
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
