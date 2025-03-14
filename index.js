const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o5v4c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const reviewCollection = client.db('reviewDB').collection('review');
    const watchlistCollection = client.db('reviewDB').collection('watchlist');

    app.get('/review', async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);

    })

    app.get('/review/:id', async (req, res) => {
      const id = req.params.id
      console.log(id);
      const query = { _id: new ObjectId(id) }
      const result = await reviewCollection.findOne(query)
      res.send(result)
    })

    app.get('/watchlist', async (req, res) => {
      const cursor = watchlistCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    // Fetch top 6 highest-rated games
    app.get('/highest-rated-games', async (req, res) => {
      try {
        const games = await reviewCollection
          .find()
          .sort({ rating: -1 })
          .limit(6)
          .toArray();
        res.send(games);
      } catch (error) {
        res.status(500).send({ message: "Error fetching data", error });
      }
    });

    app.get('/latest-games', async(req, res) => {
      try {
        const games = await reviewCollection
        .find()
        .sort({publishingYear: -1})
        .toArray()
        res.send(games)        
      }
      catch (error) {
        res.status(500).send({message: "Error fetching data", error});
      }
    })
  

    app.get('/watchlist/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await watchlistCollection.findOne(query);
      console.log(result);
      res.send(result)
      
    });



    app.post('/review', async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);

    })

    app.post('/watchlist', async (req, res) => {
      const newWatchlist = req.body;
      console.log(newWatchlist);
      const result = await watchlistCollection.insertOne(newWatchlist);
      res.send(result);

    })

    app.put('/review/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedReview = req.body;
      const review = {
        $set: {
          gameCover: updatedReview.gameCover,
          gameTitle: updatedReview.gameTitle,
          reviewDescription: updatedReview.reviewDescription,
          rating: updatedReview.rating,
          publishingYear: updatedReview.publishingYear,
          genre: updatedReview.genre,
        }
      }
      const result = await reviewCollection.updateOne(filter, review, options)
      res.send(result)

    })

    // review delete
    app.delete('/review/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await reviewCollection.deleteOne(query)
      res.send(result)
    })

    // watchlist delete
    app.delete('/watchlist/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: id }
      const result = await watchlistCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Gammer')
})

app.listen(port, () => {
  console.log(`running on port ${port}`);

})