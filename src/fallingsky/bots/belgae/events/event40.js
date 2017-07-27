import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import RemoveResources from 'fallingsky/actions/removeResources';
class Event40 {
    static handleEvent(state) {
        const numResourcesToLose = _.reduce(state.regionsById[RegionIDs.CISALPINA].adjacent, (sum, region) => {
            if(region.controllingFactionId() !== FactionIDs.ROMANS) {
                return sum + 5;
            }

            return sum;
        }, 0);

        if( numResourcesToLose === 0) {
            return false;
        }

        RemoveResources.execute(state, {
            factionId: FactionIDs.ROMANS,
            count: numResourcesToLose
        });

        state.sequenceOfPlay.remainEligible(FactionIDs.BELGAE);

        return true;
    }
}

export default Event40