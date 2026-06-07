"use client";

import { supabase } from "./supabase";

export interface NewsletterResult {
  success: boolean;
  message: string;
}

export async function subscribeToNewsletterClient(email: string): Promise<NewsletterResult> {
  if (!email || !email.includes("@")) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  try {
    const { error } = await supabase
      .from("insiders_newsletter")
      .insert([{ email: email.trim().toLowerCase() }]);

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          message: "You're already on our list!",
        };
      }
      console.error("Supabase error:", error);
      return {
        success: false,
        message: "Something went wrong. Please try again.",
      };
    }

    return {
      success: true,
      message: "Welcome to the inner circle.",
    };
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
