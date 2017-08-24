import TurnContext from 'common/turnContext';
import ArverniBattle from 'fallingsky/bots/arverni/arverniBattle';
import FactionIDs from 'fallingsky/config/factionIds';
import CommandIDs from 'fallingsky/config/commandIds';

class Event36 {
    static handleEvent(state) {
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e36',
                                             free: true,
                                             context: {
                                                 shadedMorasses: true
                                             }
                                         }));
        const battleAction = ArverniBattle.battle(state, turn.getContext());
        turn.popContext();

        turn.pushContext(new TurnContext({
                                             id: 'e36-2',
                                             free: true,
                                             noEvent: true,
                                             outOfSequence: true,
                                             noSpecial: true,
                                             allowedCommands: [CommandIDs.MARCH]
                                         }));
        const marchAction = state.playersByFaction[FactionIDs.ARVERNI].takeTurn(state, turn.getContext());
        turn.popContext();

        return battleAction || marchAction;
    }
}

export default Event36
