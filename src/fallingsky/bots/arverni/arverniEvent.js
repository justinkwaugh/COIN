import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';


const NoEvents = [];
const Auto1to4 = [];
const EventHandlers = {

};

class ArverniEvent {

    static handleEvent(state) {
        const currentCard = state.currentCard();
        if (_.indexOf(NoEvents, currentCard.id) >= 0) {
            return false;
        }

        if (_.indexOf(Auto1to4, currentCard.id) < 0 && _.random(1,6) > 4) {
            return false;
        }

        const eventHandler = EventHandlers[currentCard.id];
        if (!eventHandler) {
            return false;
        }

        return eventHandler.handleEvent(state);
    }

}

export default ArverniEvent;