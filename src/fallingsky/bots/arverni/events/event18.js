import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionGroups from 'fallingsky/config/regionGroups';
import RemoveResources from 'fallingsky/actions/removeResources';
class Event18 {
    static handleEvent(state) {
        const valid = _.find(state.regions, region=> {
            if(region.getLegions().length === 0) {
                return false;
            }

            return _.find(region.adjacent, adjacent=> adjacent.group === RegionGroups.GERMANIA);
        });

        if(valid) {
            RemoveResources.execute(state, { factionId: FactionIDs.ROMANS, count: 6});
            state.sequenceOfPlay.ineligibleThroughNext(FactionIDs.ROMANS);
            return true;
        }

        return false;
    }
}

export default Event18