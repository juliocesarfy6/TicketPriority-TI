require("dotenv").config();
const express = require("express");
const cors = require("cors");

const ticketsRouter = require("./routes/tickets.routes");
const criteriosRouter = require("./routes/criterios.routes");
const evaluateRouter = require("./routes/evaluate.routes");
const resultadosRouter = require("./routes/resultados.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:4200" })); // ajustar origen si hace falta
app.use(express.json());

app.use("/api/tickets", ticketsRouter);
// app.use('/api/criterios', criteriosRouter);
// app.use('/api/evaluate', evaluateRouter);   // ✅ ruta unificada
app.use("/api/resultados", resultadosRouter);

app.use("/api/criteria", criteriosRouter);

app.use("/api/evaluate", evaluateRouter);
app.get("/", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
