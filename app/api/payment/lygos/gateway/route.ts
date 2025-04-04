import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const LYGOS_API_URL = process.env.LYGOS_API_URL! as string
const LYGOS_API_KEY = process.env.LYGOS_API_KEY! as string 

export async function POST(req: Request) {
    try {
        const order_id = uuidv4();
        const { amount, message } = await req.json();

        if (!amount || !message) {
            return NextResponse.json(
                { error: "Amount and message are required" },
                { status: 400 }
            );
        }

        const payload = {
            amount,
            shop_name: 'ReachDem',
            message,
            order_id
        };

        const response = await fetch(LYGOS_API_URL, {
            method: 'POST',
            headers: {
                'api-key': LYGOS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: "Payment initiation failed", details: data.detail },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            payment_link: data.link,
            order_id
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}