const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// *************

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d5v1sm5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
   
    // all database collection
    const bioDataCollection = client.db('Matrimonial').collection('biodata');
    const favoriteCollection = client.db('Matrimonial').collection('favorite');
    const userCollection = client.db('Matrimonial').collection('users');
    const premiumCollection = client.db('Matrimonial').collection('premium');
    const premiumCollectionBio = client.db('Matrimonial').collection('premiumCltBio');
    const reviewCollection = client.db('Matrimonial').collection('review');

    // jwt related api
    app.post('/jwt', async(req,res) =>{
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN,{
        expiresIn: '1h'});
      res.send({token});
    })

    // verify middlewares
    const verifyToken = (req,res,next) =>{
      console .log('inside verify token',req.headers.authorization);
      if(!req.headers.authorization){
         return res.status(401).send({message: 'forbidden access'})
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token,process.env.ACCESS_SECRET_TOKEN, (error,decoded) =>{
        if(error){
         return res.status(401).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next()
      })
      
    }
    
// **************Users***********

    // post method for users
    app.post('/users', async(req,res) =>{
      const newUsers = req.body
      const query = {email: newUsers.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
         return res.send({message: 'user already exists', insertedId: null})
      }
      const result = await userCollection.insertOne(newUsers)
      res.send(result)
    })

    // get method for all users in admin dashboard
    app.get('/users', verifyToken, async(req,res) =>{
      const result = await userCollection.find().toArray();
      res.send(result)
  })

  // update method for make admin
  app.patch('/users/admin/:id', async(req,res) =>{
    const id = req.params.id
    const filter = {_id: new ObjectId(id)}
    const updateDoc = {
      $set: {
        role: 'admin'
      } 
    }
    const result = await userCollection.updateOne(filter,updateDoc)
    res.send(result)
  })

  // update method for make premium
  app.patch('/users/premium/:id', async(req,res) =>{
    const id = req.params.id
    const filter = {_id: new ObjectId(id)}
    const updateDoc = {
      $set: {
        role: 'premium'
      } 
    }
    const result = await userCollection.updateOne(filter,updateDoc)
    res.send(result)
  })

  // get method for verify admin
  app.get('/user/admin/:email', verifyToken, async(req,res) =>{
     const email = req.params.email
     if(email !== req.decoded.email){
       return res.status(403).send({message: 'unauthorized access'})
     }
     const query = {email: email}
     const user = await userCollection.findOne(query)
     let admin = false;
     if(user){
       admin = user?.role === 'admin';
     }
       res.send({admin});
  })

  // get method for verify premium **************************************PRONOY***************
  app.get('/user/premium/:email', verifyToken, async(req,res) =>{
    const email = req.params.email
    if(email !== req.decoded.email){
      return res.status(403).send({message: 'unauthorized access'})
    }
    const query = {email: email}
    const user = await userCollection.findOne(query)
    let premium = false;
    if(user){
      premium = user?.role === 'premium';
    }
      res.send({premium});
 })

// ***************End*************

// ************** Bio Data***************
    // post method for BioData
    app.post('/bioData', async(req,res) =>{
      const newBioData = req.body
      console.log(newBioData)
      const result = await bioDataCollection.insertOne(newBioData)
      res.send(result)
    })

    // get allBioData
    app.get('/bioData', async(req,res) =>{
        const result = await bioDataCollection.find().sort({id: 1}).toArray();
        res.send(result)
    })

    // get method for self viewBioData email basis
    app.get('/selfBioData', async(req,res) =>{
      const email = req.query.email
      const query = {
        Contact_Email: email}
      const result = await bioDataCollection.find(query).toArray();
      res.send(result)
  })
  
  // get method for male basis
  // app.get('/male', async(req,res) =>{
  //   const male = req.query.male
  //   const query = {
  //     Biodata_Type: male}
  //   if(query === 'male'){
  //     const result = await bioDataCollection.find(query).toArray()
  //     res.send(result)
  //   } 
  // })


//    get method for details page
        app.get('/detailsBio/:id',  async (req,res) =>{
            const id = req.params.id;
            console.log({id})
            const query = {_id: new ObjectId(id)}
            const result = await bioDataCollection.findOne(query)
            res.send(result)
})

// *****************End**************

// *****************Favorite*********
  // get method for  favorite on dashboard
  app.get('/favorite', async(req,res) =>{
    const email = req.query.email
    const query = {email: email}
    const result = await favoriteCollection.find(query).toArray();
    res.send(result)
})

// post method for favorite collection
app.post('/favorite', async(req,res) =>{
    const newFavorite = req.body
    console.log(newFavorite)
    const result = await favoriteCollection.insertOne(newFavorite)
    res.send(result)
  })

  // ************TODO DELETE METHOD********
app.delete('/favorite/:id', async(req,res) =>{
  const id = req.params.id
  const query = {_id: new ObjectId(id)}
  const result = await favoriteCollection.deleteOne(query)
  res.send(result)
})

// ****************End******************

// *****************premium*********
  // post method for premium
  app.post('/premium', async(req,res) =>{
    const newPremium = req.body
    console.log(newPremium)
    const result = await premiumCollection.insertOne(newPremium)
    res.send(result)
  })

 
  // get method for load premium data on admin dashboard
  app.get('/premium',  async(req,res) =>{
    const result = await premiumCollection.find().toArray();
    res.send(result)
})

// ***************Done****************************
// todo patch method use for premium update
app.post('/users/premiumCltBio/:id', async(req,res) =>{
  const id = req.params.id
  const newPremiumBio = req.body
  const filter = {_id: new ObjectId(id)}
  const updateDoc = {
    $set: {
      role: 'premium'
    } 
  }
  const result = await premiumCollection.updateOne(filter,updateDoc)
  const post = await premiumCollectionBio.insertOne(newPremiumBio)
  res.send(result)
})

// get method for verify another premium user
app.get('/user/anotherPremium/:email', verifyToken, async(req,res) =>{
  const email = req.params.email
  if(email !== req.decoded.email){
    return res.status(403).send({message: 'unauthorized access'})
  }
  const query = {email: email}
  const user = await premiumCollection.findOne(query)
  let premium = false;
  if(user){
    premium = user?.role === 'premium';
  }
    res.send({premium});
})

// get method for premium bio data
app.get('/premiumMember',  async(req,res) =>{
  const result = await premiumCollectionBio.find().toArray();
  res.send(result)
})

// get method review collection
app.get('/review',  async(req,res) =>{
  const result = await reviewCollection.find().toArray();
  res.send(result)
})


// payment intent
app.post('/create-payment-intent', async(req,res) =>{
  // const {price} = req.body
  const amount = parseInt(5*100)
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
  })

  res.send({
    clientSecret: paymentIntent.client_secret
  })
})


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// *************


app.get('/', (req,res) =>{
    res.send('assignment 12')
})

app.listen(port, () =>{
    console.log(`assignment 12 is running on ${port}`);
})