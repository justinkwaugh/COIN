import FactionIDs from '../../../config/factionIds';
import CommonEvent41 from 'fallingsky/bots/events/commonEvent41';

class Event41 {
    static handleEvent(state) {
        return CommonEvent41.handleEvent(state, FactionIDs.BELGAE);
    }
}

export default Event41;