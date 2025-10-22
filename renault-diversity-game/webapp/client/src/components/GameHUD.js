import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../utils/socket';
import useGameStore from '../utils/gameStore';

const HUDContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
`;

const TopBar = styled.div`
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  pointer-events: all;

  @media (max-width: 768px) {
    top: 50px;
    flex-direction: column;
    gap: 10px;
  }
`;

const InfoPanel = styled(motion.div)`
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid var(--renault-yellow);
  border-radius: 15px;
  padding: 1rem 1.5rem;
  color: white;
  min-width: 200px;

  h3 {
    color: var(--renault-yellow);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    min-width: unset;
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const PlayerChip = styled.div`
  background: ${props => props.active ? 'var(--renault-yellow)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? 'black' : 'white'};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .tricks {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
  }
`;

const BottomBar = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0 20px;
  pointer-events: all;

  @media (max-width: 768px) {
    bottom: 10px;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ActionButton = styled(motion.button)`
  background: var(--renault-yellow);
  color: black;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 204, 0, 0.4);

  &:hover {
    background: #FFD700;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
`;

const SecondaryButton = styled(motion.button)`
  background: transparent;
  color: var(--renault-yellow);
  border: 2px solid var(--renault-yellow);
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: rgba(255, 204, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
`;

const ChallengeCard = styled(motion.div)`
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid var(--renault-yellow);
  border-radius: 20px;
  padding: 1.5rem 2rem;
  max-width: 500px;
  text-align: center;
  pointer-events: all;

  h2 {
    color: var(--renault-yellow);
    margin-bottom: 0.5rem;
  }

  .scenario {
    color: #ccc;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .condition {
    background: rgba(255, 204, 0, 0.1);
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid var(--renault-yellow);
  }

  @media (max-width: 768px) {
    top: 50px;
    max-width: 90%;
    padding: 1rem 1.5rem;

    h2 {
      font-size: 1.2rem;
    }

    .scenario {
      font-size: 0.8rem;
    }
  }
`;

const AbilityPanel = styled(motion.div)`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid ${props => props.color || 'var(--renault-yellow)'};
  border-radius: 15px;
  padding: 1.5rem;
  max-width: 250px;
  pointer-events: all;

  h3 {
    color: ${props => props.color || 'var(--renault-yellow)'};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.2rem;
  }

  p {
    color: #ccc;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    right: 10px;
    max-width: 200px;
    padding: 1rem;

    h3 {
      font-size: 1rem;
    }

    p {
      font-size: 0.8rem;
    }
  }
`;

function GameHUD() {
  const {
    roomId,
    selectedCard,
    currentPlayer,
    playerId,
    myHand,
    tricksWon,
    currentChallenge,
    showChallenge,
    setShowChallenge,
    myAbility,
    abilityUsed,
    showAbility,
    setShowAbility,
    players
  } = useGameStore();

  const isMyTurn = currentPlayer && currentPlayer.id === playerId;

  const handlePlayCard = () => {
    if (selectedCard !== null && isMyTurn) {
      socket.emit('playCard', { roomId, cardIndex: selectedCard });
    }
  };

  const handleUseAbility = () => {
    if (myAbility && !abilityUsed) {
      socket.emit('useAbility', { roomId, abilityData: {} });
    }
  };

  return (
    <HUDContainer>
      {/* Top Bar - Game Info */}
      <TopBar>
        <InfoPanel
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Room: {roomId}</h3>
          <p>Challenge {currentChallenge?.id || 1}: {currentChallenge?.title || 'Loading...'}</p>
          <p>Difficulty: {'⭐'.repeat(currentChallenge?.difficulty || 1)}</p>
        </InfoPanel>

        <InfoPanel
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Players</h3>
          <PlayerInfo>
            {tricksWon.map((player) => {
              const isActive = currentPlayer?.id === player.playerId;
              return (
                <PlayerChip key={player.playerId} active={isActive}>
                  {player.playerName}
                  <span className="tricks">{player.count}</span>
                </PlayerChip>
              );
            })}
          </PlayerInfo>
        </InfoPanel>
      </TopBar>

      {/* Challenge Card */}
      <AnimatePresence>
        {showChallenge && currentChallenge && (
          <ChallengeCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h2>{currentChallenge.title}</h2>
            <div className="scenario">{currentChallenge.scenario}</div>
            <div className="condition">
              <strong>Goal:</strong> {currentChallenge.winCondition}
            </div>
            <SecondaryButton
              onClick={() => setShowChallenge(false)}
              style={{ marginTop: '1rem' }}
            >
              Close
            </SecondaryButton>
          </ChallengeCard>
        )}
      </AnimatePresence>

      {/* Player Ability */}
      <AnimatePresence>
        {showAbility && myAbility && (
          <AbilityPanel
            color={myAbility.color}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <h3>
              <span>{myAbility.symbol}</span>
              {myAbility.name}
            </h3>
            <p><strong>{myAbility.title}</strong></p>
            <p>{myAbility.description}</p>
            <ActionButton
              onClick={handleUseAbility}
              disabled={abilityUsed}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {abilityUsed ? 'Used' : 'Use Ability'}
            </ActionButton>
            <SecondaryButton
              onClick={() => setShowAbility(false)}
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              Close
            </SecondaryButton>
          </AbilityPanel>
        )}
      </AnimatePresence>

      {/* Bottom Bar - Actions */}
      <BottomBar>
        {!showChallenge && (
          <SecondaryButton
            onClick={() => setShowChallenge(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Show Challenge
          </SecondaryButton>
        )}

        {myAbility && !showAbility && (
          <SecondaryButton
            onClick={() => setShowAbility(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {myAbility.symbol} My Ability
          </SecondaryButton>
        )}

        {isMyTurn && (
          <ActionButton
            onClick={handlePlayCard}
            disabled={selectedCard === null}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {selectedCard !== null ? 'Play Selected Card' : 'Select a Card'}
          </ActionButton>
        )}

        {!isMyTurn && (
          <InfoPanel style={{ pointerEvents: 'none' }}>
            <p>Waiting for {currentPlayer?.name}...</p>
          </InfoPanel>
        )}
      </BottomBar>
    </HUDContainer>
  );
}

export default GameHUD;
