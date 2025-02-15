// src/pages/api/subscribe.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  try {
    await addDoc(collection(db, "waitlist"), {
      email,
      subscribedAt: new Date().toISOString()
    });

    res.status(200).json({ message: "Successfully subscribed" });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: "Failed to subscribe" });
  }
}
