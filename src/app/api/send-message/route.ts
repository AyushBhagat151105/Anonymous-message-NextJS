/* eslint-disable @typescript-eslint/no-unused-vars */
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User Not Found",
        },
        {
          status: 404,
        }
      );
    }

    //   is user accepting the messages
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is Not acceptng the messages",
        },
        {
          status: 403, // Internal Server Error
        }
      );
    }

    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      {
        status: 200, // Internal Server Error
      }
    );
  } catch (error) {
    console.log("Error adding messages: ", error);

    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500, // Internal Server Error
      }
    );
  }
}
