
import FactionIDs from 'fallingsky/config/factionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import TurnContext from 'common/turnContext';


class Event35 {
    static handleEvent(state) {
        const turn = state.turnHistory.currentTurn;
        const firstAction = turn.pushContext(new TurnContext({
                                             id: 'e35-1',
                                             free: true,
                                             noEvent: true,
                                             noSpecial: true,
                                             outOfSequence: true,
                                             restrictedCommands: [CommandIDs.BATTLE]
                                         }));
        state.playersByFaction[FactionIDs.BELGAE].takeTurn(state);
        turn.popContext();

        turn.pushContext(new TurnContext({
                                             id: 'e35-2',
                                             free: true,
                                             noEvent: true,
                                             noSpecial: true,
                                             limited: true,
                                             outOfSequence: true,
                                             restrictedCommands: [CommandIDs.BATTLE]
                                         }));
        const secondAction = state.playersByFaction[FactionIDs.BELGAE].takeTurn(state);
        turn.popContext();

        return firstAction && secondAction;
    }

}

export default Event35;
