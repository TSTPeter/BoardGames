import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import socket from '../utils/socket';
import useGameStore from '../utils/gameStore';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 2px solid var(--renault-yellow);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(255, 204, 0, 0.2);
`;

const Title = styled.h2`
  color: var(--renault-yellow);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const RoomCode = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 2rem;

  h3 {
    color: #888;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .code {
    font-size: 2rem;
    font-weight: bold;
    color: var(--renault-yellow);
    letter-spacing: 0.2em;
  }
`;

const PlayerList = styled.div`
  margin-bottom: 2rem;
`;

const PlayerItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .name {
    font-weight: 600;
  }

  .badge {
    background: ${props => props.isAI ? '#6C5CE7' : 'var(--renault-yellow)'};
    color: ${props => props.isAI ? 'white' : 'black'};
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 15px;
  margin-bottom: 0.5rem;
  background: ${props => props.primary ? 'var(--renault-yellow)' : 'transparent'};
  color: ${props => props.primary ? 'black' : 'var(--renault-yellow)'};
  border: 2px solid var(--renault-yellow);
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${props => props.primary ? '#FFD700' : 'rgba(255, 204, 0, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Info = styled.div`
  background: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196F3;
  padding: 1rem;
  border-radius: 5px;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #ccc;
`;

function WaitingRoom() {
  const { roomId, players, isHost, playerId } = useGameStore();

  const handleStartGame = () => {
    socket.emit('startGame', { roomId });
  };

  const handleAddAI = () => {
    socket.emit('addAI', { roomId });
  };

  const canStart = players.length >= 3 && players.length <= 6;

  return (
    <Container>
      <Card
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Waiting Room</Title>

        <RoomCode>
          <h3>Room Code</h3>
          <div className="code">{roomId}</div>
        </RoomCode>

        <PlayerList>
          <h3 style={{ color: '#888', marginBottom: '1rem' }}>
            Players ({players.length}/6)
          </h3>
          {players.map(player => (
            <PlayerItem key={player.id} isAI={player.isAI}>
              <span className="name">
                {player.name}
                {player.id === playerId && ' (You)'}
              </span>
              <span className="badge">
                {player.isHost ? 'Host' : player.isAI ? 'AI' : 'Player'}
              </span>
            </PlayerItem>
          ))}
        </PlayerList>

        {isHost && (
          <>
            <Button
              primary
              onClick={handleStartGame}
              disabled={!canStart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {canStart ? 'Start Game' : `Need ${3 - players.length} more players`}
            </Button>

            {players.length < 6 && (
              <Button
                onClick={handleAddAI}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add AI Player
              </Button>
            )}

            <Info>
              💡 You need 3-6 players to start. Add AI players if needed!
            </Info>
          </>
        )}

        {!isHost && (
          <Info>
            ⏳ Waiting for host to start the game...
          </Info>
        )}
      </Card>
    </Container>
  );
}

export default WaitingRoom;
