import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';


const NoEvents = [];
const EventHandlers = {

};

class BelgaeEvent {

    static handleEvent(state) {
        const currentCard = state.currentCard();
        if (_.indexOf(NoEvents, currentCard.id) >= 0) {
            return false;
        }

        const eventHandler = EventHandlers[currentCard.id];
        if (!eventHandler) {
            return false;
        }

        return eventHandler.handleEvent(state);
    }

}

export default BelgaeEvent;