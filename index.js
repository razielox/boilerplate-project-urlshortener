require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('dns')
app.use(bodyParser.urlencoded({extended: false}))
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//Data In memory
const urlShortered = []
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:shortId', (request, response) => {
  const short_url = Number(request.params.shortId)
  const verifyId = (url) => {

    const checkIndex = urlShortered.findIndex(index => index.short_url === url)
    console.log(checkIndex, urlShortered)
    if (checkIndex >= 0) {
      response.redirect(urlShortered[checkIndex].original_url)
    } else {
      
      response.json({error: 'invalid url'})
    }
  }
  verifyId(short_url)
})

app.post('/api/shorturl', (request, response) => {
  const {url} = request.body
  const dnsName = url.split('/')[2]
  const urlNumber = Math.round(Math.random() * 10000)
  const urlProtocol = url.split('/')[0]
  const verifyReg = (url) => {
    const checkIndex = urlShortered.findIndex(index => index.original_url === url.original_url)
    //console.log(checkIndex, urlShortered)
    if (checkIndex >= 0) {
      response.json(urlShortered[checkIndex])
    } else {
      urlShortered.push(url)
      response.json(url)
    }
  }
  dns.lookup(dnsName, (err, address, family) => {
    console.log(urlProtocol.slice(0,5))
    if(err || urlProtocol.split(':')[0] !== 'https') {
   return response.json({error: 'invalid url'})
    } 
    const urlReg = {original_url: url, short_url: urlNumber}
    verifyReg(urlReg)
    console.log(`the data form this dns is  IP ${address} and is from the family Ipv${family}`)
  })
  
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
