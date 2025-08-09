import { sql } from "../config/db.js";

export const getProducts= async (req,res)=>{
    try {
        const products= await sql`
        SELECT * FROM products
        ORDER BY created_at DESC
        `
        console.log("Fetched Products", products);
        res.status(200).json({success:true, data:products});
    } catch (error) {
        console.log("Error fetching products: " , error);
        res.status(500).json({success:false, message:"Internal Server Error"});
    }
};
export const createProduct=async(req,res)=>{
    const {name, image, price}=req.body;
    const newProduct=await sql `
    INSERT INTO products (name,price,image)
    VALUES (${name},${price},${image})
    RETURNING *
    `
    res.status(201).json({success:true, data:newProduct[0]})
};
export const getProduct=async(req,res)=>{
    const {id}=req.params;
    try {
        const product=await sql `
        SELECT * FROM PRODUCTS WHERE id=${id}
        `
        res.status(200).json({success:true, data:product[0]});

        
    } catch (error) {
        console.log("Error fetching product: ", error);
        res.status(500).json({success:false,message:"Internal server error!"})
    }
    
};
export const deleteProduct=async(req,res)=>{
    const {id}=req.params;
    
    try {
        const deleteProduct=await sql `
    DELETE FROM products WHERE id=${id} 
    RETURNING *`
    if(deleteProduct.length===0){
        res.status(404).json({success:false, message:"Product does not exist!"});
    }
    res.status(201).json({success:true,data:deleteProduct[0]});
    } catch (error) {
        res.status(500).json({success:false, message:"Internal Server Error!"})
    }
};

export const updateProduct=async(req,res)=>{
    const {id}=req.params;
    const {name,price,image}=req.body;
    if (!name || !price || !image) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
    try {
        const updatedProduct=await sql`
        UPDATE products
        SET name=${name}, price=${price}, image=${image}
        WHERE id=${id}
        RETURNING *`;
        if(updatedProduct.length===0){
            console.log("No such product found!")
            res.status(404).json({success:false, message:"Product not found!"})
        }
        res.status(200).json({success:true, data:updatedProduct[0]});
    } catch (error) {
        console.log("Error updating product: ", error);
        res.status(500).send("Internal Server error!")
    }
};