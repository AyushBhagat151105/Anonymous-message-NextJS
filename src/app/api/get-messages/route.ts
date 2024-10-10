/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";
import { log } from "console";

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenitcated",
      },
      {
        status: 401, // Internal Server Error
      }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    const user = await UserModel.aggregate([
      { $match: { id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", $messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404, // Internal Server Error
        }
      );
    }

    return Response.json(
      {
        success: true,
        messages: user[0].messages,
      },
      {
        status: 200, // Internal Server Error
      }
    );
  } catch (error) {
    console.log("An unexpected error occured: ", error);

    return Response.json(
      {
        success: false,
        message: "Not Authenitcated",
      },
      {
        status: 500, // Internal Server Error
      }
    );
  }
}
