import Bot from './bot';
import FactionIDs from '../config/factionIds';

class RomanBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.ROMANS});
    }

    takeTurn(currentState) {
        const action = currentState.sequenceOfPlay.availableActions()[0];
        currentState.sequenceOfPlay.recordFactionAction(FactionIDs.ROMANS, action);
    }

    willHarass(factionId) {
        return factionId === FactionIDs.ARVERNI;
    }

    willAgreeToSupplyLine(factionId) {
        return factionId === FactionIDs.AEDUI;
    }

    handleEvent(state, currentCard) {

    }
}

export default RomanBot;
