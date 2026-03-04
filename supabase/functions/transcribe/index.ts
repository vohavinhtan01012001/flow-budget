import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    // Verify auth — create client with user's JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Parse FormData
    const formData = await req.formData();
    const audioFile = formData.get('file');
    const language = (formData.get('language') as string) || 'vi';

    if (!audioFile || !(audioFile instanceof File)) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 10MB limit
    if (audioFile.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 413,
      });
    }

    // Send to Groq Whisper API
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: 'Transcription service not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }

    const groqFormData = new FormData();
    groqFormData.append('file', audioFile, audioFile.name || 'audio.webm');
    groqFormData.append('model', 'whisper-large-v3');
    groqFormData.append('language', language);
    groqFormData.append('response_format', 'json');

    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      {
        body: groqFormData,
        headers: { Authorization: `Bearer ${groqApiKey}` },
        method: 'POST',
      },
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Transcription failed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502,
        },
      );
    }

    const result = await groqResponse.json();

    return new Response(
      JSON.stringify({ transcript: result.text }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Transcribe function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
