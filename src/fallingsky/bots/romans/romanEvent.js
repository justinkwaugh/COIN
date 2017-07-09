import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';

const NoEvents = [];
const CapabilityEvents = [8,10,12,13,15,25,27,30,38,39,43,55,59,63];
const EventHandlers = {};

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