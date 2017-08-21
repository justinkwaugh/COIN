import CommonEvent28 from 'fallingsky/bots/events/commonEvent28';
import FactionIDs from 'fallingsky/config/factionIds';

class Event28 {
    static handleEvent(state) {
        return CommonEvent28.handleEvent(state, FactionIDs.ARVERNI);
    }
}

export default Event28;
