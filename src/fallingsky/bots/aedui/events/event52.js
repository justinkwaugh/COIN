import _ from '../../../../lib/lodash';
import FactionIDs from '../../../config/factionIds';

class Event52 {
    static handleEvent(state) {
        const aeduiFaction = state.factionsById[FactionIDs.AEDUI];
        const arverniPlayer = state.playersByFaction[FactionIDs.ARVERNI];
        const belgaePlayer = state.playersByFaction[FactionIDs.BELGAE];

        let effective = false;

        if(arverniPlayer.isNonPlayer && belgaePlayer.isNonPlayer) {
            return false;
        }

        throw 'Not yet implemented';
        return effective;
    }
}

export default Event52;
