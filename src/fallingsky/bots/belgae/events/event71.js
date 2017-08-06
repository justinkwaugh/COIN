import FactionIDs from '../../../config/factionIds';
import CommonEvent71 from 'fallingsky/bots/events/commonEvent71';

class Event71 {
    static handleEvent(state) {
        return CommonEvent71.handleEvent(state, FactionIDs.BELGAE);
    }
}

export default Event71;