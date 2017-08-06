import TurnContext from 'common/turnContext'

class CommonEvent48 {
    static handleEvent(state,factionId) {
        const player = state.playersByFaction[factionId];
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext(
                {
                    id: 'e48',
                    free: true,
                    noEvent: true,
                    outOfSequence: true,
                    limited: true,
                    allowLimitedSpecial: true
                }));
        const commandAction = player.takeTurn(state, turn);
        turn.popContext();
        if (commandAction) {
            state.sequenceOfPlay.remainEligible(factionId);
            return true;
        }
        return false;
    }
}

export default CommonEvent48;