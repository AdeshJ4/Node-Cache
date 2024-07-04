const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const { faker } = require("@faker-js/faker");
const Product = require("./schema");
const morgan = require("morgan");
const NodeCache = require("node-cache");

// creating instance of nodeCache
const nodeCache = new NodeCache();

// database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then((c) => console.log("Database connected"))
  .catch((err) => console.log(err.message));

app.use(morgan("dev"));
app.use(express.json());

// get All Products
app.get("/api/products", async (req, res) => {
  try {
    let products;

    if (nodeCache.has("products")) {
      products = JSON.parse(nodeCache.get("products"));
    } else {
      products = await Product.find({});
      nodeCache.set("products", JSON.stringify(products));
    }

    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.log(err.message);
  }
});

// specific product
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    return res.status(200).json({ success: true, product });
  } catch (err) {
    console.log(err.message);
  }
});

// update product
app.put("/api/products/:id", async (req, res)=> {
  try{
    const {name, photo, price, stock, category} = req.body;
    const product = await Product.findById(req.params.id);
    if(!product) return res.status(404).send("Product Not Found");
    product.name = name;
    await product.save();
    nodeCache.del("products");  // refetch data
    return res.status(200).json({status: 'success', message: 'Updated', })
  }catch(err){
    console.log(err.message);
  }
});

// delete product
app.delete('/api/products/:id', async (req, res)=> {
  try{
    const product = await Product.findByIdAndDelete(req.params.id);
    if(!product) return res.status(404).send("Not FOund");

    nodeCache.del("products");  // refetch data
    return res.status(200).json({status: 'Success', message: 'Deleted'});

  }catch(err){
    console.log(err.message);
  }
})

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});


// logic for inserting data in database
async function generateProducts(count = 10) {
  const products = [];

  for (let i = 0; i < count; i++) {
    const newProducts = {
      name: faker.commerce.productName(),
      photo: faker.image.url(),
      price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
      stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
      category: faker.commerce.department(),
      createdAt: new Date(faker.date.past()),
      updatedAt: new Date(faker.date.recent()),
    };

    products.push(newProducts);
  }

  await Product.create(products);
  console.log("Check DB");
}
// generateProducts(5000);


// http://localhost:5000/api/products
// http://localhost:5000/api/products/66853fcb560bf964e0b8b3e5
// http://localhost:5000/api/products/:id