require("dotenv").config()
const sql = require("mssql")
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const cors = require("cors");
app.use(cors());
app.use(bodyParser.json())
const PORT = process.env.PORT ;
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  server: "localhost",
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
}
const pool = new sql.ConnectionPool(config)
app.get("/product", (req, res) => {
  sql.connect(config, (err) => {
    if (err) {
      console.log(`Error connecting to database: ${err}`)
      return
    }
    sql.query("SELECT * FROM tb_products", (err, result) => {
      if (err) {
        console.log(`Error executing query: ${err}`)
        return
      } else {
        res.json(result.recordset)
      }
    })
  })
})
app.get("/product/:id", (req, res) => {
  const id = req.params.id
  sql.connect(config, (err) => {
    if (err) {
      console.log(`Error connecting to database: ${err}`)
      return
    }
    sql.query(`SELECT * FROM tb_products WHERE id = ${id}`, (err, result) => {
      if (err) {
        console.log(`Error executing query: ${err}`)
        return
      } else {
        res.json(result.recordset)
      }
    })
  })
})
app.post("/add/product", (req, res) => {
  const { name, price, amount } = req.body
  pool.connect((err) => {
    if (err) {
      console.log(`Error connecting to database: ${err}`)
      return
    }
    const request = pool.request()
    const query =
      "INSERT INTO tb_products (name_product,product_price,amount) VALUES (@name,@price,@amount)"
        request.input("name", sql.NVarChar, name)
        request.input("price", sql.Int, price)
        request.input("amount", sql.Int, amount)
        request.query(query, (err, result) => {
      if (err) {
        console.log(`Error executing query: ${err}`)
        return
      }
      res.json({
        err: false,
        msg: "Product added successfully!",
        result: result,
      })
    })
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
