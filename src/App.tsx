import { useState, useEffect } from 'react';

// --- 型定義 ---
type GameState = 'IDLE' | 'PLAYING' | 'CLEAR';

type CardChars = '🐣️' | '🦝️' | '🐓️' | '🦊️' | '🐖️' | '🦓️' | '🐧️' | '🐏️';

interface CardType {
    id: number;
    value: CardChars;
    isFlipped: boolean;
    isMatched: boolean;
}

function App() {
    // --- 状態管理 (State) ---
    const [state, setState] = useState<GameState>('IDLE');
    const [cards, setCards] = useState<CardType[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [isLocked, setIsLocked] = useState<boolean>(false);

    // --- カードのシャッフル・初期化 ---
    const initializeGame = () => {
        const cardPictures: CardChars[] = [
            '🐣️', '🐣️', '🦝️', '🦝️', '🐓️', '🐓️', '🦊️', '🦊️',
            '🐖️', '🐖️', '🦓️', '🦓️', '🐧️', '🐧️', '🐏️', '🐏️'
        ];
        
        const array = [...cardPictures];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        const initialCards: CardType[] = array.map((char, index) => ({
            id: index,
            value: char,
            isFlipped: false,
            isMatched: false
        }));

        setCards(initialCards);
        setFlippedIndices([]);
        setIsLocked(false);
    };

    // --- ゲーム開始ボタン ---
    const gameStart = () => {
        initializeGame();
        setState('PLAYING');
    };

    // --- カードクリック時の処理 ---
    const handleCardClick = (clickedIndex: number) => {
        if (isLocked) return;
        if (cards[clickedIndex].isFlipped || cards[clickedIndex].isMatched) return;

        const newFlipped = [...flippedIndices, clickedIndex];

        // 2枚目がめくられた瞬間、クリックイベント内でロックをかける
        if (newFlipped.length === 2) {
            setIsLocked(true);
        }

        const updatedCards = [...cards];
        updatedCards[clickedIndex].isFlipped = true;
        setCards(updatedCards);
        setFlippedIndices(newFlipped);
    };

    useEffect(() => {
        if (flippedIndices.length !== 2) return;

        const [firstIdx, secondIdx] = flippedIndices;

        if (cards[firstIdx].value === cards[secondIdx].value) {
            // 【アタリ】ペア成立
            const timer = setTimeout(() => {
                setCards(prevCards => {
                    const nextCards = [...prevCards];
                    nextCards[firstIdx].isMatched = true;
                    nextCards[secondIdx].isMatched = true;

                    const isAllMatched = nextCards.every(card => card.isMatched);
                    if (isAllMatched) {
                        // 非同期のタイマー内。ここでsetStateを呼んでも安全。
                        setState('CLEAR');
                    }

                    return nextCards;
                });
                
                setFlippedIndices([]);
                setIsLocked(false);
            }, 500);

            return () => clearTimeout(timer);
        } else {
            // 【ハズレ】裏に戻す
            const timer = setTimeout(() => {
                setCards(prevCards => {
                    const nextCards = [...prevCards];
                    nextCards[firstIdx].isFlipped = false;
                    nextCards[secondIdx].isFlipped = false;
                    return nextCards;
                });
                setFlippedIndices([]);
                setIsLocked(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [flippedIndices, cards]);


    // --- インラインスタイル ---
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        padding: '20px'
    };

    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        maxWidth: '400px',
        width: '100%',
        marginTop: '20px'
    };

    const cardStyle = (card: CardType): React.CSSProperties => {
        const isOpen = card.isFlipped || card.isMatched;
        return {
            aspectRatio: '1 / 1',
            backgroundColor: card.isMatched ? '#2e7d32' : isOpen ? '#ffffff' : '#333333',
            color: isOpen ? '#000000' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            borderRadius: '8px',
            cursor: isOpen || isLocked ? 'default' : 'pointer',
            border: card.isMatched ? '2px solid #4caf50' : '2px solid #555555',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            transition: 'background-color 0.2s, transform 0.1s',
            userSelect: 'none'
        };
    };

    const buttonStyle: React.CSSProperties = {
        padding: '12px 24px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        backgroundColor: '#00bcd4',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        marginTop: '20px'
    };

    return (
        <div style={containerStyle}>
            <h1>動物神経衰弱 (4 × 4)</h1>

            {state === 'IDLE' && (
                <div>
                    <button style={buttonStyle} onClick={gameStart}>ゲームスタート</button>
                </div>
            )}

            {state === 'PLAYING' && (
                <div style={gridStyle}>
                    {cards.map((card, index) => (
                        <div
                            key={card.id}
                            style={cardStyle(card)}
                            onClick={() => handleCardClick(index)}
                        >
                            {(card.isFlipped || card.isMatched) ? card.value : '？'}
                        </div>
                    ))}
                </div>
            )}

            {state === 'CLEAR' && (
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: '#4caf50', fontSize: '2.5rem', margin: '20px 0' }}>🎉 CLEAR!! 🎉</h2>
                    <p>すべての動物のペアが見つかりました！</p>
                    <button style={buttonStyle} onClick={gameStart}>もう一度遊ぶ</button>
                </div>
            )}
        </div>
    );
}

export default App;