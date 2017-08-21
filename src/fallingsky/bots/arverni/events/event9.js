import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import TurnContext from 'common/turnContext';
import ArverniMarch from 'fallingsky/bots/arverni/arverniMarch';

class Event9 {
    static handleEvent(state) {
        const arverniBot = state.playersByFaction[FactionIDs.ARVERNI];
        let marchDestination = null;
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({id: 'e9-1', free: true, noSpecial: true, outOfSequence: true, context: { monsCevenna: true }}));
        const marchAction = ArverniMarch.march(state, turn.getContext());
        let commandAction = null;
        if(marchAction) {
            marchDestination = turn.getContext().context.marchDestination;
        }
        turn.popContext();
        if(marchDestination) {
            turn.pushContext(new TurnContext({id: 'e9-2', free: true, noEvent: true, outOfSequence: true, allowedRegions: [marchDestination]}));
            commandAction = arverniBot.takeTurn(state);
            turn.popContext();
        }
        return marchAction || commandAction;
    }
}

export default Event9
