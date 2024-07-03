import express from "express";
import pg from "pg";

const app = express();
app.use(express.json());

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_icecreamshop_db"
);

const PORT = process.env.PORT || 3000;

app.get("/api/scoops", async (req, res, next) => {
  try {
    const response = await client.query("SELECT * FROM scoops");
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/scoops/:id", async (req, res, next) => {
  try {
    const response = await client.query("SELECT * FROM scoops WHERE id = $1", [
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.post("/api/scoops", async (req, res, next) => {
  try {
    const response = await client.query(
      "INSERT INTO scoops(name, price) VALUES($1, $2) RETURNING *",
      [req.body.name, req.body.price]
    );
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.put("/api/scoops/:id", async (req, res, next) => {
  try {
    const response = await client.query(
      "UPDATE scoops SET name = $1, price = $2 WHERE id = $3 RETURNING *",
      [req.body.name, req.body.price, req.params.id]
    );
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/scoops/:id", async (req, res, next) => {
  try {
    const response = await client.query(
      "DELETE FROM scoops WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  res.status(500).send({ error: error.message });
});

const syncAndListen = async () => {
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS scoops(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(5, 2) NOT NULL
      );
    `);
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  } catch (error) {
    console.error(error);
  }
};

syncAndListen();
