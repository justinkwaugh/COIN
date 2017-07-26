import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';

import Event8 from './events/event8';
import Event12 from './events/event12';
import Event13 from './events/event13';
import Event15 from './events/event15';
import Event25 from './events/event25';
import Event27 from './events/event27';
import Event30 from './events/event30';
import Event38 from './events/event38';
import Event39 from './events/event39';
import Event43 from './events/event43';
import Event59 from './events/event59';
import Event63 from './events/event63';

const NoEvents = [10,61,47,4,55,64,60,54,66];
const CapabilityEvents = [8,12,13,15,25,27,30,38,39,43,59,63];
const Auto1to4 = [7,13,14,5,59,15,2,33,19,27,3,23,24,21,30];

const EventHandlers = {
    8: Event8,
    12: Event12,
    13: Event13,
    15: Event15,
    25: Event25,
    27: Event27,
    30: Event30,
    38: Event38,
    39: Event39,
    43: Event43,
    59: Event59,
    63: Event63
};

class ArverniEvent {

    static handleEvent(state) {
        const currentCard = state.currentCard();
        console.log('*** Is Arverni No Event? ***');
        if (_.indexOf(NoEvents, currentCard.id) >= 0) {
            return false;
        }

        console.log('*** Is Capability in final year? ***');
        if(state.isLastYear() && _.indexOf(CapabilityEvents, currentCard.id) >= 0) {
            return false;
        }

        if (_.indexOf(Auto1to4, currentCard.id) < 0 && _.random(1,6) > 4) {
            return false;
        }

        const eventHandler = EventHandlers[currentCard.id];
        if (!eventHandler) {
            return false;
        }

        state.turnHistory.getCurrentTurn().startEvent(currentCard.id);
        const handled = eventHandler.handleEvent(state);
        if(!handled) {
            state.turnHistory.getCurrentTurn().rollbackEvent();
        }
        else {
            state.turnHistory.getCurrentTurn().commitEvent();
        }

        return handled;
    }

}

export default ArverniEvent;