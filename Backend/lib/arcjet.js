import arcjet, { tokenBucket, detectBot, shield } from "@arcjet/node";
import dotenv from "dotenv";
dotenv.config();

export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics:["ip.src"],
  rules: [
    //Description from docs:-
    // Shield protects your app from common attacks e.g. SQL injection
    // DRY_RUN mode logs only. Use "LIVE" to block
    shield({
      mode: "LIVE",
    }),

    //bot protection 
    detectBot({
        mode:"LIVE",
        allow:[
            "CATEGORY:SEARCH_ENGINE",//Index data for search engines like google, bing, etc.
            "UA:PostmanRuntime/7.45.0", //Allow Postman Requests 
            "IP:127.0.0.1" //Allow localhost
        ]
        //allowing only search engine bots while blocking the rest
    }),
    
    //Rate limiting
    tokenBucket({
        mode:"LIVE",
        refillRate:30,
        interval:5,
        capacity:20
    })
  ],
});
