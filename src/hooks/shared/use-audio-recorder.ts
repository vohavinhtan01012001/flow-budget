interface IAudioRecorderHook {
  error: null | string;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
}

const MAX_DURATION_MS = 15_000;

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return 'audio/webm;codecs=opus';
  }
  if (MediaRecorder.isTypeSupported('audio/mp4')) {
    return 'audio/mp4';
  }
  if (MediaRecorder.isTypeSupported('audio/webm')) {
    return 'audio/webm';
  }
  return '';
}

export const useAudioRecorder = (): IAudioRecorderHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null);
  const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(
    null,
  );

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError('Trình duyệt không hỗ trợ ghi âm');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setIsRecording(false);
        if (resolveStopRef.current) {
          resolveStopRef.current(blob);
          resolveStopRef.current = null;
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);

      // Auto-stop after max duration
      timerRef.current = setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === 'recording'
        ) {
          mediaRecorderRef.current.stop();
        }
      }, MAX_DURATION_MS);
    } catch (err) {
      cleanup();
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Vui lòng cấp quyền microphone');
      } else {
        setError('Không thể truy cập microphone');
      }
    }
  }, [cleanup]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state !== 'recording'
      ) {
        resolve(null);
        return;
      }

      resolveStopRef.current = resolve;
      mediaRecorderRef.current.stop();
    });
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return { error, isRecording, startRecording, stopRecording };
};
