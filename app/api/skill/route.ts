// app/api/skill/route.ts

import { prismaClient } from "@/utils/constants"; // Ensure this is the correct path
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

// GET request handler
export async function GET(req: NextApiRequest) {
  try {
    const data = await prismaClient.skill.findMany();
    return NextResponse.json(
      { skills: data, length: data.length },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error fetching skills: " + error.message,
      },
      { status: 500 }
    );
  }
}

// POST request handler
export async function POST(req: NextApiRequest) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    let data = await req.body;
    data = await JSON.parse(data);


    if (!data || !data.name) {
      return NextResponse.json(
        { message: "Invalid data: 'name' field is required" },
        { status: 404 }
      );
    }

    const response = await prismaClient.skill.create({ data });
    console.log("Response: ", response.name);
    return NextResponse.json({ skills: response }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      {
        message: "Error creating skill: " + error.message,
      },
      { status: 400 }
    );
  }
}
