import { NextRequest, NextResponse } from 'next/server';
import PinataClient from '@pinata/sdk';

export async function POST(req: NextRequest) {
  console.log('Received request to upload to IPFS');

  const pinata = new PinataClient({ pinataJWTKey: process.env.PINATA_JWT });

  try {
    const body = await req.json();
    console.log('Request body:', body);
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const postJson = {
        title,
        content
    }

    const options = {
        pinataMetadata: {
            name: `${title.replace(/\s/g, '-')}.json`,
        },
    };

    console.log('Uploading to Pinata...');
    const result = await pinata.pinJSONToIPFS(postJson, options);
    console.log('Successfully pinned to IPFS:', result);

    return NextResponse.json({ cid: result.IpfsHash }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return NextResponse.json({ error: 'Failed to upload to IPFS' }, { status: 500 });
  }
} 