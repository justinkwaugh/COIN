import FactionIDs from 'fallingsky/config/factionIds';
import TurnContext from 'common/turnContext';


class Event46 {
    static handleEvent(state) {
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e46',
                                             free: true,
                                             noEvent: true,
                                             noSpecial: true,
                                             outOfSequence: true
                                         }));
        const effective = state.playersByFaction[FactionIDs.BELGAE].takeTurn(state);
        turn.popContext();

        if(effective) {
            state.sequenceOfPlay.remainEligible(FactionIDs.BELGAE);
        }

        return effective;
    }

}

export default Event46
