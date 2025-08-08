import {create} from "zustand";
import axios from "axios";
import React from 'react'

const BASE_URL="http://localhost:3000"

export const useProductStore=create((set,get)=>({
  products:[],
  loading:false,
  error:null,

  //form state
  formData:{
    name:"",
    price:"",
    image:""
  },
  setFormData:(formData)=>set({formData}),
  resetForm:(formData)=>set({formData:{name:"", price:"",image:""}}),
  
  addProduct:async(e)=>{
    e.preventDefault();
    set({loading:true});
    
    try {
      const form=get();
      await axios.post(`${BASE_URL}/api/products`,get().formData);
      await get().fetchProducts();
      get().resetForm();
      toast.success("Product added succesfully!")
      document.getElementById("add_product_modal").close();
    } catch (error) {
      console.log("Error in adding product: ",error);
      toast.error("Something went wrong!")
    } finally{
      set({loading:false});
    }
  },

  fetchProducts:async()=>{
    set({loading:true});
    try {
        const response= await axios.get(`${BASE_URL}/api/products`)
        set({products: response.data.data,error:null})
    } catch (error) {
        if(error.status===429) set({error:"Rate Limit exceeded!", products:[]});
        else set({error:"Something went wrong!", products:[]});
    } finally{
        set({loading:false})
    }
  },
  deleteProduct:async(id)=>{
    set({loading:true});
    try {
      await axios.delete(`${BASE_URL}/api/products/${id}`);
      set((prev)=>({products: prev.products.filter((product)=>product.id!==id)}));
      toast.success("Product deleted Succesfully");
    } catch (error) {
      console.log("Error in deleteProduct", error);
      toast.error("Something went wrong!")
    } finally{
      set({loading:false});
    }
  }
  
}));


