import TurnContext from 'common/turnContext'

class Event48 {
    static handleEvent(state,factionId) {
        const player = state.playersByFaction[factionId];
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext(
                {
                    id: 'e48',
                    free: true,
                    limited: true,
                    allowLimitedSpecial: true
                }));
        const commandAction = player.executeCommand(state, turn);
        turn.popContext();
        if (commandAction) {
            state.sequenceOfPlay.remainEligible(factionId);
            return true;
        }
        return false;
    }
}

export default Event48;