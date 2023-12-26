// import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from "next/server";
 
// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     // Process a POST request
//     console.log("THIS IS POST")
//   } else {
//     // Handle any other HTTP method
//   }
//   res.json({success: 200})
// }

export async function GET() {
  return NextResponse.json({success: "raj"});
}