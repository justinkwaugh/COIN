import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionGroups from 'fallingsky/config/regionGroups';
import PromoteSuccessor from 'fallingsky/actions/promoteSuccessor';

class Event56 {
    static handleEvent(state) {
        const faction = state.factionsById[FactionIDs.BELGAE];
        if(!faction.hasAvailableLeader()) {
            return false;
        }

        PromoteSuccessor.execute(state, { factionId: FactionIDs.BELGAE });

        const regionIds = _(state.regions).filter(region=>_.find(region.adjacent, adjacent=>adjacent.group === RegionGroups.GERMANIA)).map('id').value();

        state.playersByFaction[FactionIDs.BELGAE].placeLeader(state, true, regionIds);
        return true;
    }
}

export default Event56