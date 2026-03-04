import { message } from 'antd';

import { useAudioRecorder } from '@/hooks/shared/use-audio-recorder';
import { supabase } from '@/libs/supabase/client';

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
    length: number;
  };
}

interface ISpeechRecognitionHook {
  isListening: boolean;
  isSupported: boolean;
  isTranscribing: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

// iOS Safari has webkitSpeechRecognition in window but it doesn't
// actually work — detect iOS/iPadOS and exclude it
const isIOS =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document));

const hasWebSpeechAPI =
  typeof window !== 'undefined' &&
  !isIOS &&
  ('SpeechRecognition' in window ||
    'webkitSpeechRecognition' in window);

const hasMediaRecorder =
  typeof window !== 'undefined' &&
  'MediaRecorder' in window &&
  typeof navigator.mediaDevices?.getUserMedia === 'function';

async function sendToCloud(blob: Blob): Promise<string> {
  const formData = new FormData();

  // Determine file extension from MIME type
  const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
  formData.append('file', blob, `recording.${ext}`);
  formData.append('language', 'vi');

  const { data, error } = await supabase.functions.invoke('transcribe', {
    body: formData,
  });

  if (error) throw error;
  return data.transcript;
}

export const useSpeechRecognition = (): ISpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const {
    error: recorderError,
    isRecording,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const isSupported = hasWebSpeechAPI || hasMediaRecorder;

  // Show recorder errors as toast
  useEffect(() => {
    if (recorderError) {
      message.error(recorderError);
    }
  }, [recorderError]);

  // Sync recorder isRecording → isListening
  useEffect(() => {
    setIsListening(isRecording);
  }, [isRecording]);

  const startCloud = useCallback(async () => {
    setTranscript('');
    await startRecording();
  }, [startRecording]);

  const stopCloud = useCallback(async () => {
    const blob = await stopRecording();
    if (!blob) return;

    setIsTranscribing(true);
    try {
      const text = await sendToCloud(blob);
      if (text) setTranscript(text);
    } catch {
      message.error('Không thể nhận dạng giọng nói');
    } finally {
      setIsTranscribing(false);
    }
  }, [stopRecording]);

  const startNative = useCallback(() => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setTranscript('');
    } catch {
      // Web Speech API failed — fallback to cloud
      if (hasMediaRecorder) {
        startCloud();
      } else {
        message.error(
          'Trình duyệt không hỗ trợ nhận dạng giọng nói',
        );
      }
    }
  }, [startCloud]);

  const startListening = useCallback(() => {
    if (hasWebSpeechAPI) {
      startNative();
    } else {
      startCloud();
    }
  }, [startNative, startCloud]);

  const stopListening = useCallback(() => {
    if (hasWebSpeechAPI) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    } else {
      stopCloud();
    }
  }, [stopCloud]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    isTranscribing,
    startListening,
    stopListening,
    transcript,
  };
};
