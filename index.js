const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
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
    
// **************Users***********

    // post method for users
    app.post('/users', async(req,res) =>{
      const newUsers = req.body
      // console.log(newUsers)
      const query = {email: newUsers.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
         return res.send({message: 'user already exists', insertedId: null})
      }
      const result = await userCollection.insertOne(newUsers)
      res.send(result)
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
        const result = await bioDataCollection.find().toArray();
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

// ****************End******************


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