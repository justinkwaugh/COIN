import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';

import Event8 from './events/event8';
import Event10 from './events/event10';
import Event12 from './events/event12';
import Event13 from './events/event13';
import Event15 from './events/event15';
import Event27 from './events/event27';
import Event30 from './events/event30';
import Event38 from './events/event38';
import Event55 from './events/event55';
import Event59 from './events/event59';
import Event63 from './events/event63';

const NoEvents = [47,53,43,48,35,54,28,20,39,69,29,51];
const CapabilityEvents = [8,10,12,13,15,27,30,38,55,59,63];
const EventHandlers = {
    8: Event8,
    10: Event10,
    12: Event12,
    13: Event13,
    15: Event15,
    27: Event27,
    30: Event30,
    38: Event38,
    55: Event55,
    59: Event59,
    63: Event63
};

class RomanEvent {

    static handleEvent(state) {
        const currentCard = state.currentCard();
        console.log('*** Is Roman No Event? ***');
        if (_.indexOf(NoEvents, currentCard.id) >= 0) {
            return false;
        }

        console.log('*** Is Capability in final year? ***');
        if(state.isLastYear() && _.indexOf(CapabilityEvents, currentCard.id) >= 0) {
            return false;
        }

        console.log('*** Is Event effective? ***');
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

export default RomanEvent;