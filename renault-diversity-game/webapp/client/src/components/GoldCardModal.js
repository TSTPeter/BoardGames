import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import socket from '../utils/socket';
import useGameStore from '../utils/gameStore';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const Card = styled(motion.div)`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 3px solid var(--renault-yellow);
  border-radius: 30px;
  padding: 3rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(255, 204, 0, 0.4);

  @media (max-width: 768px) {
    padding: 2rem;
    max-height: 95vh;
  }
`;

const GoldBadge = styled.div`
  display: inline-block;
  background: var(--renault-yellow);
  color: black;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  color: var(--renault-yellow);
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Concept = styled.h2`
  color: #FFD700;
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;

  h3 {
    color: var(--renault-yellow);
    font-size: 1.2rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: '💡';
      font-size: 1.5rem;
    }
  }

  p {
    color: #ccc;
    line-height: 1.8;
    margin-bottom: 1rem;
    font-size: 1.05rem;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      color: #ddd;
      padding: 0.75rem 0;
      padding-left: 1.5rem;
      position: relative;
      line-height: 1.6;

      &::before {
        content: '→';
        position: absolute;
        left: 0;
        color: var(--renault-yellow);
        font-weight: bold;
      }
    }
  }

  @media (max-width: 768px) {
    h3 {
      font-size: 1.1rem;
    }

    p {
      font-size: 0.95rem;
    }
  }
`;

const QuestionBox = styled.div`
  background: rgba(255, 204, 0, 0.1);
  border-left: 4px solid var(--renault-yellow);
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1rem;

  ol {
    padding-left: 1.5rem;
    color: #eee;

    li {
      margin: 0.75rem 0;
      line-height: 1.6;
    }
  }
`;

const ActionSection = styled.div`
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.2) 0%, rgba(39, 174, 96, 0.1) 100%);
  border: 2px solid #27AE60;
  border-radius: 15px;
  padding: 1.5rem;
  margin-top: 2rem;

  h3 {
    color: #27AE60;
    margin-bottom: 1rem;
    font-size: 1.2rem;

    &::before {
      content: '✓';
      margin-right: 0.5rem;
    }
  }

  p {
    color: #ccc;
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled(motion.button)`
  background: var(--renault-yellow);
  color: black;
  border: none;
  padding: 1.25rem 3rem;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(255, 204, 0, 0.4);

  &:hover {
    background: #FFD700;
    box-shadow: 0 8px 25px rgba(255, 204, 0, 0.6);
  }

  @media (max-width: 768px) {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }
`;

function GoldCardModal() {
  const { goldCard, roomId, clearGoldCard } = useGameStore();

  const handleContinue = () => {
    clearGoldCard();
    socket.emit('continueAfterGoldCard', { roomId });
  };

  if (!goldCard) return null;

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <GoldBadge>🌟 GOLD CARD UNLOCKED</GoldBadge>

        <Title>{goldCard.title}</Title>
        <Concept>D&I Concept: {goldCard.concept}</Concept>

        <Section>
          <h3>Game Connection</h3>
          <p>{goldCard.gameConnection}</p>
        </Section>

        <Section>
          <h3>Key Insights</h3>
          <ul>
            {goldCard.keyInsights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </Section>

        <Section>
          <h3>Reflection Questions</h3>
          <QuestionBox>
            <ol>
              {goldCard.questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ol>
          </QuestionBox>
        </Section>

        <ActionSection>
          <h3>Take Action</h3>
          <p>{goldCard.action}</p>
        </ActionSection>

        <ButtonContainer>
          <Button
            onClick={handleContinue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue to Next Challenge
          </Button>
        </ButtonContainer>
      </Card>
    </Overlay>
  );
}

export default GoldCardModal;
