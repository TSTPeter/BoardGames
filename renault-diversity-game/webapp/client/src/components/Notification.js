import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../utils/gameStore';

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 90px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;

  @media (max-width: 768px) {
    top: auto;
    bottom: 80px;
    right: 10px;
    left: 10px;
    max-width: unset;
  }
`;

const NotificationBox = styled(motion.div)`
  background: ${props => {
    switch (props.type) {
      case 'success': return 'linear-gradient(135deg, #27AE60 0%, #229954 100%)';
      case 'danger': return 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)';
      case 'warning': return 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)';
      case 'info': return 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)';
      default: return 'linear-gradient(135deg, var(--renault-yellow) 0%, #FFD700 100%)';
    }
  }};
  color: white;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(10px);

  .icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .message {
    flex: 1;
    font-weight: 500;
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;

    .message {
      font-size: 0.9rem;
    }
  }
`;

const icons = {
  success: '✓',
  danger: '⚠',
  warning: '⚡',
  info: 'ℹ',
  default: '🎮'
};

function Notification() {
  const { notification, clearNotification } = useGameStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  return (
    <AnimatePresence>
      {notification && (
        <NotificationContainer>
          <NotificationBox
            type={notification.type}
            initial={{ opacity: 0, x: 100, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <span className="icon">
              {icons[notification.type] || icons.default}
            </span>
            <span className="message">
              {notification.message}
            </span>
          </NotificationBox>
        </NotificationContainer>
      )}
    </AnimatePresence>
  );
}

export default Notification;
