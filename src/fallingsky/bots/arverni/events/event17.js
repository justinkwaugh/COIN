import FactionIDs from 'fallingsky/config/factionIds';

import TurnContext from 'common/turnContext';


class Event17 {
    static handleEvent(state) {
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e17',
                                             currentFactionId: FactionIDs.GERMANIC_TRIBES,
                                             free: true,
                                             noEvent: true,
                                             outOfSequence: true
                                         }));
        state.playersByFaction[FactionIDs.GERMANIC_TRIBES].takeTurn(state);
        turn.popContext();

        return true;
    }
}

export default Event17
