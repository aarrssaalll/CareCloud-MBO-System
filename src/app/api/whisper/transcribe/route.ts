import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 Whisper transcription API called');
    
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Get the audio file from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      console.error('❌ No audio file provided');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log(`🎵 Processing audio file: ${audioFile.name}, size: ${audioFile.size} bytes`);

    // Create a new File object for OpenAI (required format)
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });
    const file = new File([audioBlob], audioFile.name || 'audio.webm', {
      type: audioFile.type,
    });

    // Send to OpenAI Whisper API
    console.log('🚀 Sending to OpenAI Whisper...');
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // Set to English for better accuracy
      response_format: 'json',
      temperature: 0, // Lower temperature for more consistent results
    });

    console.log('✅ Whisper transcription successful');
    console.log(`📝 Transcribed text: "${transcription.text}"`);

    return NextResponse.json({
      success: true,
      text: transcription.text,
      confidence: 1.0, // Whisper doesn't provide confidence scores
    });

  } catch (error: any) {
    console.error('❌ Whisper transcription error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Transcription failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}