const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes');

app.use(cors({
  origin: [
    "https://link-do-seu-front-end-hospedado"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true 
}));

app.use(express.json());
app.use(routes);

app.listen(3000, () => {
    console.log("Server em funcionamento.");
});
