// types/match.ts
export interface SetScore {
    set_number: number;
    player1_games: number;
    player2_games: number;
    // Optional: Only populated if the set went to a tiebreak (e.g., 6-6)
    // or if the final set is a 10-point match tiebreak (player1_games=1, player2_games=0)
    player1_tiebreak: number | null;
    player2_tiebreak: number | null;
}

export type ScoreJson = SetScore[];