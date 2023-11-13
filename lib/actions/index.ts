"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDatabase } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    connectToDatabase();
    const scrappedProduct = await scrapeAmazonProduct(productUrl);
    if (!scrappedProduct) return;

    // Save to Database
    let product = scrappedProduct;
    const existingProduct = await Product.find({ url: scrappedProduct.url });

    if (existingProduct.length > 0) {
      const updatedPriceHistory: any = [
        ...existingProduct[0].priceHistory,
        { price: scrappedProduct.currentPrice },
      ];

      product = {
        ...scrappedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    // Create or update the product
    const newProduct = await Product.findOneAndUpdate(
      { url: scrappedProduct.url },
      product,
      { upsert: true, new: true }
    );
    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDatabase();
    const product = await Product.findOne({ _id: productId });
    if (!product) return null;
    return product;
  } catch (error) {
    console.error(error);
  }
}

export async function getAllProducts() {
  try {
    connectToDatabase();
    const allProducts = await Product.find();
    return allProducts;
  } catch (error) {
    console.log(error);
  }
}
export async function getSimilarProducts(productId: string) {
  try {
    connectToDatabase();

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);
    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

/// NODEMAILER EMAIL PRODUCTS

export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
) {
  try {
    //Send first email
    const product = await Product.findById(productId);
    if (!product) return;

    //if user exists
    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );

    if (!userExists) {
      product.users.push({ email: userEmail });
      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");
      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.error(error);
  }
}
