import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RemovePieces from 'fallingsky/actions/removePieces';

class Event29 {
    static handleEvent(state) {

        const removedRoman = this.removeAlly(state,FactionIDs.ROMANS);
        const removedAedui = this.removeAlly(state,FactionIDs.AEDUI);

        const removedSecondRoman = this.removeAlly(state,FactionIDs.ROMANS);
        if(!removedSecondRoman) {
            this.removeAlly(state,FactionIDs.AEDUI);
        }

        return removedRoman || removedAedui;
    }

    static removeAlly(state, factionId) {
        let removed = false;
        _(state.regions).shuffle().each(region=> {
            const allies = region.getAlliesForFaction(factionId);
            if (allies.length > 0) {
                RemovePieces.execute(state, {
                    factionId: factionId,
                    regionId: region.id,
                    pieces: _.take(allies, 1)
                });
                removed = true;
                return false;
            }
        });

        return removed;
    }

}

export default Event29
