import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import {sql} from "./config/db.js"
import{aj} from "./lib/arcjet.js"
import path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const __dirname=path.resolve();
app.use(express.json());
// app.use(helmet()); // for adding HTTP security headers
app.use(helmet({
  contentSecurityPolicy:false,
})
);
app.use(morgan("dev"));
app.use(cors());

app.use(async (req, res, next)=>{
    try {
        const decision=await aj.protect(req,{
            requested:1,
        });
        if (decision.isDenied()){
            if(decision.reason.isRateLimit()){
                res.status(429).json({error:"Too Many Requests! Please try again after some time!"});
            } else if (decision.reason.isBot()){
                res.status(403).json({error:"Bot Access Denied!"});
            }else{
                res.status(403).json({error:"Forbidden!"})
            }
            return
        }
        next(); // if it is not denied, then call the immediate next function which is productRoutes
    } catch (error) {
        console.log("Arcjet error: ", error);
        next(error);
    }
})

app.use("/api/products", productRoutes);

if (process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname,"Frontend/dist")));

  app.get(("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,"Frontend","dist","index.html"));
  }))
}
async function initDB() {
  try {
    await sql`
        CREATE TABLE IF NOT EXISTS products(
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        image TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `
    console.log("Database initialized succesfully!");
  } catch (error) {
    console.log("Error initializing DB: ", error);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
  });
});
