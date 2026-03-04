import { Button, Input } from 'antd';
import { Loader2, Mic, Square } from 'lucide-react';

import styles from '@/assets/styles/components/expense/expense-input.module.scss';

interface IProps {
  inputValue: string;
  isListening: boolean;
  isSpeechSupported: boolean;
  isTranscribing: boolean;
  onMicClick: () => void;
  onSubmit: () => void;
  setInputValue: (value: string) => void;
}

export const ExpenseQuickInput: React.FC<IProps> = ({
  inputValue,
  isListening,
  isSpeechSupported,
  isTranscribing,
  onMicClick,
  onSubmit,
  setInputValue,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={styles['quick-input__wrapper']}>
      <div className={styles['quick-input__field']}>
        <Input
          autoFocus
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="cf 25k, ăn trưa 50k..."
          size="large"
          value={inputValue}
        />
      </div>
      {isSpeechSupported && (
        <Button
          className={`${styles['quick-input__mic-btn']} ${
            isListening ? styles['quick-input__mic-btn--listening'] : ''
          } ${isTranscribing ? styles['quick-input__mic-btn--transcribing'] : ''}`}
          disabled={isTranscribing}
          onClick={onMicClick}
          type={isListening || isTranscribing ? 'primary' : 'default'}
        >
          {isTranscribing ? (
            <Loader2 className={styles['quick-input__spinner']} size={16} />
          ) : isListening ? (
            <Square size={16} />
          ) : (
            <Mic size={16} />
          )}
        </Button>
      )}
    </div>
  );
};
